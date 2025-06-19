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
        const { width, height } = this.props.mensaje._data
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

    calcularHeight() {
        const { widthContainer, heightContainer, widthImage, heightImage } = this.state;
        if (widthContainer === 0 || heightContainer === 0 || widthImage === 0 || heightImage === 0) {
            return 300; // Valor por defecto si no se han calculado las dimensiones
        }
        const aspectRatio = widthImage / heightImage;
        const newHeight = widthContainer / aspectRatio;
        return Math.min(newHeight, heightContainer); // Limitar la altura al contenedor
    }

    calcularWidth() {
        const { widthContainer, heightContainer, widthImage, heightImage } = this.state;
        if (widthContainer === 0 || heightContainer === 0 || widthImage === 0 || heightImage === 0) {
            return "75%"; // Valor por defecto si no se han calculado las dimensiones
        }
        const aspectRatio = widthImage / heightImage;
        const newWidth = heightContainer * aspectRatio;
        return Math.min(newWidth, widthContainer); // Limitar el ancho al contenedor
    }
    render() {

        return (
            <View style={{
                width: this.calcularWidth(),
                height: this.calcularHeight(),
                overflow: 'hidden',
                marginHorizontal: 10,
                backgroundColor: this.props.color,
                borderWidth: 2,
                borderColor: this.props.color,
                borderRadius: 8,
                overflow: "hidden",

            }} onLayout={e => {
                const { width, height } = e.nativeEvent.layout;
                this.setState({ widthContainer: width, heightContainer: height });

            }}>
                <SImage src={`data:img/png;base64,${this.props.mensaje._data.body}`} style={{
                    borderRadius: 8,
                    position: "absolute",
                }} />
                <SImage enablePreview src={MDL.whatsapp.device.getMedia(this.props.key_device, this.props.mensaje.id._serialized)} style={{
                    borderRadius: 8,
                }} />

                <HoraLabel style={{
                    position: "absolute",
                    bottom: 2, right: 5, color: "white",
                    fonWeight: "bold"
                }} mesaje={this.props.mensaje} />
            </View>

        );
    }



}
