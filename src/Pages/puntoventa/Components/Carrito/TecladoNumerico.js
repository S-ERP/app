import React, { Component } from 'react';
import { SView, SText, STheme, SNavigation, SMath, SInput, SButtom, SPopup, SNotification, SForm, SHr, SThread } from 'servisofts-component';
import Model from '../../../../Model';
import MDL from '../../../../MDL';
import SIconApp from '../../../../Assets/SIconApp';
import PButtom from '../../../../Components/PButtom';
import PButtom3 from '../../../../Components/PButtom3';
import ResumenTotales from './ResumenTotales';
import FotoCliente2 from '../Foto/FotoCliente';
import PopupConfirmaPago from './PopupConfirmaPago';
export default class TecladoNumerico extends Component {
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
    dataSinFormateada({ carrito = [], cliente = null, vendedor = null }) {
        return {
            carrito,
            cliente,
            vendedor,
        };
    }
    renderPopudPago() {
        const { subtotal, descuento, totalImpuesto, totalDescuento, totalFinal, numeroIva, conFactura } = this.props;
        let monto_recibido_number = parseFloat(this._recibido);
        if (isNaN(monto_recibido_number)) monto_recibido_number = 0;
        if (!this._recibido) this._recibido = "";
        if (!this._devolvido) this._devolvido = 0;
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
                            this.forceUpdate();
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
                            console.log("🧾 Venta Formateadaaaaaaaaaaaa:");
                            console.log(JSON.stringify(datos, null, 2));
                            this.showPaymentModal = false;
                            this._recibido = "";
                            this._devolvido = "";
                            this.data.cliente = {};
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
        const cliente = this.data.cliente ?? {};
        const { key, nombres, apellidos, telefono, nombre_completo } = cliente;
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
        return (
            <>
                <SView col={"xs-0 sm-12"} row color={STheme.color.danger}>
                    <SView col={"xs-4"}>
                        <SView center backgroundColor={STheme.color.darkGray} border={STheme.color.card} style={{ height: 44, borderRadius: 2, margin: 2 }}>
                            <FotoCliente2 onReload2={(cliente) => {
                                this.data.cliente = cliente;
                                this.forceUpdate();
                            }}  ></FotoCliente2>
                        </SView>
                        <SView center flex backgroundColor={STheme.color.darkGray} border={STheme.color.card} style={{ borderRadius: 2, margin: 2 }} onPress={() => {
                            let carro = this.props?.carrito || {};
                            console.log("mirala1 " + JSON.stringify(this.data.cliente))
                            PopupConfirmaPago.open({
                                subtotal: subtotal,
                                descuento: this.props.descuento,
                                iva: this.props.descuento,
                                totalImpuesto: totalImpuesto,
                                totalDescuento: descuento,
                                totalFinal: totalFinal,
                                numeroIva: numeroIva,
                                conFactura: conFactura,
                                carrito: this.props?.carrito || {},
                                cliente: this.data?.cliente,
                                onReload: () => {
                                    this.props?.onReload?.(); // o cualquier otra función de recarga
                                }
                            }
                            )
                        }}>
                            <SText style={{ ...style_text, textTransform: 'uppercase' }}>Pagare</SText>
                        </SView>
                    </SView>
                    <SView col={"xs-8"}>
                        {teclas.map((fila, i) => (
                            <SView key={i} row>
                                {fila.map((t, j) => (
                                    <SView key={j} flex center backgroundColor={STheme.color.darkGray} border={STheme.color.card}
                                        style={{ height: 44, borderRadius: 2, margin: 2 }}
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
                        this.data.cliente = null;
                        return;
                        PopupConfirmaPago.open({
                            subtotal: subtotal,
                            descuento: this.props.descuento,
                            totalImpuesto: totalImpuesto,
                            totalDescuento: totalDescuento,
                            totalFinal: totalFinal,
                            numeroIva: numeroIva,
                            conFactura: conFactura,
                            carrito: this.props?.carrito || {},
                            cliente: this.data.cliente
                        })
                    }}>
                        <SText style={{ ...style_text, textTransform: 'uppercase' }}>Procesar Pagosss</SText>
                    </SView>
                        : null
                }
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
