import React, { Component } from 'react';
import Svg from "react-native-svg";
import { Path, Rect, Line, Circle, Text } from "react-native-svg";
import { SMath, STheme } from 'servisofts-component';
function generarColorPastel() {
    var r = Math.floor(Math.random() * 156) + 50;
    var g = Math.floor(Math.random() * 156) + 50;
    var b = Math.floor(Math.random() * 156) + 50;
    return "rgb(" + r + ", " + g + ", " + b + ")";
}
export const Barra = ({ x, height, width, porcentaje, label, monto }) => {
    var color = generarColorPastel()
    return <>
        {/* Horizontal */}
        <Rect y={x + 14} width={1} height={"100%"} fill={color} opacity={0.2} x={((porcentaje * 0.8)).toFixed(0) + "%"} />
        {/* Vertical */}
        <Rect y={x + 20} width={"100%"} height={1} fill={color} opacity={0.2} x={((porcentaje * 0.8)).toFixed(0) + "%"} />
        {/* Barra */}
        <Rect x={1} y={x} width={(porcentaje * 0.8).toFixed(0) + "%"} height={width} fill={color}  opacity={0.7}/>

        <Text fill={STheme.color.text} fontSize="12" fontWeight="bold" font-family="Arial" x={2} y={x + 14}>{label}</Text>
        <Text fill={STheme.color.text} fontSize="12" fontWeight="bold" font-family="Arial" textAnchor="end" x={"99%"} y={x + 14}>{SMath.formatMoney(monto)}</Text>
    </>
}

export const Container = ({ width, height, children }) => {
    return <Svg width="100%" height="100%" fill="none">
        {children}
        {/* <Rect x={"90%"} y={0} width={1} height={"100%"} fill={STheme.color.card} /> */}
    </Svg>
}
