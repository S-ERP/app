import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SHr, SIcon, SImage, SNavigation, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Etiqueta from './Etiqueta';

export default class DashboardCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const card = this.props.data;
        const fecha = card.fecha_edit ?? card.fecha_on;
        return <SView style={{
            backgroundColor: STheme.color.background + "66",
            borderColor: STheme.color.card,
            borderWidth: 1,
            minHeight: 70,
            padding: 8,
            borderRadius: 8,
            // marginVertical: 4,
            cursor: "grab",
        }} >

            <SView row col={"xs-12"}>

                <SText fontSize={12} color={STheme.color.lightGray}>{card.codigo}</SText>
                <SView width={8} />
                <SText fontSize={14} underLine style={{ marginTop: -1 }}
                    color={STheme.color.link}
                    onPress={() => {
                        // SNavigation.navigate("/crm/plantilla", { key: card.key })
                        SNavigation.navigate("/crm/call", { key: card.key })
                        // }} >{card?.cliente?.telefono}</SText>
                    }} >{card?.campana?.nombre}</SText>
            </SView>
            <SHr h={4} />
            <SText>{card?.cliente?.nombres}</SText>
            <SHr h={16} />

            <SView row col={"xs-12"} center>
                <SIcon name="producto" width={14} height={18} fill={"#384052"} />
                <SView width={8} />
                <SView style={{ padding: 4, backgroundColor: "#3840526b", borderRadius: 1 }}>
                    <SText color={STheme.color.lightGray} >Proyecto: {card?.proyecto?.nombre}</SText>
                </SView>
                <SView flex />
            </SView>
            <SHr h={8} />

            <SView row col={"xs-12"} center>
                <SIcon name="tpIn" width={14} height={18} fill={"#384052"} />
                <SView width={8} />
                <SView style={{ padding: 4, backgroundColor: "#3840526b", borderRadius: 1 }}>
                    <SText style={{ maxWidth: 203 }} numberOfLines={1} color={STheme.color.lightGray}> Campaña: {card?.campana?.nombre}</SText>
                </SView>
                <SView flex />
            </SView>

            <SHr h={16} />
            <SView row style={{ alignItems: "flex-end" }}>

                <Etiqueta tipo_leads={card.state} size={12} ></Etiqueta>
                <SView flex />
                <SView row center>
                    <SIcon name="history" width={10} fill={STheme.color.lightGray} />
                    <SView width={4} />
                    <SText fontSize={10} color={STheme.color.lightGray}>Hace {new SDate(fecha, "yyyy-MM-ddThh:mm:ss").timeSince(new SDate())}</SText>
                </SView>
            </SView>
            <SView style={{
                width: 24,
                height: 24,
                position: "absolute",
                right: 4,
                top: 4,
                borderRadius: 100,
                overflow: "hidden",
                backgroundColor: STheme.color.card + "66",
            }}>
                <SImage src={SSocket.api.root + "usuario/" + card.key_usuario_atiende} style={{
                    resizeMode: "cover",
                }} />
            </SView>
        </SView>
    }
}
