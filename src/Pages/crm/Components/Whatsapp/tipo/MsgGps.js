import React, { Component } from "react";
import { View } from "react-native";
import { SDate, SHr, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SThread, SView, SIcon } from "servisofts-component";
import SSocket from "servisofts-socket";
import HoraLabel from "../Comp/HoraLabel";

export default class MsgGps extends Component {
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
                    backgroundColor: this.props.color,
                    borderRadius: 12, padding: 4,
                    marginHorizontal: 10,
                    width: "75%"
                }}>
                {/* <SText color={"white"} fontSize={14}>{texto}</SText> */}
                {/* <SImage src={}/> */}
                <SView style={{ width: "100%", height: 150, borderRadius: 12, overflow: "hidden", backgroundColor: STheme.color.card }} onPress={(e) => {
                    console.log(this.props.mensaje)
                }}>
                    {/* <SImage src={"data:img/png;base64," + this.props.mensaje.body} style={{ resizeMode: "cover", width: "100%", height: "100%" }} /> */}
                    <SImage src={this.props.mensaje.mediaData} style={{ resizeMode: "cover", width: "100%", height: "100%" }} />
                    {/* <SText>{JSON.stringify(this.props.mensaje)}</SText> */}
                </SView>
                <SHr />
                <SView padding={4}>
                    <SText>{this.props.mensaje?.location?.address}</SText>
                    <SView style={{ alignItems: "flex-end" }}>
                        <HoraLabel style={{}} mesaje={this.props.mensaje} />
                    </SView>
                </SView>
            </View>
        );
    }



}
