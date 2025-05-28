import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SForm, SNavigation, SNotification, SPage, STheme } from 'servisofts-component';
import { Container } from '../../Components';
import SSocket from 'servisofts-socket';
import Model from '../../Model';

const options = ["glb", "building", "weapon", "cube", "sprite", "car", "character"];
export default class _new extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: {}
        };
        this.pk = SNavigation.getParam("pk")
    }

    componentDidMount() {
        if (this.pk) {
            SSocket.sendPromise({
                component: "mesh",
                type: "getByKey",
                key: this.pk
            }).then(e => {
                this.setState({ data: e.data[this.pk], loading: true })
            }).catch(e => {

            })
        } else {
            this.setState({ loading: true })
        }

    }


    handleSubmit = (data) => {

        try {
            data.data = JSON.parse(data?.data ?? "{}")
        } catch (error) {
            SNotification.send({
                title: "Mesh",
                body: "Error en el formato del JSON.",
                color: STheme.color.danger,
                time: 5000,
            })
            return;
        }
        // this.form.uploadFiles(
        //     SSocket.api.root + "mesh/" + this.pk,
        //     "foto"
        // );
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
            console.log("keyyy")
            console.log(e)
            console.log(e.data.key)
            this.form.uploadFiles(
                SSocket.api.root + "upload/mesh/" + e.data.key,
                "foto"
            );
            // this.form.uploadFiles(Model.empresa._get_image_upload_path(SSocket.api, e.data.key), "foto");
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
            <Container loading={!this.state.loading}>
                <SForm
                    ref={(ref) => { this.form = ref; }}
                    style={{
                        // alignItems: "center",
                    }}
                    inputProps={{
                        col: "xs-12",
                    }}
                    inputs={{
                        "foto": { type: "image", isRequired: false, defaultValue: SSocket.api.root + "mesh/" + this.state.data?.key + "?date=" + new Date().getTime(), col: "xs-12", style: { overflow: 'hidden', alignItems: "center", } },
                        "tipo": { label: "Categoria", type: "select", col: "xs-7", options: options, defaultValue: options[0], defaultValue: this.state?.data?.tipo },
                        "descripcion": { label: "Nombre del objeto *", placeholder: "Escriba el nombre del objeto...", required: true, defaultValue: this.state?.data?.descripcion },
                        "url": { label: "URL *", placeholder: "https://drive.servisofts.com/http/models/test.glb", required: true, defaultValue: this.state?.data?.url },
                        "observacion": { label: "Informacion del objeto", placeholder: "Ecribe informacion extra del objeto, por ejemplo como usarlo o cuando se usa.", type: "textArea", defaultValue: this.state?.data?.observacion },
                        // "is_personaje": { label: "¿Personaje?", type: "checkBox", value: this.state.data?.is_personaje },
                        // "data": { label: "data", type: "textArea" },
                    }}
                    onSubmitName={"GUARDAR"}
                    onSubmit={this.handleSubmit.bind(this)}
                />
            </Container>
        </SPage>
    }
}
