import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SImage, SMath, SScrollView2, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import SSocket from 'servisofts-socket';

const productSinFoto = 'https://cauder.com/wp-content/uploads/2020/12/producto-sin-imagen-600x600.jpg';


export default class Modelo extends Component {
    constructor(props) {
        super(props);
        this.modelos = [];
        this.time = Date.now();
    }

    componentDidMount() {
        this.loadApis();
    }

    async loadApis() {
        const modelos = await MDL.inventario.getAllModeloStock();
        this.modelos = modelos;
        this.forceUpdate();
    }

    modificarStock = (key, delta) => {
        const index = this.modelos.findIndex(m => m.key === key);
        if (index >= 0) {
            const nuevoStock = this.modelos[index].stock + delta;
            if (nuevoStock < 0) return false;
            this.modelos[index].stock = nuevoStock;
            this.forceUpdate();
            return true;
        }
        return false;
    };


    renderModelos() {
        const modelos = this.modelos || [];
        const tipoKey = this.props.tipoKey;

        // ✅ Usamos let para poder modificar después
        let productosFiltrados = tipoKey === "all"
            ? modelos
            : modelos.filter(m => m.key_tipo_producto === tipoKey);

        // ✅ Filtro por texto
        if (this.props.searchText) {
            const search = this.props.searchText.toLowerCase();
            productosFiltrados = productosFiltrados.filter(p =>
                p.descripcion?.toLowerCase().includes(search)
            );
        }

        const columnas = 5;
        const colSize = parseFloat((12 / (columnas + 1)).toFixed(2));

        return (
            <SView col={"xs-12"} flex center backgroundColor='transparent'>
                <SScrollView2 disableHorizontal>
                    <SView col={"xs-12"} style={{ padding: 20 }}>
                        <SView col={"xs-12"} row style={{ flexWrap: "wrap" }}>
                            {productosFiltrados.map((producto, index) => {
                                const src = producto.key
                                    ? `${SSocket.api.inventario}modelo/.128_${producto.key}?date=${this.time}`
                                    : productSinFoto;

                                return (
                                    <SView
                                        key={index}
                                        col={`xs-${colSize}`}
                                        style={{
                                            margin: 4,
                                            borderRadius: 12,
                                            padding: 12,
                                            backgroundColor: "#FFF",
                                            shadowColor: "#000",
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.1,
                                            shadowRadius: 8,
                                            elevation: 3,
                                            borderWidth: 1,
                                            borderColor: "#F3F4F6",
                                        }}
                                        // onPress={() => {
                                        //     if (producto.stock <= 0) return alert("No hay más stock disponible");
                                        //     this.props.onPressProducto?.(producto);
                                        // }}

                                         onPress={() => {
                                             if (producto.stock <= 0) return alert("No hay más stock disponible");
                                             producto.stock -= 1; // ⬅️ Resta stock localmente
                                             this.forceUpdate();  // ⬅️ Fuerza render para reflejar el cambio
                                             this.props.onPressProducto?.(producto); // ⬅️ Lo pasa al carrito


                                        }}
                                    >
                                        <SView center style={{ marginBottom: 12 }}>
                                            <SImage
                                                src={src || productSinFoto}
                                                style={{
                                                    width: 120,
                                                    height: 120,
                                                    borderRadius: 8,
                                                    backgroundColor: "#F9FAFB",
                                                }}
                                                resizeMode="cover"
                                            />
                                        </SView>

                                        <SText center fontSize={12} bold color={"#111827"}>
                                            {producto.descripcion}
                                        </SText>
                                        <SText center fontSize={14} bold color={"#714B67"}>
                                            Bs {SMath.formatMoney(producto.precio_venta, 2)}
                                        </SText>
                                        <SText center fontSize={10} color={producto?.stock > 0 ? "#10B981" : "#EF4444"}>
                                            Disponible: {producto?.stock} und
                                        </SText>
                                    </SView>
                                );
                            })}
                        </SView>
                    </SView>
                </SScrollView2>
            </SView>
        );
    }

    render() {
        return this.renderModelos();
    }
}
