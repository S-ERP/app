import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SForm, SHr, SIcon, SInput, SLoad, SNotification, SPopup, SText, STheme, SView, Upload } from 'servisofts-component';
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


const cuentaToText = (c: any) => {
    if (!c) return "";
    return `${c.codigo} - ${c.descripcion}`
}
const findCuentaText = (arr: any[], text: string) => {
    const cuenta = arr.find(c => cuentaToText(c) === text);
    return cuenta ? cuenta : null;
}
export default class FormularioTipoProducto extends Component<Props> {

    static open(props: Props) {
        SPopup.open({
            key: "FormularioTipoProducto",
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
                <FormularioTipoProducto {...props} onCancel={() => {
                    SPopup.close("FormularioTipoProducto")
                    if (props.onCancel) props.onCancel()
                }}
                    onSuccess={(e: any) => {
                        SPopup.close("FormularioTipoProducto")
                        if (props.onSuccess) props.onSuccess(e)
                    }}

                />
            </SView>
        })
    }

    state: any = {
        tipo: MDL.inventario.TIPOS_DE_PRODUCTOS[0].key,
    }
    componentDidMount(): void {

        MDL.contabilidad.getCuentas().then(cuentas => {
            const arrCuentas = Object.values(cuentas)
            arrCuentas.map((cuenta: any) => {
                const hijas = arrCuentas.filter((c: any) => c.codigo.startsWith(cuenta.codigo) && c.codigo != cuenta.codigo);
                cuenta.cantidad_hijas = hijas.length

            })
            this.setState({ cuentas: Object.values(cuentas).sort((a: any, b: any) => (a.codigo > b.codigo) ? 1 : -1) });
        }).catch(e => {
            console.error(e);
        })

    }


    buildCustmomInputs() {

    }


