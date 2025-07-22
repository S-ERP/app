import React, { Component, useState } from 'react';
import { SText, SView, SInput, SMath } from 'servisofts-component';

export default function Subtotal({ carrito }) {
    const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(0); // %
    const [vipDescuento, setVipDescuento] = useState(0); // Bs fijos

    const subtotal = carrito.reduce((acc, item) => {
        const precio = parseFloat(item.precio_venta || 0);
        return acc + (item.cantidad * precio);
    }, 0);

    const descuentoAplicado = subtotal * (descuentoPorcentaje / 100);
    const iva = subtotal * 0.15;
    const totalFinal = subtotal - descuentoAplicado - vipDescuento;

    return (
        <SView style={{ marginTop: 8 }}>
            <SView row justifyContent='space-between'>
                <SText bold>Subtotal:</SText>
                <SText>Bs {SMath.formatMoney(subtotal, 2)}</SText>
            </SView>

            <SView row justifyContent='space-between' alignItems='center'>
                <SText bold>Descuento %:</SText>
                <SInput
                    value={descuentoPorcentaje + ""}
                    keyboardType="numeric"
                    placeholder="0"
                    style={{ width: 80, textAlign: "right" }}
                    onChangeText={txt => setDescuentoPorcentaje(parseFloat(txt.replace(",", ".")) || 0)}
                />
            </SView>

            <SView row justifyContent='space-between' alignItems='center'>
                <SText bold>Descuento VIP Bs:</SText>
                <SInput
                    value={vipDescuento + ""}
                    keyboardType="numeric"
                    placeholder="0"
                    style={{ width: 80, textAlign: "right" }}
                    onChangeText={txt => setVipDescuento(parseFloat(txt.replace(",", ".")) || 0)}
                />
            </SView>

            <SView row justifyContent='space-between'>
                <SText bold>IVA 15%:</SText>
                <SText>Bs {SMath.formatMoney(iva, 2)}</SText>
            </SView>

            <SView row justifyContent='space-between' style={{ marginTop: 8 }}>
                <SText bold>Total Final:</SText>
                <SText bold color='#10B981'>Bs {SMath.formatMoney(totalFinal, 2)}</SText>
            </SView>
        </SView>
    );
}
