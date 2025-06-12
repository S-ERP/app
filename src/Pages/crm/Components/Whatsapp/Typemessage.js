import React, { Component } from "react";
import { SDate, SHr, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SThread, SView, SIcon } from "servisofts-component";
import SSocket from "servisofts-socket";
import MsgText from "./tipo/MsgText";
import MsgStiker from "./tipo/MsgStiker";
import MsgImg from "./tipo/MsgImg";
import MsgGps from "./tipo/MsgGps";
import MsgAudio from "./tipo/MsgAudio";
import MsgVideo from "./tipo/MsgVideo";

export default class Typemessage extends Component {

    render() {
        const isEnviado = this.props.mensaje.fromMe;
        const color = isEnviado ? "#005c4b" : "#202c33";
        if (this.props.mensaje.type == "chat") return <MsgText mensaje={this.props.mensaje} color={color} />
        if (this.props.mensaje.type == "image") return <MsgImg mensaje={this.props.mensaje} color={color} />
        if (this.props.mensaje.type == "video") return <MsgVideo mensaje={this.props.mensaje} color={color} />
        if (this.props.mensaje.type == "sticker") return <MsgStiker mensaje={this.props.mensaje} color={color} />
        if (this.props.mensaje.type == "ptt") return <MsgAudio mensaje={this.props.mensaje} color={color} />
        if (this.props.mensaje.type == "location") return <MsgGps mensaje={this.props.mensaje} color={color} />
        return <SText color={STheme.color.danger} padding={4}>{this.props.mensaje.type}</SText>;
    }
}