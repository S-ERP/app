import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SMath, SText, SView } from 'servisofts-component';

export default function Subtotal({ carrito }) {
    const subtotal = carrito.reduce((acc, item) => {
        const precio = parseFloat(item.precio_venta || 0);
        return acc + (item.cantidad * precio);
    }, 0);

    return (
        <SView row justifyContent='space-between' style={{ marginTop: 8 }}>
            <SText fontSize={14} bold color={"#111827"}>Subtotal</SText>
            <SText fontSize={14} bold color={"#10B981"}>Bs {SMath.formatMoney(subtotal, 2)}</SText>
        </SView>
    );
}