    _ref: any = {}
    form: SForm | undefined = undefined;
    render() {
        if (!this.state.cuentas) return <SLoad />
        const tipo = MDL.inventario.TIPOS_DE_PRODUCTOS.find(a => a.key == this.state.tipo)
        return <SView col={"xs-12"} center padding={16}>
            <SText fontSize={16}>{this.props.editObject ? "Editar" : "Crear"}{" Tipo Producto"}</SText>
            <SForm ref={(ref: any) => this.form = ref} row
                style={{
                    justifyContent: "space-between",
                }}
                inputs={{

                    "descripcion": {
                        col: "xs-12",
                        style: { paddingStart: 0, },
                        labelStyle: { top: -10, },
                        inputStyle: { paddingStart: 8 },
                        icon: <SView style={{ borderRadius: 4, overflow: "hidden", width: 50, height: 50, backgroundColor: STheme.color.background, borderWidth: 1, borderColor: STheme.color.text + '66' }}>
                            {/* <SInput ref={ref => this._ref.image_modelo = ref} type='image' height={50} defaultValue={(SSocket.api as any).inventario + "modelo/" + this.props.editObject?.key}/> */}
                            <InputFoto
                                ref={ref => this._ref.image_perfil = ref}
                                src={(SSocket.api as any).inventario + "tipo_producto/.128_" + this.props.editObject?.key}
                                style={{
                                    width: 50,
                                    height: 50,
                                }} />
                        </SView>,
                        label: "Nombre", placeholder: "Ingresa el nombre",
                        isRequired: true, autoFocus: true,
                        defaultValue: this.props.editObject?.descripcion,
                        onSubmitEditing: () => {
                            // if (this.form) this.form.focus("barcode");
                        }
                    },
                    "tipo": {
                        col: "xs-5.8",
                        type: "select2",
                        label: "Tipo",
                        style: { paddingStart: 0, },
                        labelStyle: { top: -10, },
                        inputStyle: { paddingStart: 8 },
                        defaultValue: this.props.editObject?.tipo ?? "inventario",
                        options: MDL.inventario.TIPOS_DE_PRODUCTOS.map(a => a.key),
                        onChangeText: (text: string) => {
                            this.state.tipo = text;
                            this.forceUpdate();
                            // this.props.onChange("tipo", text);
                        }
                    },

                    ...(!tipo?.cuentas.includes("key_cuenta_contable_ganancia") ? {} : {
                        "key_cuenta_contable_ganancia": {
                            col: "xs-12",
                            type: "select2",

                            label: "Cuenta de Ganancia",
                            style: { paddingStart: 0, fontSize: 10 },
                            labelStyle: { top: -10, },
                            selectStyle: {
                                fontSize: 10,
                            },
                            inputStyle: { paddingStart: 8, fontSize: 10 },
                            defaultValue: cuentaToText(this.state.cuentas.find(c => c.key == this.props.editObject?.key_cuenta_contable_ganancia)),
                            options: this.state.cuentas.filter(c => c.cantidad_hijas <= 0 && c.tipo == "INGRESO").map(cuentaToText),

                        }
                    }),
                    ...(!tipo?.cuentas.includes("key_cuenta_contable_costo") ? {} : {
                        "key_cuenta_contable_costo": {
                            col: "xs-12",
                            type: "select2",
                            label: "Cuenta de Costo",
                            style: { paddingStart: 0, fontSize: 10 },
                            labelStyle: { top: -10, },
                            selectStyle: {
                                fontSize: 10,
                            },
                            inputStyle: { paddingStart: 8, fontSize: 10 },
                            defaultValue: cuentaToText(this.state.cuentas.find(c => c.key == this.props.editObject?.key_cuenta_contable_costo)),
                            options: this.state.cuentas.filter(c => c.cantidad_hijas <= 0 && c.tipo == "GASTO").map(cuentaToText)
                        }
                    }),

                    ...(!tipo?.cuentas.includes("key_cuenta_contable") ? {} : {
                        "key_cuenta_contable": {
                            col: "xs-12",
                            type: "select2",
                            label: "Cuenta de inventario",
                            style: { paddingStart: 0, fontSize: 10 },
                            labelStyle: { top: -10, },
                            inputStyle: { paddingStart: 8, fontSize: 10 },
                            selectStyle: {
                                fontSize: 10,
                            },
                            defaultValue: cuentaToText(this.state.cuentas.find(c => c.key == this.props.editObject?.key_cuenta_contable)),
                            options: this.state.cuentas.filter(c => c.cantidad_hijas <= 0 && c.tipo == "ACTIVO").map(cuentaToText),

                        }
                    }),
                    ...(!tipo?.cuentas.includes("key_cuenta_contable_depreciacion_activo") ? {} : {
                        "key_cuenta_contable_depreciacion_activo": {
                            col: "xs-12",
                            type: "select2",
                            label: "Cuenta de Depreciación Activo",
                            style: { paddingStart: 0, fontSize: 10 },
                            labelStyle: { top: -10, },
                            inputStyle: { paddingStart: 8, fontSize: 10 },
                            selectStyle: {
                                fontSize: 10,
                            },
                            defaultValue: cuentaToText(this.state.cuentas.find(c => c.key == this.props.editObject?.key_cuenta_contable_depreciacion_activo)),
                            options: this.state.cuentas.filter(c => c.cantidad_hijas <= 0 && c.tipo == "ACTIVO").map(cuentaToText),
                        }
                    }),
                    ...(!tipo?.cuentas.includes("key_cuenta_contable_depreciacion_gasto") ? {} : {
                        "key_cuenta_contable_depreciacion_gasto": {
                            col: "xs-12",
                            type: "select2",
                            label: "Cuenta de Depreciación Gasto",
                            style: { paddingStart: 0, fontSize: 10 },
                            labelStyle: { top: -10, },
                            inputStyle: { paddingStart: 8, fontSize: 10 },
                            selectStyle: {
                                fontSize: 10,
                            },
                            defaultValue: cuentaToText(this.state.cuentas.find(c => c.key == this.props.editObject?.key_cuenta_contable_depreciacion_gasto)),
                            options: this.state.cuentas.filter(c => c.cantidad_hijas <= 0 && c.tipo == "GASTO").map(cuentaToText),
                        }
                    })

                }}
                onSubmit={(data: any) => {
                    const cuentaGanancia = findCuentaText(this.state.cuentas, data.key_cuenta_contable_ganancia);
                    const cuentaCosto = findCuentaText(this.state.cuentas, data.key_cuenta_contable_costo);
                    const cuentaInventario = findCuentaText(this.state.cuentas, data.key_cuenta_contable);
                    const cuentaDepreciacionActivo = findCuentaText(this.state.cuentas, data.key_cuenta_contable_depreciacion_activo);
                    const cuentaDepreciacionGasto = findCuentaText(this.state.cuentas, data.key_cuenta_contable_depreciacion_gasto);
                    console.log(data, cuentaGanancia, cuentaCosto, cuentaInventario);
                    const final_data = {
                        ...(this.props.editObject ?? {
                            key_empresa: MDL.empresa.select?.key
                        }),
                        descripcion: data.descripcion,
                        tipo: data.tipo,
                        key_cuenta_contable_ganancia: cuentaGanancia?.key,
                        key_cuenta_contable_costo: cuentaCosto?.key,
                        key_cuenta_contable: cuentaInventario?.key,
                        key_cuenta_contable_depreciacion_activo: cuentaDepreciacionActivo?.key,
                        key_cuenta_contable_depreciacion_gasto: cuentaDepreciacionGasto?.key,
                    }
                    MDL.inventario.saveTipoProducto(final_data).then((resp: any) => {
                        if (this._ref.image_perfil) {
                            const value = this._ref.image_perfil.getValue();
                            if (Array.isArray(value)) {
                                Upload.sendPromise({ file: value[0], compress: false }, (SSocket.api as any).inventario + "upload/tipo_producto/" + resp.key)
                            }
                        }

                        if (this.props.onSuccess) this.props.onSuccess(resp);
                    }).catch(e => {

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
