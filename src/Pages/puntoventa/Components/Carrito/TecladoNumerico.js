import React, { Component } from 'react';
import { SView, SText, STheme, SNavigation, SMath, SInput, SButtom, SPopup, SNotification, SForm, SHr, SThread, SIcon } from 'servisofts-component';
import Model from '../../../../Model';

import ResumenTotales from './ResumenTotales';
import PopupConfirmaPago from './PopupConfirmaPago';
import FotoCliente from '../Foto/FotoCliente';
import SelectTipoPago from '../../../caja2/components/SelectTipoPago';
import MDL from '../../../../MDL';
import ReciboRollo from '../../../../Components/PDF/venta/ReciboRollo';
export default class TecladoNumerico extends Component {
    constructor(props) {
        super(props);
        // this.data = props.data;
        // this.carrito = props.carrito;
        // this.carritonuevo = props.carritonuevo;
        // this.showPaymentModal = false;
        // this._recibido = "";
        // this._devolvido = "";
        // this.descuentoManual = "";
    }




    dataFormateada({ sucursal = null, carrito = [], cliente = null, vendedor = null, caja = null }) {
        const carritoFormateado = carrito.map(item => ({
            key: item.key,
            descripcion: item.descripcion,
            precio_compra: item.precio_compra ?? 0,
            precio_venta: item.precio_venta ?? 0,
            stock: item.stock ?? 0,
            cantidad: item.cantidad ?? 0,
            key_marca: item.key_marca ?? null,
            marca_descripcion: item.marca?.descripcion ?? null,
            key_tipo_producto: item.key_tipo_producto ?? null,
            tipo_producto: item.tipo_producto?.descripcion ?? null,
        }));
        const clienteFormateado = cliente?.key;
        const vendedorFormateado = vendedor?.key;
        return {
            sucursal: sucursal,
            carrito: carritoFormateado,
            key_cliente: cliente?.key ?? null,
            key_vendedor: vendedor?.key ?? null,
            caja: caja,
        };
    }

