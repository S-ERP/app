import React from "react";
import { SIcon, SInput, STheme, SView } from "servisofts-component";
import Label from "./Label";
import { Factura } from "../../../MDL/factura/type";
import { Parametricas } from "../../../MDL/factura/typeParametricas";



type FooterProps = {
    factura: Factura,
    parametricas: Parametricas,
    mostrarErrores?: boolean,
    onSend: () => void
}
const customStyle: any = "facturaDuplicar";
const errorStyle = { borderWidth: 2, borderColor: STheme.color.danger };
export default class Footer extends React.Component<FooterProps> {
    render() {
        return <SView col={"xs-12"} row>
            <SView center flex>
                <SView col={"xs-12"} row center>
                    <Label bold>{"Leyenda"}</Label>
                    <SView width={8} />
                    <SInput flex customStyle={customStyle} defaultValue={this.props.factura.data.leyenda}
                        style={!this.props.factura.data.leyenda ? errorStyle : undefined}
                        onChangeText={e => {
                            this.props.factura.data.leyenda = e
                        }} />
                </SView>
                <Label center fontSize={9}>{`"Este documento es la Representación Gráfica de un Documento Fiscal Digital emitido en una modalidad de facturación en línea"`}</Label>
            </SView>
            {/* <SView width={16} />
            <SView width={80} height={80} card padding={8} onPress={this.props.onSend} >
                <SIcon name={"MessageSend"} fill={STheme.color.text} />
            </SView> */}
        </SView>
    }
}