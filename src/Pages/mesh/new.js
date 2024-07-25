import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SForm, SNavigation, SNotification, SPage, STheme } from 'servisofts-component';
import { Container } from '../../Components';
import SSocket from 'servisofts-socket';
import Model from '../../Model';

export default class _new extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }


    handleSubmit = (data) => {
        try {
            data.data = JSON.parse(data.data ?? {})
        } catch (error) {
            SNotification.send({
                title: "Mesh",
                body: "Error en el formato del JSON.",
                color: STheme.color.danger,
                time: 5000,
            })
            return;
        }
        SSocket.sendPromise({
            component: "mesh",
            type: "registro",
            key_usuario: Model.usuario.Action.getKey(),
            key_empresa: Model.empresa.Action.getKey(),
            data: {
                ...data
            }
        }).then(e => {
            SNotification.send({
                title: "Mesh",
                body: "Registro exitoso.",
                color: STheme.color.success,
                time: 5000,
            })
            SNavigation.goBack();
        }).catch(e => {
            SNotification.send({
                title: "Mesh",
                body: "Ocurrio un error.",
                color: STheme.color.danger,
                time: 5000,
            })
        })
    }
    render() {
        return <SPage>
            <Container>
                <SForm
                    inputs={{
                        "descripcion": { label: "Descripcion" },
                        "observacion": { label: "Observacion" },
                        "url": { label: "URL" },
                        "tipo": { label: "Type" },
                        "data": { label: "data", type: "textArea" },
                    }}
                    onSubmitName={"Subir"}
                    onSubmit={this.handleSubmit.bind(this)}
                />
            </Container>
        </SPage>
    }
}
