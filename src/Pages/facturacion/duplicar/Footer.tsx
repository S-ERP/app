import React from "react";
import { SHr, SIcon, SInput, SNotification, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import Label from "./Label";
import { Factura } from "../../../MDL/factura/type";
import { Parametricas } from "../../../MDL/factura/typeParametricas";



type FooterProps = {
    factura: Factura,
    parametricas: Parametricas,
    onSend: () => void
}
export default class Footer extends React.Component<FooterProps> {




    render() {
        return <SView col={"xs-12"} row>
            <SView center flex>
                <Label center fontSize={9}>{this.props.factura.data.leyenda}</Label>
                <Label center fontSize={9}>{`"Este documento es la Representación Gráfica de un Documento Fiscal Digital emitido en una modalidad de facturación en línea"`}</Label>
            </SView>
            <SView width={16} />
            <SView width={80} height={80} card padding={8} onPress={this.props.onSend} >
                <SIcon name={"MessageSend"} fill={STheme.color.text} />
                {/* <SText>{"EMITIR"}</SText> */}
            </SView>
        </SView>
    }
}