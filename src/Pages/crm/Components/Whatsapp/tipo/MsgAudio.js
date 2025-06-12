import React, { Component } from "react";
import { View } from "react-native";
import { SDate, SHr, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SThread, SView, SIcon } from "servisofts-component";
import SSocket from "servisofts-socket";

export default class MsgAudio extends Component {
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

            <View style={{
                backgroundColor: this.props.color, borderRadius: 8, padding: 12, marginHorizontal: 10,
                width: "80%",
                height: 50,
                flexDirection: "row"
            }}>
                <SText color={"white"} fontSize={14}>{texto}</SText>
                {/* <SIcon name={"crmplay"} width={16} fill="white" /> */}
                <SIcon name="crmplay" fill="white" width={18} height={18} />
                <SIcon name="crmpause" fill="white" width={18} height={18} />

                <SView flex={1} />
            </View>







        );
    }



}
