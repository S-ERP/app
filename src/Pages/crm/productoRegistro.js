import React, { Component, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SHr, SInput, SNavigation, SNotification, SPage, SPopup, SText, STheme, SThread, SUuid, SView, DropFile, DropFileSingle, Submit, Upload, SDate } from 'servisofts-component';
import { Container } from '../../Components';
// import Container from '../../../Components/Container';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
import TopBar from '../../Components/TopBar';
import ListaDeOpciones from '../restaurante/producto/Components/EditarListaDeOpciones';
import BtnNaranja from '../restaurante/producto/Components/BtnNaranja';
import FormularioProducto from '../restaurante/producto/Components/FormularioProducto';
import FormularioOpciones from '../restaurante/producto/Components/FormularioOpciones';
import PageTitle from '../../Components/PageTitle';
import { InputValidator } from '../restaurante/producto/Components/Input';
// import Input, { InputValidator } from './Components/Input';
// import VentanaLista from "./list";
const colorGray = "#999999"
const colorGray2 = "#BBBBBB"
const colorCard = "#EEEEEE"
const FotoDePerfil = ({ key_producto, onChange }) => {
    return <SView center>
        <SView width={130} height={130} style={{
            backgroundColor: STheme.color.card,
            borderRadius: 8,
            overflow: "hidden"
        }}>
            {/* <SInput defaultValue={SSocket.api.root + "producto/" + key_producto} type={"image"} style={{
                width: "100%",
                height: "100%",
                borderRadius: 8,
            }} /> */}
            <DropFileSingle
                defaultValue={SSocket.api.inventario + "producto/" + key_producto + "?date=" + new SDate().getTime()}
                accept={"image/*"}
                style={{
                    resizeMode: "cover"
                }}
                onChange={onChange}
            />
        </SView>
        <SHr h={4} />
        <SText fontSize={10} font={"Montserrat-SemiBold"} color={colorGray}>{"Agregar foto del producto/item"}</SText>
        <SText fontSize={10} font={"Montserrat-MediumItalic"} color={colorGray2}>{"jpeg,png,1024x1024px máximo 1Mb"}</SText>
    </SView>
}




export default class edit extends Component {
    _inputs = {}
    static TOPBAR = <TopBar type={"usuario_back"} />
    imageToUpload = null;
    constructor(props) {
        super(props);
        this.state = {
            original: {}
        };

        this.key_restaurante = SNavigation.getParam("key_restaurante")
        this.pk = SNavigation.getParam("pk")
        this.noPrevent = false;
    }


    verificarCambios() {
        if (!this.formProducto) return;
        this.formProducto.handleGuardar();
        let cambios = {};
        if (this.imageToUpload) {
            cambios["image"] = this.imageToUpload?.file?.name
        }
        const deepCompare = (obj1, obj2, prefix = '') => {
            if (obj1 == null && obj2 == null) {
                console.log("Retorno por error")
                return;
            }

            if ((!obj1) != (!obj2)) {
                cambios[prefix] = "uno nulo";
                return;
            }
            if (typeof obj1 == "object" || typeof obj2 == "object") {

                if (Array.isArray(obj1)) {
                    for (let i = 0; i < obj1.length; i++) {
                        deepCompare(obj1[i], obj2[i], prefix + "." + i);
                    }
                } else {
                    try {
                        const arr = Object.keys(obj1)
                        for (let i = 0; i < arr.length; i++) {
                            const key = arr[i];
                            deepCompare(obj1[key], obj2[key], prefix + "." + key);
                        }
                    } catch (error) {
                        console.error(error)
                    }

                }

            } else {
                // console.log(obj1, obj2)
                if (typeof obj1 == 'number' || typeof obj2 == 'number') {
                    if (parseFloat(obj1) !== parseFloat(obj2)) {
                        cambios[prefix] = obj1
                    }
                } else if (obj1 !== obj2) {
                    cambios[prefix] = obj1
                }
            }



        };
        deepCompare(this.state.data, this.state.original, "producto");
        console.log(this.state.data, this.state.original)
        console.log("CAMBIOS", cambios)
        return Object.values(cambios).length > 0 ? cambios : null
    }
    handleRemove(e) {
        if (this.noPrevent) {
            return;
        }

        if (!this.verificarCambios()) {
            return;
        }
        e.preventDefault();

        SPopup.confirm({
            title: "Salir sin guardar cambios?",
            message: "Si confirma se perderan los cambios realizados.",
            onClose: () => {
                console.log("cancel")
            },
            onPress: () => {
                this.noPrevent = true;
                SNavigation.goBack();
            }
        })
        console.log("Se previno");
    }
    componentDidMount() {
        new SThread(100, "load",).start(() => {
            this.setState({ ready: true })
        })
        if (this.pk) {
            SSocket.sendPromise({
                service: "inventario",
                component: "producto",
                type: "getProductosDetalle",
                key_producto: this.pk,
                key_usuario: Model.usuario.Action.getKey(),
            }).then(e => {
                this.setState({ data: e.data, original: JSON.parse(JSON.stringify(e.data)) })
                console.log(e);
            }).catch(e => {
                console.error(e);
            })
        } else {
            // cuando no viene pk
            this.setState({
                data: {
                    key: SUuid(),
                    estado: 1,
                    key_usuario: Model.usuario.Action.getKey(),
                    sub_productos: [],
                }
            })
        }

        console.log(this.props.navigation);
        this.props.navigation.addListener("beforeRemove", this.handleRemove.bind(this));

    }
    componentWillUnmount() {
        this.props.navigation.removeListener("beforeRemove", this.handleRemove);
    }

