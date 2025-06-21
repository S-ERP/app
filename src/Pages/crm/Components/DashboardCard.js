import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SHr, SIcon, SImage, SNavigation, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Etiqueta from './Etiqueta';
import SIconApp from '../../../Assets/SIconApp';

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
                    }} >{card?.cliente?.telefono}</SText>
            </SView>
            <SHr h={4} />
            <SText bold>{card?.cliente?.nombres}</SText>
            <SHr h={4} />

            <SView row col={"xs-12"} >
                <Etiqueta tipo_leads={card.state} size={10} style={{
                    padding: 0,
                    // paddingStart: 0,
                    // paddingEnd: 0,
                    height: 18,
                    justifyContent: 'center',
                    marginRight: 4, marginBottom: 4
                }} ></Etiqueta>
                {card?.cliente?.departamento && <SView style={{ padding: 3, backgroundColor:STheme.colorFromText(card.cliente.departamento)+"6b", borderRadius: 1, flexDirection: "row", borderRadius: 4, marginRight: 4, marginBottom: 4 }} center>
                    <SText style={{ maxWidth: 90 }} fontSize={10} numberOfLines={1} color={STheme.color.lightGray}>{card.cliente.departamento}</SText>
                </SView>}
                <SView style={{ padding: 3, backgroundColor: "#3840526b", borderRadius: 1, flexDirection: "row", borderRadius: 4, marginRight: 4, marginBottom: 4 }} center>
                    <SIcon name="producto" width={12} height={14} fill={"#384052"} />
                    <SView width={4} />
                    <SText style={{ maxWidth: 90 }} fontSize={10} numberOfLines={1} color={STheme.color.lightGray}>{card?.proyecto?.nombre}</SText>
                </SView>
                <SView style={{ padding: 3, backgroundColor: "#3840526b", borderRadius: 1, flexDirection: "row", borderRadius: 4, marginRight: 4, marginBottom: 4 }} center>
                    <SIcon name="tpIn" width={12} height={14} fill={"#384052"} />
                    <SView width={4} />
                    <SText style={{ maxWidth: 90 }} fontSize={10} numberOfLines={1} color={STheme.color.lightGray}>{card?.campana?.nombre}</SText>
                </SView>


                {card.state == "rellamada" && <SView style={{ padding: 3, backgroundColor: "#3840526b", borderRadius: 1, flexDirection: "row", borderRadius: 4, marginRight: 4, marginBottom: 4 }} center>
                    <SIcon name="recall" width={12} height={14} fill={"#384052"} />
                    <SView width={4} />
                    <SText style={{ maxWidth: 90 }} fontSize={10} numberOfLines={1} color={STheme.color.lightGray}>{new SDate(card?.fecha_rellamada, "yyyy-MM-ddThh:mm:ss").toString("yyyy-MM-dd hh:mm")}</SText>
                </SView>}

                <SView style={{ padding: 3, backgroundColor: "#3840526b", borderRadius: 1, flexDirection: "row", borderRadius: 4, marginRight: 4, marginBottom: 4 }} center>
                    <SIcon name="history" width={12} height={14} fill={"#384052"} />
                    <SView width={4} />
                    <SText style={{ maxWidth: 90 }} fontSize={10} numberOfLines={1} color={STheme.color.lightGray}>Hace {new SDate(fecha, "yyyy-MM-ddThh:mm:ss").timeSince(new SDate())}</SText>
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
        </SView >
    }
}
