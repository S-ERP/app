import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SLoad, SPopup, SButtom, SHr, SImage, SNavigation, SPage, SText, STheme, SView, SDate } from 'servisofts-component';

import SSocket from 'servisofts-socket';
import Model from '../Model';
import { Container } from '../Components';
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
            let invitacion = e.data[this.pk]
            if (Model.empresa.Action.getKey() != invitacion.key_empresa) {
                SSocket.sendPromise({
                    service: "empresa",
                    component: "empresa",
                    type: "getByKey",
                    key: invitacion.key_empresa,
                }).then(em => {
                    Model.empresa.Action.setEmpresa(em.data)
                    console.log(em);
                }).catch(e => {
                    console.error(em);
                })
            }

            this.setState({ data: e.data[this.pk] })
            console.log(e);
        }).catch(e => {
            console.error(e);
        })
    }

    getInvitacion = () => {
        if (!Model.usuario.Action.getKey()) {
            return <SView >
                <SText>Usted no esta logeado con un usuario</SText>
            </SView>
        }
        let invitation: InvitationType = this.state.data;
        if (!invitation) return <SLoad />
        let empresa = Model.empresa.Action.getSelect();
        return <SView row col={"xs-12"} card padding={15} border={STheme.color.primary} center>
            <SHr height={20} />
            <SText fontSize={25} onPress={() => SNavigation.reset("/")}>INVITACIÓN</SText>
            <SHr height={20} />
            <SView col={"xs-12"} center>
                <SView width={80} height={80} style={{ padding: 4, borderRadius: 40 }}>
                    <SView flex height card style={{
                        overflow: 'hidden',
                        borderRadius: 40
                    }}>
                        <SImage src={SSocket.api.empresa + "empresa/" + invitation.key_empresa} />
                    </SView>
                </SView>
                <SText color={STheme.color.gray} fontSize={12} center >{this.state.dataUserInvitacion?.Correo ?? ""}</SText>
            </SView>
            <SHr height={20} />
            <SView col={"xs-12"} center row>
                <SText fontSize={15} bold center>{this.state.dataUserInvitacion?.Nombres ?? ""} {this.state.dataUserInvitacion?.Apellidos ?? ""}</SText>
                <SText fontSize={15} >{invitation?.descripcion}</SText>
                <SText color={STheme.color.gray} fontSize={18} center underLine >{empresa?.razon_social}</SText>
                <SHr height={30} />
                <SView col={"xs-12"} center >

                    <SText center fontSize={15} style={{ fontStyle: 'italic' }}>{invitation?.observacion}</SText>
                </SView>
            </SView>
            <SHr height={30} />
            <SView col={"xs-12"} center row>
                <SText fontSize={13} center>La invitación tiene un tiempo de validez</SText>
                <SHr width={10} />
                <SText fontSize={13} center>De: </SText>
                <SText fontSize={15} bold center>{new SDate(invitation.fecha_inicio, "yyyy-MM-ddThh:mm:ss").toString("dd/MM/yyyy")}</SText>
                <SView width={10} />
                <SText fontSize={13} center>Hasta: </SText>
                <SText fontSize={15} bold center>{new SDate(invitation.fecha_fin, "yyyy-MM-ddThh:mm:ss").toString("dd/MM/yyyy")}</SText>

            </SView>
            <SHr height={30} />
            <SView col={"xs-12"} center row>
                <SButtom type={"outline"} onPress={this.handleAccept.bind(this)}>Aceptar</SButtom>
                <SView width={16} />
                <SButtom type={"danger"}>Cancelar</SButtom>
            </SView>
            <SHr height={20} />
        </SView>
    }
    handleAccept() {
        this.setState({ loading: true })
        let usuario = Model.usuario.Action.getUsuarioLog();
        SSocket.sendPromise({
            component: "invitacion",
            type: "aceptar",
            key: this.pk,
            alias: `${usuario.Nombres} ${usuario.Apellidos}`,
            key_usuario: Model.usuario.Action.getKey()
        }).then(e => {
            // this.setState({ data: e.data[this.pk] })
            this.setState({ loading: false })
            SNavigation.replace("/loby");
            // SNavigation.reset("/");
            console.log(e);
        }).catch(e => {
            this.setState({ loading: false })
            SPopup.alert(e.error)
            console.error(e);
        })
    }
    render() {

        return <SPage title={"Inivitarion"}>
            <SHr />
            <Container>
                <SHr height={30} />
                {this.getInvitacion()}
            </Container>
        </SPage>
    }
}