    handleGuardar() {
        let resp = {}
        Object.keys(this._inputs).map(k => {
            resp[k] = this._inputs[k].getValue();
        })
        console.log(resp);

    }

    renderSaveChange() {

        const cambios = this.verificarCambios();
        if (!cambios) return null
        return <SView col={"xs-12"} height={30} backgroundColor={STheme.color.primary}>
            <SText>{"Cambios sin guardar"}</SText>
        </SView>
    }

    render() {
        const data = this.state.data ?? {};
        return <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >

            <SPage hidden footer={this.renderSaveChange()}>
                <Container loading={!this.state.ready || !this.state.data} border={"green"} >
                    <SHr />
                    <PageTitle title='REGISTRAR PRODUCTO' />
                    <SHr h={32} />
                    <FotoDePerfil key_producto={this.pk} onChange={(e) => {
                        this.imageToUpload = e[0];
                    }} />
                    <SHr h={32} />
                    <FormularioProducto ref={ref => this.formProducto = ref} producto={this.state.data} key_restaurante={this.key_restaurante}  />
                    <SHr h={32} />
                    <SView col={"xs-12"} row >
                        <SText flex color={STheme.color.text} fontSize={14} font={"Montserrat-Bold"}>{"OPCIONES"}</SText>
                        <BtnNaranja onPress={() => {
                            FormularioOpciones.openPopup({
                                data: { key_producto: this.pk },
                                onChange: (subproductoedit) => {
                                    const existe = this.state.data.sub_productos.findIndex(a => a.key == subproductoedit.key);
                                    if (existe > -1) {
                                        console.log("Existe", existe)
                                    } else {
                                        this.state.data.sub_productos.push(subproductoedit)
                                        console.log("No Existe", existe)
                                    }
                                    this.setState({ ...this.state })
                                }
                            })

                        }}>{"+ Agregar Opciones"}</BtnNaranja>
                    </SView>
                    <SHr h={8} />
                    <ListaDeOpciones producto={this.state.data} />
                    <SHr h={32} />
                    <SView width={250} height={40} borderRadius={8} center style={{ backgroundColor: "blue", padding: 8, }} onPress={() => {
                        this.formProducto.handleGuardar();


                        const faltantes = InputValidator({
                            data: this.state.data,
                            keys: ["nombre", "key_categoria_producto", "precio"]
                        })
                        if (faltantes.length > 0) {
                            SNotification.send({
                                title: "Complete lo campos requeridos.",
                                body: faltantes.join(", "),
                                time: 5000,
                                color: STheme.color.danger,
                            })
                            return;
                        }
                        SNotification.send({
                            key: "guardando_producto",
                            title: "Producto",
                            body: "Estamos guardando los cambios.",
                            // color: STheme.color.danger,
                            type: "loading"
                        })

                        if (!this.state.data.key_empresa) {
                            this.state.data.key_empresa = Model.empresa.Action.getKey()
                        }
                        SSocket.sendPromise({
                            service: "inventario",
                            component: "producto",
                            type: "guardar",
                            data: this.state.data,
                            key_usuario: Model.usuario.Action.getKey(),
                        }).then(async (e) => {
                            SNotification.send({
                                key: "guardando_producto",
                                title: "Producto",
                                body: "Subiendo la foto.",
                                // color: STheme.color.danger,
                                type: "loading"
                            })
                            if (this.imageToUpload) {
                                console.log(this.imageToUpload)
                                const resp = await Upload.sendPromise(this.imageToUpload, SSocket.api.inventario + "upload/producto/" + this.pk)
                            }
                            SNotification.remove("guardando_producto")
                            SNotification.send({
                                title: "Producto",
                                body: "Guardado con exito",
                                time: 5000,
                                color: STheme.color.success,
                            })

                            // if (VentanaLista.INSTANCE) {
                            //     VentanaLista.INSTANCE.onChangeProducto(this.state.data);
                            // }
                            this.noPrevent = true;
                            SNavigation.goBack();
                            console.log(e);
                        }).catch(e => {
                            SNotification.remove("guardando_producto")
                            SNotification.send({
                                title: "Producto",
                                body: "Ocurrio un error al guardar.",
                                time: 5000,
                                color: STheme.color.danger,
                            })
                            console.error(e);
                        })
                    }}>  < SText fontSize={12} font='Montserrat' color={"#fff"}>Guardar</SText> </SView>
                </Container>
                <SHr h={100} />
            </SPage>
        </KeyboardAvoidingView>
    }
}
