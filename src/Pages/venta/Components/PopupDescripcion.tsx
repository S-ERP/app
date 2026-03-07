import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import { SDate, SForm, SHr, SNotification, SPopup, SText, STheme, SView, Upload } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import MDL from '../../../MDL';
// import InputFoto from '../../../Components/InputFoto';
import Btn from './Btn';
import { stat } from 'fs';
// import SIconApp from '../../../Assets/SIconApp';
type Props = {
    key_empresa: string,
    editObject?: any,
    data?: any,
    onCancel?: Function,
    onSuccess?: Function,
    onReload?: Function,
}
export default class PopupDescripcion extends Component<Props> {
    static open(props: Props) {
        SPopup.open({
            key: "PopupDescripcion",
            content: <SView style={{
                width: "100%",
                maxHeight: "100%",
                maxWidth: 500,
                borderRadius: 8,
                borderColor: STheme.color.card,
                borderWidth: 1,
                backgroundColor: STheme.color.background
            }} withoutFeedback >
                <PopupDescripcion {...props} onCancel={() => {
                    SPopup.close("PopupDescripcion")
                    if (props.onCancel) props.onCancel()
                }}
                    onSuccess={(e: any) => {
                        SPopup.close("PopupDescripcion")
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

                        "descripcion": { label: "Descripcion", placeholder: "Descripcion", defaultValue: this.props.data?.descripcion, col: "xs-12" },
                        // "descripcion2": { label: "Descripcion", placeholder: "Descripcion", defaultValue: this.props.data?.descripcion, col: "xs-12"},

                    }}
                    onSubmit={(val: any) => {
                        const data = {
                            ...val,
                            // key_cuenta_contable: "1.0.1",
                            state: this.props.data?.state,

                        };
                        if (this.props.data?.key) {
                            data.key = this.props.data?.key;
                            // MDL.compra_venta.
                            SSocket.sendPromise({
                                service: "compra_venta",
                                component: "compra_venta",
                                type: "editar",
                                key: this.props.data?.key,
                                data: data
                            }).then((resp: any) => {
                                // if (this.props.onSuccess) this.props.onSuccess(resp)
                                if (this.props.onReload) {
                                    this.props.onReload();
                                }
                                SNotification.send({
                                    title: "Descripción editada",
                                    body: "La descripción se ha editado correctamente.",
                                    time: 3000,
                                    color: STheme.color.success,
                                });
                            }).catch((e: any) => {
                                // if (this.props.onSuccess) this.props.onSuccess(e)
                                 if (this.props.onReload) {
                                    this.props.onReload();
                                }
                                console.error("Error al editar la descripción:", e);
                                SNotification.send({
                                    title: "Error",
                                    body: "No se pudo editar la descripción",
                                    time: 3000,
                                    color: STheme.color.danger,
                                });
                            })


                            // component: "cuota"
                            // type:editar,
                            // key_cuota: this.props.editObject?.key,
                            // data: data

                            // MDL.inventario.proveedor.editar(data).then((resp: any) => {
                            //     if (this.props.onSuccess) this.props.onSuccess(resp)
                            //     console.log("eitationnnn " + JSON.stringify(resp))
                            //     if (this._ref.image_sucursal) {
                            //         const value = this._ref.image_sucursal.getValue();
                            //         if (Array.isArray(value)) {
                            //             Upload.sendPromise({ file: value[0], compress: false }, (SSocket.api as any).inventario + "upload/proveedor/" + resp.key)
                            //         }
                            //     }
                            //     SNotification.send({
                            //         title: "proveedor guardada",
                            //         body: "proveedor se ha guardado correctamente.",
                            //         time: 3000,
                            //         color: STheme.color.success,
                            //     });
                            // }).catch((e: any) => {
                            //     if (this.props.onSuccess) this.props.onSuccess(e)
                            //     console.error("Error al guardar el proveedor:", e);
                            //     SNotification.send({
                            //         title: "Error",
                            //         body: "No se pudo guardar el proveedor.",
                            //         time: 3000,
                            //         color: STheme.color.danger,
                            //     });
                            // })
                        } else {
                            // MDL.inventario.proveedor.registrar(data).then((resp: any) => {
                            //     if (this.props.onSuccess) this.props.onSuccess(resp)
                            //     if (this._ref.image_sucursal) {
                            //         const value = this._ref.image_sucursal.getValue();
                            //         if (Array.isArray(value)) {
                            //             Upload.sendPromise({ file: value[0], compress: false }, (SSocket.api as any).inventario + "upload/proveedor/" + resp.key)
                            //         }
                            //     }
                            //     SNotification.send({
                            //         title: "proveedor guardada",
                            //         body: "proveedor se ha guardado correctamente.",
                            //         time: 3000,
                            //         color: STheme.color.success,
                            //     });
                            //     console.log("Actualizae error")
                            // }).catch((e: any) => {
                            //     if (this.props.onSuccess) this.props.onSuccess(e)
                            //     console.error("Error al guardar la proveedor:", e);
                            //     SNotification.send({
                            //         title: "Error",
                            //         body: "No se pudo guardar la proveedor.",
                            //         time: 3000,
                            //         color: STheme.color.danger,
                            //     });
                            // })
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
