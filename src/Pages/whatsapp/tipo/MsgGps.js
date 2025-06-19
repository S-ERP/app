import React, { Component } from "react";
import { Platform, View } from "react-native";
import { SDate, SHr, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SThread, SView, SIcon, SMapView } from "servisofts-component";
import SSocket from "servisofts-socket";
import HoraLabel from "../Comp/HoraLabel";

export default class MsgGps extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }






    onPress = (e) => {
        const scheme = Platform.select({
            ios: 'maps:0,0?q=',
            android: 'geo:0,0?q=',
            web: "https://www.google.com/maps?q=",
        });
        const latLng = `${this.props.mensaje.location.latitude},${this.props.mensaje.location.longitude}`;
        const label = 'Ubicación';
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`,
            web: `${scheme}${latLng}`,
        });
        SNavigation.openURL(url);
        console.log(this.props.mensaje)
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
                    backgroundColor: this.props.color,
                    borderRadius: 12, padding: 4,
                    marginHorizontal: 10,
                    width: 300,
                    maxWidth: "75%"
                }}>
                {/* <SText color={"white"} fontSize={14}>{texto}</SText> */}
                {/* <SImage src={}/> */}

                <SView style={{
                    width: "100%", height: 140, borderRadius: 4, overflow: "hidden",
                    borderTopLeftRadius:12,
                    borderTopRightRadius: 12,
                    backgroundColor: STheme.color.card,


                }} onPress={this.onPress.bind(this)} >
                    <SView col={"xs-12"} flex style={{
                        pointerEvents: "none",
                        position: "absolute",
                        height: "120%"
                    }}>
                        <SMapView initialRegion={{
                            latitude: this.props.mensaje.location.latitude,
                            longitude: this.props.mensaje.location.longitude,
                            latitudeDelta: 0.015,
                            longitudeDelta: 0.015
                        }}
                            options={{
                                disableDefaultUI: true, // Oculta todos los controles
                                zoomControl: false,
                                mapTypeControl: false,
                                streetViewControl: false,
                                fullscreenControl: false,
                            }}

                        >
                            <SMapView.SMarker latitude={this.props.mensaje.location.latitude} longitude={this.props.mensaje.location.longitude} />
                        </SMapView>
                    </SView>

                    {/* <SImage src={"data:img/png;base64," + this.props.mensaje.body} style={{ resizeMode: "cover", width: "100%", height: "100%" }} /> */}
                    {/* <SImage src={this.props.mensaje.mediaData} style={{ resizeMode: "cover", width: "100%", height: "100%" }} /> */}
                    {/* <SText>{JSON.stringify(this.props.mensaje)}</SText> */}
                </SView>
                <SView padding={2}>
                    <SText color={"#6A9AF6"} fontSize={14}>{this.props.mensaje?.location?.name}</SText>
                    <SText color={STheme.color.lightGray} fontSize={12}>{this.props.mensaje?.location?.address}</SText>
                </SView>
                <SView style={{ alignItems: "flex-end" }}>
                    <HoraLabel style={{}} mesaje={this.props.mensaje} />
                </SView>
            </View>
        );
    }



}
