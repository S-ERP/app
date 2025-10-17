 import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SHr, SIcon, SImage, SNavigation, SNotification, SPopup, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Etiqueta from './Etiqueta';
import SIconApp from '../../../Assets/SIconApp';
import MDL from '../../../MDL';

export default class DashboardCard extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const card = this.props.data;
        const data_tipo_stage = this.props.data_stage;
        const tipo_contacto = card.tipo_cliente?.filter(a => a.key === data_tipo_stage.key)[0] ?? null;
        const fecha = card.fecha_edit ?? card.fecha_on;
        
        return (
            <SView style={{
                backgroundColor: STheme.color.background + "66",
                borderColor: STheme.color.card,
                borderWidth: 1,
                minHeight: 70,
                padding: 8,
                borderRadius: 8,
                cursor: "grab",
            }} row >
                <SView row col={"xs-2"} center>
                    <SView style={{
                        width: 30,
                        height: 30,
                        borderRadius: 100,
                        overflow: "hidden",
                        backgroundColor: STheme.color.card,
                    }}>
                        <SImage 
                            src={SSocket.api.root + "usuario/" + card.key_usuario_atiende} 
                            style={{ resizeMode: "cover" }} 
                        />
                    </SView>
                </SView>
                <SView row col={"xs-10"}>
                    <SView row col={"xs-12"}>
                        <SHr h={4} />
                        <SText bold>{card?.nombres}</SText>
                        <SView width={8} />
                        <SText fontSize={14} underLine style={{ marginTop: -1 }}
                            color={STheme.color.link}
                            onPress={() => {
                                // SNavigation.navigate("/crm/plantilla", { key: card.key })
                                // SNavigation.navigate("/crm/call", { key: card.key })
                            }}
                        >{card?.telefono}</SText>
                        <SHr h={4} />
                        <SText fontSize={10} color={STheme.color.lightGray}>{card?.tipo}</SText>
                        <SText fontSize={10} color={STheme.color.lightGray}>{tipo_contacto?.titulo}</SText>
                    </SView>
                </SView>
                <SHr h={5} />
                <SView col={"xs-12"} style={{ 
                    borderBottomColor: STheme.color.card, 
                    borderBottomWidth: 1, 
                }} />
                <SHr h={10} />
                <SView row col={"xs-12"} >
                    <Etiqueta 
                        tipo_leads={card.state} 
                        size={10} 
                        style={{
                            padding: 0,
                            height: 18,
                            justifyContent: 'center',
                            marginRight: 4, 
                            marginBottom: 4
                        }} 
                    />
                    {card?.departamento && (
                        <SView style={{ 
                            padding: 3, 
                            backgroundColor: STheme.colorFromText(card.departamento) + "6b", 
                            borderRadius: 4, 
                            marginRight: 4, 
                            marginBottom: 4 
                        }} center>
                            <SText style={{ maxWidth: 90 }} 
                                fontSize={10} 
                                numberOfLines={1} 
                                color={STheme.color.lightGray}
                            >
                                {card.departamento}
                            </SText>
                        </SView>
                    )}
                    <SView style={{ 
                        padding: 3, 
                        backgroundColor: STheme.color.card, 
                        borderRadius: 4, 
                        marginRight: 4, 
                        marginBottom: 4 
                    }} center>
                        <SIcon name="history" width={12} height={14} fill={"#384052"} />
                        <SView width={4} />
                        <SText style={{ maxWidth: 90 }} 
                            fontSize={10} 
                            numberOfLines={1} 
                            color={STheme.color.lightGray}
                        >
                            Hace {new SDate(fecha, "yyyy-MM-ddThh:mm:ss").timeSince(new SDate())}
                        </SText>
                    </SView>

                    {/* ✅ BOTÓN QUITAR (DESAPARECE INSTANTÁNEO) */}
                    {tipo_contacto && (
                        <SView style={{ 
                            padding: 3, 
                            backgroundColor: STheme.color.danger, 
                            borderRadius: 4, 
                            marginRight: 4, 
                            marginBottom: 4 
                        }} center row
                            onPress={() => {
                                SPopup.confirm({
                                    title: `¿Quitar "${card.nombres}" de "${tipo_contacto.titulo}"?`,
                                    onPress: () => {
                                        MDL.crm.tipoCliente.deleteClienteDeLaTabla(tipo_contacto.key_cliente_tipo_cliente)
                                            .then(() => {
                                                this.props.onRemoveCliente(tipo_contacto.key_cliente_tipo_cliente);
                                                SNotification.send({
                                                    title: `✅ "${card.nombres}" quitado`,
                                                    color: STheme.color.success,
                                                    time: 1500
                                                });
                                            })
                                            .catch(err => {
                                                SNotification.send({
                                                    title: "❌ Error al quitar",
                                                    body: err,
                                                    color: STheme.color.danger
                                                });
                                            });
                                    }
                                });
                            }}
                        >
                            <SIcon name="Cancel" width={12} height={14} fill={"#07db3cff"} />
                            <SView width={4} />
                            <SText fontSize={10} color={STheme.color.text}>Quitar</SText>
                        </SView>
                    )}
                </SView>
            </SView>
        );
    }
}