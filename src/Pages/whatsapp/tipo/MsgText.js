import React, { Component } from "react";
import { SText, SView } from "servisofts-component";
import HoraLabel from "../Comp/HoraLabel";
import QuotedMsg from "../Comp/QuotedMsg";

export default class MsgText extends Component {

    renderRemitente() {
        const { mensaje } = this.props;

        // Solo mostrar en chats de grupo y si no es tuyo
        if (mensaje.fromMe || !mensaje.from || !mensaje.id.remote.includes("@g.us")) return null;

        const nombre = mensaje._data.notifyName || mensaje._data.pushname || mensaje.author || "Desconocido";

        return (
            <SText
                color={"#a0d7ff"}
                fontSize={12}
                bold
                style={{
                    marginBottom: 1,
                    alignSelf: "flex-start",
                }}
            >
                {nombre}
            </SText>
        );
    }

    renderTextoConLinks = (texto) => {
        if (!texto) return null;
        const regex = /(https?:\/\/[^\s]+)/g;
        const partes = texto.split(regex);

        return partes.map((parte, i) => {
            if (parte.match(regex)) {
                return (
                    <SText
                        key={i}
                        color={"#4da6ff"}
                        style={{ textDecorationLine: "underline" }}
                        onPress={() => window.open(parte, "_blank")}
                    >
                        {parte}
                    </SText>
                );
            }

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
        const { mensaje, color, key_device } = this.props;
        const texto = mensaje.body;
        const isEnviado = mensaje.fromMe;

        return (
            <SView
                style={{
                    backgroundColor: color,
                    borderRadius: 10,
                    paddingVertical: 6,
                    paddingLeft: 8,
                    paddingRight: 55,
                    maxWidth: "80%",
                    alignItems: "flex-end",
                    alignSelf: isEnviado ? "flex-end" : "flex-start",
                    position: "relative",
                }}
            >
                {/* 🔹 Mostrar nombre del remitente si es grupo */}
                {this.renderRemitente()}

                {mensaje.hasQuotedMsg && (
                    <QuotedMsg mensaje={mensaje} key_device={key_device} />
                )}

                <SText fontSize={14} color={"white"} style={{ textAlign: "left" }}>
                    {this.renderTextoConLinks(texto)}
                </SText>

                <HoraLabel
                    mesaje={mensaje}
                    style={{
                        position: "absolute",
                        bottom: 4,
                        right: 8,
                    }}
                />
            </SView>
        );
    }
}
