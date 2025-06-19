import React, { Component } from "react";
import { Linking, View } from "react-native";
import { SDate, SHr, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SThread, SView, SIcon } from "servisofts-component";
import SSocket from "servisofts-socket";
import HoraLabel from "../Comp/HoraLabel";
import SIconApp from "../../../Assets/SIconApp";

export default class MsgDocument extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }







    render() {
        const isEnviado = this.props.mensaje.fromMe;
        const tipoMensaje = this.props.mensaje.type;
        const id = this.props.mensaje.id;

        const texto = this.props.mensaje.body;
        const hora = this.props.mensaje.time;

        return (
            <View
                style={{
                    width: 350,
                    marginHorizontal: 10,
                    backgroundColor: this.props.color,
                    borderRadius: 12,
                    padding: 6,
                    overflow: "hidden",
                }}>
                <SView style={{ width: "100%", height: 150, overflow: "hidden", backgroundColor: STheme.color.card }} onPress={(e) => {

                    const url = this.props.mensaje?.mediaData;
                    if (url) {
                        Linking.openURL(url).catch(err => {
                            console.warn("No se pudo abrir el documento:", err);
                        });
                    }

                    Linking.openURL("https://example.com/documento.pdf");
                }}>
                    <SImage src={`data:img/png;base64,${this.props.mensaje._data.body}`} style={{
                        width: "100%",
                        height: "100%",
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                        resizeMode: "cover",
                    }} />
                </SView>


                <SView col={"xs-12"} row>
                    <SView col={"xs-12"} row backgroundColor={STheme.color.card} style={{
                        borderBottomLeftRadius: 12,
                        borderBottomRightRadius: 12,
                        padding: 12

                    }} >
                        <SHr height={4} />

                        <SView width={24} height={24}  >
                            <SIconApp name="crmpdf" fill="#FF0000"></SIconApp>

                        </SView>
                        <SView width={4} />

                        <SView flex>

                            <SText color={"white"} fontSize={14}>{texto}</SText>
                        </SView>
                    </SView>

                    <SHr height={8} />

                    <SView col={"xs-12"}>

                        {/* <SText>{this.props.mensaje?.location?.address}</SText> */}
                        <SView style={{ alignItems: "flex-end" }}>
                            <HoraLabel style={{}} mesaje={this.props.mensaje} />
                        </SView>
                    </SView>
                </SView>
            </View>
        );
    }



}
