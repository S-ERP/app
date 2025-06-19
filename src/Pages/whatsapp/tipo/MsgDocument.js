import React, { Component } from "react";
import { Linking, View } from "react-native";
import { SDate, SHr, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SThread, SView, SIcon } from "servisofts-component";
import SSocket from "servisofts-socket";
import HoraLabel from "../Comp/HoraLabel";

export default class MsgDocument extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }







    render() {
        const isEnviado = this.props.mensaje.fromMe;
        const tipoMensaje = this.props.mensaje.type;
        const id = this.props.mensaje.id;

        const texto = this.props.mensaje.body;
        const hora = this.props.mensaje.time;

        return (
            <View
                style={{
                    width: 240,
                    // width: "75%"
                    overflow: 'hidden',
                    marginHorizontal: 10,
                    backgroundColor: this.props.color,
                    borderRadius: 8,
                    borderRadius: 12, padding: 4,
                }}>
                <SView style={{ width: "100%", height: 150, borderRadius: 12, overflow: "hidden", backgroundColor: STheme.color.card }} onPress={(e) => { Linking.openURL("https://example.com/documento.pdf"); }}>
                    <SImage src={`data:img/png;base64,${this.props.mensaje._data.body}`} style={{ borderRadius: 8, position: "absolute", }} />
                </SView>

                <SHr height={4} />

                <SView padding={4}>
                    <SText color={"white"} fontSize={14}>Documento: {texto}</SText>
                    <SText>{this.props.mensaje?.location?.address}</SText>
                    <SView style={{ alignItems: "flex-end" }}>
                        <HoraLabel style={{}} mesaje={this.props.mensaje} />
                    </SView>
                </SView>
            </View>
        );
    }



}
