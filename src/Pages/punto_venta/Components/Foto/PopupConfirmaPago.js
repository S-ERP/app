import React, { Component } from 'react';
import { SView, SText, STheme, SForm, SPopup, SInput, SMath, SNotification } from 'servisofts-component';
import SIconApp from '../../../../Assets/SIconApp';
import ResumenTotales from '../Carrito/ResumenTotales';

export default class PopupConfirmaPago extends Component {
    static open(props) {
        SPopup.open({
            key: "popup_config_horario",
            content: (
                <SView col="xs-11" backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 700 }} padding={16} withoutFeedback>
                    <SView col="xs-12" height={470}>
                        <PopupConfirmaPago {...props} />
                    </SView>
                </SView>
            )
        });
    }

    form = null;
    variableGlobal = "";

    render() {
        const defaultData = this.props?.data?.cliente ?? {};
        const { subtotal, totalImpuesto, totalDescuento, totalFinal, numeroIva, conFactura } = this.props;

        return (
            <SView col="xs-12">
                <SText fontSize={18} bold center>Confirmar Pago</SText>
                <SView height={8} />



                <ResumenTotales subtotal={subtotal} totalImpuesto={totalImpuesto} numeroIva={numeroIva} totalDescuento={totalDescuento} totalFinal={totalFinal}  ></ResumenTotales>

                <SView row    >



                    <SInput label={"Monto Recibido:"} placeholder={"0"} defaultValue={this.variableGlobal ?? null} type='number' border={STheme.color.card} style={{ backgroundColor: "transparent", }}
                        onChangeText={(text) => {
                            this.variableGlobal = text;
                            this.forceUpdate();
                        }}
                    />
                    <SInput label={"Descuento (Bs):"} placeholder={"0"} defaultValue={this.totalDescuento ?? null} type='number' border={STheme.color.card} style={{ backgroundColor: "transparent", }}
                        onChangeText={(text) => {
                            this.totalDescuento = text;
                            this.forceUpdate();
                        }}
                    />
                    <SView height={20} />
                    <SView center row style={{ justifyContent: "space-between", marginBottom: 40 }}>
                        <SText fontSize={16} color={STheme.color.text}>Cambio:</SText>
                        <SText fontSize={18} bold color={totalFinal > this.variableGlobal ? "red" : "green"}    >
                            Bs {this.variableGlobal ? SMath.formatMoney((this.variableGlobal - totalFinal) || 0, 2) : 0}
                        </SText>
                    </SView>


                    <SView center row >

                        <SView center flex style={{ borderColor: STheme.color.card, borderWidth: 2, borderRadius: 4, height: 40 }}
                            onPress={() => {
                                // this.showPaymentModal = false;
                                // this._recibido = "";
                                // this._devolvido = "";
                                // this.data.cliente = "";
                                // this.props.onReload();
                                // this.forceUpdate();
                                SPopup.close("popup_config_horario");

                            }}
                        >
                            <SText color={STheme.color.text}>Cancelar</SText>
                        </SView>
                        <SView width={8} />


                        <SView center flex style={{ backgroundColor: "#18181b", borderColor: STheme.color.gray, borderWidth: 2, borderRadius: 4, height: 40 }}
                            onPress={() => {


                                if (!this.variableGlobal || parseFloat(this.variableGlobal) < totalFinal) {
                                    SNotification.send({
                                        title: "Error",
                                        body: `Monto insuficiente para pagar`,
                                        type: "error",
                                        color: STheme.color.error,
                                        time: 5000,
                                    });
                                    return;
                                }
                                // const carritoFormateado = this.carrito.map(item => ({
                                //     key: item.key,
                                //     descripcion: item.descripcion,
                                //     precio_compra: item.precio_compra ?? 0,
                                //     precio_venta: item.precio_venta ?? 0,
                                //     stock: item.stock ?? 0,
                                //     cantidad: item.cantidad ?? 0,
                                //     key_marca: item.key_marca ?? null,
                                //     marca_descripcion: item.marca?.descripcion ?? null,
                                //     key_tipo_producto: item.key_tipo_producto ?? null,
                                //     tipo_producto: item.tipo_producto?.descripcion ?? null,
                                // }));
                                // const datos = this.dataFormateada({
                                //     caja: {
                                //         subtotal: SMath.formatMoney(subtotal, 2),
                                //         IVA: SMath.formatMoney(totalImpuesto, 2),
                                //         Descuento: SMath.formatMoney(totalDescuento, 2),
                                //         totalFinal: SMath.formatMoney(totalFinal, 2),
                                //         montoRecibido: SMath.formatMoney(this._recibido, 2),
                                //         cambio: SMath.formatMoney((this._recibido - totalFinal), 2),
                                //         conFactura: conFactura ? "si" : "no",
                                //     },

                                //     carrito: this.props.carrito,
                                //     cliente: this.data.cliente,
                                //     // cliente: this.props.data ? this.props.data?.cliente : this.data.cliente,
                                //     // cliente: this.data?.cliente,
                                //     vendedor: Model.usuario.Action.getUsuarioLog()
                            }


                                // console.log("🧾 Venta Formateada:");
                                // console.log(JSON.stringify(datos, null, 2));


                                // this.showPaymentModal = false;
                                // this._recibido = "";
                                // this._devolvido = "";
                                // this.data.cliente = "";
                                // this.props.onReload();
                                // this.forceUpdate();
                                // SPopup.close("PopupPago");



                            }
                        >
                            <SText color={STheme.color.background}>Confirmar Pago</SText>
                        </SView>



                    </SView>

                    {/*
                <SForm
                    row
                    ref={(ref) => this.form = ref}
                    style={{ justifyContent: "space-between" }}
                    inputs={{
                        nit: {
                            col: "xs-12",
                            label: "NIT",
                            type: 'number',
                            required: true,
                            defaultValue: defaultData?.nit,
                            autoFocus: true,
                            iconR: (
                                <SView width={30} height={30} center onPress={() => { }}>
                                    <SIconApp name='Search' fill={STheme.color.lightGray} />
                                </SView>
                            ),
                            onChangeText: (text) => {
                                this.variableGlobal = text;
                                this.forceUpdate(); // sin state
                            },
                        },
                        cambio: {
                            col: "xs-12",
                            label: "Cambio a devolver",
                            disabled: true,
                            defaultValue: this.variableGlobal,
                        }
                    }}
                /> */}
                </SView>
                <SView height={16} />
                <SText fontSize={16} center color={totalFinal > this.variableGlobal ? "red" : "green"}   >Valor ingresado: {this.variableGlobal}</SText>
            </SView>
        );
    }
}
