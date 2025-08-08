import React, { Component } from 'react';
import { SView, SText, STheme, SNavigation, SMath, SInput, SButtom, SPopup, SNotification, SForm, SHr, SThread } from 'servisofts-component';
import SIconApp from '../../Assets/SIconApp';
import PopupTotal from './Components/Carrito/PopupConfirmaPago';
import PopupConfirmaPago from './Components/Carrito/PopupConfirmaPago';
const variableGlobal = 0;
export default class Testx extends Component {
    constructor(props) {
        super(props);
        this.data = props.data;
        this.carrito = props.carrito;
        this.carritonuevo = props.carritonuevo;
        this.showPaymentModal = false;
        this._recibido = "";
        this._devolvido = "";
        this.descuentoManual = "";
    }
    dataFormateada({ carrito = [], cliente = null, caja = null, vendedor = null }) {
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
            carrito: carritoFormateado,
            key_cliente: clienteFormateado ?? null,
            key_vendedor: vendedorFormateado ?? null,
            caja: caja,
        };
    }
    renderPopudPago() {
        const { subtotal, totalImpuesto, totalDescuento, totalFinal, numeroIva, conFactura } = this.props;
        let monto_recibido_number = parseFloat(this._recibido);
        if (isNaN(monto_recibido_number)) monto_recibido_number = 0;
        if (!this._recibido) this._recibido = "";
        if (!this._devolvido) this._devolvido = 0;
        const defaultData = this.data?.cliente ?? {};
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
                    shadowColor: "#18181b",
                    shadowOffset: { width: 5, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 60,
                }}>
                <SText fontSize={18} bold center>Confirmar Pago</SText>
                <SView height={8} />
                <SView row    >
                    <SForm row ref={(ref: any) => this.form = ref}
                        style={{ justifyContent: "space-between" }}
                        inputs={{
                            nit: {
                                col: "xs-12",
                                label: "Nit",
                                type: 'number',
                                required: true,
                                autoFocus: true,
                                defaultValue: defaultData?.nit,
                                iconR: <SView width={30} height={30} center onPress={() => {
                                    this.hanldeEditTelefono();
                                }}>
                                    <SIconApp name='Search' fill={STheme.color.lightGray} />
                                </SView>,
                                onChangeText: (text: string) => {
                                    this.forceUpdate();
                                },
                            },
                            cambio: {
                                col: "xs-12",
                                disabled: true,
                                label: "cambio a devolver",
                                defaultValue: defaultData?.cambio,
                            }
                        }} />
                    <SInput
                        label={"Monto Recibido:"}
                        defaultValue={this._recibido}
                        onChangeText={(text) => {
                            this._recibido = text;
                            const recibido = parseFloat(text);
                            const total = parseFloat(100);
                            if (!isNaN(recibido) && !isNaN(total)) {
                                this._devolvido = recibido - total;
                            } else {
                                this._devolvido = 0;
                            }
                            this.forceUpdate();
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
                    <SText fontSize={18} bold color={100 < this._recibido ? "green" : "red"}    >
                        {this.form?.getValues().cambio + " ape"}
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
                            this.forceUpdate();
                            SPopup.close("PopupPago");
                        }}
                    >
                        <SText color={STheme.color.text}>Cancelar</SText>
                    </SView>
                    <SView width={8} />
                    <SView center flex style={{ backgroundColor: "#18181b", borderColor: STheme.color.gray, borderWidth: 2, borderRadius: 4, height: 40 }}
                        onPress={() => {
                            if (!this._recibido || parseFloat(this._recibido) < 100) {
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
                                    totalFinal: SMath.formatMoney(100, 2),
                                    montoRecibido: SMath.formatMoney(this._recibido, 2),
                                    cambio: SMath.formatMoney((this._recibido - 100), 2),
                                    conFactura: conFactura ? "si" : "no",
                                },
                                carrito: this.props.carrito,
                            });
                            this.showPaymentModal = false;
                            this._recibido = "";
                            this._devolvido = "";
                            this.data.cliente = "";
                            this.props.onReload();
                            this.forceUpdate();
                            SPopup.close("PopupPago");
                        }}
                    >
                        <SText color={STheme.color.background}>Confirmar Pago</SText>
                    </SView>
                </SView>
            </SView>
        })
    }
    renderTecladoNumerico = () => {
        const cliente = this.data?.cliente ?? {};
        const { key, nombres, apellidos, telefono, nombre_completo } = cliente;
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
        const subtotal = 100;
        const totalConIVA = 150;
        const totalImpuesto = 545;
        const totalDescuento = 0;
        const totalFinal = 10;
        const carro = [];
        return (
            <>
                <SView col={"xs-0 sm-12"} row color={STheme.color.danger}>
                    <SView col={"xs-4"}>
                        <SView center flex backgroundColor={STheme.color.darkGray} border={STheme.color.card} style={{ borderRadius: 2, margin: 2 }} onPress={() => {
                            PopupConfirmaPago.open({
                                total: 100,
                                descuento: 5,
                                subtotal: subtotal,
                                totalImpuesto: totalImpuesto,
                                numeroIva: 54,
                                totalDescuento: totalDescuento,
                                totalFinal: totalFinal,
                                carro: carro,
                            })
                        }}>
                            <SText style={{ ...style_text, textTransform: 'uppercase' }}>Pagar</SText>
                        </SView>
                    </SView>
                    <SView flex />
                </SView>
                {this.props.subtotal ? <SView col={"xs-12 md-0"} height={42} center backgroundColor={STheme.color.darkGray} border={STheme.color.card} style={{ borderRadius: 2, margin: 2 }} onPress={() => {
                    this.renderPopudPago()
                }}>
                    <SText style={{ ...style_text, textTransform: 'uppercase' }}>Procesar Pagosss</SText>
                </SView>
                    : null}
            </>
        );
    };
    render() {
        return <>
            { }
            {this.renderTecladoNumerico()}
            { }
        </>
    }
}
