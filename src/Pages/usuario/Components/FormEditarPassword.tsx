
import React, { Component } from 'react';
import { View, Text } from 'react-native';
import MDL from '../../../MDL';
import { DinamicTable } from 'servisofts-table';
import { SForm, SHr, SIcon, SNotification, SPopup, SText, STheme, SView } from 'servisofts-component';
import PButtom from '../../../Components/PButtom';
import { Role } from '../../../MDL/role/types';
import { Usuario } from '../../../MDL/usuario/types';
import CryptoJS from 'crypto-js';


type FormEditarType = {
    data: Usuario,
    onRegister: (e: any) => void,
    onCancel?: () => void,
}

export default class FormEditarPassword extends Component<FormEditarType> {
    static open(props: FormEditarType) {
        SPopup.open({
            key: "ppupregistro",
            content: <SView backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 300 }} padding={16} withoutFeedback col={"xs-11"}>
                <FormEditarPassword {...props} onRegister={(e) => {
                    SPopup.close("ppupregistro")
                    if (props.onRegister) props.onRegister(e)
                }}
                    onCancel={() => {
                        SPopup.close("ppupregistro")
                        if (props.onCancel) props.onCancel()
                    }}
                />
            </SView>
        })
    }
    form: any = null;
    render() {
        return <SView center>
            <SText bold>{"Cambiar Contraseña"}</SText>
            <SForm
                ref={(ref: any) => this.form = ref}
                inputProps={{
                    col: "xs-12",
                    separation: 12
                }}
                inputs={{
                    Password: { placeholder: "Ingresa tu contraseña", isRequired: true, type: "password" },
                    RepPassword: { placeholder: "Repetir Contraseña", type: "password", isRequired: true },
                }}
                onSubmit={(e: any) => {
                    if (e["Password"] != e["RepPassword"]) {
                        SNotification.send({
                            title: "Las contraseñas no coinciden",
                            color: STheme.color.danger,
                            time: 5000,
                        })
                        return null;
                    }
                    var password = CryptoJS.MD5(e["Password"]).toString();

                    SNotification.send({
                        key: "registro",
                        title: "Cambiando contraseña",
                        type: "loading",
                    })
                    MDL.usuario.editar({
                        estado: this.props.data.estado,
                        Password: password,
                        key: this.props.data.key,

                    } as any).then((e: any) => {
                        SNotification.send({
                            key: "registro",
                            title: "Contraseña cambiada",
                            color: STheme.color.success,
                            time: 5000,
                        })
                        if (this.props.onRegister) this.props.onRegister(e)

                    }).catch((e: any) => {
                        SNotification.send({
                            key: "registro",
                            title: "Error al cambiar la contraseña",
                            body: e,
                            color: STheme.color.danger,
                            time: 5000,
                        })
                    })
                }}
            />
            <SHr />
            <SView row col={"xs-12"}>
                {this.props.onCancel && <>
                    <PButtom flex type='danger' onPress={() => {
                        if (this.props.onCancel) this.props.onCancel()
                    }}>CANCELAR</PButtom>
                    <SView width={8} />
                </>}

                <PButtom flex type='primary' onPress={() => {
                    if (this.form) this.form.submit();
                }}>GUARDAR</PButtom>
            </SView>
        </SView >
    }
}
