import React, { Component } from 'react';
import { SView, SText, STheme, SMath, SHr } from 'servisofts-component';
 
 
export default class ResumenTotales extends Component {
    render() {
        const { monedaSymbol, subtotal, subtotalMoneda, totalImpuesto, numeroIva, totalDescuento, totalFinal } = this.props;

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
                        {monedaSymbol} {SMath.formatMoney(subtotalMoneda, 2)}
                    </SText>
                </SView>
                <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                    <SText fontSize={12} color={STheme.color.text}>
                        IVA ({numeroIva}%)
                    </SText>
                    <SText fontSize={13} color={STheme.color.text}>
                        + {monedaSymbol} {SMath.formatMoney(totalImpuesto, 2)}
                    </SText>
                </SView>
                <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                    <SText fontSize={12} color={STheme.color.text}>Descuento:</SText>
                    <SText fontSize={13} color={STheme.color.text}>
                        - {monedaSymbol} {SMath.formatMoney(totalDescuento || 0, 2)}
                    </SText>
                </SView>
                <SHr height={3} />
                <SView col={"xs-12"} style={{ borderColor: STheme.color.gray, borderBottomWidth: 2 }} />
                <SHr height={5} />
                <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 4, padding: 3 }}>
                    <SText fontSize={18} color={STheme.color.text}>Total:</SText>
                    <SText fontSize={18} bold color={STheme.color.text}>
                        {monedaSymbol} {SMath.formatMoney(totalFinal, 2)}
                    </SText>
                </SView>
            </SView>
        );
    }
}
