import React, { Component } from 'react';
import { SView, SText, STheme, SForm, SPopup, SInput, SMath, SNotification } from 'servisofts-component';
import ResumenTotales from './ResumenTotales';
import Model from '../../../../Model';
import MDL from '../../../../MDL';
import ReciboRollo from '../../../../Components/PDF/venta/ReciboRollo';
import ReciboCarta from '../../../../Components/PDF/venta/ReciboCarta';
export default class PopupConfirmaPago extends Component {
    // sucursal = null;
    async componentDidMount() {
        this.sucursal = await MDL.compra_venta.getSucursalSeleccionada();
        // this.forceUpdate(); // Refresca para que aparezca la sucursal
    }
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
    // variableGlobal = "";
    // totalDescuento = 0;
    dataFormateada({ sucursal = null, carrito = [], cliente = null, caja = null, vendedor = null }) {
        const carritoFormateado = carrito.map(item => ({
            key_modelo: item.key,
            descripcion: item.descripcion,
            precio_unitario: item.precio_venta ?? 0,
            cantidad: item.cantidad ?? 0,
        }));
        const clienteFormateado = cliente?.key;
        const sucursalFormateado = sucursal?.key_sucursal;
        const vendedorFormateado = vendedor?.key;
        return {
            detalle: carritoFormateado,
            key_cliente: clienteFormateado ?? null,
            key_sucursal: sucursalFormateado ?? null,
            key_vendedor: vendedorFormateado ?? null,
            caja: caja,
        };
    }
    renderButton(totalFinal, subtotal, descuento, conFactura, carrito, cliente) {
        const sucursal = this.sucursal;
        // console.log("WWWWW")
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
        // console.log("WWWWW 1")
        if (!this.sucursal || !this.sucursal.key_sucursal) {
            SNotification.send({
                title: "Error",
                body: "No hay sucursal",
                type: "error",
                color: STheme.color.error,
                time: 5000,
            });
            return;
        }
        // console.log("WWWWW 2")
        const vendedor = Model.usuario.Action.getUsuarioLog();
        const caja = {
            subtotal: SMath.formatMoney(subtotal, 2),
            iva: SMath.formatMoney(descuento, 2),
            descuento: SMath.formatMoney(descuento || 0, 2),
            monto_total: SMath.formatMoney((subtotal - descuento), 2),
            montoRecibido: SMath.formatMoney(this.variableGlobal, 2),
            cambio: SMath.formatMoney((this.variableGlobal - totalFinal), 2),
            conFactura: conFactura ? true : false,
            monto_factura: conFactura ? SMath.formatMoney((subtotal - descuento), 2) : SMath.formatMoney(0, 2),
        };
        const datos = this.dataFormateada({
            sucursal,
            carrito,
            cliente,
            vendedor,
            caja
        });
        SNotification.send({
            key: "compra",
            title: "Esperando...",
            type: "loading",
        })
        MDL.compra_venta.registrar(datos).then((res) => {
            // this.forceUpdate();
            this.props?.onReload();
            this.props?.onReloadCliente?.(null); // Limpia cliente en FotoCliente

            ReciboRollo.imprimir(res.key)
            ReciboCarta.imprimir(res.key)
            SPopup.close("popup_config_horario");
            SNotification.remove("compra")
        }).catch(res => {
            console.log("compra_venta registrado error " + res.error),
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
    render() {
        const sucursal = this.sucursal;
        const { subtotal, descuento, totalImpuesto, totalDescuento, totalFinal, numeroIva, conFactura, carrito, cliente } = this.props;
        console.log("traeido " + cliente)
        return (
            <SView col="xs-12" center>
                <SView height={8} />
                <SText fontSize={18} bold center >Confirmar Pago</SText>
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
                        autoFocus={true}
                        type="number"
                        border={STheme.color.card}
                        style={{ backgroundColor: "transparent", borderRadius: 8 }}
                        onChangeText={(text) => {
                            this.variableGlobal = parseFloat(text) || 0;
                            this.forceUpdate();
                        }}
                        onKeyPress={(e) => {
                            if (e.key === "Enter") {
                                // this.props.onConfirm(this.variableGlobal);
                                // console.log("AAAAA")
                                this.renderButton(totalFinal, subtotal, descuento, conFactura, carrito, cliente);
                            }
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
                            this.props?.onReloadCliente?.(null); // Limpia cliente en FotoCliente

                            SPopup.close("popup_config_horario");
                        }}
                    >
                        <SText>Cancelar</SText>
                    </SView>
                    <SView width={8} />
                    <SView center flex height={40} style={{ backgroundColor: STheme.color.text, borderColor: STheme.color.gray, borderWidth: 1, borderRadius: 4 }}
                        onPress={() => {
                            this.renderButton(totalFinal, subtotal, descuento, conFactura, carrito, cliente)
                        }}
                    >
                        <SText color={STheme.color.background} >Confirmar Pago</SText>
                    </SView>
                </SView>
                <SView width={8} />
            </SView >
        );
    }
}
