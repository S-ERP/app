import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SForm, SHr, SLoad, SNotification, SPage, SText, STheme } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
import { Container } from '../../Components';

export default class ajustes extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }
    componentDidMount() {
        SSocket.sendPromise({
            service: "facturacion",
            component: "siat",
            type: "getAll",
            estado: "cargando",
            key_usuario: Model.usuario.Action.getKey(),
            key_empresa: Model.empresa.Action.getKey(),
        }).then(e => {
            this.setState({ data: Object.values(e.data)[0] ?? {} })
        }).catch(e => {
            console.error(e);
        })
    }

    form() {
        if (!this.state.data) return <SLoad />
        return <SForm inputs={{
            "token": { type: "textArea", label: "Token", placeholder: " ", defaultValue: this.state?.data?.token },
            "token_test": { type: "textArea", label: "Token de prueba", placeholder: " ", defaultValue: this.state?.data?.token_test },
            "certificado": { type: "file", label: "Certificado (P12)", defaultValue: !this.state?.data?.certificado ? null : SSocket.api.facturacion + "empresa/" + Model.empresa.Action.getKey() + "/" + this.state?.data?.certificado },
            "certificado_pass": { type: "password", label: "Contraseña del certificado", placeholder: " ", defaultValue: this.state?.data?.certificado_pass },

        }}
            ref={ref => this.ref = ref}
            onSubmitName={"SUBIR"}
            loading={this.state.loading}
            onSubmit={(data) => {
                this.setState({ loading: true })
                if (data.certificado == SSocket.api.facturacion + "empresa/" + Model.empresa.Action.getKey() + "/" + this.state?.data?.certificado) {
                    data.certificado = this.state?.data?.certificado
                }
                SSocket.sendPromise({
                    service: "facturacion",
                    component: "siat",
                    type: "editar",
                    estado: "cargando",
                    key_usuario: Model.usuario.Action.getKey(),
                    key_empresa: Model.empresa.Action.getKey(),
                    data: data
                }).then(e => {

                    // this.ref.
                    this.ref.uploadFiles2(
                        SSocket.api.facturacion + "upload/empresa/" + Model.empresa.Action.getKey()
                    ).then((resp) => {
                        console.log(resp);
                        // this.setState({ loading: true, loadingLabel: "Guardando cambios..." });
                    }).catch((e) => {
                        console.error(e);
                        // this.setState({ loading: false, loadingLabel: "Error al subir los archivos..." });
                    })
                    SNotification.send({
                        title: "Edicion",
                        body: "Exito",
                        color: STheme.color.success,
                        time: 5000
                    })
                    this.setState({ loading: false })
                    console.log(e);
                }).catch(e => {
                    SNotification.send({
                        title: "Edicion",
                        body: "Error",
                        color: STheme.color.error,
                        time: 5000
                    })
                    console.error(e);
                })
            }}
        />
    }

    verificarComunicacion({ ambiente, label }) {
        return <SText col={"xs-12"} color={STheme.color.warning} underLine fontSize={18}
            onPress={() => {
                SSocket.sendPromise({
                    service: "facturacion",
                    component: "siat",
                    type: "verificarComunicacion",
                    estado: "cargando",
                    ambiente: ambiente, // 1=produccion 2=prueba
                    key_empresa: Model.empresa.Action.getKey(),
                    key_usuario: Model.usuario.Action.getKey(),
                }, 1000 * 60).then(e => {
                    SNotification.send({
                        title: label,
                        body: "Exito",
                        color: STheme.color.success,
                        time: 5000
                    })
                    this.setState({ loading: false })
                    console.log(e);
                }).catch(e => {
                    SNotification.send({
                        title: label,
                        body: "Error",
                        color: STheme.color.error,
                        time: 5000
                    })
                    console.error(e);
                })
            }}
        >{label}</SText>
    }
    getCertificado({ ambiente, label }) {
        return <SText col={"xs-12"} color={STheme.color.warning} underLine fontSize={18}
            onPress={() => {
                SSocket.sendPromise({
                    service: "facturacion",
                    component: "siat",
                    type: "getCertificado",
                    estado: "cargando",
                    ambiente: ambiente, // 1=produccion 2=prueba
                    key_empresa: Model.empresa.Action.getKey(),
                    key_usuario: Model.usuario.Action.getKey(),
                }, 1000 * 60).then(e => {
                    SNotification.send({
                        title: label,
                        body: "Exito",
                        color: STheme.color.success,
                        time: 5000
                    })
                    this.setState({ loading: false })
                    console.log(e);
                }).catch(e => {
                    SNotification.send({
                        title: label,
                        body: "Error",
                        color: STheme.color.error,
                        time: 5000
                    })
                    console.error(e);
                })
            }}
        >{label}</SText>
    }
    sincronizarParametricas({ ambiente, label }) {
        return <SText col={"xs-12"} color={STheme.color.warning} underLine fontSize={18}
            onPress={() => {
                SSocket.sendPromise({
                    service: "facturacion",
                    component: "siat",
                    type: "sincronizarParametricas",
                    estado: "cargando",
                    nit: Model.empresa.Action.getSelect()?.nit,
                    ambiente: ambiente, // 1=produccion 2=prueba
                    key_empresa: Model.empresa.Action.getKey(),
                    key_usuario: Model.usuario.Action.getKey(),
                }, 1000 * 60).then(e => {
                    SNotification.send({
                        title: label,
                        body: "Exito",
                        color: STheme.color.success,
                        time: 5000
                    })
                    this.setState({ loading: false })
                    console.log(e);
                }).catch(e => {
                    SNotification.send({
                        title: label,
                        body: "Error",
                        color: STheme.color.error,
                        time: 5000
                    })
                    console.error(e);
                })
            }}
        >{label}</SText>
    }
    render() {

        return <SPage title={"Facturacion - Ajustes"}>
            <Container>
                <SHr h={50} />
                {this.verificarComunicacion({
                    ambiente: 1,
                    label: "Verificar comunicacion"
                })}
                <SHr h={20} />

                {this.sincronizarParametricas({
                    ambiente: 1,
                    label: "Sincronizar Parametricas"
                })}
                <SHr h={20} />

                {this.getCertificado({
                    ambiente: 1,
                    label: "GetCertificado"
                })}
                <SHr h={50} />
                {this.verificarComunicacion({
                    ambiente: 2,
                    label: "Verificar comunicacion de PRUEBAS"
                })}
                <SHr h={20} />
                {this.sincronizarParametricas({
                    ambiente: 2,
                    label: "Sincronizar Parametricas de PRUEBAS"
                })}
                <SHr h={20} />

                {/* {this.getCertificado({
                    ambiente: 2,
                    label: "GetCertificado PRUEBA"
                })} */}
                {this.form()}
            </Container>
        </SPage>
    }
}
