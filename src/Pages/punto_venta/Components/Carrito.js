import React, { Component } from 'react';
import { FlatList } from 'react-native';
import { SHr, SImage, SText, STheme, SView, SInput, SScrollView2 } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import { color } from 'three/examples/jsm/nodes/Nodes';

const sinFoto = 'https://cauder.com/wp-content/uploads/2020/12/producto-sin-imagen-600x600.jpg';

export default class Carrito extends Component {
    carrito = [];
    descuentoManual = "0";

    addProducto = (producto) => {
        const index = this.carrito.findIndex(p => p.key === producto.key);
        if (index >= 0) this.carrito[index].cantidad += 1;
        else this.carrito.push({ ...producto, cantidad: 1 });
        this.forceUpdate();
    };

    aumentarCantidad = (producto) => {
        const index = this.carrito.findIndex(p => p.key === producto.key);
        if (index >= 0) {
            const success = this.props.onModificarStock?.(producto.key, -1);
            if (success === false) return alert("No hay más stock disponible");
            this.carrito[index].cantidad += 1;
            this.forceUpdate();
        }
    };

    disminuirCantidad = (producto) => {
        const index = this.carrito.findIndex(p => p.key === producto.key);
        if (index >= 0) {
            this.carrito[index].cantidad -= 1;
            this.props.onModificarStock?.(producto.key, +1);
            if (this.carrito[index].cantidad <= 0) this.carrito.splice(index, 1);
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

    calcularSubtotal = () => this.carrito.reduce((t, i) => t + i.precio_venta * i.cantidad, 0);
    calcularTotalConIVA = (subtotal) => subtotal * 1.15;
    calcularTotalConDescuento = (total) => total - parseFloat(this.descuentoManual || "0");

    handleCalculatorPress = (tecla) => {
        let val = this.descuentoManual || "";

        switch (tecla) {
            case "<": val = val.slice(0, -1); break;
            case "+/-": val = val.startsWith("-") ? val.slice(1) : "-" + val; break;
            case ".": if (!val.includes(".")) val += "."; break;
            case "Cant": case "% de desc.": case "Precio": return;
            default: if (/^\d$/.test(tecla)) val += tecla;
        }

        this.descuentoManual = val;
        this.forceUpdate();
    };

    renderItemCarrito = (item) => {
        const src = item.key ? `${SSocket.api.inventario}modelo/.128_${item.key}` : sinFoto;
        return (
            <SView key={item.key} row style={{ paddingVertical: 4, alignItems: "center" }}>
                <SImage src={src} style={{ width: 40, height: 40, borderRadius: 4, marginRight: 8 }} />
                <SText fontSize={12} flex color={"#374151"}>{item.descripcion}</SText>
                <SView row center>
                    <SText onPress={() => this.disminuirCantidad(item)} style={{ paddingHorizontal: 8, fontSize: 16, color: "#EF4444" }}>-</SText>
                    <SText fontSize={12} bold color='blue' style={{ paddingHorizontal: 4 }}>x{item.cantidad}</SText>
                    <SText onPress={() => this.aumentarCantidad(item)} style={{ paddingHorizontal: 8, fontSize: 16, color: "#10B981" }}>+</SText>
                    <SText onPress={() => this.eliminarItem(item)} style={{ paddingHorizontal: 8, fontSize: 14, color: "#9CA3AF" }}>🗑</SText>
                </SView>
            </SView>
        );
    };



    renderTecladoNumerico = () => {
        const style_text = {
            color: STheme.color.text,
            fontSize: 12,
            fontWeight: "bold",
        };


        const teclas = [
            ["1", "2", "3", "Cant"],
            ["4", "5", "6", "% de desc."],
            ["7", "8", "9", "Precio"],
            ["+/-", "0", ".", "<"]
        ];

        return (
            <SView col={"xs-12"} row color={STheme.color.danger}>
                <SView col={"xs-4"}>
                    <SView center backgroundColor={STheme.color.darkGray} border={STheme.color.card} style={{ height: 44, borderRadius: 2, margin: 2, }} >
                        <SView row center  >
                            <SView center backgroundColor={"#ab05ddff"} style={{ width: 28, height: 28, borderRadius: 18, margin: 12 }}>
                                <SText fontSize={14} bold  >AO</SText>
                            </SView>
                            <SView> <SText style={style_text}  >Anita Oliver</SText> <SText style={style_text}  >Cliente Vip</SText> </SView>
                        </SView>
                    </SView>


                    <SView center flex backgroundColor={STheme.color.darkGray} border={STheme.color.card} style={{ borderRadius: 2, margin: 2, }}   >
                        <SText style={style_text} >pagar</SText>
                    </SView>
                </SView>

                <SView col={"xs-8"}>
                    {teclas.map((fila, i) => (
                        <SView key={i} row  >
                            {fila.map((t, j) => (
                                <SView key={j} flex center backgroundColor={STheme.color.darkGray} border={STheme.color.card} style={{ height: 44, borderRadius: 2, margin: 2, }}
                                    onPress={() => this.handleCalculatorPress(t)}
                                >
                                    <SText style={style_text}>{t}</SText>
                                </SView>
                            ))}
                        </SView>
                    ))}
                </SView>
            </SView>
        );
    };

    renderCarrito = () => {
        const subtotal = this.calcularSubtotal();
        const totalConIVA = this.calcularTotalConIVA(subtotal);
        const totalFinal = this.calcularTotalConDescuento(totalConIVA);

        return (
            <>
                <SView
                    // border={STheme.color.card}
                    backgroundColor={STheme.color.background}
                    // height={500}
                    flex
                    style={{ borderRadius: 8, marginBottom: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
                >
                    <SView row justifyContent='space-between' alignItems='center' style={{ marginBottom: 8 }}>
                        <SText fontSize={14} bold color={STheme.color.text + "99"}>Orden Actual</SText>
                        <SText onPress={this.vaciarCarrito} fontSize={12} color={"#EF4444"}>Vaciar 🧹</SText>
                    </SView>

                    {/* <SView flex> */}

                    <SView col={"xs-12"} flex center backgroundColor='transparent'>
                        <SScrollView2 disableHorizontal>

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
                        </SScrollView2>

                    </SView>

                    <SHr height={20} />
                    <SText bold>Subtotal: Bs {subtotal.toFixed(2)}</SText>
                    <SText bold>IVA 15%: Bs {(totalConIVA - subtotal).toFixed(2)}</SText>

                    <SView col={"xs-12"} style={{ marginTop: 8 }}>
                        <SText>Descuento VIP (Bs):</SText>
                        <SInput
                            value={this.descuentoManual}
                            onChangeText={(text) => {
                                this.descuentoManual = text;
                                this.forceUpdate();
                            }}
                            keyboardType="numeric"
                        />
                    </SView>

                    <SText bold>Total con descuento: Bs {totalFinal.toFixed(2)}</SText>

                </SView>
                {this.renderTecladoNumerico()}

            </>

        );
    };

    render() {
        return this.renderCarrito();
    }
}
