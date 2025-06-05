import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SHr, SImage, SNavigation, SText, STheme, SView } from 'servisofts-component';
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
                <SText underLine onPress={() => {
                    // SNavigation.navigate("/crm/plantilla", { key: card.key })
                    SNavigation.navigate("/crm/call", { key: card.key })
                }} >{card?.cliente?.telefono}</SText>
            </SView>
            <SHr />
            <SText color={STheme.color.lightGray}>{card?.cliente?.nombres}</SText>
            <SText fontSize={10} color={STheme.color.lightGray}>Hace {new SDate(fecha, "yyyy-MM-ddThh:mm:ss").timeSince(new SDate())}</SText>
            <SHr />
            <SView row>
                <Etiqueta tipo_leads={card.state} ></Etiqueta>
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
