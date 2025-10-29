import React, { Component } from "react";
import { SText, SView } from "servisofts-component";
import HoraLabel from "../Comp/HoraLabel";
import QuotedMsg from "../Comp/QuotedMsg";

export default class MsgText extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    // Función para formatear el texto
    formatText = (texto) => {
        // Reemplazar texto entre asteriscos por negrita
        let formattedText = texto.replace(/\*(.*?)\*/g, (match, p1) => `<b>${p1}</b>`);

        // Reemplazar links por etiquetas <a> con la URL
        formattedText = formattedText.replace(/https?:\/\/[^\s]+/g, (match) => `<a href="${match}" target="_blank">${match}</a>`);

        return formattedText;
    }

    render() {
        const isEnviado = this.props.mensaje.fromMe;
        const texto = this.props.mensaje.body;
        const hora = this.props.mensaje.time;

        // Formatear el texto antes de mostrarlo
        const formattedTexto = this.formatText(texto);

        return (
            <SView style={{ backgroundColor: this.props.color, borderRadius: 10, padding: 6, width: "auto", maxWidth: "80%", alignItems: "flex-start" }}>
                {this.props.mensaje.hasQuotedMsg && <QuotedMsg mensaje={this.props.mensaje} key_device={this.props.key_device} />}
                <SText col={"xs-12"} clean color={"white"} fontSize={14}>
                    {/* <span style={{  }} dangerouslySetInnerHTML={{ __html: formattedTexto + "                  " }} /> */}
                    {formattedTexto}{"                   "}

                    {/* <SText clean>{"               "}</SText> */}
                </SText>
                <HoraLabel mesaje={this.props.mensaje} style={{
                    position: "absolute",
                    bottom: 4, right: 4,
                }} />

            </SView>
        );
    }
}
