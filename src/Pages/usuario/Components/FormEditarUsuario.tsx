
import React, { Component } from 'react';
import { View, Text } from 'react-native';
import MDL from '../../../MDL';
import { DinamicTable } from 'servisofts-table';
import { SForm, SHr, SIcon, SNotification, SPopup, SText, STheme, SView } from 'servisofts-component';
import PButtom from '../../../Components/PButtom';
// import { Role } from '../../../MDL/role/types';
import { Usuario } from '../../../MDL/usuario/types';


type FormEditarType = {
    data: Usuario,
    onRegister: (e: any) => void,
    onCancel?: () => void,
}

export default class FormEditarUsuario extends Component<FormEditarType> {
    static open(props: FormEditarType) {
        SPopup.open({
            key: "ppupregistro",
            content: <SView backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 300 }} padding={16} withoutFeedback col={"xs-11"}>
                <FormEditarUsuario {...props} onRegister={(e) => {
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
            <SText bold>{"Editar Usuario"}</SText>
            <SForm
                ref={(ref: any) => this.form = ref}
                inputs={{
                    "Nombres": {
                        label: "Nombres", autoFocus: true, required: true,
                        defaultValue: this.props.data.Nombres,
                        autoCorrect: false,
                        onSubmitEditing: () => {
                            if (this.form) this.form.focus("Nombres");
                        }
                    },
                    "Apellidos": {
                        label: "Apellidos", required: true,
                        defaultValue: this.props.data.Apellidos,
                        autoCorrect: false,
                        onSubmitEditing: () => {
                            if (this.form) this.form.focus("Apellidos");
                        }
                    },
                    "CI": {
                        label: "CI",
                        defaultValue: this.props.data.CI,
                        // type: "",
                        isRequired: true,
                        onSubmitEditing: () => {
                            if (this.form) this.form.focus("CI");
                        }
                    },
                     "Telefono": {
                        label: "Telefono",
                        defaultValue: this.props.data.Telefono,
                        // type: "",
                        isRequired: true,
                        onSubmitEditing: () => {
                            if (this.form) this.form.focus("CI");
                        }
                    },
                    "Correo": {
                        label: "Correo electrónico",
                        type: 'email',
                        isRequired: true,
                        defaultValue: this.props.data.Correo,
                        onSubmitEditing: () => {
                            if (this.form) this.form.submit()
                        }
                    },
                }}
                onSubmit={(e: any) => {
                    SNotification.send({
                        key: "registro",
                        title: "Registrado el usuario",
                        type: "loading",
                    })
                    MDL.usuario.editar({
                        ...e,
                        estado: this.props.data.estado,
                        key: this.props.data.key,

                    } as any).then((e: any) => {
                        SNotification.send({
                            key: "registro",
                            title: "Usuario registrado",
                            color: STheme.color.success,
                            time: 5000,
                        })
                        if (this.props.onRegister) this.props.onRegister(e)

                    }).catch((e: any) => {
                        SNotification.send({
                            key: "registro",
                            title: "Error al registrar el usuario",
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
