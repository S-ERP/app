import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SForm, SHr, SIcon, SInput, SNotification, SPopup, SText, STheme, SView, Upload } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import MDL from '../../../MDL';
import Btn from '../../empresa/config/Components/Btn';
import SIconApp from '../../../Assets/SIconApp';
import BarcodeScanner from '../../../Components/BarcodeScanner';
import InputFoto from '../../../Components/InputFoto';
import BarcodeIcon from '../../../Components/BarcodeScanner/BarcodeIcon';
import TextAreaPopupOpenIcon from '../../../Components/QueryTool/TextAreaPopupOpenIcon';

type Props = {
    editObject?: any,
    onCancel?: Function,
    onSuccess?: Function,
}

export default class FormularioModelo extends Component<Props> {

    static open(props: Props) {
        SPopup.open({
            key: "FormularioModelo",
            content: <SView style={{
                width: "100%",
                maxHeight: "100%",
                maxWidth: 500,
                // height: 500,
                borderRadius: 8,
                borderColor: STheme.color.card,
                borderWidth: 1,
                backgroundColor: STheme.color.background
            }} withoutFeedback >
                <FormularioModelo {...props} onCancel={() => {
                    SPopup.close("FormularioModelo")
                    if (props.onCancel) props.onCancel()
                }}
                    onSuccess={(e: any) => {
                        SPopup.close("FormularioModelo")
                        if (props.onSuccess) props.onSuccess(e)
                    }}

                />
            </SView>
        })
    }

    state = {
        key_marca: this.props.editObject?.key_marca,
        key_tipo_producto: this.props.editObject?.key_tipo_producto,
        marcas: [],
        tipo_productos: [],
        descripcion_tipo_producto: "",
        descripcion_marca: "",
    }
    qr_reader_listener: any;
    // qr_reader_listener_picture: any;
    componentDidMount(): void {
        MDL.inventario.getAllMarca().then((resp: any) => {

            this.state.marcas = resp;
            if (this.form && this.props.editObject) {
                const marca = resp.find((item: any) => item.key == this.props.editObject.key_marca);
                this.form.setValues({ "marca": marca.descripcion });
            }
            this.setState({
                marcas: resp
            })
        }).catch((e: any) => {
            console.error("Error al cargar marcas", e);
        })
        MDL.inventario.getAllTipoProducto().then((resp: any) => {

            this.state.tipo_productos = resp;
            if (this.form && this.props.editObject) {
                const tipo_producto = resp.find((item: any) => item.key == this.props.editObject.key_tipo_producto);
                this.form.setValues({ "tipo": tipo_producto.descripcion });
            }
            this.setState({
                tipo_productos: resp
            })
        }).catch((e: any) => {
            console.error("Error al cargar marcas", e);
        })


    }


