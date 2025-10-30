import React, { Component } from "react";
import { SText, SView, SNavigation } from "servisofts-component";
import HoraLabel from "../Comp/HoraLabel";
import QuotedMsg from "../Comp/QuotedMsg";

export default class MsgText extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    // Función que separa texto normal y links
    renderTextoConLinks = (texto) => {
        if (!texto) return null;

        // Expresión regular para detectar URLs
        const regex = /(https?:\/\/[^\s]+)/g;
        const partes = texto.split(regex);

        return partes.map((parte, i) => {
            if (parte.match(regex)) {
                // Es un link → clickeable y con estilo
                return (
                    <SText
                        key={i}
                        color={"#4da6ff"}
                        style={{ textDecorationLine: "underline" }}
                        onPress={() => SNavigation.openURL(parte)}
                    >
                        {parte}
                    </SText>
                );
            }

            // Detectar texto en negrita con *...*
            const boldParts = parte.split(/(\*.*?\*)/g);
            return boldParts.map((bp, j) => {
                if (bp.startsWith("*") && bp.endsWith("*")) {
                    return (
                        <SText key={`${i}-${j}`} bold color={"white"}>
                            {bp.replace(/\*/g, "")}
                        </SText>
                    );
                }
                return (
                    <SText key={`${i}-${j}`} color={"white"}>
                        {bp}
                    </SText>
                );
            });
        });
    };

    render() {
        const texto = this.props.mensaje.body;
        const isEnviado = this.props.mensaje.fromMe;

        return (
            <SView
                style={{
                    backgroundColor: this.props.color,
                    borderRadius: 10,
                    padding: 6,
                    maxWidth: "80%",
                    paddingRight: 80,
                    alignItems: "flex-start",
                    position: "relative",
                }}
            >
                {this.props.mensaje.hasQuotedMsg && (
                    <QuotedMsg
                        mensaje={this.props.mensaje}
                        key_device={this.props.key_device}
                    />
                )}

                <SText fontSize={14} color={"white"}>
                    {this.renderTextoConLinks(texto)}
                </SText>

                <HoraLabel
                    mesaje={this.props.mensaje}
                    style={{
                        position: "absolute",
                        bottom: 4,
                        right: 4,
                    }}
                />
            </SView>
        );
    }
}
