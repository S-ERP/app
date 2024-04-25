import { Text, View } from 'react-native'
import React, { Component } from 'react'
import { SInput, SPage, STable2, SLoad, SText, SView, SHr, SPopup, SNavigation, SStorage } from 'servisofts-component'
import { Btn, Container } from '../../Components'

import SSocket from 'servisofts-socket'
import Model from '../../Model'

export default class send extends Component {
    state = {
        descripcion: "Notificacion por tags.",
        observacion: "Prueba de notificaciones por tags.",
        url: "",
        data: {
            deepLink: "",
        }
    }

    componentDidMount() {
        SStorage.getItem("notification_data", (e => {
            this.state.ready = true;
            if (e) {
                let data = JSON.parse(e);
                this.state = data;
                // this.state.descripcion = data.descripcion;
                // this.state.observacion = data.observacion;
                // this.state.url_image = data?.url_image;
                // this.state.data.deepLink = data?.deeplink;
            }
            this.setState({ ...this.state })
        }))
    }

    save() {
        let data = {
            descripcion: this.inp_descripcion.getValue() ?? this.state.descripcion,
            observacion: this.inp_observacion.getValue() ?? this.state.observacion,
            url_image: this.inp_url.getValue() ?? this.state.url_image,
            data: {
                deepLink: this.inp_deeplink.getValue() ?? this.state.data.deepLink
            }
        }
        SStorage.setItem("notification_data", JSON.stringify(data));
    }
    handleSend(tags) {
        if (this.state.loading) return;
        this.state.loading = true;
        const empresa = Model.empresa.Action.getSelect();
        this.setState({ loading: true })
        let data = {
            descripcion: this.inp_descripcion.getValue() ?? this.state.descripcion,
            observacion: this.inp_observacion.getValue() ?? this.state.observacion,
            url_image: this.inp_url.getValue() ?? this.state.url_image,
            data: {
                deepLink: this.inp_deeplink.getValue() ?? this.state.data.deepLink,
                key_empresa: Model.empresa.Action.getKey(),
                razon_social: empresa?.razon_social ?? "S/N",
            }

        }
        SStorage.setItem("notification_data", JSON.stringify(data));
        SSocket.sendPromise({
            service: "notification",
            component: "notification",
            type: "sendV2",
            key_usuario_emisor: Model.usuario.Action.getKey(),
            // type: "send",
            data: data,
            tags: tags
        }).then(e => {
            SPopup.alert(`Se notifico a ${e.data} dispositivos.`)
            this.setState({ loading: false })
            console.log(e);
        }).catch(e => {
            this.setState({ loading: false })
            console.error(e);
        })
    }
    render() {
        if (!this.state.ready) return <SLoad />
        return <SPage>
            <Container>
                <SInput ref={ref => this.inp_descripcion = ref} label={"Titulo"} defaultValue={this.state.descripcion} />
                <SInput ref={ref => this.inp_observacion = ref} label={"Body"} type={"textArea"} defaultValue={this.state.observacion} />
                <SInput ref={ref => this.inp_url = ref} label={"Image url"} defaultValue={this.state.url_image} />
                <SInput ref={ref => this.inp_deeplink = ref} label={"deeplink"} defaultValue={this.state.data.deepLink} />
                <SHr />
                <SHr />
                <Btn col={"xs-10"} loading={this.state.loading} onPress={() => {
                    this.save();
                }}>GUARDAR</Btn>
                <SHr />
                <SHr />
                <SHr />
                <Btn col={"xs-12"} loading={this.state.loading} onPress={() => {
                    this.handleSend(null)
                }}>Todos los tokens.</Btn>
                <SHr />
                <Btn col={"xs-12"} loading={this.state.loading} onPress={() => {
                    this.handleSend({
                        platform: "web",
                    })
                }}>Todos los navegadores web.</Btn>
                <SHr />
                <Btn col={"xs-12"} loading={this.state.loading} onPress={() => {
                    this.handleSend({
                        platform: "ios",
                    })
                }}>Todos los IOS o Apple.</Btn>
                <SHr />
                <Btn col={"xs-12"} loading={this.state.loading} onPress={() => {
                    this.handleSend({
                        platform: "android",
                    })
                }}>Todos los Android.</Btn>
                <SHr />
                <Btn col={"xs-12"} loading={this.state.loading} onPress={() => {
                    this.handleSend({
                        user_type: "undefined",
                    })
                }}>Dispositivos sin session.</Btn>
                <SHr />
                <Btn col={"xs-12"} loading={this.state.loading} onPress={() => {
                    this.handleSend({
                        user_type: "cliente",
                    })
                }}>Todos los clientes.</Btn>
                <SHr />
                <Btn col={"xs-12"} loading={this.state.loading} onPress={() => {
                    this.handleSend({
                        user_type: "admin",
                    })
                }}>Todos los administradores.</Btn>
                <SHr />
                <Btn col={"xs-12"} loading={this.state.loading} onPress={() => {
                    SNavigation.navigate("/usuario/list", {
                        onSelect: (e) => {
                            this.handleSend({
                                key_usuario: e.key,
                            })
                        }
                    })
                }}>Notificar a un usuario.</Btn>
                <SHr h={100} />
            </Container>
        </SPage>
    }
}