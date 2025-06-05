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
        const size = this.props.size || 10;
        return <SView style={{
            padding: size / 4,
            paddingStart: size / 2,
            paddingEnd: size / 2,
            borderRadius: size / 4,
            backgroundColor: (MDL.crm.clienteProyecto.stageColor[this.props.tipo_leads] ?? STheme.color.text),
            ...(this.props.style ?? {})
        }}>
            <SText fontSize={size} bold color={STheme.color.text} center >{MDL.crm.clienteProyecto.stageNombre[this.props.tipo_leads]}</SText>
        </SView>
    }
}