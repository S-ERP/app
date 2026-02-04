import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import { SForm, SHr, SNotification, SPopup, SText, STheme, SView, Upload } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import MDL from '../../../../MDL';
import Btn from '../../../cliente/Components/Btn';
import InputSelector from '../../../../Components/Selectores/InputSelector';
type Props = {
    key_cliente: string,
    key_modelo: string,
    editObject?: any,
    onCancel?: Function,
    onSuccess?: Function,
    modelos?: any[],
}
export default class PopupAgregarTipoCosto extends Component<Props> {
    modelos = null;
    state = {
        key_marca: this.props.editObject?.key_marca,
        key_modelo: this.props.editObject?.key_modelo,
        key_cliente: this.props.editObject?.key_cliente,
        marcas: [],
        articulo: [],
        descripcion_modelo: "",
        nombre_cliente: "",
        descripcion_marca: "",
        cuentas: [],
        tipos_costo: [],
        contactos: [],
    }
    initializeForm = () => {
        if (this.props.editObject && this.form && !this.state.formInitialized) {
            const obj = this.props.editObject;
            this.form.setValues({
                key_cliente: obj.key_cliente,
                comision: obj.comision,
                key_cuenta_contable: obj.key_cuenta_contable,
                key_tipo_costo: obj.key_tipo_costo,
            });
            this.setState({ formInitialized: true });
        }
    }
    componentDidMount(): void {
        MDL.crm.cliente.getAll().then((resp: any) => {
            this.state.contactos = resp;
            this.setState({
                contactos: Object.values(resp).sort((a: any, b: any) => {
                    if (a.nombres > b.nombres) return 1;
                    if (a.nombres < b.nombres) return -1;
                    return 0;
                })
            });
        }).catch((e: any) => {
            console.error("Error al cargar clientes nombres", e);
        })
        MDL.contabilidad.getCuentas().then((resp: any) => {
            this.setState({
                cuentas: Object.values(resp).sort((a: any, b: any) => {
                    if (a.codigo > b.codigo) return 1;
                    if (a.codigo < b.codigo) return -1;
                    return 0;
                })
            });
        }).catch((e: any) => {
            console.error("Error al cargar cuentas contables", e);
        })
        MDL.inventario.getAllTipoCosto().then((resp: any) => {
            this.setState({
                tipos_costo: Object.values(resp || {}).sort((a: any, b: any) => {
                    if (a.descripcion > b.descripcion) return 1;
                    if (a.descripcion < b.descripcion) return -1;
                    return 0;
                })
            });
        }).catch((e: any) => {
            console.error("Error al cargar tipos de costo", e);
        })
        MDL.inventario.getAllModeloStock().then((resp: any) => {
            this.state.articulo = resp;
            if (this.form && this.props.editObject) {
                const articulo = resp.find((item: any) => item.key == this.props.editObject.key_modelo);
                this.setState({ articulo }, this.initializeForm);
            }
            this.setState({
                articulo: resp
            })
        }).catch((e: any) => {
            console.error("Error al cargar marcas", e);
        })
    }
    static open(props: Props) {
        SPopup.open({
            key: "PopupAgregarTipoCosto",
            content: <SView style={{
                width: "100%",
                maxHeight: "100%",
                maxWidth: 500,
                borderRadius: 8,
                borderColor: STheme.color.card,
                borderWidth: 1,
                backgroundColor: STheme.color.background
            }} withoutFeedback >
                <PopupAgregarTipoCosto {...props} onCancel={() => {
                    SPopup.close("PopupAgregarTipoCosto")
                    if (props.onCancel) props.onCancel()
                }}
                    onSuccess={(e: any) => {
                        SPopup.close("PopupAgregarTipoCosto")
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
            <SText fontSize={16}>{this.props?.editObject ? "Editar" : "Crear"}{" Tipo de Costos"}</SText>
            <ScrollView>
                <SForm ref={(ref: any) => this.form = ref} row style={{ justifyContent: "space-between" }}
                    inputs={{
                        "key_cliente": {
                            label: "Selecciona un contacto",
                            type: "custom",
                            customInputClass: InputSelector,
                            placeholder: "Elige un contacto",
                            style: { width: "100%" },
                            options: this.state.contactos.map((contacto: any) => ({
                                label: contacto.nombres, // Texto que verá el usuario
                                value: contacto.key,// Valor interno
                                customComponent: (e: any) => (<SText fontSize={12} color={STheme.color.lightGray}> {e.data.nombres} </SText>),
                                data: contacto
                            }))
                        },
                        "comision": {
                            label: "Comisión (%)",
                            placeholder: "Ej: 10",
                            type: "number",
                            maxLength:3,
                            col: "xs-12",
                            isRequired: true,
                            inputStyle: { paddingStart: 8 },
                            labelStyle: { top: -10 },
                        },
                        "key_cuenta_contable": {
                            label: "Cuenta Contable",
                            type: "custom",
                            customInputClass: InputSelector,
                            style: {
                                width: "100%",
                            },
                            options: this.state.cuentas.map((cuenta: any) => {
                                return {
                                    label: `${cuenta.codigo} - ${cuenta.descripcion}`,
                                    value: cuenta.key,
                                    customComponent: (e: any) => {
                                        return <SText fontSize={12} color={STheme.color.lightGray}>{e.data.tipo}</SText>
                                    },
                                    data: cuenta
                                }
                            })
                        },
                        "key_tipo_costo": {
                            label: "Tipos de costo",
                            type: "custom",
                            customInputClass: InputSelector,
                            style: {
                                width: "100%",
                            },
                            options: this.state.tipos_costo.map((tipo: any) => {
                                return {
                                    label: tipo.descripcion,
                                    value: tipo.key,
                                    customComponent: (e: any) => {
                                        return (
                                            <SText fontSize={12} color={STheme.color.lightGray}>
                                                {e.data.descripcion}
                                            </SText>
                                        );
                                    },
                                    data: tipo
                                }
                            })
                        }
                    }}
                    onSubmit={(data: any) => {
                        data.key_cliente = data.key_cliente;
                        data.key_modelo = this.props.key_modelo;
                        if (this.props.editObject?.key_modelo_cliente) {
                            data.key = this.props.editObject?.key_modelo_cliente;
                            MDL.inventario.editModeloCliente(data).then((resp: any) => {
                                if (this.props.onSuccess) this.props.onSuccess(resp)
                                if (this._ref.image_modelo) {
                                    const value = this._ref.image_modelo.getValue();
                                    if (Array.isArray(value)) {
                                        Upload.sendPromise({ file: value[0], compress: false }, (SSocket.api as any).root + "upload/usuario/" + resp.key)
                                    }
                                }
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
                            MDL.inventario.saveModeloCliente(data).then((resp: any) => {
                                if (this.props.onSuccess) this.props.onSuccess(resp)
                                if (this._ref.image_modelo) {
                                    const value = this._ref.image_modelo.getValue();
                                    if (Array.isArray(value)) {
                                        Upload.sendPromise({ file: value[0], compress: false }, (SSocket.api as any).root + "upload/usuario/" + resp.key)
                                    }
                                }
                                SNotification.send({
                                    title: "Contacto guardado",
                                    body: "Contacto se ha guardado correctamente.",
                                    time: 3000,
                                    color: STheme.color.success,
                                });
                                console.log("Actualizae error")
                            }).catch((e: any) => {
                                if (this.props.onSuccess) this.props.onSuccess(e)
                                console.error("Error al guardar el contacto:", e);
                                SNotification.send({
                                    title: "Error",
                                    body: "No se pudo guardar el contacto.",
                                    time: 3000,
                                    color: STheme.color.danger,
                                });
                            })
                        }
                    }
                    }
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
