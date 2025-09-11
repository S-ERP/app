import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import { SForm, SHr, SNotification, SPopup, SText, STheme, SView, Upload } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import MDL from '../../../MDL';
import InputFoto from '../../../Components/InputFoto';
import Btn from './Btn';
type Props = {
    key_empresa: string,
    editObject?: any,
    onCancel?: Function,
    onSuccess?: Function,
}
export default class PopupCrearRol extends Component<Props> {
    static open(props: Props) {
        SPopup.open({
            key: "PopupCrearRol",
            content: <SView style={{
                width: "100%",
                maxHeight: "100%",
                maxWidth: 500,
                borderRadius: 8,
                borderColor: STheme.color.card,
                borderWidth: 1,
                backgroundColor: STheme.color.background
            }} withoutFeedback >
                <PopupCrearRol {...props} onCancel={() => {
                    SPopup.close("PopupCrearRol")
                    if (props.onCancel) props.onCancel()
                }}
                    onSuccess={(e: any) => {
                        SPopup.close("PopupCrearRol")
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
            <SText fontSize={16}>{this.props?.editObject ? "Editar" : "Crear"}{" Rol"}</SText>
            <ScrollView>
                <SForm ref={(ref: any) => this.form = ref} row style={{ justifyContent: "space-between" }}
                    inputs={{
                        "descripcion": {
                            label: "Descripción *", placeholder: "Ingresa la descripción", isRequired: true, autoFocus: true, defaultValue: this.props.editObject?.descripcion,
                            onSubmitEditing: () => {
                                if (this.form) this.form.submit();
                            },
                            icon: <SView style={{ borderRadius: 4, overflow: "hidden", width: 50, height: 50, backgroundColor: STheme.color.background, borderWidth: 1, borderColor: STheme.color.text + '66' }}>
                                <InputFoto
                                    ref={ref => this._ref.image_rol = ref}
                                    src={this.props.editObject?.key ? `${(SSocket.api as any).roles_permisos}rol/${this.props.editObject.key}` : undefined}
                                    style={{ width: 50, height: 50, }} />
                            </SView>,
                        },
                        // "key_empresa": { label: "key_empresa", placeholder: "key_empresa", defaultValue: this.props.editObject?.key_empresa, col: "xs-12" },
                        // "tipo": { label: "tipo", placeholder: "tipo", defaultValue: this.props.editObject?.tipo, col: "xs-12" },
                        // "observacion": { label: "observacion", placeholder: "observacion", defaultValue: this.props.editObject?.observacion, col: "xs-12" },
                        // "color": { label: "color", placeholder: "color", defaultValue: this.props.editObject?.color, col: "xs-12" },
                    }}
                    onSubmit={(data: any) => {

                        if (this.props.editObject?.key) {
                            data.key = this.props.editObject?.key;
                            MDL.rolesPermisos.editarRol(data).then((resp: any) => {
                                if (this.props.onSuccess) this.props.onSuccess(resp)
                                if (this._ref.image_rol) {
                                    const value = this._ref.image_rol.getValue();
                                    if (Array.isArray(value)) {
                                        Upload.sendPromise({ file: value[0], compress: false }, (SSocket.api as any).roles_permisos + "upload/rol/" + resp.key)
                                    }
                                }
                                SNotification.send({
                                    title: "rol guardada",
                                    body: "rol se ha guardado correctamente.",
                                    time: 3000,
                                    color: STheme.color.success,
                                });
                            }).catch((e: any) => {
                                if (this.props.onSuccess) this.props.onSuccess(e)
                                console.error("Error al guardar el rol:", e);
                                SNotification.send({
                                    title: "Error",
                                    body: "No se pudo guardar el rol.",
                                    time: 3000,
                                    color: STheme.color.danger,
                                });
                            })
                        } else {
                            MDL.rolesPermisos.registrarRol(data).then((resp: any) => {
                                if (this.props.onSuccess) this.props.onSuccess(resp)
                                if (this._ref.image_rol) {
                                    const value = this._ref.image_rol.getValue();
                                    if (Array.isArray(value)) {
                                        Upload.sendPromise({ file: value[0], compress: false }, (SSocket.api as any).roles_permisos + "upload/rol/" + resp.key)
                                    }
                                }
                                SNotification.send({
                                    title: "rol guardada",
                                    body: "rol se ha guardado correctamente.",
                                    time: 3000,
                                    color: STheme.color.success,
                                });
                                console.log("registra error")
                            }).catch((e: any) => {
                                if (this.props.onSuccess) this.props.onSuccess(e)
                                console.error("Error al guardar la rol:", e);
                                SNotification.send({
                                    title: "Error",
                                    body: "No se pudo guardar la rol.",
                                    time: 3000,
                                    color: STheme.color.danger,
                                });
                            })
                        }
                    }}
                />
            </ScrollView>
            <SHr h={16} />
            <SView row col={"xs-12"}>
                {this.props.onCancel && <>
                    <Btn type='danger' label='CANCELAR' onPress={() => {
                        if (this.props.onCancel) this.props.onCancel()
                    }} />
                    <SView width={8} />
                </>}
                <Btn type='primary' label='GUARDAR' onPress={() => {
                    if (this.form) this.form.submit();
                }} />
            </SView>
        </SView>
    }
}
