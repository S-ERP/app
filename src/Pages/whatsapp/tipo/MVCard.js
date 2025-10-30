import React, { Component } from "react";
import { Platform, View } from "react-native";
import { SDate, SHr, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SThread, SView, SIcon, SMapView } from "servisofts-component";
import SSocket from "servisofts-socket";
import HoraLabel from "../Comp/HoraLabel";
import MDL from "../../../MDL";

export default class MVCard extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }






    onPress = (e) => {
        console.log("onPress", this.props.mensaje);
    }

    static vCardToJson(vcard) {
        const lines = vcard.trim().split(/\r?\n/);
        const json = {};
        let currentItem = null;

        for (let line of lines) {
            if (line.startsWith('BEGIN:VCARD') || line.startsWith('VERSION') || line.startsWith('END:VCARD')) {
                continue; // omitimos estas líneas
            }

            const [keyPart, ...valueParts] = line.split(':');
            const value = valueParts.join(':'); // por si el valor contiene ":"
            const keyParts = keyPart.split(';');

            let key = keyParts[0];
            let meta = keyParts.slice(1);

            if (key.startsWith('item')) {
                const itemMatch = key.match(/item(\d+)\.(.+)/);
                if (itemMatch) {
                    const index = itemMatch[1];
                    const subkey = itemMatch[2];
                    if (!json.items) json.items = {};
                    if (!json.items[index]) json.items[index] = {};
                    if (subkey === 'TEL') {
                        json.items[index].number = value;
                        meta.forEach(m => {
                            const [k, v] = m.split('=');
                            if (k && v) json.items[index][k.toLowerCase()] = v;
                        });
                    } else if (subkey === 'X-ABLabel') {
                        json.items[index].label = value;
                    }
                }
            } else {
                json[key] = value;
            }
        }

        return json;
    }

    render() {
        const vcard = this.props.mensaje.body;

        const json = MVCard.vCardToJson(vcard);
        console.log("JSON VCard", json);

        const number = json?.items?.[1]?.waid || "";
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
                    width: "100%", height: 60,
                    // backgroundColor: STheme.color.card,
                    borderBottomWidth: 1,
                    borderColor: STheme.color.card,


                }} onPress={this.onPress.bind(this)} >


                    <SView flex row style={{
                        alignItems: "center"
                    }}>
                        <SView width={45} height={45} style={{
                            borderRadius: 100,
                            overflow: "hidden",
                            backgroundColor: STheme.color.card,
                        }}>

                            <SImage src={MDL.whatsapp.device.getUrlImage(this.props?.key_device, number + "@c.us")} />
                        </SView>
                        <SView style={{ width: 8 }} />
                        <SText bold>{json?.FN}</SText>
                        {/* <SText bold>{number}</SText> */}
                    </SView>
                    {/* <SText>{MDL.whatsapp.device.getUrlImage(this.props?.key_device, number)}</SText> */}

                    {/* <SImage src={"data:img/png;base64," + this.props.mensaje.body} style={{ resizeMode: "cover", width: "100%", height: "100%" }} /> */}
                    {/* <SImage src={this.props.mensaje.mediaData} style={{ resizeMode: "cover", width: "100%", height: "100%" }} /> */}
                    {/* <SText>{JSON.stringify(this.props.mensaje)}</SText> */}
                    <SView style={{ alignItems: "flex-end" }}>
                        <HoraLabel style={{}} mesaje={this.props.mensaje} />
                    </SView>
                </SView>
                <SView col={"xs-12"} center padding={8}>
                    {/* <SText color={"#6A9AF6"} fontSize={14}>{this.props.mensaje?.location?.name}</SText> */}
                    <SText color={STheme.color.lightGray} fontSize={12}>{"Mensaje"}</SText>
                </SView>

            </View>
        );
    }



}
