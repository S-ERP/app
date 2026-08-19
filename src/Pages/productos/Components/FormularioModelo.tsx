import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import { SForm, SHr, SLoad, SNotification, SPopup, SText, STheme, SView, Upload, SMath } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import MDL from '../../../MDL';
import Btn from '../../empresa/config/Components/Btn';
import SIconApp from '../../../Assets/SIconApp';
import InputFoto from '../../../Components/InputFoto';
import BarcodeIcon from '../../../Components/BarcodeScanner/BarcodeIcon';
import TextAreaPopupOpenIcon from '../../../Components/QueryTool/TextAreaPopupOpenIcon';
import InputSelector from '../../../Components/Selectores/InputSelector';
import CuentasAnidadas from '../../conta/cuentas_anidadas';
import SForm2 from '../../../Components/SForm2';
import ToolTips from '../../../Components/ToolTips';

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
                borderRadius: 8,
                borderColor: STheme.color.card,
                borderWidth: 1,
                backgroundColor: STheme.color.background,
                overflow: "hidden",
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
        tipoSeleccionado: this.props.editObject?.tipo_producto?.tipo || "",
        key_cuenta_contable_inventario: this.props.editObject?.key_cuenta_contable_inventario || null,
        ingredientesModelo: null as any[] | null,
    }
    componentDidMount(): void {
        // Cargar monedas
        MDL.empresa.getFull().then((resp: any) => {
            this.setState({ monedas: resp.monedas || [] });
        }).catch(console.error);
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
                this.form.setValues({ "tipo": tipo_producto?.descripcion });
            }
            this.setState({
                tipo_productos: resp
            })
        }).catch((e: any) => {
            console.error("Error al cargar marcas", e);
        })
        if (this.props.editObject?.key) {
            MDL.inventario.getReceta_ByModelo().then((resp: any) => {
                const propio = (resp ?? []).find((a: any) => a?.key_modelo === this.props.editObject?.key);
                this.setState({ ingredientesModelo: propio?.ingredientes ?? [] });
            }).catch((e: any) => {
                console.error("Error al cargar ingredientes", e);
                this.setState({ ingredientesModelo: [] });
            })
        }
    }
    buildCustmomInputs() {
    }
    _ref: any = {}
    form: SForm | undefined = undefined;
    render() {
        if (!this.state.monedas) return <SLoad />
        return <SView col={"xs-12"} height>
            <SView center style={{ paddingHorizontal: 16, paddingTop: 16 }}>
                <SText fontSize={16}>{this.props.editObject ? "Editar" : "Crear"}{" Modelo"}</SText>
                <SText fontSize={16} style={{ userSelect: "text" }}>{this.props.editObject?.key}</SText>
            </SView>
            <ScrollView style={{ flex: 1, width: "100%" }} contentContainerStyle={{ alignItems: "center", padding: 16 }}>
                <SForm2 ref={(ref: any) => this.form = ref} row
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
                                if (!this.state.key_marca) {
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
                                const tipoObj = this.state.tipo_productos.find((item: any) => item.descripcion == text);
                                const tipo = tipoObj?.tipo;

                                this.setState({
                                    key_tipo_producto,
                                    descripcion_tipo_producto: text,
                                    tipoSeleccionado: tipo,
                                });
                                this.state.key_tipo_producto = key_tipo_producto;
                                this.state.descripcion_tipo_producto = text;

                                if (key_tipo_producto) {
                                    this._ref.image_tipo_producto.setValue((SSocket.api as any).inventario + "tipo_producto/.128_" + key_tipo_producto);
                                    this._ref.image_tipo_producto.forceUpdate();
                                } else {
                                    if (this._ref.image_tipo_producto.getValue() != "") {
                                        this._ref.image_tipo_producto.setValue("");
                                        this._ref.image_tipo_producto.forceUpdate();
                                    }
                                }
                            },
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
                                if (!this.state.key_tipo_producto) {
                                    this.forceUpdate();
                                }
                            }
                        },
                        "descripcion": {
                            col: "xs-12",
                            style: { paddingStart: 0, },
                            labelStyle: { top: -10, },
                            inputStyle: { paddingStart: 8 },
                            icon: <SView style={{ borderRadius: 4, overflow: "hidden", width: 50, height: 50, backgroundColor: STheme.color.background, borderWidth: 1, borderColor: STheme.color.text + '66' }}>
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
                        "activo": {
                            col: "xs-12",
                            defaultValue: this.props.editObject ? !!this.props.editObject?.activo : true,
                            label: <SView row center>
                                <SText fontSize={16}>Activar en Ventas</SText>
                                <SView width={8} />
                                <ToolTips type="info" small descripcion='Al desactivar esta opción, este modelo dejará de estar disponible en el punto de venta para los cajeros.' />
                            </SView>,
                            type: "checkBox",
                        },

                        "codigo_ref": {
                            col: "xs-5.5",
                            icon: <SView />,
                            defaultValue: (!this.props.editObject?.codigo_ref ? "" : this.props.editObject?.codigo_ref),
                            label: "Codigo de Referencia", placeholder: "[ 000 ]",
                            onSubmitEditing: () => {
                                if (this.form) this.form.focus("precio_compra");
                            }
                        },
                        "barcode": {
                            col: "xs-5.5",
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
                                if (this.form) this.form.focus("precio_compra");
                            }
                        },

                        ...(this.state.tipoSeleccionado === 'servicio' && {
                            "duracion": {
                                col: "xs-1.5",
                                type: "number",
                                icon: <SView />,
                                defaultValue: (!this.props.editObject?.duracion ? "" : this.props.editObject?.duracion),
                                label: "Duracion", placeholder: "Duracion del producto o servicio",
                                onSubmitEditing: () => {
                                    if (this.form) this.form.focus("precio_compra");
                                }
                            },
                            "duracion_medida": {
                                col: "xs-3.5",
                                type: "select2",
                                style: { right: 8, },
                                defaultValue: (!this.props.editObject?.duracion_medida ? "" : this.props.editObject?.duracion_medida),
                                label: "Duracion medida",
                                options: ["horas", "dias", "semanas", "meses", "anos"],
                                placeholder: "Duracion del producto o servicio",
                                onSubmitEditing: () => {
                                    if (this.form) this.form.focus("cantidad_suscriptores");
                                }
                            },
                            "cantidad_suscriptores": {
                                col: "xs-5.5",
                                defaultValue: (!this.props.editObject?.cantidad_suscriptores ? "" : this.props.editObject?.cantidad_suscriptores),
                                label: "Cantidad de suscriptores",
                                placeholder: "Cantidad de suscriptores",
                                onSubmitEditing: () => {
                                    if (this.form) this.form.focus("observacion");
                                }
                            },
                        }),

                        "observacion": {
                            col: "xs-12",
                            defaultValue: this.props.editObject?.observacion,
                            label: "Detalles", placeholder: "Detalles adicionales",
                            type: "textArea",
                            onSubmitEditing: () => {
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
                            col: "xs-5.5 sm-3",
                            defaultValue: (!this.props.editObject?.precio_compra ? "" : SMath.formatMoney(parseFloat(this.props.editObject?.precio_compra ?? 0), 6)),
                            icon: <SIconApp name='Egreso' width={20} />,
                            label: "Precio compra est", placeholder: "0,00", type: "text", 
                            onSubmitEditing: () => {
                                if (this.form) this.form.focus("precio_venta");
                            }
                        },
                        "precio_compra_moneda": {
                            col: "xs-12 sm-2.5",
                            type: "custom",
                            style: { right: 4, },
                            defaultValue: (!this.props.editObject?.precio_compra_moneda ? "" : this.props.editObject?.precio_compra_moneda),
                            customInputClass: InputSelector,
                            label: "Moneda compra",
                            options: this.state.monedas?.map((m: any) => {
                                return { label: m.observacion, value: m.key }
                            }) || [],
                            placeholder: "Selecciona moneda",
                            onSubmitEditing: () => {
                                if (this.form) this.form.focus("cantidad_suscriptores");
                            }
                        },
                        "precio_venta": {
                            col: "xs-5.5 sm-3",
                            style: { left: 4, },
                            icon: <SIconApp name='Ingreso' width={20} />,
                            defaultValue: (!this.props.editObject?.precio_venta ? "" : parseFloat(this.props.editObject?.precio_venta ?? 0).toFixed(5).replace('.', ',')),
                            label: "Precio venta", placeholder: "0,00000", type: "text",
                        },
                        "precio_venta_moneda": {
                            col: "xs-12 sm-2.5",
                            type: "custom",
                            defaultValue: (!this.props.editObject?.precio_venta_moneda ? "" : this.props.editObject?.precio_venta_moneda),
                            customInputClass: InputSelector,
                            label: "Moneda venta",
                            options: this.state.monedas?.map((m: any) => {
                                return { label: m.observacion, value: m.key }
                            }) || [],
                            placeholder: "Selecciona moneda",
                            onSubmitEditing: () => {
                                if (this.form) this.form.focus("cantidad_suscriptores");
                            }
                        },
                        "key_cuenta_contable_inventario": {
                            label: "Cuenta contable de inventario",
                            value: this.state?.key_cuenta_contable_inventario,
                            onPress: () => {
                                CuentasAnidadas.open({
                                    select: (cuentaSelec: any) => {
                                        CuentasAnidadas.close();
                                        this.setState({ key_cuenta_contable_inventario: cuentaSelec.key });
                                    }
                                })
                            }
                        }
                    }
                    }
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
                        const modelo: any = {
                            key_marca: this.state.key_marca,
                            precio_venta_moneda: data?.precio_venta_moneda,
                            precio_compra_moneda: data?.precio_compra_moneda,
                            key_tipo_producto: this.state.key_tipo_producto,
                            descripcion: data.descripcion,
                            activo: data.activo ? 1 : 0,
                            observacion: data.observacion,
                            barcode: data.barcode,
                            precio_compra: parseFloat((data.precio_compra ?? 0).toString().replace(',', '.')),
                            precio_venta: parseFloat((data.precio_venta ?? 0).toString().replace(',', '.')),
                            key_cuenta_contable_inventario: this.state.key_cuenta_contable_inventario,
                            // aqui estoy dejando pasar duracion medida y suscriptores vacio
                            duracion: parseInt(data.duracion ?? "0"),
                            duracion_medida: data.duracion_medida ?? "",
                            cantidad_suscriptores: parseInt(data.cantidad_suscriptores ?? "0"),

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
                {!!this.props.editObject?.key && (
                    <SView style={{ width: "100%", paddingHorizontal: 16, marginTop: 8 }}>
                        <SText fontSize={14} bold>Ingredientes</SText>
                        <SHr h={8} />
                        {!this.state.ingredientesModelo ? (
                            <SLoad />
                        ) : this.state.ingredientesModelo.length === 0 ? (
                            <SText fontSize={12} color={STheme.color.lightGray}>Este modelo no tiene ingredientes.</SText>
                        ) : (
                            <SView style={{ borderWidth: 1, borderColor: STheme.color.card, borderRadius: 4, overflow: "hidden" }}>
                                <SView row style={{ backgroundColor: STheme.color.card, padding: 6 }}>
                                    <SText flex={2} fontSize={11} bold>Producto</SText>
                                    <SText flex={1} fontSize={11} bold style={{ textAlign: "right" }}>Cantidad</SText>
                                </SView>
                                {this.state.ingredientesModelo.map((i: any, idx: number) => (
                                    <SView row key={i.key_ingrediente ?? idx} style={{ padding: 6, borderTopWidth: idx === 0 ? 0 : 1, borderTopColor: STheme.color.card + "66" }}>
                                        <SText flex={2} fontSize={12}>{i.modelo_requerido}</SText>
                                        <SText flex={1} fontSize={12} style={{ textAlign: "right" }}>{i.cantidad}</SText>
                                    </SView>
                                ))}
                            </SView>
                        )}
                    </SView>
                )}
            </ScrollView>
            <SView style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
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
        </SView>
    }
}
