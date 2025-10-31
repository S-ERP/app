import React, { Component } from "react";
import { SImage, SText, SView, STheme } from "servisofts-component";
import HoraLabel from "../Comp/HoraLabel";
import MDL from "../../../MDL";
import QuotedMsg from "../Comp/QuotedMsg";

export default class MsgStiker extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    // Mostrar remitente (solo si es grupo y no es un mensaje propio)
    renderRemitente() {
        const { mensaje } = this.props;

        if (mensaje.fromMe || !mensaje.id?.remote?.includes("@g.us")) return null;

        let nombre = mensaje._data?.notifyName || mensaje._data?.pushname || mensaje.author || "Desconocido";

        // Si viene algo como "59160000000@c.us" → limpiar
        if (typeof nombre === "string") {
            nombre = nombre.replace(/@.*$/, "");
        }

        return (
            <SText
                color={STheme.color.primary}
                fontSize={12}
                bold
                style={{
                    marginBottom: 2,
                    alignSelf: "flex-start",
                }}
            >
                {nombre}
            </SText>
        );
    }

    render() {
        const { mensaje, key_device, color } = this.props;
        const isEnviado = mensaje.fromMe;

        return (
            <SView
                style={{
                    alignSelf: isEnviado ? "flex-end" : "flex-start",
                    marginHorizontal: 10,
                    marginVertical: 4,
                    maxWidth: "80%",
                    backgroundColor: mensaje.hasQuotedMsg ? color : color,
                    borderRadius: 10,
                    padding: 6,
                }}
            >
                {/* Mensaje citado (reply) */}
                {mensaje.hasQuotedMsg && (
                    <QuotedMsg mensaje={mensaje} key_device={key_device} />
                )}

                {/* Contenido del mensaje */}
                <SView
                    style={{
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {/* Nombre del remitente (solo grupos) */}
                    {this.renderRemitente()}

                    {/* Sticker */}
                    <SView
                        width={130}
                        height={130}
                        style={{
                            borderRadius: 8,
                            overflow: "hidden",
                            backgroundColor: "rgba(255,255,255,0.05)",
                        }}
                    >
                        <SImage
                            src={MDL.whatsapp.device.getMedia(
                                key_device,
                                mensaje.id._serialized
                            )}
                            style={{
                                width: "100%",
                                height: "100%",
                                resizeMode: "contain",
                            }}
                        />
                    </SView>
                </SView>

                {/* Hora del mensaje */}
                <HoraLabel
                    mesaje={mensaje}
                    style={{
                        position: "absolute",
                        bottom: 2,
                        right: 6,
                        color: "white",
                    }}
                />
            </SView>
        );
    }
}
