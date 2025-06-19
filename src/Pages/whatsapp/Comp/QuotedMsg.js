import def from 'ajv/dist/vocabularies/discriminator';
import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SImage, SText, STheme, SView } from 'servisofts-component';
import MVCard from '../tipo/MVCard';
import MDL from '../../../MDL';

export default class QuotedMsg extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    renderParticipant() {
        const qPariticipant = this.props?.mensaje?._data?.quotedParticipant
        const color = STheme.colorFromText(qPariticipant?.user)

        return <SText color={color} fontSize={12} bold>{qPariticipant?.user}</SText>
    }
    renderType() {
        const qPariticipant = this.props?.mensaje?._data?.quotedParticipant

        const qMessage = this.props?.mensaje?._data?.quotedMsg
        const quotedStanzaID = this.props?.mensaje?._data?.quotedStanzaID
        switch (qMessage?.type) {
            case "chat":
                return <SView padding={4} flex>
                    {this.renderParticipant()}
                    <SText numberOfLines={1} fontSize={12} color={STheme.color.lightGray} flex>{qMessage?.body}</SText>
                </SView>
            case "location":
                return <>
                    <SView padding={4} flex>
                        {this.renderParticipant()}
                        <SText numberOfLines={1} fontSize={12} color={STheme.color.lightGray} flex>Ubicación</SText>
                    </SView>
                    <SView style={{ width: 40, height: 40, backgroundColor: STheme.color.card }} >
                        <SImage src={"data:img/png;base64," + qMessage?.body} style={{ resizeMode: "cover", width: "100%", height: "100%" }} />
                    </SView>
                </>
            case "vcard":
                const vcard = MVCard.vCardToJson(qMessage.body);
                const number = vcard?.items?.[1]?.waid || "";
                return <>
                    <SView padding={4} flex>
                        {this.renderParticipant()}
                        <SText numberOfLines={1} fontSize={12} color={STheme.color.lightGray} flex>Contacto: {vcard?.FN}</SText>
                    </SView>
                    <SView style={{ width: 40, height: 40, backgroundColor: STheme.color.card }} >
                        <SImage src={MDL.whatsapp.device.getUrlImage(this.props?.key_device, number + "@c.us")} style={{ resizeMode: "cover", width: "100%", height: "100%" }} />
                    </SView>
                </>
            case "image":
                return <>
                    <SView padding={4} flex>
                        {this.renderParticipant()}
                        <SText numberOfLines={1} fontSize={12} color={STheme.color.lightGray} flex>Foto: </SText>
                    </SView>
                    <SView style={{ width: 40, height: 40, backgroundColor: STheme.color.card }} >
                        <SImage src={`data:img/png;base64,${qMessage?.body}`} style={{ resizeMode: "cover", width: "100%", height: "100%" }} />
                    </SView>
                </>
            case "sticker":
                // if(qr.)
                const ba = this.props.mensaje?.id?.remote == qPariticipant._serialized ? "false" : "true"
                const surl = ba+"_" + this.props.mensaje?.id?.remote + "_" + quotedStanzaID
                // const surl = "false_" + qPariticipant._serialized + "_" + quotedStanzaID
                return <>
                    <SView style={{ minWidth: 120, padding: 4 }}>
                        {this.renderParticipant()}
                        <SView style={{ width: 50, height: 50, }} >
                            <SImage src={MDL.whatsapp.device.getMedia(this.props.key_device, surl)} />
                            {/* <SImage src={MDL.whatsapp.device.getMedia(this.props.key_device, "false_" + qPariticipant._serialized + "_" + quotedStanzaID)} /> */}
                            {/* <SImage src={MDL.whatsapp.device.getMedia(this.props.key_device, "true_59169050028@c.us_C99394681FD20FD472D943419C18ACB5")} /> */}
                            {/* <SImage src={`data:img/png;base64,${qMessage?.body}`} style={{ resizeMode: "cover", width: "100%", height: "100%" }} /> */}
                        </SView>
                        {/* <SText>{surl}</SText> */}
                        {/* <SText>{"true_59169050028@c.us_C99394681FD20FD472D943419C18ACB5"}</SText> */}
                    </SView>
                </>
            case "document":
                return <>
                    <SView padding={4} flex onPress={() => {
                        // console.log(qMessage)
                    }}>
                        {this.renderParticipant()}
                        <SText numberOfLines={1} fontSize={12} color={STheme.color.lightGray} flex>Document: {qMessage?.caption}</SText>
                    </SView>
                    {/* <SView style={{ width: 40, height: 40, backgroundColor: STheme.color.card }} >
                        <SImage src={`data:img/png;base64,${qMessage?.body}`} style={{ resizeMode: "cover", width: "100%", height: "100%" }} />
                    </SView> */}
                </>
            default:
                return <SView padding={4}>
                    {this.renderParticipant()}
                    <SText numberOfLines={1} fontSize={12} color={STheme.color.lightGray} flex>{qMessage?.type}</SText>
                </SView>
        }
    }


    render() {
        const qMessage = this.props?.mensaje?._data?.quotedMsg
        const qPariticipant = this.props?.mensaje?._data?.quotedParticipant
        const color = STheme.colorFromText(qPariticipant?.user)
        return <SView style={{
            maxWidth: "100%",
            backgroundColor: STheme.color.card,
            borderRadius: 8,
            marginBottom: 4,
            overflow: "hidden",
            width: "100%",
        }} row>
            <SView style={{
                width: 5,
                height: "100%",

                backgroundColor: color,
            }} />
            <SView flex row style={{
            }}>
                {this.renderType()}

            </SView>
        </SView>
    }
}
