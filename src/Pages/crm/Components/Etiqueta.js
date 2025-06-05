import React, { Component } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { SButtom, SDate, SForm, SHr, SIcon, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SThread, SView } from "servisofts-component";
import SSocket from "servisofts-socket";
import MDL from "../../../MDL";
export default class Etiqueta extends Component<{ tipo_leads: string }> {

    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return <SView style={{
            padding: 2,
            paddingStart: 4,
            paddingEnd: 4,
            borderRadius: 4,
            backgroundColor: MDL.crm.clienteProyecto.stageColor[this.props.tipo_leads] ?? STheme.color.card,
            ...(this.props.style ?? {})
        }}>
            <SText fontSize={10} color={STheme.color.text} center>{this.props.tipo_leads}</SText>
        </SView>
    }
}