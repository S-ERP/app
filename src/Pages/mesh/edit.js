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
        this.key = SNavigation.getParam("key")

    }
    componentDidMount() {
        SSocket.sendPromise({
            component: "mesh",
            type: "getByKey",
            key: this.key,
            key_usuario: Model.usuario.Action.getKey(),
            key_empresa: Model.empresa.Action.getKey(),
        }).then(e => {
            console.log(e.data[this.key])
            this.setState({ data: e.data[this.key] })
        }).catch(e => {
            console.error(e);
        })
    }
    handleSubmit = (data) => {
        data.data = JSON.parse(data?.data)
        // this.form.uploadFiles(
        //     SSocket.api.empresa + "mesh/" + this.pk,
        //     "foto"
        // );
        SSocket.sendPromise({
            component: "mesh",
            type: "editar",
            key_usuario: Model.usuario.Action.getKey(),
            key_empresa: Model.empresa.Action.getKey(),
            data: {
                ...this.state.data,
                ...data
            }
        }).then(e => {
            SNotification.send({
                title: "Mesh",
                body: "Modificacion exitosa.",
                color: STheme.color.success,
                time: 5000,
            })
            this.form.uploadFiles(
                SSocket.api.root + "upload/mesh/" + e.data.key,
                "foto"
            );
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
            <Container loading={!this.state.data}>
                <SForm
                    ref={(ref) => { this.form = ref; }}
                    style={{
                        alignItems: "center",
                    }}
                    inputProps={{
                        col: "xs-12",
                    }}
                    inputs={{
                        "foto": { type: "image", isRequired: false, defaultValue: SSocket.api.root + "mesh/" + this.state.data?.key + "?date=" + new Date().getTime(), col: "xs-4", style: { borderRadius: 100, overflow: 'hidden', width: 140, height: 140, borderWidth: 1, borderColor: STheme.color.lightGray, alignItems: "center", } },
                        "descripcion": { label: "Descripcion", defaultValue: this.state.data?.descripcion },
                        "observacion": { label: "Observacion", defaultValue: this.state.data?.observacion },
                        "url": { label: "URL", defaultValue: this.state.data?.url },
                        "tipo": { label: "Type", defaultValue: this.state.data?.tipo },
                        "is_personaje": { label: "¿Personaje?", type: "checkBox", value: this.state.data?.is_personaje },
                        "data": { label: "data", type: "textArea", height: 400, defaultValue: JSON.stringify(this.state.data?.data, "\n", "\t") },
                    }}
                    onSubmitName={"Subir"}
                    onSubmit={this.handleSubmit.bind(this)}
                />
            </Container>
        </SPage>
    }
}
