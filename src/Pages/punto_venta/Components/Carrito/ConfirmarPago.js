import React, { Component } from 'react';
import { SView, SText, STheme, SNavigation, SMath, SInput, SButtom, SPopup, SNotification, SForm, SHr, SThread } from 'servisofts-component';
// import FotoCliente from '../Foto/FotoCliente';
import Model from '../../../../Model';
import MDL from '../../../../MDL';
import SIconApp from '../../../../Assets/SIconApp';
import PButtom from '../../../../Components/PButtom';
import PButtom3 from '../../../../Components/PButtom3';
import ResumenTotales from './ResumenTotales';

{/* <ConfirmarPago subtotal={subtotal} totalImpuesto={totalImpuesto} numeroIva={numeroIva} totalDescuento={totalDescuento} totalFinal={totalFinal} conFactura()  conFactura = { totalFinal } ></ConfirmarPago > */ }


export default class ConfirmarPago extends Component {
    constructor(props) {
        super(props);
        // this.data = props.data ?? {};
        // this.carrito = props.carrito ?? [];
        // this.dataFormateada = props.dataFormateada ?? ((data) => data);
        // this._recibido = "";
        // this._devolvido = 0;
        // this.descuentoManual = "";
        // this.showPaymentModal = false;
    }


    render() {

        alert("siiiiiiii")
        // const {
        //     subtotal,
        //     totalImpuesto,
        //     totalDescuento,
        //     totalFinal,
        //     numeroIva,
        //     conFactura
        // } = this.props;

        // let monto_recibido_number = parseFloat(this._recibido);
        // if (isNaN(monto_recibido_number)) monto_recibido_number = 0;
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
                    shadowColor: "#18181b",
                    shadowOffset: { width: 5, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 60,
                }}>

                <SText fontSize={18} bold center>Confirmar Pago</SText>
                <SView height={8} />

                {/* <ResumenTotales
                    subtotal={subtotal}
                    totalImpuesto={totalImpuesto}
                    numeroIva={numeroIva}
                    totalDescuento={totalDescuento}
                    totalFinal={totalFinal}
                /> */}

                <SView row>
                    <SInput
                        label={"Monto Recibido:"}
                        // defaultValue={this._recibido}
                        // onChangeText={(text) => {
                        //     this._recibido = text;
                        //     const recibido = parseFloat(text);
                        //     const total = parseFloat(totalFinal);
                        //     if (!isNaN(recibido) && !isNaN(total)) {
                        //         this._devolvido = recibido - total;
                        //     } else {
                        //         this._devolvido = 0;
                        //     }
                        //     this.forceUpdate();
                        // }}
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
                    {/* <SText fontSize={18} bold color={totalFinal < parseFloat(this._recibido) ? "green" : "red"}> */}
                    {/* Bs {SMath.formatMoney(this._devolvido, 2)} */}
                    {/* </SText> */}
                </SView>

                <SView center row>
                    <SView
                        center
                        flex
                        style={{
                            borderColor: STheme.color.card,
                            borderWidth: 2,
                            borderRadius: 4,
                            height: 40
                        }}
                    // onPress={() => {
                    //     this.showPaymentModal = false;
                    //     this._recibido = "";
                    //     this._devolvido = "";
                    //     if (this.data) this.data.cliente = "";
                    //     this.props.onReload?.();
                    //     this.forceUpdate();
                    //     SPopup.close("PopupPago");
                    // }}
                    >
                        <SText color={STheme.color.text}>Cancelar</SText>
                    </SView>

                    <SView width={8} />

                    <SView
                        center
                        flex
                        style={{
                            backgroundColor: "#18181b",
                            borderColor: STheme.color.gray,
                            borderWidth: 2,
                            borderRadius: 4,
                            height: 40
                        }}
                    // onPress={() => {
                    //     if (!this._recibido || parseFloat(this._recibido) < totalFinal) {
                    //         SNotification.send({
                    //             title: "Error",
                    //             body: `Monto insuficiente para pagar`,
                    //             type: "error",
                    //             color: STheme.color.error,
                    //             time: 5000,
                    //         });
                    //         return;
                    //     }

                    //     const carritoFormateado = this.carrito.map(item => ({
                    //         key: item.key,
                    //         descripcion: item.descripcion,
                    //         precio_compra: item.precio_compra ?? 0,
                    //         precio_venta: item.precio_venta ?? 0,
                    //         stock: item.stock ?? 0,
                    //         cantidad: item.cantidad ?? 0,
                    //         key_marca: item.key_marca ?? null,
                    //         marca_descripcion: item.marca?.descripcion ?? null,
                    //         key_tipo_producto: item.key_tipo_producto ?? null,
                    //         tipo_producto: item.tipo_producto?.descripcion ?? null,
                    //     }));

                    //     const datos = this.dataFormateada({
                    //         caja: {
                    //             subtotal: SMath.formatMoney(subtotal, 2),
                    //             IVA: SMath.formatMoney(totalImpuesto, 2),
                    //             Descuento: SMath.formatMoney(totalDescuento, 2),
                    //             totalFinal: SMath.formatMoney(totalFinal, 2),
                    //             montoRecibido: SMath.formatMoney(parseFloat(this._recibido), 2),
                    //             cambio: SMath.formatMoney((parseFloat(this._recibido) - totalFinal), 2),
                    //             conFactura: conFactura ? "si" : "no",
                    //         },
                    //         carrito: this.props.carrito,
                    //         cliente: this.data?.cliente,
                    //         vendedor: Model.usuario.Action.getUsuarioLog()
                    //     });

                    //     console.log("🧾 Venta Formateada:");
                    //     console.log(JSON.stringify(datos, null, 2));

                    //     this.showPaymentModal = false;
                    //     this._recibido = "";
                    //     this._devolvido = "";
                    //     if (this.data) this.data.cliente = "";
                    //     this.props.onReload?.();
                    //     this.forceUpdate();
                    //     SPopup.close("PopupPago");
                    // }}
                    >
                        <SText color={STheme.color.background}>Confirmar Pago</SText>
                    </SView>
                </SView>
            </SView>
        });
    }
}
