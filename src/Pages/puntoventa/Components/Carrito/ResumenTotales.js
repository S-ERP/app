import React, { Component } from 'react';
import { SView, SText, STheme, SMath, SHr } from 'servisofts-component';
export default class ResumenTotales extends Component {
    render() {
        const { monedaSymbol,subtotal, totalImpuesto, numeroIva, totalDescuento } = this.props;


        //     const precio = item.selectedMoneda
        //     ? item.precio_venta / (item.selectedMoneda.tipo_cambio || 1)
        //     : item.precio_venta;
        // const monedaSymbol = item.selectedMoneda ? item.selectedMoneda.observacion : 'Bs';
        console.log("precio en carrito " + JSON.stringify(monedaSymbol));
        // console.log("monedaSymbol en carrito " + JSON.stringify(monedaSymbol));
        // console.log("selectedMoneda en carrito " + JSON.stringify(item.selectedMoneda));
        // si quiero cambiar el precio aca

        return (
            <SView
                col={"xs-12"}
                border={STheme.color.card}
                style={{ borderRadius: 8, padding: 8, backgroundColor: STheme.color.card }}
                height={100}
            >
                <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 4 }}>
                    <SText fontSize={13} color={STheme.color.text}>Subtotal:</SText>
                    <SText fontSize={13} bold color={STheme.color.text}>
                        Bs {SMath.formatMoney(subtotal, 2)}
                    </SText>
                </SView>
                <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                    <SText fontSize={12} color={STheme.color.text}>
                        IVA ({numeroIva}%)
                    </SText>
                    <SText fontSize={13} color={STheme.color.text}>
                        + Bs {SMath.formatMoney(totalImpuesto, 2)}
                    </SText>
                </SView>
                <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                    <SText fontSize={12} color={STheme.color.text}>Descuento:</SText>
                    <SText fontSize={13} color={STheme.color.text}>
                        - Bs {SMath.formatMoney(totalDescuento || 0, 2)}
                    </SText>
                </SView>
                <SHr height={3} />
                <SView col={"xs-12"} style={{ borderColor: STheme.color.gray, borderBottomWidth: 2 }} />
                <SHr height={5} />
                <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 4, padding: 3 }}>
                    <SText fontSize={18} color={STheme.color.text}>Total:</SText>
                    <SText fontSize={18} bold color={STheme.color.text}>
                        Bs {SMath.formatMoney((subtotal - (totalDescuento || 0)), 2)}
                    </SText>
                </SView>
            </SView>
        );
    }
}