    renderPopudPago() {
        const { subtotal, descuento, totalImpuesto, totalDescuento, totalFinal, numeroIva, conFactura } = this.props;
        let monto_recibido_number = parseFloat(this._recibido);
        if (isNaN(monto_recibido_number)) monto_recibido_number = 0;
        // if (!this._recibido) this._recibido = "";
        // if (!this._devolvido) this._devolvido = 0;
        return SPopup.open({
            key: "PopupPago",
            type: 1,
            content: <SView
                col="xs-11"
                withoutFeedback
                padding={24}
                backgroundColor={STheme.color.background}
                style={{
                    maxWidth: 320,
                    borderRadius: 12,
                    shadowColor: STheme.color.gray,
                    shadowOffset: { width: 5, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 60,
                }}>
                <SText fontSize={18} bold center>Confirmar Pago</SText>
                <SView height={8} />
                <ResumenTotales subtotal={subtotal} totalImpuesto={totalImpuesto} numeroIva={numeroIva} totalDescuento={totalDescuento} totalFinal={totalFinal}  ></ResumenTotales>
                <SView row    >
                    <SInput
                        label={"Monto Recibido:"}
                        defaultValue={this._recibido}
                        onChangeText={(text) => {
                            this._recibido = text;
                            const recibido = parseFloat(text);
                            const total = parseFloat(totalFinal);
                            if (!isNaN(recibido) && !isNaN(total)) {
                                this._devolvido = recibido - total;
                            } else {
                                this._devolvido = 0;
                            }
                            // this.forceUpdate();
                        }}
                        border={STheme.color.card}
                        type='number'
                        placeholder="Ej. 100.00"
                        style={{
                            height: 48,
                            fontSize: 18,
                            textAlign: "center",
                            borderRadius: 4,
                            color: STheme.color.text,
                        }}
                    />
                </SView>
                <SView height={20} />
                <SView center row style={{ justifyContent: "space-between", marginBottom: 40 }}>
                    <SText fontSize={16} color={STheme.color.text}>Cambio:</SText>
                    <SText fontSize={18} bold color={totalFinal < this._recibido ? "green" : "red"}    >
                        Bs {SMath.formatMoney(this._devolvido, 2)}
                    </SText>
                </SView>
                <SView center row >
                    <SView center flex style={{ borderColor: STheme.color.card, borderWidth: 2, borderRadius: 4, height: 40 }}
                        onPress={() => {
                            this.showPaymentModal = false;
                            this._recibido = "";
                            this._devolvido = "";
                            this.data.cliente = "";
                            this.props.onReload();
                            // this.forceUpdate();
                            SPopup.close("PopupPago");
                        }}
                    >
                        <SText color={STheme.color.text}>Cancelar</SText>
                    </SView>
                    <SView width={8} />
                    <SView center flex style={{ backgroundColor: "#18181b", borderColor: STheme.color.gray, borderWidth: 2, borderRadius: 4, height: 40 }}
                        onPress={() => {
                            if (!this._recibido || parseFloat(this._recibido) < totalFinal) {
                                SNotification.send({
                                    title: "Error",
                                    body: `Monto insuficiente para pagar`,
                                    type: "error",
                                    color: STheme.color.error,
                                    time: 5000,
                                });
                                return;
                            }
                            const carritoFormateado = this.carrito.map(item => ({
                                key: item.key,
                                descripcion: item.descripcion,
                                precio_compra: item.precio_compra ?? 0,
                                precio_venta: item.precio_venta ?? 0,
                                stock: item.stock ?? 0,
                                cantidad: item.cantidad ?? 0,
                                key_marca: item.key_marca ?? null,
                                marca_descripcion: item.marca?.descripcion ?? null,
                                key_tipo_producto: item.key_tipo_producto ?? null,
                                tipo_producto: item.tipo_producto?.descripcion ?? null,
                            }));
                            const datos = this.dataFormateada({
                                caja: {
                                    subtotal: SMath.formatMoney(subtotal, 2),
                                    IVA: SMath.formatMoney(totalImpuesto, 2),
                                    Descuento: SMath.formatMoney(totalDescuento, 2),
                                    totalFinal: SMath.formatMoney(totalFinal, 2),
                                    montoRecibido: SMath.formatMoney(this._recibido, 2),
                                    cambio: SMath.formatMoney((this._recibido - totalFinal), 2),
                                    conFactura: conFactura ? "si" : "no",
                                },
                                carrito: this.props?.carrito,
                                cliente: this.data.cliente,
                                vendedor: Model.usuario.Action.getUsuarioLog()
                            });
                            this.showPaymentModal = false;
                            this._recibido = "";
                            this._devolvido = "";
                            this.data.cliente = {};
                            this.props.onReload();
                            // this.forceUpdate();
                            SPopup.close("PopupPago");
                        }}
                    >
                        <SText color={STheme.color.background}>Confirmar Pago</SText>
                    </SView>
                </SView>
            </SView>
        })
    }


    renderButton(totalFinal, subtotal, descuento, conFactura, carrito) {
        // console.log("WWWWW")
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
        if (!this.tipos_pago.efectivo || this.tipos_pago.efectivo < totalFinal) {
            SNotification.send({
                title: "Error",
                body: "Monto insuficiente para pagar",
                type: "error",
                color: STheme.color.error,
                time: 5000,
            });

            this.tipos_pago = null;
            // this.forceUpdate();
            return;
        }
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



        // console.log("basta....... " + JSON.stringify(datos))

        SNotification.send({
            key: "compra",
            title: "Esperando...",
            type: "loading",
        })


        MDL.compra_venta.registrar(datos).then((res) => {

            this.props?.onReload?.();
            this.props?.onReloadCliente?.(null); // Limpia cliente en FotoCliente

            ReciboRollo.imprimir(res.key)
            // ReciboCarta.imprimir(res.key)
            SPopup.close("popup_config_horario");
            // SNavigation.goBack();
            this.tipos_pago = null;
            SNotification.remove("compra")
            this.forceUpdate();

        }).catch(res => {

            this.tipos_pago = null;
            this.forceUpdate();

            console.log("compra_venta registrado error " + res.error)
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

    renderTecladoNumerico = () => {
        const { subtotal, descuento, totalImpuesto, totalDescuento, totalFinal, numeroIva, conFactura } = this.props;
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
                                console.log("cheking 22222222222 web" + JSON.stringify(cliente))
                                this.cliente = cliente;
                                // this.forceUpdate();
                            }}  ></FotoCliente>
                        </SView>
                        <SView center flex backgroundColor={STheme.color.darkGray} border={STheme.color.card} style={{ borderRadius: 8, margin: 2 }} onPress={() => {
                            let carro = this.props?.carrito || {};

                            if (!this.tipos_pago) {
                                SelectTipoPago.openPopup({
                                    key_punto_venta: MDL.caja.activa.key_punto_venta,
                                    montoMaximo: totalFinal,
                                    onSelect: (item) => {
                                        this.tipos_pago = item;
                                        // this.handleSubmit(item.key_tipo_pago)
                                        console.log("selecciono " + JSON.stringify(item))
                                        this.forceUpdate();
                                        this.renderButton(totalFinal, subtotal, descuento, conFactura, carrito);

                                        SelectTipoPago.closePopup();
                                    }
                                });
                            }




                            // }

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
                                        onPress={() => this.handleCalculatorPress(t)} >
                                        <SText style={style_text}>{t}</SText>
                                    </SView>
                                ))}
                            </SView>
                        ))}
                    </SView>
                </SView >
                {
                    this.props.subtotal ? <SView col={"xs-12 md-0"} height={42} center backgroundColor={STheme.color.darkGray} border={STheme.color.card} style={{ borderRadius: 2, margin: 2 }} onPress={() => {
                        console.log("modo movil " + this.props.cliente)
                        PopupConfirmaPago.open({
                            subtotal: subtotal,
                            descuento: this.props.descuento,
                            iva: this.props.descuento,
                            totalImpuesto: totalImpuesto,
                            totalDescuento: descuento,
                            totalFinal: (subtotal - this.props.descuento),
                            numeroIva: numeroIva,
                            conFactura: conFactura,
                            carrito: this.props?.carrito || {},
                            cliente: this.props?.cliente,

                            onReload: () => {
                                this._recibido = "";
                                this._devolvido = "";
                                this.cliente = {};
                                this.forceUpdate();
                                this.props.onReload();
                            },
                            onReloadCliente: (cliente) => {
                                this.cliente = cliente || {};
                                this.props.onReloadCliente?.(cliente);
                                this.forceUpdate();
                            }

                            // onReload: () => {
                            //     this.props?.onReload?.(); // o cualquier otra función de recarga
                            // }
                        })
                    }}>
                        <SText style={{ ...style_text, textTransform: 'uppercase' }}>Procesar Pago</SText>
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
