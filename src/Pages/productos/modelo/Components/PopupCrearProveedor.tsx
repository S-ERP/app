import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import { SForm, SHr, SNotification, SPopup, SText, STheme, SView, Upload } from 'servisofts-component';
import SSocket from 'servisofts-socket';
// import MDL from '../../../MDL';
// import InputFoto from '../../../Components/InputFoto';
import MDL from '../../../../MDL';
// import { Btn } from '../../../../Components';
import InputFoto from '../../../../Components/InputFoto';
import Btn from './Btn';
// import Btn from './Btn';
type Props = {
    key_empresa: string,
    editObject?: any,
    onCancel?: Function,
    onSuccess?: Function,
}
export default class PopupCrearProveedor extends Component<Props> {
    static open(props: Props) {
        SPopup.open({
            key: "PopupCrearProveedor",
            content: <SView style={{
                width: "100%",
                maxHeight: "100%",
                maxWidth: 500,
                borderRadius: 8,
                borderColor: STheme.color.card,
                borderWidth: 1,
                backgroundColor: STheme.color.background
            }} withoutFeedback >
                <PopupCrearProveedor {...props} onCancel={() => {
                    SPopup.close("PopupCrearProveedor")
                    if (props.onCancel) props.onCancel()
                }}
                    onSuccess={(e: any) => {
                        SPopup.close("PopupCrearProveedor")
                        if (props.onSuccess) props.onSuccess(e)
                    }}
                />
            </SView>
        })
    }
    form: SForm | undefined = undefined;
    _ref: any = {}
    render() {

        const { proveedor, producto_key, producto_descripcion, precio_compra, onPress } = this.props;

        return <SView col={"xs-12"} center padding={16}>
            <SText fontSize={16}>{proveedor ? "Editar" : "Crear"}{" Proveedor"}</SText>
            <ScrollView>
                <SForm ref={(ref: any) => this.form = ref} row style={{ justifyContent: "space-between" }}
                    inputs={{
                        "razon_social": {
                            label: "Razón Social *", placeholder: "Ingresa la razón social", disabled: true, isRequired: true, autoFocus: true, defaultValue: proveedor?.razon_social,
                            onSubmitEditing: () => {
                                if (this.form) this.form.submit();
                            },
                            icon: <SView style={{ borderRadius: 4, overflow: "hidden", width: 50, height: 50, backgroundColor: STheme.color.background, borderWidth: 1, borderColor: STheme.color.text + '66' }}>
                                <InputFoto
                                    ref={ref => this._ref.image_sucursal = ref}
                                    src={(SSocket.api as any).inventario + "proveedor/" + proveedor?.key}
                                    style={{ width: 50, height: 50, }} />
                            </SView>,
                        },
                        "nit": { label: "NIT", placeholder: "NIT", disabled: true,  defaultValue: proveedor?.nit, col: "xs-12" },
                        "nombre": { label: "Nombre del contacto", placeholder: "Nombre del contacto", defaultValue: proveedor?.nombre, col: "xs-12" },
                        "telefono": { label: "Teléfono", placeholder: "Teléfono", type: "telefono", defaultValue: proveedor?.telefono, col: "xs-12" },
                        "nit": { label: "NIT", placeholder: "NIT", disabled: true, defaultValue: proveedor?.nit, col: "xs-12" },
                        "nombre": { label: "Nombre del contacto", disabled: true, placeholder: "Nombre del contacto", defaultValue: proveedor?.nombre, col: "xs-12" },
                        "telefono": { label: "Teléfono", placeholder: "Teléfono", disabled: true, type: "telefono", defaultValue: proveedor?.telefono, col: "xs-12" },


                        "producto_descripcion": {
                            label: "Producto", placeholder: "Producto", defaultValue: producto_descripcion || "0",
                            style: { paddingStart: 0, fontSize: 10 },
                            labelStyle: { top: -10, },
                            inputStyle: { paddingStart: 8, fontSize: 10, backgroundColor: STheme.color.success + "55" },
                            col: "xs-12"
                        },
                        "precio_compra": {
                            label: "Precio", defaultValue: precio_compra || "0", col: "xs-12",

                            style: { paddingStart: 0, fontSize: 10 },
                            labelStyle: { top: -10, },
                            inputStyle: { paddingStart: 8, fontSize: 10, backgroundColor: STheme.color.success + "55" },
                        }
                    }}
                onSubmit={(data: any) => {
                    

                    alert("Pronto funcionada..... se editara el precio al actualiuzar "+JSON.stringify(data))
                    // if (proveedor?.key) {
                    //     data.key = proveedor?.key;
                    //     MDL.inventario.proveedor.editar(data).then((resp: any) => {
                    //         if (this.props.onSuccess) this.props.onSuccess(resp)
                    //         console.log("eitationnnn " + JSON.stringify(resp))
                    //         if (this._ref.image_sucursal) {
                    //             const value = this._ref.image_sucursal.getValue();
                    //             if (Array.isArray(value)) {
                    //                 Upload.sendPromise({ file: value[0], compress: false }, (SSocket.api as any).inventario + "upload/proveedor/" + resp.key)
                    //             }
                    //         }
                    //         SNotification.send({
                    //             title: "proveedor guardada",
                    //             body: "proveedor se ha guardado correctamente.",
                    //             time: 3000,
                    //             color: STheme.color.success,
                    //         });
                    //     }).catch((e: any) => {
                    //         if (this.props.onSuccess) this.props.onSuccess(e)
                    //         console.error("Error al guardar el proveedor:", e);
                    //         SNotification.send({
                    //             title: "Error",
                    //             body: "No se pudo guardar el proveedor.",
                    //             time: 3000,
                    //             color: STheme.color.danger,
                    //         });
                    //     })
                    // } else {
                    //     MDL.inventario.proveedor.registrar(data).then((resp: any) => {
                    //         if (this.props.onSuccess) this.props.onSuccess(resp)
                    //         if (this._ref.image_sucursal) {
                    //             const value = this._ref.image_sucursal.getValue();
                    //             if (Array.isArray(value)) {
                    //                 Upload.sendPromise({ file: value[0], compress: false }, (SSocket.api as any).inventario + "upload/proveedor/" + resp.key)
                    //             }
                    //         }
                    //         SNotification.send({
                    //             title: "proveedor guardada",
                    //             body: "proveedor se ha guardado correctamente.",
                    //             time: 3000,
                    //             color: STheme.color.success,
                    //         });
                    //         console.log("Actualizae error")
                    //     }).catch((e: any) => {
                    //         if (this.props.onSuccess) this.props.onSuccess(e)
                    //         console.error("Error al guardar la proveedor:", e);
                    //         SNotification.send({
                    //             title: "Error",
                    //             body: "No se pudo guardar la proveedor.",
                    //             time: 3000,
                    //             color: STheme.color.danger,
                    //         });
                    //     })
                    // }
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
