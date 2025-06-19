import React, { Component } from "react";
import { Image, View } from "react-native";
import { SImage, SText } from "servisofts-component";
import HoraLabel from "../Comp/HoraLabel";

export default class MsgImg extends Component {
    constructor(props) {
        super(props);
        this.state = {
            widthImage: 0,
            heightImage: 0,
        };
    }

    componentDidMount() {
        Image.getSize(this.props.mensaje.mediaData, (width, height) => {
            console.log('Ancho:', width);
            console.log('Alto:', height);
            this.setState({
                widthImage: width,
                heightImage: height
            });
        }, (error) => {
            console.error('Error al obtener tamaño:', error);
        });
    }

    render() {
        const { widthImage, heightImage } = this.state;
        const texto = this.props.mensaje.body;
        const fixedWidth = 250;
        const fixedHeight = 300;
        let imgWidth = fixedWidth;
        let imgHeight = fixedHeight;
        if (widthImage && heightImage) {
            const aspectRatio = widthImage / heightImage;
            imgHeight = fixedWidth / aspectRatio;
            if (imgHeight > fixedHeight) {
                imgHeight = fixedHeight;
                imgWidth = fixedHeight * aspectRatio;
            } else {
                imgWidth = fixedWidth;
            }
        }
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
                    <SImage
                        enablePreview
                        src={this.props.mensaje.mediaData}
                        style={{
                            width: imgWidth,
                            height: imgHeight,
                            borderRadius: 8,
                        }}
                    />
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
                        }}>
                            {texto}
                        </SText>
                    </View>
                )}
            </View>
        );
    }
}
