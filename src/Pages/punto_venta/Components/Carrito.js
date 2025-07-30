import React, { Component } from 'react';
import { FlatList } from 'react-native';
import { SHr, SImage, SText, STheme, SView, SInput, SScrollView2, SMath, SButtom, SNotification, SNavigation, SIcon } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import SIconApp from '../../../Assets/SIconApp';
import Model from '../../../Model';
import FotoCliente from './Foto/FotoCliente';
import FotoModelo from './Foto/FotoModelo';
import CarritoItem from './Carrito/CarritoItem';
import ResumenTotales from './Carrito/ResumenTotales';
import TecladoNumerico from './Carrito/TecladoNumerico';
export default class Carrito extends Component {
    carrito = [];
    descuentoManual = "";
    showPaymentModal = false;
    data = {};
    amountReceived = "";
    setCarrito(nuevoCarrito) {
        this.carrito = Array.isArray(nuevoCarrito) ? [...nuevoCarrito] : [];
        this.forceUpdate();
    }
    addProducto = (producto) => {
        const index = this.carrito.findIndex(p => p.key === producto.key);
        if (index >= 0) {
            this.carrito[index].cantidad += 1;
            this.carrito[index].stock = producto.stock;
        }
        else this.carrito.push({ ...producto, cantidad: 1 });
        this.forceUpdate();
    };
    aumentarCantidad = (producto) => {
        const index = this.carrito.findIndex(p => p.key === producto.key);
        if (index >= 0) {
            const success = this.props.onModificarStock?.(producto.key, -1);
            if (success === false) return alert("No hay más stock disponible");
            this.carrito[index].cantidad += 1;
            this.carrito[index].stock -= 1;
            this.forceUpdate();
        }
    };
    disminuirCantidad = (producto) => {
        const index = this.carrito.findIndex(p => p.key === producto.key);
        if (index >= 0) {
            this.carrito[index].cantidad -= 1;
            this.carrito[index].stock += 1;
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
        this.descuentoManual = 0;
        this.carrito = [];
        this.forceUpdate();
    };
    calcularSubtotal = () => this.carrito.reduce((t, i) => t + i.precio_venta * i.cantidad, 0);
    calcularTotalConIVA = (subtotal) => subtotal * 1.15;
    calcularIVA = (subtotal) => subtotal * 0.15;
    calcularTotalConDescuento = (total) => total - parseFloat(this.descuentoManual || "0");
    getCarrito = () => this.carrito;


    getCarritoimprimir() {
        return this.carrito;
        // console.log("sakura " + JSON.stringify(this.carrito))
    }
    showwwwwwwwwwwwwwww() {

        console.log("sakura " + JSON.stringify(this.getCarritoimprimir()))
    }
    renderPaymentModal = () => {
        if (!this.showPaymentModal) return null;
        const subtotal = this.calcularSubtotal();
        const totalConIVA = this.calcularTotalConIVA(subtotal);
        const totalImpueso = this.calcularIVA(subtotal);
        const totalFinal = this.calcularTotalConDescuento(totalConIVA);
        const montoRecibido = parseFloat(this.amountReceived || 0);
        const change = isNaN(montoRecibido) ? 0 : montoRecibido - totalFinal;
        const handleConfirmarPago = () => {
            if (change >= 0) {
                SNotification.send({
                    title: "Pago Exitoso",
                    body: `Cambio: Bs ${SMath.formatMoney(change, 2)}`,
                    type: "success",
                });
                console.log("🧾 Pago confirmado. Total:", totalFinal);
                console.log("🛒 Carrito guardado:", JSON.stringify(this.carrito, null, 2));
                this.showPaymentModal = false;
                this.amountReceived = "";
                this.carrito = [];
                this.forceUpdate();
            } else {
                SNotification.send({
                    title: "Monto insuficiente",
                    body: "El monto recibido es menor al total a pagar.",
                    type: "danger",
                });
            }
        };
        return (
            <SView
                col={"xs-12"}
                height={"100%"}
                center
                style={{
                    position: "absolute",
                    backgroundColor: "rgba(0,0,0,0.6)",
                    zIndex: 1000,
                }}
            >
                <SView
                    width={400}
                    height={320}
                    backgroundColor={STheme.color.background}
                    style={{
                        borderRadius: 12,
                        padding: 24,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                        elevation: 6,
                    }}
                >
                    <SText fontSize={20} bold center  >  Confirmar Pago    </SText>
                    <SView height={20} />
                    <SView row style={{ justifyContent: "space-between", marginBottom: 12 }}>
                        <SText fontSize={16} color={STheme.color.text}>Total a Pagar:</SText>
                        <SText fontSize={18} bold color={STheme.color.warning}>
                            Bs {SMath.formatMoney(totalFinal, 2)}
                        </SText>
                    </SView>
                    <SView row borderColor={"transparent"} >
                        <SText fontSize={14} color={STheme.color.text}>Monto Recibido:</SText>
                        <SInput
                            value={this.amountReceived}
                            onChangeText={(text) => {
                                this.amountReceived = text;
                                this.forceUpdate();
                            }}
                            type='number'
                            placeholder="Ej. 100.00"
                            style={{
                                height: 48,
                                fontSize: 20,
                                textAlign: "center",
                                borderWidth: 1,
                                borderColor: STheme.color.card,
                                borderRadius: 4,
                                marginTop: 8,
                                color: STheme.color.text,
                                backgroundColor: "transparent"
                            }}
                        />
                    </SView>
                    <SView height={20} />
                    <SView row style={{ justifyContent: "space-between", marginBottom: 40 }}>
                        <SText fontSize={16} color={STheme.color.text}>Cambio:</SText>
                        <SText fontSize={18} bold color={change >= 0 ? STheme.color.success : STheme.color.danger}>
                            Bs {SMath.formatMoney(change, 2)}
                        </SText>
                    </SView>
                    <SView row style={{ justifyContent: "space-around" }}>
                        <SButtom
                            onPress={() => {
                                this.showPaymentModal = false;
                                this.amountReceived = "";
                                this.forceUpdate();
                            }}
                            style={{
                                backgroundColor: STheme.color.lightGray,
                                paddingVertical: 12,
                                paddingHorizontal: 24,
                                borderRadius: 4,
                                width: 150
                            }}
                        >
                            <SText color={STheme.color.text}>Cancelar</SText>
                        </SButtom>
                        <SButtom
                            onPress={handleConfirmarPago}
                            style={{
                                backgroundColor: STheme.color.text,
                                paddingVertical: 12,
                                paddingHorizontal: 24,
                                borderRadius: 4,
                                width: 150
                            }}
                        >
                            <SText color={STheme.color.white}>Confirmar Pago</SText>
                        </SButtom>
                    </SView>
                </SView>
            </SView>
        );
    };
    renderItemCarrito = ({ item }) => (
        <CarritoItem
            item={item}
            onAumentar={() => this.aumentarCantidad(item)}
            onDisminuir={() => this.disminuirCantidad(item)}
            onEliminar={() => this.eliminarItem(item)}
        />
    );
    renderCarrito = () => {
        const subtotal = this.calcularSubtotal();
        const totalConIVA = this.calcularTotalConIVA(subtotal);
        const totalImpuesto = this.calcularIVA(subtotal);
        const totalDescuento = this.descuentoManual || 0;
        const totalFinal = this.calcularTotalConDescuento(totalConIVA);
        const carro = this.getCarrito();

        return (
            <>
                {subtotal <= 0 ?
                    <SView backgroundColor={STheme.color.background} flex center style={{ borderRadius: 8, marginBottom: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
                    >
                        <SView row center backgroundColor='transparent' >
                            <SIconApp name='carritoproducto' height={50} fill={STheme.color.card} />
                            <SText fontSize={12} color={STheme.color.card}>Comience a agregar productos</SText>
                        </SView>
                    </SView>
                    :
                    <SView backgroundColor={STheme.color.background} flex style={{ borderRadius: 8, marginBottom: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }} >
                        <SView col={"xs-12"} row style={{ marginBottom: 8 }} >
                            <SView col={"xs-10 md-10"} row  >
                                <SText fontSize={16} bold color={STheme.color.text}>Detalle venta</SText>
                            </SView>
                            <SView col={"xs-2 md-2"} backgroundColor='transparent' row center onPress={() => this.vaciarCarrito()} >
                                <SView backgroundColor={STheme.color.card} border={STheme.color.text} style={{ borderRadius: 2, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, height: 24, opacity: 0.6 }}>
                                    <SText fontSize={12} center color={STheme.color.text}>Vaciar</SText>
                                </SView>
                            </SView>
                        </SView>
                        <SView col={"xs-12"} flex center backgroundColor='transparent'>
                            <SScrollView2 disableHorizontal>
                                <FlatList data={this.carrito} keyExtractor={(item) => item.key.toString()} renderItem={this.renderItemCarrito} />
                            </SScrollView2>
                        </SView>
                        <SHr height={20} />
                        <ResumenTotales subtotal={subtotal} totalImpuesto={totalImpuesto} totalDescuento={totalDescuento} totalFinal={totalFinal}  ></ResumenTotales>
                        <SView col={"xs-12"} style={{ marginTop: 8 }}>
                            <SText>Descuento VIP (Bs):</SText>
                            <SInput placeholder={"0"} value={this.descuentoManual ?? null} type='number' border={STheme.color.card} style={{ backgroundColor: "transparent", }}
                                onChangeText={(text) => {
                                    this.descuentoManual = text;
                                    this.forceUpdate();
                                }}
                            />
                        </SView>
                    </SView>
                }
                <TecladoNumerico data={{ cliente: this.data?.cliente }} carrito={this.getCarritoimprimir()} carritonuevo={this.carritonuevo} subtotal={subtotal} totalImpuesto={totalImpuesto} totalDescuento={totalDescuento} totalFinal={totalFinal}
                    onReload={() => { this.vaciarCarrito(); }}
                />
            </>
        );
    };
    render() {
        return <>
            {this.renderCarrito()}
        </>
    }
}
