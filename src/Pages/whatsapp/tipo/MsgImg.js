import React, { Component } from "react";
import { SView, SText, SImage } from "servisofts-component";
import HoraLabel from "../Comp/HoraLabel";
import MDL from "../../../MDL";

export default class MsgImg extends Component {
    constructor(props) {
        super(props);
        this.state = {
            widthImage: 0,
            heightImage: 0,
        };
    }

    componentDidMount() {
        const { width, height } = this.props.mensaje?._data ?? { width: 0, height: 0 };
        this.setState({ widthImage: width, heightImage: height });
    }

    calcularDimensiones() {
        const { widthImage, heightImage } = this.state;
        if (!widthImage || !heightImage) {
            return { width: 250, height: 300 };
        }

        const maxWidth = 250;
        const maxHeight = 400;

        const aspectRatio = widthImage / heightImage;
        let width = maxWidth;
        let height = width / aspectRatio;

        if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
        }

        return { width, height };
    }

    // 🔹 Mostrar remitente solo si es grupo y no es tuyo
    renderRemitente() {
        const { mensaje } = this.props;
        if (mensaje.fromMe || !mensaje.id?.remote?.includes("@g.us")) return null;

        const nombre =
            mensaje._data?.notifyName ||
            mensaje._data?.pushname ||
            mensaje.author?.replace(/@.*/, "") ||
            "Desconocido";

        return (
            <SText
                color={"#a0d7ff"}
                fontSize={12}
                bold
                style={{
                    marginBottom: 4,
                    marginLeft: 4,
                }}
            >
                {nombre}
            </SText>
        );
    }

    render() {
        const { mensaje, color, key_device } = this.props;
        const { width, height } = this.calcularDimensiones();
        const texto = mensaje.body;
        const isEnviado = mensaje.fromMe;

        return (
            <SView
                style={{
                    backgroundColor: color,
                    borderRadius: 10,
                    padding: 6,
                    width: "auto",
                    maxWidth: "80%",
                    alignItems: "flex-start",
                    alignSelf: isEnviado ? "flex-end" : "flex-start",
                    marginBottom: 8,
                }}
            >
                {/* 🔹 Mostrar remitente (solo en grupos) */}
                {this.renderRemitente()}

                {/* 🔹 Imagen */}
                <SView
                    style={{
                        width,
                        height,
                        borderRadius: 8,
                        overflow: "hidden",
                        position: "relative",
                    }}
                >
                    <SImage
                        enablePreview
                        src={MDL.whatsapp.device.getMedia(
                            key_device,
                            mensaje?.id?._serialized
                        )}
                        style={{
                            width: "100%",
                            height: "100%",
                            resizeMode: "cover",
                        }}
                    />
                    {/* 🔹 Hora */}
                    <HoraLabel
                        mesaje={mensaje}
                        style={{
                            position: "absolute",
                            bottom: 4,
                            right: 6,
                        }}
                    />
                    {/* 🔹 Texto debajo (caption) */}
                    {texto && (
                        <SView
                            style={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                backgroundColor: "rgba(0,0,0,0.5)",
                                padding: 5,
                            }}
                        >
                            <SText color={"white"}>{texto}</SText>
                        </SView>
                    )}
                </SView>
            </SView>
        );
    }
}
