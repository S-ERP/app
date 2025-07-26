import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SView, SText, STheme, SMath } from 'servisofts-component';

export default class ResumenTotales extends Component {
    render() {
        const { subtotal, totalConIVA, totalFinal } = this.props;

        return (
            <SView
                col={"xs-12"}
                border={STheme.color.card}
                style={{ borderRadius: 2, padding: 16, marginBottom: 8 }}
                height={80}
            >
                <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 4 }}>
                    <SText fontSize={13} color={STheme.color.darkGray}>Subtotal:</SText>
                    <SText fontSize={14} bold color={STheme.color.darkGray}>Bs {SMath.formatMoney(subtotal, 2)}</SText>
                </SView>
                <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                    <SText fontSize={12} color={STheme.color.darkGray}>Impuesto:</SText>
                    <SText fontSize={13} color={STheme.color.darkGray}>Sumar IVA 13%  Bs {SMath.formatMoney(totalConIVA, 2)}</SText>
                </SView>
                <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 4 }}>
                    <SText fontSize={13} color={STheme.color.darkGray}>Total:</SText>
                    <SText fontSize={16} bold color={STheme.color.darkGray}>Bs {SMath.formatMoney(totalFinal, 2)}</SText>
                </SView>
            </SView>
        );
    }
}
