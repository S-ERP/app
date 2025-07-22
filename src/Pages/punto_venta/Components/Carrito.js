import React, { Component } from 'react';
import { FlatList } from 'react-native';
import { SHr, SImage, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Subtotal from './Subtotal';

const sinFoto = 'https://cauder.com/wp-content/uploads/2020/12/producto-sin-imagen-600x600.jpg';

export default class Carrito extends Component {
    constructor(props) {
        super(props);
        this.carrito = [];
    }

    addProducto = (producto) => {
        const index = this.carrito.findIndex(p => p.key === producto.key);
        if (index >= 0) {
            this.carrito[index].cantidad += 1;
        } else {
            this.carrito.push({ ...producto, cantidad: 1 });
        }
        this.forceUpdate();
    };

    aumentarCantidad = (producto) => {
        const index = this.carrito.findIndex(p => p.key === producto.key);
        if (index >= 0) {
            const success = this.props.onModificarStock?.(producto.key, -1);
            if (success === false) {
                alert("No hay más stock disponible");
                return;
            }
            this.carrito[index].cantidad += 1;
            this.forceUpdate();
        }
    };

    disminuirCantidad = (producto) => {
        const index = this.carrito.findIndex(p => p.key === producto.key);
        if (index >= 0) {
            this.carrito[index].cantidad -= 1;
            this.props.onModificarStock?.(producto.key, +1);

            if (this.carrito[index].cantidad <= 0) {
                this.carrito.splice(index, 1);
            }
            this.forceUpdate();
        }
    };

    eliminarItem = (producto) => {
        const index = this.carrito.findIndex(p => p.key === producto.key);
        if (index >= 0) {
            this.props.onModificarStock?.(producto.key, +this.carrito[index].cantidad);
            this.carrito.splice(index, 1);
            this.forceUpdate();
        }
    };

    vaciarCarrito = () => {
        this.carrito.forEach(item => {
            this.props.onModificarStock?.(item.key, +item.cantidad);
        });
        this.carrito = [];
        this.forceUpdate();
    };

    renderItemCarrito = (item) => {
        const src = item.key ? `${SSocket.api.inventario}modelo/.128_${item.key}` : sinFoto;

        return (
            <SView key={item.key} row style={{ paddingVertical: 4, alignItems: "center" }}>
                <SImage src={src} style={{ width: 40, height: 40, borderRadius: 4, marginRight: 8 }} />

                <SText fontSize={12} flex color={"#374151"}>{item.descripcion}</SText>

                <SView row center>
                    <SText onPress={() => this.disminuirCantidad(item)} style={{ paddingHorizontal: 8, fontSize: 16, color: "#EF4444", fontWeight: "bold" }}>-</SText>
                    <SText fontSize={12} color='blue' bold style={{ paddingHorizontal: 4 }}>x{item.cantidad}</SText>
                    <SText onPress={() => this.aumentarCantidad(item)} style={{ paddingHorizontal: 8, fontSize: 16, color: "#10B981", fontWeight: "bold" }}>+</SText>
                    <SText onPress={() => this.eliminarItem(item)} style={{ paddingHorizontal: 8, fontSize: 14, color: "#9CA3AF" }}>🗑</SText>
                </SView>

                <SHr />
                <SHr />
                <SHr color={STheme.color.card} height={0.2} />
            </SView>
        );
    };

    renderCarrito() {
        return (
            <SView
                border={STheme.color.card}
                backgroundColor={STheme.color.background} height={500} style={{
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 8,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                }}>
                <SView row justifyContent='space-between' alignItems='center' style={{ marginBottom: 8 }}>
                    <SText fontSize={14} bold color={STheme.color.text + "99"}>Orden Actual</SText>
                    <SText onPress={this.vaciarCarrito} fontSize={12} color={"#EF4444"}>Vaciar 🧹</SText>
                </SView>

                <FlatList
                    data={this.carrito}
                    keyExtractor={(item) => item.key.toString()}
                    renderItem={({ item }) => this.renderItemCarrito(item)}
                    ListEmptyComponent={
                        <SView center style={{ paddingVertical: 20 }}>
                            <SText fontSize={12} color={STheme.color.text + "99"}>No hay productos en el carrito</SText>
                        </SView>
                    }
                />

                <SHr height={50} ></SHr>

                {this.carrito.length > 0 && <Subtotal carrito={this.carrito} />}

            </SView>
        );
    }

    render() {
        return this.renderCarrito();
    }
}