    buildCustmomInputs() {

    }
    _ref: any = {}
    form: SForm | undefined = undefined;
    render() {
        return <SView col={"xs-12"} center padding={16}>
            <SText fontSize={16}>{this.props.editObject ? "Editar" : "Crear"}{" Modelo"}</SText>
            <SForm ref={(ref: any) => this.form = ref} row
                style={{
                    justifyContent: "space-between",
                }}
                inputs={{

                    "marca": {
                        col: "xs-12 sm-5.8",
                        style: { paddingStart: 0, },
                        labelStyle: { top: -10, },
                        inputStyle: { paddingStart: 8 },
                        icon: <SView style={{ borderRadius: 4, overflow: "hidden", width: 50, height: 50, backgroundColor: STheme.color.background, borderWidth: 1, borderColor: STheme.color.text + '66' }}>
                            {/* <SInput ref={ref => this._ref.image_marca = ref} type='image' height={50} defaultValue={(SSocket.api as any).inventario + "marca/" + this.props.editObject?.key_marca} /> */}
                            <InputFoto
                                ref={ref => this._ref.image_marca = ref}
                                src={(SSocket.api as any).inventario + "marca/.128_" + this.props.editObject?.key_marca}
                                style={{
                                    width: 50,
                                    height: 50,
                                }} />
                        </SView>,
                        label: "Marca", placeholder: "Ingresa la marca", isRequired: true,
                        type: "select2",
                        options: this.state.marcas.map((item: any) => item.descripcion),
                        onChangeText: (text: string) => {
                            const key_marca = (this.state.marcas as any).find((item: any) => item.descripcion == text)?.key;
                            this.state.key_marca = key_marca;
                            this.state.descripcion_marca = text;
                            console.log("entro al onchange", key_marca, text);
                            if (key_marca) {
                                this._ref.image_marca.setValue((SSocket.api as any).inventario + "marca/.128_" + key_marca);
                                this._ref.image_marca.forceUpdate();

                            } else {
                                if (this._ref.image_marca.getValue() != "") {
                                    this._ref.image_marca.setValue("");
                                    this._ref.image_marca.forceUpdate();
                                }
                            }
                        },
                        // defaultValue: this.props.editObject?.descripcion,
                        onSubmitEditing: () => {
                            if (this.form) this.form.focus("tipo");
                        },
                        iconR: !this.state.key_marca && !!this.state.descripcion_marca ? <SView style={{
                            width: 40, height: 40,
                            padding: 10,
                            backgroundColor: STheme.color.card
                        }} center onPress={() => {
                            MDL.inventario.saveMarca({
                                descripcion: this.state.descripcion_marca,
                                key_empresa: MDL.empresa.select?.key,
                            }).then((resp: any) => {
                                this.state.key_marca = resp.key;
                                this.state.marcas.push(resp as never);
                                // this._ref.image_marca.setValue((SSocket.api as any).inventario + "marca/" + resp.key);
                                // this._ref.image_marca.forceUpdate();
                                this.forceUpdate();
                                SNotification.send({
                                    title: "Marca guardada",
                                    body: "La marca se ha guardado correctamente.",
                                    time: 3000,
                                    color: STheme.color.success,
                                });
                            }).catch((e: any) => {
                                console.error("Error al guardar la marca:", e);
                                SNotification.send({
                                    title: "Error",
                                    body: "No se pudo guardar la marca.",
                                    time: 3000,
                                    color: STheme.color.danger,
                                });
                            })
                        }}>
                            <SIconApp name='adicional' fill={STheme.color.warning} />
                        </SView> : null,
                        onBlur: () => {
                            if (this.state.key_marca) {
                                console.log("Marca seleccionada:", this.state.key_marca);
                            } else {
                                console.log("No se ha seleccionado una marca válida.");
                                this.forceUpdate();
                            }
                        }
                    },
                    "tipo": {
                        col: "xs-12 sm-5.8",
                        style: { paddingStart: 0, },
                        labelStyle: { top: -10, },
                        inputStyle: { paddingStart: 8 },
                        icon: <SView style={{ borderRadius: 4, overflow: "hidden", width: 50, height: 50, backgroundColor: STheme.color.background, borderWidth: 1, borderColor: STheme.color.text + '66' }}>
                            {/* <SInput ref={ref => this._ref.image_tipo_producto = ref} type='image' height={50} defaultValue={(SSocket.api as any).inventario + "tipo_producto/" + this.props.editObject?.key_marca} /> */}
                            <InputFoto
                                ref={ref => this._ref.image_tipo_producto = ref}
                                src={(SSocket.api as any).inventario + "tipo_producto/.128_" + this.props.editObject?.key_tipo_producto}
                                style={{
                                    width: 50,
                                    height: 50,
                                }} />
                        </SView>,
                        label: "Tipo", placeholder: "Ingresa el tipo", isRequired: true,
                        type: "select2",
                        options: this.state.tipo_productos.map((item: any) => item.descripcion),
                        onChangeText: (text: string) => {
                            const key_tipo_producto = (this.state.tipo_productos as any).find((item: any) => item.descripcion == text)?.key;
                            this.state.key_tipo_producto = key_tipo_producto;
                            this.state.descripcion_tipo_producto = text;
                            if (key_tipo_producto) {
                                this._ref.image_tipo_producto.setValue((SSocket.api as any).inventario + "tipo_producto/.128_" + key_tipo_producto);
                                this._ref.image_tipo_producto.forceUpdate();
                                console.log("text", text);
                            } else {
                                if (this._ref.image_tipo_producto.getValue() != "") {
                                    this._ref.image_tipo_producto.setValue("");
                                    this._ref.image_tipo_producto.forceUpdate();
                                }
                            }
                        },
                        // defaultValue: this.props.editObject?.descripcion,
                        onSubmitEditing: () => {
                            if (this.form) this.form.focus("descripcion");
                        },
                        iconR: !this.state.key_tipo_producto && !!this.state.descripcion_tipo_producto ? <SView style={{
                            width: 40, height: 40,
                            padding: 10,
                            backgroundColor: STheme.color.card
                        }} center onPress={() => {
                            MDL.inventario.saveTipoProducto({
                                descripcion: this.state.descripcion_tipo_producto,
                                key_empresa: MDL.empresa.select?.key,
                            }).then((resp: any) => {
                                this.state.key_tipo_producto = resp.key;
                                this.state.tipo_productos.push(resp as never);
                                // this._ref.image_marca.setValue((SSocket.api as any).inventario + "marca/" + resp.key);
                                // this._ref.image_marca.forceUpdate();
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
                            if (this.state.key_tipo_producto) {
                                console.log("Tipo produco seleccionada:", this.state.key_tipo_producto);
                            } else {
                                this.forceUpdate();
                                console.log("No se ha seleccionado una marca válida.");
                            }
                        }
                    },
                    "descripcion": {
                        col: "xs-12",
                        style: { paddingStart: 0, },
                        labelStyle: { top: -10, },
                        inputStyle: { paddingStart: 8 },
                        icon: <SView style={{ borderRadius: 4, overflow: "hidden", width: 50, height: 50, backgroundColor: STheme.color.background, borderWidth: 1, borderColor: STheme.color.text + '66' }}>
                            {/* <SInput ref={ref => this._ref.image_modelo = ref} type='image' height={50} defaultValue={(SSocket.api as any).inventario + "modelo/" + this.props.editObject?.key}/> */}
                            <InputFoto
                                ref={ref => this._ref.image_modelo = ref}
                                src={(SSocket.api as any).inventario + "modelo/.128_" + this.props.editObject?.key}
                                style={{
                                    width: 50,
                                    height: 50,
                                }} />
                        </SView>,
                        label: "Nombre", placeholder: "Ingresa el nombre",
                        isRequired: true, autoFocus: true,
                        defaultValue: this.props.editObject?.descripcion,
                        onSubmitEditing: () => {
                            if (this.form) this.form.focus("barcode");
                        }
                    },
                    "codigo_ref": {
                        col: "xs-5.5",
                        style: {
                            // maxWidth: 200,
                        },
                        icon: <SView />,
                        defaultValue: (!this.props.editObject?.codigo_ref ? "" : this.props.editObject?.codigo_ref),
                        label: "Codigo de Referencia", placeholder: "[ 000 ]",
                        onSubmitEditing: () => {
                            // if (this.form) this.form.submit();
                            if (this.form) this.form.focus("precio_compra");
                        }
                    },

                    "barcode": {
                        col: "xs-5.5",
                        style: {
                            // maxWidth: 200,
                        },
                        iconR: <BarcodeIcon onChange={e => {
                            SNotification.send({
                                title: "Código de barra leído",
                                body: e,
                                time: 3000,
                                color: STheme.color.warning,
                            })
                            if (this.form) {
                                this.form.setValues({
                                    "barcode": e
                                });
                            }
                        }} />,
                        icon: <SView />,
                        defaultValue: (!this.props.editObject?.barcode ? "" : this.props.editObject?.barcode),
                        label: "Codigo de barra", placeholder: "0000000000",
                        onSubmitEditing: () => {
                            // if (this.form) this.form.submit();
                            if (this.form) this.form.focus("precio_compra");
                        }
                    },

                    "duracion": {
                        col: "xs-5.5",
                        style: {
                            // maxWidth: 200,
                        },
                        type: "number",
                        icon: <SView />,
                        defaultValue: (!this.props.editObject?.duracion ? "" : this.props.editObject?.duracion),
                        label: "Duracion", placeholder: "Duracion del producto o servicio",
                        onSubmitEditing: () => {
                            // if (this.form) this.form.submit();
                            if (this.form) this.form.focus("precio_compra");
                        }
                    },
                    "duracion_medida": {
                        col: "xs-5.5",
                        style: {
                            // maxWidth: 200,
                        },
                        type: "select2",
                        defaultValue: (!this.props.editObject?.duracion_medida ? "" : this.props.editObject?.duracion_medida),
                        label: "Duracion",
                        options: ["horas", "dias", "semanas", "meses", "anos"],
                        placeholder: "Duracion del producto o servicio",
                        onSubmitEditing: () => {
                            // if (this.form) this.form.submit();
                            if (this.form) this.form.focus("cantidad_suscriptores");
                        }
                    },
                    "cantidad_suscriptores": {
                        col: "xs-5.5",
                        style: {
                            // maxWidth: 200,
                        },
                        // type: "select2",
                        defaultValue: (!this.props.editObject?.cantidad_suscriptores ? "" : this.props.editObject?.cantidad_suscriptores),
                        label: "Cantidad de suscriptores",
                        // options: ["horas", "dias", "semanas", "meses", "anos"],
                        placeholder: "Cantidad de suscriptores",
                        onSubmitEditing: () => {
                            // if (this.form) this.form.submit();
                            if (this.form) this.form.focus("observacion");
                        }
                    },
                    "observacion": {
                        col: "xs-12",
                        defaultValue: this.props.editObject?.observacion,
                        label: "Detalles", placeholder: "Detalles adicionales",
                        type: "textArea",
                        onSubmitEditing: () => {
                            // if (this.form) this.form.submit();
                            if (this.form) this.form.focus("precio_compra");
                        },
                        iconR: <TextAreaPopupOpenIcon
                            type={"MD"}
                            title='Detalles adicionales'
                            getDefaultValue={() => {
                                return this.form?.getValues()?.observacion;
                            }}
                            onChangeText={(text: string) => {
                                if (this.form) {
                                    this.form.setValues({ "observacion": text });
                                }
                            }} />
                    },
                    "precio_compra": {
                        col: "xs-5.5 sm-4",
                        defaultValue: (!this.props.editObject?.precio_compra ? "" : parseFloat(this.props.editObject?.precio_compra ?? 0).toFixed(2)),
                        icon: <SIconApp name='Egreso' width={20} />,
                        label: "Precio compra", placeholder: "0,00", type: "money",
                        onSubmitEditing: () => {
                            if (this.form) this.form.focus("precio_venta");
                        }
                    },
                    "precio_venta": {
                        col: "xs-5.5 sm-4",
                        icon: <SIconApp name='Ingreso' width={20} />,
                        defaultValue: (!this.props.editObject?.precio_venta ? "" : parseFloat(this.props.editObject?.precio_venta ?? 0).toFixed(2)),
                        label: "Precio venta", placeholder: "0,00", type: "money",
                        onSubmitEditing: () => {
                            // if (this.form) this.form.focus("observacion");
                            // if (this.form) this.form.submit();
                        }
                    },

                }}
                onSubmit={(data: any) => {
                    if (!this.state.key_marca) {
                        SNotification.send({
                            title: "Error",
                            body: "Debe seleccionar una marca válida.",
                            time: 3000,
                            color: STheme.color.danger,
                        });
                        return;
                    }
                    if (!this.state.key_tipo_producto) {
                        SNotification.send({
                            title: "Error",
                            body: "Debe seleccionar un tipo de producto válido.",
                            time: 3000,
                            color: STheme.color.danger,
                        });
                        return;
                    }

                    console.log(data)
                    const modelo: any = {
                        key_marca: this.state.key_marca,
                        key_tipo_producto: this.state.key_tipo_producto,
                        descripcion: data.descripcion,
                        observacion: data.observacion,
                        barcode: data.barcode,
                        precio_compra: parseFloat(data.precio_compra ?? 0),
                        precio_venta: parseFloat(data.precio_venta ?? 0),
                        duracion: parseInt(data.duracion ?? "0"),
                        duracion_medida: data.duracion_medida,
                        cantidad_suscriptores: data.cantidad_suscriptores,
                        codigo_ref: data.codigo_ref,
                    }
                    if (this.props.editObject) {
                        modelo.key = this.props.editObject.key;
                    }
                    SNotification.send({
                        key: "guardando_modelo",
                        title: "Guardando modelo...",
                        body: "Por favor, espere.",
                        type: "loading",
                        color: STheme.color.primary,
                    })
                    MDL.inventario.saveModelo(modelo).then(async (resp: any) => {
                        if (this._ref.image_modelo) {
                            const value = this._ref.image_modelo.getValue();
                            if (Array.isArray(value)) {
                                await Upload.sendPromise({ file: value[0], compress: false }, (SSocket.api as any).inventario + "upload/modelo/" + resp.key)
                            }
                        }

                        if (this._ref.image_marca) {
                            const value = this._ref.image_marca.getValue();
                            if (Array.isArray(value)) {
                                await Upload.sendPromise({ file: value[0], compress: false }, (SSocket.api as any).inventario + "upload/marca/" + resp.key_marca)
                            }
                        }
                        if (this._ref.image_tipo_producto) {
                            const value = this._ref.image_tipo_producto.getValue();
                            if (Array.isArray(value)) {
                                await Upload.sendPromise({ file: value[0], compress: false }, (SSocket.api as any).inventario + "upload/tipo_producto/" + resp.key_tipo_producto)
                            }
                        }


                        console.log("Modelo guardado:", resp);
                        if (this.props.onSuccess) {
                            this.props.onSuccess(resp);
                        }
                        SNotification.remove("guardando_modelo");
                    }).catch((e: any) => {
                        console.error("Error al guardar el modelo:", e);
                        SNotification.send({
                            key: "guardando_modelo",
                            title: "Error",
                            body: "No se pudo guardar el modelo.",
                            time: 3000,
                            color: STheme.color.danger,
                        });
                    })


                }}

            />
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
