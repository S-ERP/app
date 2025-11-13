import React from "react";
import { SImage, SPage, SText, SView } from "servisofts-component";
import { TipoPasarelaProps } from "./index"

export default class banco_ganadero_qr extends React.Component<TipoPasarelaProps> {
    render() {
        return <SView>
            <SText>banco_ganadero_qr</SText>
            <SView style={{
                width: 200,
                height: 200,
            }}>
                <SImage src={require("../../../../Assets/img/grid.png")}/>
            </SView>
            <SText>{this.props.monto}</SText>
        </SView>
    }
}