import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SForm, SHr, SNotification, SPopup, SText, STheme, SView, Upload } from 'servisofts-component';
import PButtom from '../../../Components/PButtom';
import CryptoJS from 'crypto-js';
import SSocket from 'servisofts-socket';
import MDL from '../../../MDL';
// import Model from '../../../../Model';
import InputFoto from '../../../Components/InputFoto';

type Props = {
    key_empresa: string,
    editObject?: any,
    onCancel?: Function,
    onSuccess?: Function,
}

export default class FormCrearUsuario extends Component<Props> {

    static open(props: Props) {
        SPopup.open({
            key: "PopupCrearSucursal",
            content: <SView style={{
                maxWidth: "100%",
                maxHeight: "100%",
                width: 500,
                // height: 500,
                borderRadius: 8,
                borderColor: STheme.color.card,
                borderWidth: 1,
                backgroundColor: STheme.color.background
            }} withoutFeedback >
                <FormCrearUsuario {...props} onCancel={() => {
                    SPopup.close("PopupCrearSucursal")
                    if (props.onCancel) props.onCancel()
                }}
                    onSuccess={(e: any) => {
                        SPopup.close("PopupCrearSucursal")
                        if (props.onSuccess) props.onSuccess(e)
                    }}

                />
            </SView>
        })
    }
    form: SForm | undefined = undefined;
    _ref: any = {}
    render() {
        return <SView col={"xs-12"} center padding={16}>
            <SText fontSize={16}>{"Crear usuario"}</SText>
            <ScrollView>
                <SForm ref={(ref: any) => this.form = ref}
                    row
                    style={{
                        justifyContent: "space-between",
                    }}
                    inputs={{
                        "CI": {
                            label: "CI*", placeholder: "Ingresa el CI", isRequired: true, autoFocus: true,
                            // defaultValue: this.props.editObject?.descripcion,
                            onSubmitEditing: () => {
                                if (this.form) this.form.submit();
                            },
                            icon: <SView style={{ borderRadius: 4, overflow: "hidden", width: 50, height: 50, backgroundColor: STheme.color.background, borderWidth: 1, borderColor: STheme.color.text + '66' }}>
                                {/* <SInput ref={ref => this._ref.image_modelo = ref} type='image' height={50} defaultValue={(SSocket.api as any).inventario + "modelo/" + this.props.editObject?.key}/> */}
                                <InputFoto
                                    ref={ref => this._ref.image_usuario = ref}
                                    src={(SSocket.api as any).root + "usuario/" + this.props.editObject?.key}
                                    style={{
                                        width: 50,
                                        height: 50,
                                    }} />
                            </SView>,
                        },
                        "Nombres": { label: "Nombres*", placeholder: "Ingresa los Nombres", isRequired: true, col: "xs-5.7" },
                        "Apellidos": { label: "Apellidos*", placeholder: "Ingresa los Apellidos", isRequired: true, col: "xs-5.7" },
                        "Telefono": { label: "Telefono", placeholder: "00000000", type: "phone", col: "xs-5" },
                        "Correo": { label: "Correo", placeholder: "example@email.com", type: "email", col: "xs-6.5" },
                        "Password": { label: "Password", placeholder: "Ingresa la contraseña", type: "password", col: "xs-5.7" },
                        "RePassword": { label: "Confirmar Password", placeholder: "Confirma la contraseña", type: "password", col: "xs-5.7" }

                    }}
                    onSubmit={(data: any) => {


                        if (data["Password"] != data["RePassword"]) {
                            SNotification.send({
                                title: "Las contraseñas no coinciden",
                                color: STheme.color.danger,
                                time: 5000,
                            })
                            return null;
                        }
                        data.Password = CryptoJS.MD5(data.Password ?? "").toString();
                        delete data["RePassword"];
                        console.log(data);
                        SSocket.sendPromise({
                            version: "2.0",
                            service: "usuario",
                            component: "usuario",
                            type: "registro",
                            cabecera: "usuario_app",
                            data: {
                                key_empresa: MDL.empresa.select?.key,
                                key_usuario: MDL.usuario.session?.key,
                                ...data,
                            }
                        }).then((e: any) => {
                            if (e.estado == "exito") {

                                SSocket.sendPromise({
                                    // version: "2.0",
                                    service: "empresa",
                                    component: "empresa_usuario",
                                    type: "registro",
                                    key_empresa: MDL.empresa.select?.key,
                                    key_usuario: e.data.key,
                                    data: {
                                        key_empresa: MDL.empresa.select?.key,
                                        key_usuario: e.data.key,
                                    }
                                }).then((f: any) => {

                                    if (this.props.onSuccess) this.props.onSuccess(f)

                                    if (this._ref.image_usuario) {
                                        const value = this._ref.image_usuario.getValue();
                                        if (Array.isArray(value)) {
                                            Upload.sendPromise({ file: value[0], compress: false }, (SSocket.api as any).root + "upload/usuario/" + e.data.key)
                                        }
                                    }
                                    console.log("response", f);
                                }).catch(f => {
                                    console.log("response", f);

                                    console.error("response", f);
                                })


                            }

                            console.log("response", e);
                        }).catch(e => {
                            //validar si data_ existe
                            if (e.data_) {
                                console.log("data_", e.data_);
                            }
                            console.error("response", e);
                        })
                    }
                    }

                />
            </ScrollView>
            <SHr h={16} />
            <SView row col={"xs-12"}>
                {this.props.onCancel && <>
                    <PButtom type='danger' flex onPress={() => {
                        if (this.props.onCancel) this.props.onCancel()
                    }} >CANCELAR</PButtom>
                    <SView width={8} />
                </>}

                <PButtom type='primary' flex onPress={() => {
                    if (this.form) this.form.submit();
                }}>GUARDAR</PButtom>

            </SView>
        </SView>
    }
}
