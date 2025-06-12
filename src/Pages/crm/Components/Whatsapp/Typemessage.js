import React, { Component } from "react";
import { SDate, SHr, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SThread, SView, SIcon } from "servisofts-component";
import SSocket from "servisofts-socket";
import MsgText from "./tipo/MsgText";
import MsgStiker from "./tipo/MsgStiker";
import MsgImg from "./tipo/MsgImg";

export default class Typemessage extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }


    condicion() {
        if (this.props.mensaje.type == "chat") return <MsgText colorado={this.props.mensaje} />
        if (this.props.mensaje.type == "image") return <MsgImg colorado={this.props.mensaje} />
        // if (this.props.mensaje.type == "sticker") return <MsgStiker colorado={this.props.mensaje} />
        // if (this.props.mensaje.type == "ppt") return <MsgStiker colorado={this.props.mensaje} />
    }


    render() {
        console.log(this.props.mensaje)

        const isEnviado = this.props.mensaje.fromMe;
        const tipoMensaje = this.props.mensaje.type;
        const id = this.props.mensaje.id;

        const texto = this.props.mensaje.body;
        // const hora = this.props.mensaje.time;

        // const timestamp = 1749712776;

        // Convertir a milisegundos y crear un Date
        const date = new Date(this.props.mensaje.timestamp * 1000);

        // Formatear a hora legible
        const opciones = { hour: 'numeric', minute: '2-digit', hour12: true };
        const hora = date.toLocaleTimeString('en-US', opciones);

        return this.condicion();

        return <SView col={"xs-12"} key={id} border={"transparent"} style={{ marginBottom: 2 }}>
            {this.condicion()}

            {(tipoMensaje === "chat") && (
                <SView
                    style={{
                        alignSelf: isEnviado ? "flex-end" : "flex-start",
                        marginHorizontal: 15,
                        width: "auto",
                        maxWidth: "100%",
                    }}
                >

                    <SText color={"#8696a0"} fontSize={11}>
                        {hora} {isEnviado && <SText color={"#53bdeb"}>✓✓</SText>}
                    </SText>
                </SView>
            )}



            {(tipoMensaje === "image") && (
                <SView border={"red"}
                    style={{
                        alignSelf: isEnviado ? "flex-end" : "flex-start",
                        marginHorizontal: 15,
                        width: "auto",
                        maxWidth: "100%",
                    }}
                >
                    <SView style={{ position: "absolute", marginTop: -25, marginLeft: isEnviado ? -70 : 195, width: 75 }}  >
                        <SText color={"#8696a0"} fontSize={11}>
                            {hora} {isEnviado && <SText color={"#53bdeb"}>✓✓</SText>}
                        </SText>
                    </SView>
                </SView>
            )}
        </SView>


    }
}