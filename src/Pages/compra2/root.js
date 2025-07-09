import React from "react";
import { SPage, SText } from "servisofts-component";

export default class root extends React.Component {
    render() {
        return <SPage title={"compra"}>
            <SText>Sucursal</SText>
            <SText>Proveedor</SText>
            <SText>Productos</SText>
        </SPage>
    }
}