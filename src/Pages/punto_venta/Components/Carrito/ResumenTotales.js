import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SView, SText, STheme, SMath } from 'servisofts-component';
export default class ResumenTotales extends Component {
    render() {
        const { subtotal, totalImpuesto, numeroIva, totalDescuento, totalFinal } = this.props;
        const resp = totalFinal - subtotal;
        return (
            <SView
                col={"xs-12"}
                border={STheme.color.card}
                style={{ borderRadius: 2, padding: 14,   }}
                height={95}
            >
                <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 4 }}>
                    <SText fontSize={13} color={STheme.color.darkGray}>Subtotal:</SText>
                    <SText fontSize={13} bold color={STheme.color.darkGray}>Bs {SMath.formatMoney(subtotal, 2)}</SText>
                </SView>
                <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                    <SText fontSize={12} color={STheme.color.darkGray}>Impuesto : IVA  {numeroIva} %</SText>
                    <SText fontSize={13} color={STheme.color.darkGray}>+ Bs {SMath.formatMoney(totalImpuesto, 2)}</SText>
                </SView>
                <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                    <SText fontSize={12} color={STheme.color.darkGray}>Descuento:</SText>
                    <SText fontSize={13} color={STheme.color.darkGray}>- Bs {SMath.formatMoney(totalDescuento, 2)}</SText>
                </SView>
                <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 4 }}>
                    <SText fontSize={13} color={STheme.color.darkGray}>Total:</SText>
                    <SText fontSize={13} bold color={STheme.color.darkGray}>Bs {SMath.formatMoney(totalFinal, 2)}</SText>
                </SView>
            </SView>
        );
    }
}
