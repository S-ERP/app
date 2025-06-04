import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SForm, SNavigation, SNotification, SPage, SText, STheme } from 'servisofts-component';
import { Container } from '../../Components';
import SSocket from 'servisofts-socket';

export default class campana extends Component {
    pk = SNavigation.getParam("pk");

    render() {
        return <SPage title={"Campaña"}>
            {/* <SText>{this.pk}</SText> */}
            <Container>
                <SForm
                    inputs={{
                        nombre: { type: "text", label: "Nombre", isRequired: true },
                        telefono: { type: "text", label: "Teléfono", isRequired: true },
                    }}
                    onSubmitName={"Enviar"}
                    onSubmit={(values) => {
                        SSocket.send({
                            "service":"crm",
                            "component": "campana",
                            "type": "me_interesa",
                            "telefono": values.telefono,
                            "nombres": values.nombre,
                            "key_campana": this.pk
                        }).then((response) => {
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
            </Container>
        </SPage>
    }
}
