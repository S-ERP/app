import React, { Component } from 'react';
import { SView, SText, SButtom, STheme, SMath } from 'servisofts-component';

export default class ModalPago extends Component {
    calcularSubtotal() {
        const { carrito } = this.props;
        let subtotal = 0;
        for (let i = 0; i < carrito.length; i++) {
            const item = carrito[i];
            subtotal += (item.precio * item.cantidad);
        }
        return subtotal;
    }

    calcularTotalConIVA(subtotal) {
        const IVA = 0.13;
        return subtotal + (subtotal * IVA);
    }

    calcularTotalConDescuento(totalConIVA) {
        const { descuentoManual } = this.props;
        return totalConIVA - descuentoManual;
    }

    render() {
        const { visible, onClose, onConfirm, descuentoManual } = this.props;
        if (!visible) return null;

        const subtotal = this.calcularSubtotal();
        const totalConIVA = this.calcularTotalConIVA(subtotal);
        const totalFinal = this.calcularTotalConDescuento(totalConIVA);

        return (
            <SView
                col={'xs-12'}
                height={300}
                backgroundColor={STheme.color.background}
                style={{ borderRadius: 8, padding: 16 }}>
                <SText fontSize={18} bold>Confirmar pago</SText>

                <SView row>
                    <SView col={'xs-6'}><SText>Subtotal:</SText></SView>
                    <SView col={'xs-6'} align='end'>
                        <SText>Bs. {SMath.formatMoney(subtotal)}</SText>
                    </SView>
                </SView>

                <SView row>
                    <SView col={'xs-6'}><SText>IVA (13%):</SText></SView>
                    <SView col={'xs-6'} align='end'>
                        <SText>Bs. {SMath.formatMoney(totalConIVA - subtotal)}</SText>
                    </SView>
                </SView>

                <SView row>
                    <SView col={'xs-6'}><SText>Descuento:</SText></SView>
                    <SView col={'xs-6'} align='end'>
                        <SText>- Bs. {SMath.formatMoney(descuentoManual)}</SText>
                    </SView>
                </SView>

                <SView height={1} backgroundColor={STheme.color.card} marginY={8} />

                <SView row>
                    <SView col={'xs-6'}><SText bold>Total:</SText></SView>
                    <SView col={'xs-6'} align='end'>
                        <SText bold>Bs. {SMath.formatMoney(totalFinal)}</SText>
                    </SView>
                </SView>

                <SButtom type='outline' props={{ marginTop: 16 }} onPress={onConfirm}>
                    Confirmar
                </SButtom>

                <SButtom type='danger' props={{ marginTop: 8 }} onPress={onClose}>
                    Cancelar
                </SButtom>
            </SView>
        );
    }
}
