import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import { SForm, SHr, SNotification, SPopup, SText, STheme, SView, Upload } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import MDL from '../../../MDL';
import Btn from './Btn';
import InputFoto from '../../../Components/InputFoto';
import SIconApp from '../../../Assets/SIconApp';
import InputSelector from '../../../Components/Selectores/InputSelector';
type Props = {
    key_cliente: string,
    editObject?: any,
    onCancel?: Function,
    onSuccess?: Function,
    modelos?: any[],
}
export default class PopupArticulos extends Component<Props> {
    modelos = null;
    state = {
        key_marca: this.props.editObject?.key_marca,
        key_modelo: this.props.editObject?.key_modelo,
        marcas: [],
        articulo: [],
        descripcion_modelo: "",
        descripcion_marca: "",
        cuentas: [],
        tipos_costo: [],
    }
    componentDidMount(): void {
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
                this.form.setValues({ "tipo": articulo.descripcion });
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
            key: "PopupArticulos",
            content: <SView style={{
                width: "100%",
                maxHeight: "100%",
                maxWidth: 500,
                borderRadius: 8,
                borderColor: STheme.color.card,
                borderWidth: 1,
                backgroundColor: STheme.color.background
            }} withoutFeedback >
                <PopupArticulos {...props} onCancel={() => {
                    SPopup.close("PopupArticulos")
                    if (props.onCancel) props.onCancel()
                }}
                    onSuccess={(e: any) => {
                        SPopup.close("PopupArticulos")
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
            <SText fontSize={16}>{this.props?.editObject ? "Editar" : "Crear"}{" Artículo"}</SText>
            <ScrollView>
                <SForm ref={(ref: any) => this.form = ref} row style={{ justifyContent: "space-between" }}
                    inputs={{
                        "articulo": {
                            col: "xs-12",
                            style: { paddingStart: 0, },
                            labelStyle: { top: -10, },
                            inputStyle: { paddingStart: 8 },
                            icon: <SView style={{ borderRadius: 4, overflow: "hidden", width: 50, height: 50, backgroundColor: STheme.color.background, borderWidth: 1, borderColor: STheme.color.text + '66' }}>
                                { }
                                <InputFoto
                                    ref={ref => this._ref.image_modelo = ref}
                                    src={(SSocket.api as any).inventario + "modelo/.128_" + this.props.editObject?.key}
                                    style={{ width: 50, height: 50, }} />
                            </SView>,
                            label: "Artículo", placeholder: "Ingresa el artículo", isRequired: true,
                            type: "select2",
                            options: this.state.articulo.map((item: any) => item.descripcion),
                            onChangeText: (text: string) => {
                                const key_modelo = (this.state.articulo as any).find((item: any) => item.descripcion == text)?.key;
                                this.state.key_modelo = key_modelo;
                                this.state.descripcion_modelo = text;
                                if (key_modelo) {
                                    this._ref.image_modelo.setValue((SSocket.api as any).inventario + "modelo/.128_" + key_modelo);
                                    this._ref.image_modelo.forceUpdate();
                                } else {
                                    if (this._ref.image_modelo.getValue() != "") {
                                        this._ref.image_modelo.setValue("");
                                        this._ref.image_modelo.forceUpdate();
                                    }
                                }
                            },
                            onSubmitEditing: () => {
                                if (this.form) this.form.focus("articulo");
                            },
                            iconR: !this.state.key_modelo && !!this.state.descripcion_modelo ? <SView style={{
                                width: 40, height: 40,
                                padding: 10,
                                backgroundColor: STheme.color.card
                            }} center onPress={() => {
                                MDL.inventario.saveModeloCliente({
                                    key_cliente: this.props.key_cliente,
                                }).then((resp: any) => {
                                    this.state.key_modelo = resp.key;
                                    this.state.articulo.push(resp as never);
                                    this.forceUpdate();
                                    SNotification.send({
                                        title: "Tipo de producto guardado",
                                        body: "El tipo de producto se ha guardado correctamente.",
                                        time: 3000,
                                        color: STheme.color.success,
                                    });
                                }).catch((e: any) => {
                                    console.error("Error al guardar el tipo de producto:", e);
                                    SNotification.send({
                                        title: "Error",
                                        body: "No se pudo guardar el tipo de producto.",
                                        time: 3000,
                                        color: STheme.color.danger,
                                    });
                                })
                            }}>
                                <SIconApp name='adicional' fill={STheme.color.warning} />
                            </SView> : null,
                            onBlur: () => {
                                if (this.state.key_modelo) {
                                } else {
                                    this.forceUpdate();
                                }
                            }
                        },
                        "comision": {
                            label: "Comisión (%)",
                            placeholder: "Ej: 10",
                            type: "number",
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
                        data.key_cliente = this.props.key_cliente;
                        data.key_modelo = this.state.key_modelo;
                        if (this.props.editObject?.key) {
                            data.key = this.props.editObject?.key;
                            MDL.inventario.saveModeloCliente(data).then((resp: any) => {
                                if (this.props.onSuccess) this.props.onSuccess(resp)
                                if (this._ref.image_modelo) {
                                    const value = this._ref.image_modelo.getValue();
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
                            MDL.inventario.saveModeloCliente(data).then((resp: any) => {
                                if (this.props.onSuccess) this.props.onSuccess(resp)
                                if (this._ref.image_modelo) {
                                    const value = this._ref.image_modelo.getValue();
                                    if (Array.isArray(value)) {
                                        Upload.sendPromise({ file: value[0], compress: false }, (SSocket.api as any).root + "upload/usuario/" + resp.key)
                                    }
                                }
                                SNotification.send({
                                    title: "Artículo guardado",
                                    body: "Artículo se ha guardado correctamente.",
                                    time: 3000,
                                    color: STheme.color.success,
                                });
                                console.log("Actualizae error")
                            }).catch((e: any) => {
                                if (this.props.onSuccess) this.props.onSuccess(e)
                                console.error("Error al guardar el artículo:", e);
                                SNotification.send({
                                    title: "Error",
                                    body: "No se pudo guardar el artículo.",
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
