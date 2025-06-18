import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SImage, SLoad, SText, SView } from 'servisofts-component';
import MDL from '../../../../MDL';
import SSocket from 'servisofts-socket';
import SIconApp from '../../../../Assets/SIconApp';

export default class qr extends Component {
    constructor(props) {
        super(props);
        this.state = {
            qr: ""
        };
    }

    handleReconnect = () => {
        const { device } = this.props;
        // MDL.whatsapp.device.reconnect
    }

    getQr = (content) => {
        this.state.qr = content;
        SSocket.sendPromise({
            "service": "sqr",
            "component": "qr",
            "type": "registro",
            "estado": "cargando",
            "data": {
                "content": content,
                // "colorBackground": "#FFFFFF",
                "errorCorrectionLevel": "L",
                // "type_color": "linear",
                // "colorBody": "#0302F9",
                // "colorBody2": "#F90203",
                // "body": "Dot",
                // "framework": "Rounded",
                // "header": "Rounded"
            }
        }).then(e => {
            this.setState({ data: e.data.b64 })
        }).catch(e => {

        })
    }

    renderPasos() {
        return <SView col={"xs-12"} card padding={8} height>
            <SText fontSize={24} bold>{"Pasos para iniciar sesión"}</SText>
            <SHr h={32} />
            <SText fontSize={16}>{"(1) I Abre WhatsApp en tu teléfono."}</SText>
            <SHr h={16} />
            <SText fontSize={16}>{"(2) En Android, toca Menú :. En iPhone, toca Ajustes"}</SText>
            <SHr h={16} />
            <SText fontSize={16}>{"(3) Toca Dispositivos vinculados y, luego, Vincular dispositivo."}</SText>
            <SHr h={16} />
            <SText fontSize={16}>{"(4) Escanea el código QR para confirmar."}</SText>
        </SView>;
    }
    handleReconnect = () => {
        const { device } = this.props;
        MDL.whatsapp.device.reconnect(device?.key).then(() => {

        }).catch(e => {

        })
    }
    render() {
        const { device } = this.props;
        if (!this.props.device?.session) {
            this.state.qr = "";
        }
        if (this.props.device?.session?.qr) {
            if (this.state.qr != this.props.device?.session?.qr) {
                this.getQr(this.props.device?.session?.qr);
            }
        }

        return <SView col={"xs-12"} row padding={32}>

            <SView col={"xs-12 sm-7"} padding={8}>
                {this.renderPasos()}

            </SView>
            <SView col={"xs-12 sm-5"} padding={8} center>
                <SView col={"xs-12"} colSquare center padding={16} style={{
                    backgroundColor: "#ffffff",
                    maxWidth: 300
                }}>
                    <SView flex col="xs-12" center>
                        {this.state.qr &&
                            <>
                                <SImage enablePreview src={"data:image/jpg;base64, " + this.state?.data} />

                                <View style={{
                                    position: "absolute", backgroundColor: "#fff", borderRadius: "5%", padding: 4,
                                    width: "27%",
                                    height: "27%"
                                }}>
                                    <SIconApp name={"whatsapp"} />
                                </View>
                            </>
                        }


                        {(device?.session?.status != "qr" && device?.session?.status != "initializing") && <SView style={{
                            backgroundColor: "#00000044",
                            padding: 16,
                            borderRadius: 8,
                        }} onPress={this.handleReconnect}>
                            <SText color={"#000000"}>{"Volver a generar QR"}</SText>
                        </SView>}
                        {(device?.session?.status == "initializing") && <SLoad color='#000'/>}
                    </SView>
                </SView>
            </SView>

        </SView>
    }
}
