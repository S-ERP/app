import React, { Component } from 'react';
import { SView, SText, STheme, SForm, SPopup, SInput, SMath, SNotification } from 'servisofts-component';
import SIconApp from '../../../../Assets/SIconApp';
import ResumenTotales from '../Carrito/ResumenTotales';
import carrito from '../../../../Model/inventario/carrito';
import Model from '../../../../Model';



export default class PopupConfirmaPago extends Component {
    static open(props) {
        SPopup.open({
            key: "popup_config_horario",
            type: 1,
            content: (
                <SView col="xs-10 sm-9 " center backgroundColor={STheme.color.background} style={{
                    borderRadius: 8, maxWidth: 400,
                    shadowColor: "#18181b",
                    shadowOffset: { width: 5, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 60,
                }} padding={24} withoutFeedback>
                    <PopupConfirmaPago {...props} />
                </SView>
            )
        });
    }

    variableGlobal = "";
    totalDescuento = 0;

    dataFormateada({ carrito = null, cliente = null, caja = null, vendedor = null }) {
        return {
            carrito: carrito.map(item => ({
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
            })),
            key_cliente: cliente?.key ?? null,
            key_vendedor: vendedor?.key ?? null,
            caja: caja,
        };
    }

    render() {
        const { subtotal, totalImpuesto, totalDescuento, totalFinal, numeroIva, conFactura, carrito , cliente } = this.props;

        return (
             <SView col="xs-12" center>
                <SView height={8} />
                <SText fontSize={18} bold center>Confirmar Pago</SText>
                <SView height={8} />

                <ResumenTotales
                    subtotal={subtotal}
                    totalImpuesto={totalImpuesto}
                    numeroIva={numeroIva}
                    totalDescuento={totalDescuento}
                    totalFinal={totalFinal}
                />

                <SView col="xs-12" row>
                    <SInput
                        label="Monto Recibido:"
                        placeholder="0"
                        type="number"
                        border={STheme.color.card}
                        style={{ backgroundColor: "transparent" }}
                        onChangeText={(text) => {
                            this.variableGlobal = parseFloat(text) || 0;
                            this.forceUpdate();
                        }}
                    />
                    {/* <SInput
                        label="Descuento (Bs):"
                        placeholder="0"
                        type="number"
                        border={STheme.color.card}
                        style={{ backgroundColor: "transparent" }}
                        onChangeText={(text) => {
                            this.totalDescuento = parseFloat(text) || 0;
                            this.forceUpdate();
                        }}
                    /> */}
                </SView>

                <SView height={20} />
                <SView col="xs-12" row style={{ justifyContent: "space-between", }}>
                    <SText fontSize={16}>Cambio:</SText>
                    <SText fontSize={18} bold color={totalFinal > this.variableGlobal ? "red" : "green"}>
                        Bs {SMath.formatMoney((this.variableGlobal - totalFinal) || 0, 2)}
                    </SText>
                </SView>
                <SView height={20} />

                <SView col="xs-12" flex row style={{ height: 150 }}>

                    <SView center flex height={40} style={{ borderColor: STheme.color.card, borderWidth: 2, borderRadius: 4 }}
                        onPress={() => {
                            this.props?.onReload?.();
                            SPopup.close("popup_config_horario");
                        }}
                    >
                        <SText>Cancelar</SText>
                    </SView>

                    <SView width={8} />

                    <SView center flex height={40} style={{ backgroundColor: "#18181b", borderColor: STheme.color.gray, borderWidth: 1, borderRadius: 4 }}
                        onPress={() => {
                            if (!this.variableGlobal || this.variableGlobal < totalFinal) {
                                SNotification.send({
                                    title: "Error",
                                    body: "Monto insuficiente para pagar",
                                    type: "error",
                                    color: STheme.color.error,
                                    time: 5000,
                                });
                                return;
                            }

                            const vendedor = Model.usuario.Action.getUsuarioLog();


                            const caja = {
                                subtotal: SMath.formatMoney(subtotal, 2),
                                IVA: SMath.formatMoney(totalImpuesto, 2),
                                Descuento: SMath.formatMoney(this.totalDescuento, 2),
                                totalFinal: SMath.formatMoney(totalFinal, 2),
                                montoRecibido: SMath.formatMoney(this.variableGlobal, 2),
                                cambio: SMath.formatMoney((this.variableGlobal - totalFinal), 2),
                                conFactura: conFactura ? "si" : "no",
                            };

                            const datos = this.dataFormateada({
                                carrito,
                                cliente,
                                vendedor,
                                caja
                            });

                            console.log("🧾 Venta Formateada:", JSON.stringify(datos, null, 2));

                            this.props?.onReload?.();
                            SPopup.close("popup_config_horario");
                        }}
                    >
                        <SText color={STheme.color.background}>Confirmar Pago</SText>
                    </SView>
                </SView>

                <SView width={8} />
            </SView>
        );
    }
}
