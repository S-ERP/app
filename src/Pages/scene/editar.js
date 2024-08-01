import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SForm, SNavigation, SNotification, SPage, STheme } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
import { Container } from '../../Components';

export default class editar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null
        };
        this.pk = SNavigation.getParam("pk")
    }

    componentDidMount() {
        SSocket.sendPromise({
            component: "scene",
            type: "getByKey",
            key: this.pk,
            key_usuario: Model.usuario.Action.getKey()
        }).then((e) => {
            console.log(e);
            this.setState({ data: e.data[this.pk] })
        }).catch(e => {
            console.error(e);
        })
    }
    render() {
        const { descripcion, data } = this.state?.data ?? {}
        console.log(this.state)
        return <SPage title={"Editar scene"}>
            <Container loading={!this.state.data}>
                <SForm inputs={{
                    "descripcion": { label: "descripcion", defaultValue: descripcion },
                    "data": { label: "data", height:400, type: "textArea", defaultValue: JSON.stringify(data ?? {}, "\n", "\t") },

                }}
                    onSubmitName={"Subir"}
                    onSubmit={(values) => {
                        try {
                            const data = JSON.parse(values.data);
                            SSocket.sendPromise({
                                component: "scene",
                                type: "editar",
                                key: this.pk,
                                key_usuario: Model.usuario.Action.getKey(),
                                data: {
                                    key: this.pk,
                                    data: data,
                                    descripcion: values.descripcion
                                }
                            }).then(e => {
                                console.log(e);
                            }).catch(e => {
                                console.error(e);
                            })
                        } catch (error) {
                            SNotification.send({
                                title: "Error en el formato",
                                body: "Data debe ser JSON",
                                color: STheme.color.danger
                            })
                            console.error(error)
                            return;
                        }

                    }}
                />
            </Container>
        </SPage>
    }
}
