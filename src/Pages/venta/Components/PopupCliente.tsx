import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import { SDate, SForm, SHr, SNotification, SPopup, SText, STheme, SView, Upload } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import MDL from '../../../MDL';
// import InputFoto from '../../../Components/InputFoto';
import proveedor from '../../../MDL/inventario/proveedor';
import Btn from './Btn';
import { stat } from 'fs';
// import SIconApp from '../../../Assets/SIconApp';
import cliente from '../../../MDL/crm/cliente';
import InputFoto from '../../../Components/InputFoto';
type Props = {
    key_empresa: string,
    editObject?: any,
    data?: any,
    onCancel?: Function,
    onSuccess?: Function,
    onReload?: Function,
}
export default class PopupCliente extends Component<Props> {
    static open(props: Props) {
        SPopup.open({
            key: "PopupCliente",
            content: <SView style={{
                width: "100%",
                maxHeight: "100%",
                maxWidth: 500,
                borderRadius: 8,
                borderColor: STheme.color.card,
                borderWidth: 1,
                backgroundColor: STheme.color.background
            }} withoutFeedback >
                <PopupCliente {...props} onCancel={() => {
                    SPopup.close("PopupCliente")
                    if (props.onCancel) props.onCancel()
                }}
                    onSuccess={(e: any) => {
                        SPopup.close("PopupCliente")
                        if (props.onSuccess) props.onSuccess(e)
                    }}
                />
            </SView>
        })
    }
    form: SForm | undefined = undefined;
    _ref: any = {}
    render() {
        console.log("dataaa: ", this.props.data)
        let cliente = this.props.data?.cliente ? this.props.data?.cliente : this.props.data?.proveedor;
        console.log("cliente: ", cliente)
        return <SView col={"xs-12"} center padding={16}>
            <SText fontSize={16}>{this.props?.data ? "Editar" : "Crear"}{" Descripción"}</SText>
            <ScrollView style={{
                width: "100%",
                maxHeight: 400,
                maxWidth: 500,
                marginTop: 16,
            }}>
                <SForm ref={(ref: any) => this.form = ref} row style={{ justifyContent: "space-between" }}
                    col={"xs-12"}
                    inputs={{
                        // "nombres": { label: "Nombre", placeholder: "Nombre", defaultValue: cliente?.nombres, col: "xs-12" },
                        "nombres": {
                            label: "Nombre completo *", placeholder: "Ingresa nombre completo", isRequired: true, autoFocus: true, defaultValue: cliente?.nombres,
                            onSubmitEditing: () => {
                                if (this.form) this.form.submit();
                            },
                            icon: <SView style={{ borderRadius: 4, overflow: "hidden", width: 50, height: 50, backgroundColor: STheme.color.background, borderWidth: 1, borderColor: STheme.color.text + '66' }}>
                                <InputFoto
                                    ref={ref => this._ref.image_sucursal = ref}
                                    src={cliente?.key ? `${(SSocket.api as any).root}usuario/${cliente?.key}` : undefined}
                                    style={{ width: 50, height: 50, }} />
                            </SView>,
                        },
                        "correo": { label: "Correo", placeholder: "Correo", defaultValue: cliente?.correo, col: "xs-6.7" },
                        "telefono": { label: "Telefono", placeholder: "Telefono", defaultValue: cliente?.telefono, col: "xs-4.7" },
                        "direccion": { label: "Direccion", placeholder: "Direccion", defaultValue: cliente?.direccion, col: "xs-12" },
                        "nit": { label: "Nit", placeholder: "Nit", defaultValue: cliente?.nit, col: "xs-12" },
                        "razon_social": { label: "Razon Social", placeholder: "Razon Social", defaultValue: cliente?.razon_social, col: "xs-12" },
                    }}
                    onSubmit={(val: any) => {
                        const data = {
                            ...val,
                            // key_cuenta_contable: "1.0.1",
                            // state: this.props.data?.state,

                        };
                        if (cliente?.key) {
                            data.key = cliente?.key;
                            MDL.crm.cliente.editar(data).then((resp: any) => {
                                if (this.props.onReload) this.props.onReload()
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
                                if (this.props.onReload) this.props.onReload()
                                console.error("Error al guardar el cliente:", e);
                                SNotification.send({
                                    title: "Error",
                                    body: "No se pudo guardar el cliente.",
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
                {this.props?.editObject?.quitar && <>
                    <Btn type='danger' label='Quitar Proveedor' onPress={() => {
                        SPopup.confirm({
                            title: "¿Quitar proveedor del modelo?",
                            message: `Esto eliminará permanentemente "${this.props?.editObject?.razon_social}" del modelo seleccionado.`,
                            ok: { label: "Quitar", color: "#fff" },
                            cancel: { label: "Cancelar" },
                            onPress: () => {
                                MDL.inventario.saveModeloProveedor({
                                    key: this.props?.editObject?.key_modelo_proveedor,
                                    key_modelo: this.props?.editObject?.key_modelo,
                                    key_proveedor: this.props?.editObject?.key,
                                    estado: 0
                                }).then((resp: any) => {
                                    if (this.props.onSuccess) this.props.onSuccess(resp)
                                    SNotification.send({
                                        title: "Proveedor quitado del modelo",
                                        body: `"${this.props?.editObject?.razon_social}" ya no forma parte del modelo.`,
                                        time: 3000,
                                        color: STheme.color.success,
                                    });
                                }).catch((e: any) => {
                                    if (this.props.onSuccess) this.props.onSuccess(e)
                                    console.error("Error al quitar el proveedor:", e);
                                    SNotification.send({
                                        title: "Error",
                                        body: "No se pudo quitar el proveedor del modelo.",
                                        time: 3000,
                                        color: STheme.color.danger,
                                    });
                                })
                            },
                        });
                    }} />
                    <SView width={8} />
                </>}
                {this.props.onCancel && <>
                    <Btn type={this.props?.editObject?.quitar ? "succes" : 'danger'} label='CANCELAR' onPress={() => {
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
