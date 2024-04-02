import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SLoad, SNavigation, SPage, SPopup, SText } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../Model';
type InvitationType = {
    descripcion: string,
    observacion: string,
    fecha_inicio: string,
    fecha_fin: string,
    color: string,
    telefono: string,
    email: string,
    url: string,
}
export default class invitation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            
        };
        this.pk = SNavigation.getParam("pk")
    }

    componentDidMount() {
        SSocket.sendPromise({
            component: "invitacion",
            type: "getByKey",
            key: this.pk,

        }).then(e => {
            this.setState({ data: e.data[this.pk] })
            console.log(e);
        }).catch(e => {
            console.error(e);
        })
    }

    render() {
        if (!Model.usuario.Action.getKey()) {
            SNavigation.replace("/login");
            return null;
        }
        let invitation: InvitationType = this.state.data;
        if (!invitation) return <SLoad />
        return <SPage title={"Inivitarion"}>
            <SText>{invitation.descripcion}</SText>
            <SText>{invitation.observacion}</SText>
            <SText>{invitation.fecha_inicio}</SText>
            <SText>{invitation.fecha_fin}</SText>
            <SText>{invitation.color}</SText>
            <SText>{invitation.email}</SText>
            <SText>{invitation.telefono}</SText>
            <SText>{invitation.url}</SText>

            <SText padding={16} center card width={180} onPress={() => {
                SSocket.sendPromise({
                    component: "invitacion",
                    type: "aceptar",
                    key: this.pk,
                    key_usuario: Model.usuario.Action.getKey()
                }).then(e => {
                    this.setState({ data: e.data[this.pk] })
                    // SNavigation.reset("/");
                    console.log(e);
                }).catch(e => {
                    SPopup.alert(e.error)
                    console.error(e);
                })
            }}>{"ACEPTAR INVITACION"}</SText>
        </SPage>
    }
}
