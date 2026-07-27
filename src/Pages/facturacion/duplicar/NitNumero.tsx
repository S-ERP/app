import React from "react";
import { SInput, SNotification, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import Label from "./Label";
import { Factura } from "../../../MDL/factura/type";



type NitNumeroProps = {
    factura: Factura
}
const customStyle: any = "factura";
export default class NitNumero extends React.Component<NitNumeroProps> {


    render() {

        console.clear();
        console.log(JSON.stringify(this.props.factura.data));
        return <SView col={"xs-12"} center>
            <SView col={"xs-12"} row >
                <Label bold flex>{"NIT"}</Label>

                <SInput flex customStyle={customStyle}
                    defaultValue={this.props.factura.data.nitEmisor}

                    onChangeText={e => {
                        this.props.factura.data.nitEmisor = e
                    }} />


            </SView>
            <SView col={"xs-12"} row >
                <Label bold flex>{"FACTURA N"}</Label>
                <SInput flex customStyle={customStyle}
                    defaultValue={this.props.factura.data.numeroFactura}
                    onChangeText={e => {
                        this.props.factura.data.numeroFactura = e
                    }} />
            </SView>
            <SView col={"xs-12"} row >
                <Label bold flex>{"CÓD. AUTORIZACIÓN"}</Label>
                <SInput flex customStyle={customStyle}
                    defaultValue={this.props.factura.data.cuf}
                    onChangeText={e => {
                        this.props.factura.data.cuf = e
                    }} />
            </SView>
            <SView col={"xs-12"} row >
                <Label bold flex>{"MÉTODO DE PAGO"}</Label>
                <SInput flex customStyle={customStyle}
                    defaultValue={this.props.factura.data.codigoMetodoPago}
                    onChangeText={e => {
                        this.props.factura.data.codigoMetodoPago = e
                    }} />
            </SView>
        </SView>
    }
}