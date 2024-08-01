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
            <Container>
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
                        "descripcion": { label: "Descripcion" },
                        "observacion": { label: "Observacion" },
                        "url": { label: "URL" },
                        "tipo": { label: "Type" },
                        "is_personaje": { label: "¿Personaje?", type: "checkBox", value: this.state.data?.is_personaje },
                        "data": { label: "data", type: "textArea" },
                    }}
                    onSubmitName={"Subir"}
                    onSubmit={this.handleSubmit.bind(this)}
                />
            </Container>
        </SPage>
    }
}
