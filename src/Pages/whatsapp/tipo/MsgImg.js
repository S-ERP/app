import React, { Component } from "react";
import { SDate, SHr, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SThread, SView, SIcon } from "servisofts-component";
import SSocket from "servisofts-socket";
import HoraLabel from "../Comp/HoraLabel";
import { Image, View } from "react-native";
import MDL from "../../../MDL";

export default class MsgImg extends Component {
    constructor(props) {
        super(props);
        this.state = {
            widthImage: 0,
            heightImage: 0,
            widthContainer: 0,
            heightContainer: 0,
        };
    }

    componentDidMount() {
        const { width, height } = this.props.mensaje?._data ?? { width: 0, height: 0 }
        // Image.getSize(this.props.mensaje.mediaData, (width, height) => {
        console.log('Ancho:', width);
        console.log('Alto:', height);
        this.setState({
            widthImage: width,
            heightImage: height
        });
        // }, (error) => {
        //     console.error('Error al obtener tamaño:', error);
        // });
    }

    calcularDimensiones() {
        const { widthImage, heightImage } = this.state;
        if (!widthImage || !heightImage) {
            return { width: 250, height: 300 }; // valores por defecto
        }

        const maxWidth = 250; // ancho máximo del card
        const maxHeight = 400; // alto máximo del card

        const aspectRatio = widthImage / heightImage;
        let width = maxWidth;
        let height = width / aspectRatio;

        // si la altura supera el máximo permitido, recalcular
        if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
        }

        return { width, height };
    }

    render() {
        const texto = this.props.mensaje.body;
        const { width, height } = this.calcularDimensiones();

        return (
            <View
                style={{
                    width,
                    height,
                    overflow: 'hidden',
                    marginHorizontal: 10,
                    backgroundColor: this.props.color,
                    borderWidth: 2,
                    borderColor: this.props.color,
                    borderRadius: 8,
                }}
            >
                <SImage
                    src={`data:image/png;base64,${this.props.mensaje?._data?.body}`}
                    style={{
                        width: "100%",
                        height: "100%",
                        resizeMode: "cover",
                        borderRadius: 8,
                    }}
                />
                <SImage
                    enablePreview
                    src={MDL.whatsapp.device.getMedia(this.props.key_device, this.props.mensaje?.id?._serialized)}
                    style={{
                        width: "100%",
                        height: "100%",
                        resizeMode: "cover",
                        borderRadius: 8,
                        position: "absolute",
                    }}
                />
                <HoraLabel
                    style={{
                        position: "absolute",
                        bottom: 2,
                        right: 5,
                        color: "white",
                        fontWeight: "bold",
                    }}
                    mesaje={this.props.mensaje}
                />
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
            </View>
        );
    }
}
