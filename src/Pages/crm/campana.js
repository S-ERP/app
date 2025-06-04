import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SForm, SNavigation, SNotification, SPage, SText, STheme, SView } from 'servisofts-component';
import { Container } from '../../Components';
import SSocket from 'servisofts-socket';

export default class campana extends Component {
    pk = SNavigation.getParam("pk");

    state = {
        exito: false,
    }
    renderForm() {
        return <SForm
            inputs={{
                nombre: { type: "text", label: "Nombre", isRequired: true },
                telefono: { type: "text", label: "Teléfono", isRequired: true },
            }}
            onSubmitName={"Enviar"}
            onSubmit={(values) => {
                SSocket.send({
                    "service": "crm",
                    "component": "campana",
                    "type": "me_interesa",
                    "telefono": values.telefono,
                    "nombres": values.nombre,
                    "key_campana": this.pk
                }).then((response) => {
                    this.setState({ exito: true });
                    SNotification.send({
                        title: "Éxito",
                        body: "Tu interés ha sido registrado correctamente.",
                        color: STheme.color.success,
                        duration: 3000,
                    })
                }).catch((error) => {

                })
            }}
        />
    }
    render() {
        return <SPage title={"Campaña"}>
            {/* <SText>{this.pk}</SText> */}
            <Container>
                {!this.state.exito && this.renderForm()}
                {this.state.exito && <SView>
                        <SText>{"Pedido realizado con exito"}</SText>
                        <SText>{"Lo contactaremos en unos momentos."}</SText>
                    </SView>}
            </Container>
        </SPage>
    }
}
