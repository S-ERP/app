import React from "react";
import { SNotification, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import Label from "./Label";
import { Factura } from "../../../MDL/factura/type";



type NitNumeroProps = {
    factura: Factura
}
export default class NitNumero extends React.Component<NitNumeroProps> {


    render() {
        return <SView col={"xs-12"} center>
            <SView col={"xs-12"} row >
                <Label bold flex>{"NIT"}</Label>
                <Label style={{ width: 90 }} >{this.props.factura.data.nitEmisor}</Label>
            </SView>
            <SView col={"xs-12"} row >
                <Label bold flex>{"FACTURA N"}</Label>
                <Label style={{ width: 90 }} >{this.props.factura.data.numeroFactura}</Label>
            </SView>
            <SView col={"xs-12"} row >
                <Label bold flex>{"CÓD. AUTORIZACIÓN"}</Label>
                <Label style={{ width: 90 }} >{this.props.factura.data.cuf}</Label>
            </SView>
        </SView>
    }
}