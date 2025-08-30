import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import { SForm, SHr, SNotification, SPopup, SText, STheme, SView, Upload } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import MDL from '../../../MDL';
// import InputFoto from '../../../Components/InputFoto';
import Btn from './Btn';
import InputFoto from '../../../Components/InputFoto';
type Props = {
    key_empresa: string,
    editObject?: any,
    onCancel?: Function,
    onSuccess?: Function,
}
export default class PopupCrearCliente extends Component<Props> {
    static open(props: Props) {
        SPopup.open({
            key: "PopupCrearCliente",
            content: <SView style={{
                maxWidth: "100%",
                maxHeight: "100%",
                width: 500,
                borderRadius: 8,
                borderColor: STheme.color.card,
                borderWidth: 1,
                backgroundColor: STheme.color.background
            }} withoutFeedback >
                <PopupCrearCliente {...props} onCancel={() => {
                    SPopup.close("PopupCrearCliente")
                    if (props.onCancel) props.onCancel()
                }}
                    onSuccess={(e: any) => {
                        SPopup.close("PopupCrearCliente")
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
            <SText fontSize={16}>{this.props?.editObject ? "Editar" : "Crear"}{" Cliente"}</SText>
            <ScrollView>
                <SForm ref={(ref: any) => this.form = ref} row style={{ justifyContent: "space-between" }}
                    inputs={{
                        "nombres": {
                            label: "nombres *", placeholder: "Ingresa la nombres", isRequired: true, autoFocus: true, defaultValue: this.props.editObject?.nombres,
                            onSubmitEditing: () => {
                                if (this.form) this.form.submit();
                            },
                            icon: <SView style={{ borderRadius: 4, overflow: "hidden", width: 50, height: 50, backgroundColor: STheme.color.background, borderWidth: 1, borderColor: STheme.color.text + '66' }}>
                                <InputFoto
                                    ref={ref => this._ref.image_sucursal = ref}
                                    src={this.props.editObject?.key ? `${(SSocket.api as any).root}usuario/${this.props.editObject?.key}` : undefined}
                                     style={{ width: 50, height: 50, }} />
                            </SView>,
                        },
                        "key": { label: "key", placeholder: "key", defaultValue: this.props.editObject?.key, col: "xs-12" },
                        "direccion": { label: "direccion", placeholder: "direccion", defaultValue: this.props.editObject?.direccion, col: "xs-12" },
                        "nit": { label: "nit", placeholder: "nit", defaultValue: this.props.editObject?.nit, col: "xs-12" },
                        "razon_social": { label: "razon_social", placeholder: "razon_social", defaultValue: this.props.editObject?.razon_social, col: "xs-12" },
                        "telefono": { label: "telefono", placeholder: "telefono", type: "telefono", defaultValue: this.props.editObject?.telefono, col: "xs-5.5" },
                        "correo": { label: "correo", placeholder: "correo", type: "email", defaultValue: this.props.editObject?.correo, col: "xs-5.5" },
                        // "lat": { label: "lat", placeholder: "lat", defaultValue: this.props.editObject?.lat, col: "xs-5.5" },
                        // "lng": { label: "lng", placeholder: "lng", defaultValue: this.props.editObject?.lng, col: "xs-5.5" },
                        "fecha_nacimiento": { label: "fecha_nacimiento", type: "date", placeholder: "fecha_nacimiento", defaultValue: this.props.editObject?.fecha_nacimiento, col: "xs-5.5" },
                        "sexo": { label: "sexo", placeholder: "sexo", defaultValue: this.props.editObject?.sexo, col: "xs-5.5" },
                        "departamento": { label: "departamento", placeholder: "departamento", defaultValue: this.props.editObject?.departamento, col: "xs-5.5" },


                    }}
                    onSubmit={(data: any) => {
            
                        if (this.props.editObject?.key) {
                            data.key = this.props.editObject?.key;

                            MDL.crm.cliente.editar(data).then((resp: any) => {
                                if (this.props.onSuccess) this.props.onSuccess(resp)
                                if (this._ref.image_sucursal) {
                                    const value = this._ref.image_sucursal.getValue();
                                    if (Array.isArray(value)) {
                                        Upload.sendPromise({ file: value[0], compress: false }, (SSocket.api as any).root + "upload/usuario/" + resp.key)
                                    }
                                }
                                console.log("aqiu " + JSON.stringify(resp))
                                SNotification.send({
                                    title: "cliente guardada",
                                    body: "cliente se ha guardado correctamente.",
                                    time: 3000,
                                    color: STheme.color.success,
                                });
                            }).catch((e: any) => {
                                if (this.props.onSuccess) this.props.onSuccess(e)
                                console.error("Error al guardar el cliente:", e);
                                SNotification.send({
                                    title: "Error",
                                    body: "No se pudo guardar el cliente.",
                                    time: 3000,
                                    color: STheme.color.danger,
                                });
                            })
                        } else {
                            MDL.crm.cliente.registrar(data).then((resp: any) => {
                                if (this.props.onSuccess) this.props.onSuccess(resp)
                                if (this._ref.image_sucursal) {
                                    const value = this._ref.image_sucursal.getValue();
                                    if (Array.isArray(value)) {
                                        Upload.sendPromise({ file: value[0], compress: false }, (SSocket.api as any).root + "upload/usuario/" + resp.key)
                                        // Upload.sendPromise({ file: value[0], compress: false }, (SSocket.api as any).crm + "upload/clientes/" + resp.key)
                                    }
                                }
                                SNotification.send({
                                    title: "cliente guardada",
                                    body: "cliente se ha guardado correctamente.",
                                    time: 3000,
                                    color: STheme.color.success,
                                });
                                console.log("Actualizae error")
                            }).catch((e: any) => {
                                if (this.props.onSuccess) this.props.onSuccess(e)
                                console.error("Error al guardar la cliente:", e);
                                SNotification.send({
                                    title: "Error",
                                    body: "No se pudo guardar la cliente.",
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
