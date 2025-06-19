import React, { Component } from "react";
import { SDate, SHr, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SThread, SView, SIcon } from "servisofts-component";
import SSocket from "servisofts-socket";
import MsgText from "./tipo/MsgText";
import MsgStiker from "./tipo/MsgStiker";
import MsgImg from "./tipo/MsgImg";
import MsgGps from "./tipo/MsgGps";
import MsgAudio from "./tipo/MsgAudio";
import MsgVideo from "./tipo/MsgVideo";
import MsgTextDelete from "./tipo/MsgTextDelete";
import Msg_e2e_notification from "./tipo/Msg_e2e_notification";
import MVCard from "./tipo/MVCard";
import MsgDocument from "./tipo/MsgDocument";

export default class Typemessage extends Component {

    render() {
        const isEnviado = this.props.mensaje.fromMe;
        const color = isEnviado ? "#005c4b" : "#202c33";
        if (this.props.mensaje.type == "chat") return <MsgText key_device={this.props.key_device} mensaje={this.props.mensaje} color={color}  />
        if (this.props.mensaje.type == "image") return <MsgImg key_device={this.props.key_device} mensaje={this.props.mensaje} color={color} />
        if (this.props.mensaje.type == "document") return <MsgDocument key_device={this.props.key_device} mensaje={this.props.mensaje} color={color} />
        if (this.props.mensaje.type == "video") return <MsgVideo key_device={this.props.key_device} mensaje={this.props.mensaje} color={color} />
        if (this.props.mensaje.type == "sticker") return <MsgStiker key_device={this.props.key_device} mensaje={this.props.mensaje} color={color} />
        if (this.props.mensaje.type == "ptt") return <MsgAudio key_device={this.props.key_device} mensaje={this.props.mensaje} color={color} />
        if (this.props.mensaje.type == "audio") return <MsgAudio key_device={this.props.key_device} mensaje={this.props.mensaje} color={color} />
        if (this.props.mensaje.type == "location") return <MsgGps key_device={this.props.key_device} mensaje={this.props.mensaje} color={color} />
        if (this.props.mensaje.type == "revoked") return <MsgTextDelete key_device={this.props.key_device} mensaje={this.props.mensaje} color={color} />
        if (this.props.mensaje.type == "e2e_notification") return <Msg_e2e_notification key_device={this.props.key_device} mensaje={this.props.mensaje} color={color} />
        if (this.props.mensaje.type == "vcard") return <MVCard key_device={this.props.key_device} mensaje={this.props.mensaje} color={color} />

        return <SText color={STheme.color.danger} padding={4}>{this.props.mensaje.type}</SText>;
    }
}