import React, { Component } from 'react';
import { SView, SText, STheme, SNavigation, SMath, SInput, SButtom, SPopup, SNotification, SForm, SHr, SThread, SIcon } from 'servisofts-component';
import Model from '../../../../Model';
import ResumenTotales from './ResumenTotales';
import PopupConfirmaPago from './PopupConfirmaPago';
import FotoCliente from '../Foto/FotoCliente';
import SelectTipoPago from '../../../caja2/components/SelectTipoPago';
import MDL from '../../../../MDL';
import ReciboRollo from '../../../../Components/PDF/venta/ReciboRollo';
import ReciboCarta from '../../../../Components/PDF/venta/ReciboCarta';
import PopupCarritoFlotante from './PopupCarritoFlotante';
import Carrito from '../Carrito';
import Main from '../../Main';
export default class TecladoNumerico extends Component {
    constructor(props) {
        super(props);
    }
    renderButton(totalFinal, subtotal, descuento, conFactura, carrito) {
        if (!this.tipos_pago) {
            SNotification.send({
                title: "Error",
                body: "No hay tipo de pago",
                type: "error",
                color: STheme.color.error,
                time: 5000,
            });
            return;
        }
        // if (!this.tipos_pago.efectivo) {
        //     SNotification.send({
        //         title: "Error",
        //         body: "Monto insuficiente para pagar",
        //         type: "error",
        //         color: STheme.color.error,
        //         time: 5000,
        //     });
        //     this.tipos_pago = null;
        //     return;
        // }
        const recibi = this.tipos_pago.efectivo || 0;
        const key_sucursal = this.props?.key_sucursal;
        const key_cliente = this.cliente?.key;
        const cliente = this.cliente;
        const key_cajero = this.props?.key_cajero;
        const detalle = carrito.map(item => ({
            key_modelo: item.key,
            descripcion: item.descripcion,
            precio_unitario: item.precio_venta ?? 0,
            cantidad: item.cantidad ?? 0,
        }));
        const caja = {
            subtotal: SMath.formatMoney(subtotal, 2),
            iva: SMath.formatMoney(descuento, 2),
            descuento: SMath.formatMoney(descuento || 0, 2),
            monto_total: SMath.formatMoney((subtotal - descuento), 2),
            montoRecibido: SMath.formatMoney((recibi || 0), 2),
            cambio: SMath.formatMoney((recibi - totalFinal), 2),
            conFactura: conFactura ? true : false,
            tipos_pago: this.tipos_pago,
            monto_factura: conFactura ? SMath.formatMoney((subtotal - descuento), 2) : SMath.formatMoney(0, 2),
        };
        const datos = {
            key_sucursal,
            detalle,
            key_cliente,
            cliente,
            key_cajero,
            caja
        };
        SNotification.send({
            key: "compra",
            title: "Esperando...",
            type: "loading",
        })
        MDL.compra_venta.registrar(datos).then((res) => {
            ReciboCarta.imprimir(res.key)
            this.tipos_pago = null;
            SNotification.remove("compra");
            this.props?.onReload?.();
            this.props?.onReloadCliente?.(); // Limpia cliente en FotoCliente
            this.forceUpdate();
            SNavigation.navigate("/caja2")
        }).catch(res => {
            this.tipos_pago = null;
            this.forceUpdate();
            SNotification.send({
                key: "compra",
                title: "Error",
                body: res.error,
                type: "error",
                color: STheme.color.error,
                time: 5000
            }
            )
        })
    }

    handleCalculatorPress(valor) {
        console.log("presiono " + valor)
    }

