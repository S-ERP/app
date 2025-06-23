import React, { Component } from 'react';
import { View, Text, FlatList } from 'react-native';
import { SInput, SNotification, SText, STheme, SThread, SView } from 'servisofts-component';
import ProductoItem from './ProductoItem';
import MDL from '../../../../MDL';

export default class Producto extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    productos_final;
    buildProductosCombinados() {
        const { productos, cliente_proyecto } = this.props
        const carrito = cliente_proyecto?.carrito;
        let productos_final = {};
        if (carrito) {
            // Si hay carrito agregamos los productos del carrito
            carrito.map((item) => {
                if (!productos_final[item.key_producto]) productos_final[item.key_producto] = {}
                productos_final[item.key_producto].carrito = item;
            })
        }
        if (productos) {
            // Agregamos los productos del proyecto
            productos.map((item) => {
                if (!productos_final[item.key_producto]) productos_final[item.key_producto] = {}
                productos_final[item.key_producto].producto = item;
            })
        }
        this.productos_final = productos_final;
        return Object.values(productos_final)
    }

    saveChanges() {
        if (!this.unsavedChange) return;
        SNotification.send({
            title: "Guardando cambios en el carrito...",
            type: "loading",
            key: "edit_carrito"
        })
        const carrito = this.props.cliente_proyecto?.carrito;

        const arr = Object.values(this.productos_final).filter(item => !!item.carrito_edit).map(item => { return { ...item.carrito_edit, key_cliente_proyecto: this.props.cliente_proyecto.key } });
        console.log(arr)
        MDL.crm.clienteProyecto.editarCarrito(arr, this.props.cliente_proyecto.key).then((resp) => {
            this.props.cliente_proyecto.carrito = resp;
            this.unsavedChange = false;
            SNotification.send({
                title: "Carrito guardado",
                color: STheme.color.success,
                time: 2000,
                key: "edit_carrito"
            });
            // }
        }).catch((e) => {
            SNotification.send({
                title: "Error guardado de carrito",
                color: STheme.color.danger,
                time: 2000,
                key: "edit_carrito"
            });
            console.error(e);
            // SNavigation.alert("Error al guardar el carrito");
        });
    }

    componentWillUnmount() {
        this.saveChanges();
        // clearTimeout(this.timeout);
    }
    onChangeProducto() {
        this.unsavedChange = true;
        new SThread(4000, "edit_carrito", true).start(() => {
            console.log("Guardando cambios en el carrito...");
            this.saveChanges();
        })
    }
    renderHeaders() {
        return <SView row>
            {/* <SView width={20} /> */}
            <SView flex style={{ alignItems: "flex-start" }}>
                <SText bold>Producto</SText>
            </SView>
            <SView width={8} />
            <SView width={80} center>
                <SText bold>Cantidad</SText>
            </SView>
            <SView width={8} />
            <SView width={50} center>
                <SText bold>Precio</SText>
            </SView>
        </SView>
    }
    render() {
        return <SView col={"xs-12"}>
            {this.renderHeaders()}
            <FlatList data={this.buildProductosCombinados()}
                style={{ width: "100%" }}
                ListHeaderComponent={() => <View style={{ height: 16 }} />}
                ItemSeparatorComponent={() => <View style={{ height: 32 }} />}
                renderItem={({ item }) => <ProductoItem data={item} onChange={(e) => {
                    this.onChangeProducto(e);
                }} />}
                ListFooterComponent={() => <View style={{ height: 32 }} />}
            />
            {/* <SText onPress={e => {
                this.saveChanges();
            }}>{"GUARDAR"}</SText> */}
        </SView >
    }
}

