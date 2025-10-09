import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SForm, SHr, SIcon, SLoad, SNavigation, SNotification, SPage, SText, STheme, SView, Upload } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
import { Container } from '../../Components';
import MDL from '../../MDL';
import Entorno from './Components/Entorno';
import InputFoto from '../../Components/InputFoto';
import Recargar from '../../Components/Recargar';

const LabelItem = ({ label, onPress }) => {
    return <SView center padding={4}>
        <SView center
            width={180}
            height={30}
            style={{
                padding: 5,
                backgroundColor: STheme.color.primary,
                borderRadius: 8,
            }} onPress={onPress}>
            <SText fontSize={12} color={STheme.color.text} center>{label}</SText>
        </SView>
    </SView >
}


export default class ajustes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ambiente: MDL.factura.ambiente,
        };
    }
    componentDidMount() {
        MDL.rolesPermisos.getPermisoAsync({ url: "/facturacion/ajustes", permiso: "ver" }).then((permit) => {
            if (!permit) {
                SNavigation.goBack();
                return;
            }
        });
        // SSocket.sendPromise({
        //     service: "facturacion",
        //     component: "siat",
        //     type: "getAll",
        //     estado: "cargando",
        //     key_usuario: Model.usuario.Action.getKey(),
        //     key_empresa: Model.empresa.Action.getKey(),
        // }).then(e => {
        //     this.setState({ data: Object.values(e.data)[0] ?? {} })
        // }).catch(e => {
        //     console.error(e);
        // })
        MDL.factura.getSiat().then(e => {
            this.setState({ data: e })
        })
    }


    formFotoFactura() {
        if (!this.state.data) return <SLoad />

        const url = SSocket.api.facturacion + "empresa/" + MDL.empresa?.select?.key + "/fotofactura.png";
        console.log("vvvvvvvvvvvv " + JSON.stringify(this.state.data))
        return <>

            <SView style={{ borderRadius: 4, overflow: "hidden", width: 150, height: 150, backgroundColor: STheme.color.background, borderWidth: 1, borderColor: STheme.color.lightGray }}>
                <InputFoto
                    ref={ref => this.inpimagen = ref} src={url}
                    style={{ width: "100%", height: "100%", }} />
                {url.length != 100 ? <SView style={{ position: "absolute", left: 50, top: 65, }}   > <SText bold color={STheme.color.lightGray} >Sin foto</SText> </SView> : ""}
            </SView>

            <SForm
                row style={{ justifyContent: "space-between" }}
                inputProps={{ style: { fontSize: 12 } }}
                inputs={{

                    // "descripcion": {
                    //     label: "Nombre del almacén *", placeholder: "Ingresa el nombre del almacén", isRequired: true, autoFocus: true,
                    //     defaultValue: this.props.editObject?.descripcion,
                    //     // onSubmitEditing: () => {
                    //     //     if (this.form) this.form.submit();
                    //     // },
                    //     icon: <SView style={{ borderRadius: 4, overflow: "hidden", width: 50, height: 50, backgroundColor: STheme.color.background, borderWidth: 1, borderColor: STheme.color.text + '66' }}>
                    //         <InputFoto
                    //             ref={ref => this._ref.image_sucursal = ref}
                    //             src={(SSocket.api as any).empresa + "sucursal/" + this.props.editObject?.key}
                    //             style={{ width: 50, height: 50, }} />
                    //     </SView>,
                    // },

                    "foto_width": {
                        type: "text",
                        col: "xs-5.8",
                        label: "Width foto",
                        style: { paddingStart: 0, },
                        labelStyle: { top: -10, },
                        inputStyle: { paddingStart: 8 },
                        defaultValue: this.state?.data?.foto_width,
                        placeholder: "Ingresa el ancho foto",
                    },
                    "foto_height": {
                        col: "xs-5.8",
                        type: "text",
                        label: "Height foto",
                        style: { paddingStart: 0, },
                        labelStyle: { top: -10, },
                        inputStyle: { paddingStart: 8 },
                        defaultValue: this.state?.data?.foto_height,
                        placeholder: "Ingresa el alto foto",
                    },
                }}
                ref={ref => this.ref_foto_factura = ref}
                onSubmitName={"Subir foto"}
                loading={this.state.loading}
                onSubmit={(data) => {
                    // console.log("todo  " + JSON.stringify(data))
                    // console.log("todo2  " + JSON.stringify(this.inpimagen.getValue()))
                    this.setState({ loading: true })
                    // if (data.certificado == SSocket.api.facturacion + "empresa/" + Model.empresa.Action.getKey() + "/" + this.state?.data?.certificado) {
                    //     data.certificado = this.state?.data?.certificado
                    // }
                    SSocket.sendPromise({
                        service: "facturacion",
                        component: "siat",
                        type: "editar",
                        estado: "cargando",
                        key_usuario: Model.usuario.Action.getKey(),
                        key_empresa: Model.empresa.Action.getKey(),
                        data: data
                    }).then(e => {
                        if (this.inpimagen) {
                            const value = this.inpimagen.getValue();
                            if (Array.isArray(value)) {
                                Upload.sendPromise({ file: value[0], compress: false }, SSocket.api.facturacion + "upload/empresa/" + MDL.empresa?.select?.key + "/fotofactura.png")
                            }
                        }
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
        </>

    }

    form() {
        if (!this.state.data) return <SLoad />
        return <>
            <SForm
                row style={{ justifyContent: "space-between" }}
                inputProps={{ style: { fontSize: 12 } }}
                inputs={{
                    "codigo_sistema": { type: "text", label: "Código de sistema", placeholder: " ", defaultValue: this.state?.data?.codigo_sistema },
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
        </>

    }

    verificarComunicacion({ ambiente }) {
        SNotification.send({
            key: "verificarComunicacion",
            title: "verificarComunicacion",
            color: STheme.color.warning,
            type: "loading"
        })
        const empresa = Model.empresa.Action.getSelect();
        SSocket.sendPromise({
            service: "facturacion",
            component: "siat",
            type: "verificarComunicacion",
            estado: "cargando",
            ambiente: ambiente, // 1=produccion 2=prueba
            key_empresa: Model.empresa.Action.getKey(),
            nit: empresa?.nit,
            key_usuario: Model.usuario.Action.getKey(),
        }, 1000 * 60).then(e => {
            SNotification.send({
                key: "verificarComunicacion",
                title: "verificarComunicacion",
                body: "Exito",
                color: STheme.color.success,
                time: 5000
            })
            this.setState({ loading: false })
            console.log(e);
        }).catch(e => {
            SNotification.send({
                key: "verificarComunicacion",
                title: "verificarComunicacion",
                body: "Error",
                color: STheme.color.error,
                time: 5000
            })
            console.error(e);
        })
    }
    getCertificado({ }) {
        SNotification.send({
            key: "getCertificado",
            title: "getCertificado",
            color: STheme.color.warning,
            type: "loading"
        })
        SSocket.sendPromise({
            service: "facturacion",
            component: "siat",
            type: "getCertificado",
            estado: "cargando",
            ambiente: 1, // 1=produccion 2=prueba
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey(),
        }, 1000 * 60).then(e => {
            SNotification.send({
                key: "getCertificado",
                title: "getCertificado",
                body: "Exito",
                color: STheme.color.success,
                time: 5000
            })
            this.setState({ loading: false })
            console.log(e);
        }).catch(e => {
            SNotification.send({
                key: "getCertificado",
                title: "getCertificado",
                body: "Error",
                color: STheme.color.error,
                time: 5000
            })
            console.error(e);
        })
    }
    sincronizarParametricas({ ambiente }) {
        SNotification.send({
            key: "sincronizarParametricas",
            title: "sincronizarParametricas",
            color: STheme.color.warning,
            type: "loading"
        })
        SSocket.sendPromise({
            service: "facturacion",
            component: "siat",
            type: "sincronizarParametricas",
            estado: "cargando",
            nit: Model.empresa.Action.getSelect()?.nit,
            ambiente: ambiente, // 1=produccion 2=prueba
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey(),
            codigo_punto_venta: "0"
        }, 1000 * 60).then(e => {
            SNotification.send({
                key: "sincronizarParametricas",
                title: "sincronizarParametricas",
                body: "Exito",
                color: STheme.color.success,
                time: 5000
            })
            this.setState({ loading: false })
            console.log(e);
        }).catch(e => {
            SNotification.send({
                key: "sincronizarParametricas",
                title: "sincronizarParametricas",
                body: "Error",
                color: STheme.color.error,
                time: 5000
            })
            console.error(e);
        })
    }
    sincronizarFechaHora({ ambiente }) {
        SNotification.send({
            key: "sincronizarFechaHora",
            title: "sincronizarFechaHora",
            color: STheme.color.warning,
            type: "loading"
        })
        SSocket.sendPromise({
            service: "facturacion",
            component: "siat",
            type: "sincronizarFechaHora",
            estado: "cargando",
            nit: Model.empresa.Action.getSelect()?.nit,
            ambiente: ambiente, // 1=produccion 2=prueba
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey(),
            codigo_punto_venta: "0"
        }, 1000 * 60).then(e => {
            SNotification.send({
                key: "sincronizarFechaHora",
                title: "sincronizarFechaHora",
                body: "Exito",
                color: STheme.color.success,
                time: 5000
            })
            this.setState({ loading: false })
            console.log(e);
        }).catch(e => {
            SNotification.send({
                key: "sincronizarFechaHora",
                title: "sincronizarFechaHora",
                body: "Error",
                color: STheme.color.error,
                time: 5000
            })
            console.error(e);
        })
    }
    getCufd({ ambiente }) {
        SNotification.send({
            key: "getCufd",
            title: "getCufd",
            color: STheme.color.warning,
            type: "loading"
        })
        SSocket.sendPromise({
            service: "facturacion",
            component: "siat",
            type: "getCufd",
            estado: "cargando",
            nit: Model.empresa.Action.getSelect()?.nit,
            ambiente: ambiente, // 1=produccion 2=prueba
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey(),
            codigo_punto_venta: "0"
        }, 1000 * 60).then(e => {
            SNotification.send({
                key: "getCufd",
                title: "getCufd",
                body: "Exito",
                color: STheme.color.success,
                time: 5000
            })
            this.setState({ loading: false })
            console.log(e.data);
        }).catch(e => {
            SNotification.send({
                key: "getCufd",
                title: "getCufd",
                body: "Error",
                color: STheme.color.error,
                time: 5000
            })

            this.state.resp = e.data;
            this.setState({ ...this.state })
        })
    }
    getPuntosDeVentas({ ambiente }) {
        SNotification.send({
            key: "getPuntosDeVentas",
            title: "getPuntosDeVentas",
            color: STheme.color.warning,
            type: "loading"
        })
        SSocket.sendPromise({
            service: "facturacion",
            component: "siat",
            type: "getPuntosDeVentas",
            estado: "cargando",
            nit: Model.empresa.Action.getSelect()?.nit,
            ambiente: ambiente, // 1=produccion 2=prueba
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey(),
        }, 1000 * 60).then(e => {
            SNotification.send({
                key: "getPuntosDeVentas",
                title: "getPuntosDeVentas",
                body: "Exito",
                color: STheme.color.success,
                time: 5000
            })
            this.setState({ loading: false })
            console.log(e);
        }).catch(e => {
            SNotification.send({
                key: "getPuntosDeVentas",
                title: "getPuntosDeVentas",
                body: "Error",
                color: STheme.color.error,
                time: 5000
            })
            console.error(e);
        })
    }
    render() {
        return <SPage title={"Facturación - Ajustes"}>
            <Container>
                <SHr h={20} />
                <SText col={"xs-12"} fontSize={15} color={STheme.color.primary}>Administración de procesos</SText>
                <SHr h={5} />
                <SView col={"xs-12"} center style={{
                    height: 1,
                    backgroundColor: STheme.color.secondary,
                }} />

                <SHr h={10} />
                <SView col={"xs-12"} row center>
                    <Entorno onPress={() => {
                        MDL.factura.setAmbiente(MDL.factura.ambiente == 1 ? 2 : 1)
                        this.setState({ ambiente: MDL.factura.ambiente })
                    }} ambiente={this.state.ambiente} />
                    <SView width={8} />
                    <SText flex fontSize={10} color={STheme.color.gray}>{"Presiona sobre el ícono de recargar para cambiar el entorno"}</SText>
                </SView>


                {/* <SView col={"xs-12"} row center>
                    <SView width={150} height={30} style={{
                        borderTopRightRadius: 10,
                        borderTopLeftRadius: 10,
                        backgroundColor: STheme.color.secondary,
                        padding: 8,
                        borderWidth: 1,
                        borderColor: this.state.ambiente == 1 ? STheme.color.success : STheme.color.warning,
                    }} row center onPress={() => {
                        this.setState({ ambiente: this.state.ambiente == 1 ? 2 : 1 })
                    }}>
                        <SText fontSize={12} color={STheme.color.text} center bold >{this.state.ambiente == 1 ? "PRODUCCIÓN" : "PRUEBA"}</SText>
                        <SView flex />
                        <SIcon name='Reload' width={10} />
                    </SView>
                    <SView width={8} />
                    <SText flex fontSize={10} color={STheme.color.gray}>{"Presiona sobre el incono de recargar para cambiar el entorno"}</SText>
                </SView> */}

                <SView col={"xs-12"} center style={{
                    padding: 10,
                    backgroundColor: STheme.color.card,
                    borderWidth: 1,
                    borderColor: this.state.ambiente == 1 ? STheme.color.success : STheme.color.warning,
                }} row>
                    <SHr h={5} />
                    <LabelItem label={"Verificar comunicación"} onPress={this.verificarComunicacion.bind(this, { ambiente: this.state.ambiente })} />
                    <SView width={5} />
                    <LabelItem label={"Sincronizar Paramétricas"} onPress={this.sincronizarParametricas.bind(this, { ambiente: this.state.ambiente })} />
                    <SView width={5} />
                    <LabelItem label={"Sincronizar Fecha hora"} onPress={this.sincronizarFechaHora.bind(this, { ambiente: this.state.ambiente })} />
                    <SView width={5} />
                    <LabelItem label={"Obtener Cufd"} onPress={this.getCufd.bind(this, { ambiente: this.state.ambiente })} />
                    <SView width={5} />
                    <LabelItem label={"Get puntos de ventas"} onPress={this.getPuntosDeVentas.bind(this, { ambiente: this.state.ambiente })} />
                    <SView width={5} />
                    <LabelItem label={"Get certificado"} onPress={this.getCertificado.bind(this)} />
                </SView>
                <SHr h={40} />
                <SText col={"xs-12"} fontSize={15} color={STheme.color.primary}>Credenciales del sistema de facturación</SText>
                <SHr h={5} />
                <SView col={"xs-12"} center style={{
                    height: 1,
                    backgroundColor: STheme.color.secondary,
                }} />
                <SHr h={5} />
                {this.formFotoFactura()}
                <SHr h={5} />
                {this.form()}
                <SHr height={30} />

            </Container>
            <SView style={{
                position: "absolute",
                right: 16,
                bottom: 32,
            }}>
                <Recargar ref={ref => this.recargar = ref} initialTime={60} onFinish={() => {
                    // if (!this.state.data) return <SLoad />
                    this.componentDidMount();
                }} />
            </SView>
        </SPage>
    }
}
