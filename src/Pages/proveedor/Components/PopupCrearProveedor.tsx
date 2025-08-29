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
export default class PopupCrearProveedor extends Component<Props> {

    // constructor(props) {
    // super(props);
    // this.state = {};
    ProveedorItem = {
        key: "",
        razon_social: "",
        nit: "",
        nombre: "",
        telefono: "",
        key_cuenta_contable: "",
        key_empresa: "",
    }
    // }

    static open(props: Props) {
        SPopup.open({
            key: "PopupCrearProveedor",
            content: <SView style={{
                maxWidth: "100%",
                maxHeight: "100%",
                width: 500,
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
    state: any = {
        sucursales: []  // inicializamos vacio
    }



    componentDidMount(): void {
        MDL.empresa.getAllSucursales().then(item => {
            this.setState({
                sucursales: Object.values(item).map((suc: any) => ({
                    key: suc.key?.toString(),  // ⚡ convertir key a string
                    content: `Suc.- ${suc.descripcion}`
                }))
            });
        }).catch(e => console.error(e));
    }
    render() {
        return <SView col={"xs-12"} center padding={16}>
            <SText fontSize={16}>{this.props?.editObject ? "Editar" : "Crear"}{" Proveedor"}</SText>
            <ScrollView>
                <SForm ref={(ref: any) => this.form = ref} row style={{ justifyContent: "space-between" }}
                    inputs={{
                        "razon_social": {
                            label: "Razón Social *", placeholder: "Ingresa la razón social", isRequired: true, autoFocus: true, defaultValue: this.props.editObject?.razon_social,
                            onSubmitEditing: () => {
                                if (this.form) this.form.submit();
                            },
                            icon: <SView style={{ borderRadius: 4, overflow: "hidden", width: 50, height: 50, backgroundColor: STheme.color.background, borderWidth: 1, borderColor: STheme.color.text + '66' }}>
                                <InputFoto
                                    ref={ref => this._ref.image_sucursal = ref}
                                    src={(SSocket.api as any).inventario + "proveedor/" + this.props.editObject?.key}
                                    style={{ width: 50, height: 50, }} />
                            </SView>,
                        },
                        "nit": { label: "NIT", placeholder: "NIT", defaultValue: this.props.editObject?.nit, col: "xs-12" },
                        "nombre": { label: "Nombre del contacto", placeholder: "Nombre del contacto", defaultValue: this.props.editObject?.nombre, col: "xs-12" },
                        "telefono": { label: "Teléfono", placeholder: "Teléfono", type: "telefono", defaultValue: this.props.editObject?.telefono, col: "xs-12" },
                    }}
                    onSubmit={(val: any) => {

                        const data = {
                            ...val,
                            key_cuenta_contable: "1.0.1",
                        };


                        if (this.props.editObject?.key) {
                            data.key = this.props.editObject?.key;
                            MDL.inventario.proveedor.editar(data).then((resp: any) => {
                                if (this.props.onSuccess) this.props.onSuccess(resp)

                                console.log("eitationnnn " + JSON.stringify(resp))

                                if (this._ref.image_sucursal) {
                                    const value = this._ref.image_sucursal.getValue();
                                    if (Array.isArray(value)) {
                                        Upload.sendPromise({ file: value[0], compress: false }, (SSocket.api as any).inventario + "upload/proveedor/" + this.props.editObject?.key)
                                    }
                                }
                                this.forceUpdate();
                                SNotification.send({
                                    title: "proveedor guardada",
                                    body: "proveedor se ha guardado correctamente.",
                                    time: 3000,
                                    color: STheme.color.success,
                                });
                            }).catch((e: any) => {
                                if (this.props.onSuccess) this.props.onSuccess(e)
                                console.error("Error al guardar el proveedor:", e);
                                SNotification.send({
                                    title: "Error",
                                    body: "No se pudo guardar el proveedor.",
                                    time: 3000,
                                    color: STheme.color.danger,
                                });
                            })
                        } else {

                            // console.log("todo  " + JSON.stringify(data))
                            // console.log("giardar prove")

                            MDL.inventario.proveedor.registrar(data).then((resp: any) => {
                                if (this.props.onSuccess) this.props.onSuccess(resp)
                                if (this._ref.image_sucursal) {
                                    const value = this._ref.image_sucursal.getValue();
                                    if (Array.isArray(value)) {
                                        Upload.sendPromise({ file: value[0], compress: false }, (SSocket.api as any).inventario + "upload/proveedor/" + resp.key)
                                    }
                                }
                                this.forceUpdate();
                                SNotification.send({
                                    title: "Almacen guardada",
                                    body: "Almacen se ha guardado correctamente.",
                                    time: 3000,
                                    color: STheme.color.success,
                                });
                                console.log("Actualizae error")
                            }).catch((e: any) => {
                                if (this.props.onSuccess) this.props.onSuccess(e)
                                console.error("Error al guardar la Almacen:", e);
                                SNotification.send({
                                    title: "Error",
                                    body: "No se pudo guardar la Almacen.",
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
