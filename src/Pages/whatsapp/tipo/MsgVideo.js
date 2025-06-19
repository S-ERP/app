import React, { Component } from "react";
import { SDate, SHr, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SThread, SView, SIcon } from "servisofts-component";
import SSocket from "servisofts-socket";
import HoraLabel from "../Comp/HoraLabel";
import { Image, View } from "react-native";
import SIconApp from "../../../Assets/SIconApp";
import SVideo from "../../../Components/SVideo";
import MDL from "../../../MDL";

export default class MsgVideo extends Component {
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
        console.log('Ancho:', width);
        console.log('Alto:', height);
        this.setState({
            widthImage: width,
            heightImage: height
        });
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
        const { widthImage, heightImage } = this.state;
        const fixedWidth = 250;
        const fixedHeight = 300;
        let vidWidth = fixedWidth;
        let vidHeight = fixedHeight;
        if (widthImage && heightImage) {
            const aspectRatio = widthImage / heightImage;
            vidHeight = fixedWidth / aspectRatio;
            if (vidHeight > fixedHeight) {
                vidHeight = fixedHeight;
                vidWidth = fixedHeight * aspectRatio;
            } else {
                vidWidth = fixedWidth;
            }
        }
        const texto = this.props.mensaje.body;
        return (
            <View style={{ alignItems: 'flex-end', marginBottom: 8 }}>
                <View style={{
                    width: fixedWidth,
                    height: fixedHeight,
                    backgroundColor: this.props.color,
                    borderWidth: 2,
                    borderColor: this.props.color,
                    borderRadius: 8,
                    overflow: "hidden",
                    marginHorizontal: 10,
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    {/* <SImage src={`data:img/png;base64,${this.props.mensaje._data.body}`} style={{
                        position: "absolute",
                        borderRadius: 8,
                        resizeMode: "cover",
                        // width: vidWidth,
                        // height: vidHeight,
                    }} /> */}
                    <SVideo

                        controls
                        src={MDL.whatsapp.device.getFile(this.props.key_device, this.props.mensaje.id._serialized)}
                    // poster={{
                    //     source: { uri: `data:img/png;base64,${this.props.mensaje._data.body}` },
                    //     resizeMode: "cover",
                    // }}
                    />
                    {/* <SView style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        justifyContent: "center",
                        alignItems: "center"
                    }}>
                        <SView width={50} height={50} center style={{
                            backgroundColor: "#ffffff99",
                            borderRadius: 100,
                            padding: 12,
                            justifyContent: "center",
                        }}>
                            <SIconApp name="crmplay" fill="#444" />
                        </SView>
                    </SView> */}
                    <SText style={{
                        position: "absolute",
                        bottom: 2, left: 5, color: "white",
                        fontWeight: "bold",
                        fontSize: 11
                    }}>{this.props.mensaje.duration}</SText>
                    <HoraLabel style={{
                        position: "absolute",
                        bottom: 2, right: 5, color: "white",
                        fontWeight: "bold"
                    }} mesaje={this.props.mensaje} />
                </View>
                {!!texto && (
                    <View style={{ marginTop: 4, maxWidth: 250, alignSelf: 'flex-start' }}>
                        <SText style={{
                            backgroundColor: "#056162",
                            color: "white",
                            fontSize: 18,
                            borderRadius: 6,
                            paddingHorizontal: 4,
                            paddingVertical: 2,
                            flexWrap: 'wrap',
                        }}>
                            {texto}
                        </SText>
                    </View>
                )}
            </View>
        );

    }



}
