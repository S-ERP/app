import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SForm, SList, SNavigation, SPage } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
import { Container } from '../../Components';

export default class _new extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
    }
    handleSubmit(data) {
        SSocket.sendPromise({
            component: "scene",
            type: "registro",
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey(),
            data: data
        }).then(e => {
            SNavigation.goBack();
        }).catch(e => {
            console.error(e);
        })
    }

    render() {
        return <SPage title={"Crear Scene"}>
            <Container>
                <SForm
                    inputs={{
                        "descripcion": { type: "text", label: "Descripcion" }
                    }}
                    onSubmit={(data) => {
                        this.handleSubmit(data);
                    }}
                    onSubmitName={"SUBIR"}
                />
            </Container>
        </SPage>
    }
}