    renderTecladoNumerico = () => {
        const { subtotal, subtotalMoneda, descuento, totalImpuesto, totalDescuento, totalFinal, numeroIva, conFactura } = this.props;
        const style_text = {
            color: STheme.color.text,
            fontSize: 12,
            fontWeight: "bold",
        };
        const teclas = [
            ["1", "2", "3", "Cant"],
            ["4", "5", "6", "% desc."],
            ["7", "8", "9", "Precio"],
            ["+/-", "0", ".", "<"]
        ];
        const carrito = this.props?.carrito || {};
        return (
            <>
                <SView col={"xs-0 md-12"} row color={STheme.color.danger}>
                    <SView col={"xs-4"}>
                        <SView center backgroundColor={STheme.color.darkGray} border={STheme.color.card} style={{ height: 40, borderRadius: 8, margin: 2 }}>
                            <FotoCliente onReloadCliente={(cliente) => {
                                this.cliente = cliente;
                            }}  ></FotoCliente>
                        </SView>
                        <SView center flex backgroundColor={STheme.color.darkGray} border={STheme.color.card} style={{ borderRadius: 8, margin: 2 }} onPress={() => {
                            let carro = this.props?.carrito || {};
                            if (!this.tipos_pago) {

                                console.log("abrir popup")
                                console.log("key", MDL.caja.activa.key_punto_venta)
                                const montoTotal_MN = parseFloat((subtotal).toFixed(2));
                                const montoTotal_ME = parseFloat((subtotalMoneda).toFixed(2));
                                console.log("monto nacional", montoTotal_MN)
                                console.log("montoTotal_ME", montoTotal_ME)
                                console.log("monedal", this.props.moneda)

                                SelectTipoPago.openPopup({
                                    key_punto_venta: MDL.caja.activa.key_punto_venta,
                                    montoMaximo:montoTotal_MN,
                                    montoMaximoMoneda: montoTotal_ME,
                                    // montoMaximo: (subtotal - descuento),
                                    // montoMaximoMoneda: (subtotal - descuento),
                                    onSelect: (item) => {
                                        this.tipos_pago = item;
                                        this.forceUpdate();
                                        this.renderButton(totalFinal, subtotal, descuento, conFactura, carrito);
                                        SelectTipoPago.closePopup();
                                    }
                                });
                            }
                        }}
                        >
                            <SIcon name="iconRight" width={50} height={50} fill={STheme.color.background} />
                            <SHr height={5} />
                            <SText style={{ ...style_text, textTransform: 'uppercase' }}>Pagare</SText>
                        </SView>
                    </SView>
                    <SView col={"xs-8"}>
                        {teclas.map((fila, i) => (
                            <SView key={i} row>
                                {fila.map((t, j) => (
                                    <SView key={j} flex center backgroundColor={STheme.color.darkGray} border={STheme.color.card}
                                        style={{
                                            height: 40, borderRadius: 8,
                                            overflow: "hidden", margin: 2
                                        }}
                                        onPress={() => this.handleCalculatorPress(t)}
                                    >
                                        <SText style={style_text}>{t}</SText>
                                    </SView>
                                ))}
                            </SView>
                        ))}
                    </SView>
                </SView >
                {
                    this.props.subtotal ? <SView col={"xs-12 md-0"} height={42} center backgroundColor={STheme.color.darkGray} border={STheme.color.card} style={{ borderRadius: 2, margin: 2 }} onPress={() => {
                        // console.log("modo movil " + this.props.cliente) 📱📱📱
                        if (!this.tipos_pago) {
                            SelectTipoPago.openPopup({
                                key_punto_venta: MDL.caja.activa.key_punto_venta,
                                montoMaximo: (subtotal - descuento),
                                montoMaximoMoneda: (subtotal - descuento),
                                onSelect: (item) => {
                                    this.tipos_pago = item;
                                    this.forceUpdate();
                                    this.renderButton(totalFinal, subtotal, descuento, conFactura, carrito);
                                    this.tipos_pago = null;
                                    SNotification.remove("compra");
                                    this.props?.onReload?.();
                                    this.props?.onReloadCliente?.(); // Limpia cliente en FotoCliente
                                    PopupCarritoFlotante.closePopup();
                                    SelectTipoPago.closePopup();
                                }
                            });
                        }
                    }}>
                        <SText style={{ ...style_text, textTransform: 'uppercase' }}>Procesar Pagokkkkkkkkk</SText>
                    </SView>
                        : null
                }
            </>
        );
    };
    render() {
        return this.renderTecladoNumerico();
    }
}
