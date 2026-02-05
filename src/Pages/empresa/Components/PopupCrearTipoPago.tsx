import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import { SForm, SHr, SLoad, SNotification, SPopup, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import MDL from '../../../MDL';
import InputFoto from '../../../Components/InputFoto';
import SelectorPasarelaEmpresa from '../../../Components/Selectores/SelectorPasarelaEmpresa';
import InputSelector from '../../../Components/Selectores/InputSelector';
type Props = {
    key_empresa: string,
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
export default class PopupCrearTipoPago extends Component<Props> {
    static open(props: Props) {
        SPopup.open({
            key: "PopupCrearTipoPago",
            content: <SView style={{
                maxHeight: "100%",
                width: "100%",
                maxWidth: 500,
                borderRadius: 8,
                borderColor: STheme.color.card,
                borderWidth: 1,
                backgroundColor: STheme.color.background
            }} withoutFeedback >
                <PopupCrearTipoPago {...props} onCancel={() => {
                    SPopup.close("PopupCrearTipoPago")
                    if (props.onCancel) props.onCancel()
                }}
                    onSuccess={(e: any) => {
                        SPopup.close("PopupCrearTipoPago")
                        if (props.onSuccess) props.onSuccess(e)
                    }}
                />
            </SView>
        })
    }
    form: SForm | undefined = undefined;
    _ref: any = {}
    state: any = {
        tipo_pago: [], // inicializamos vacio,
        cuentas: [],
        monedas: []
    }
    componentDidMount(): void {
        MDL.caja.tipo_pago_getAll().then(item => {
            this.state.tipo_pago = Object.values(item);
            this.forceUpdate();
            if (this.form) {
                const tipo = this.state.tipo_pago.find(
                    a => a.key == this.props.editObject?.key_tipo_pago
                )
                this.form.setValues({
                    key_tipo_pago: tipo?.descripcion,
                })
            }
        }).catch(e => console.error(e));
        MDL.empresa.getFull().then(empresa => {
            this.setState({ monedas: empresa.monedas }, () => {
                if (this.form && this.props.editObject?.key_moneda) {
                    const moneda = this.state.monedas.find(c => c.key == this.props.editObject.key_moneda);
                    if (moneda) {
                        this.form.setValues({
                            key_moneda: moneda.key // <- aquí pasamos el value
                        });
                    }
                }
            });
        });
        MDL.contabilidad.getCuentas().then(cuentas => {
            const arrCuentas = Object.values(cuentas)
            arrCuentas.map((cuenta: any) => {
                const hijas = arrCuentas.filter((c: any) => c.codigo.startsWith(cuenta.codigo) && c.codigo != cuenta.codigo);
                cuenta.cantidad_hijas = hijas.length
            })
            this.state.cuentas = Object.values(cuentas).sort((a: any, b: any) => (a.codigo > b.codigo) ? 1 : -1);
            this.forceUpdate();
            if (this.form) {
                const cuenta = this.state.cuentas.find(c => c.key == this.props.editObject?.key_cuenta_contable)
                console.log()
                this.form.setValues({
                    key_cuenta_contable: cuentaToText(cuenta),
                })
            }
        }).catch(e => {
            console.error(e);
        })
    }
    render() {
        if (!this.state.cuentas) return <SLoad />
        if (!this.state.monedas) return <SLoad />
        console.log(this.state.monedas)
        return <SView col={"xs-12"} center padding={16}>
            <SText fontSize={16}>{this.props?.editObject ? "Editar" : "Crear"}{" Tipo De Pago"}</SText>
            <ScrollView>
                <SForm
                    ref={(ref: any) => this.form = ref}
                    row
                    style={{
                        justifyContent: "space-between",
                    }}
                    inputs={{
                        "key_tipo_pago": {
                            label: "Tipo",
                            placeholder: "Seleccione el tipo",
                            type: "select2",
                            col: "xs-12",
                            style: { paddingStart: 0, fontSize: 10 },
                            labelStyle: { top: -10, },
                            inputStyle: { paddingStart: 8, fontSize: 10 },
                            selectStyle: {
                                fontSize: 10,
                            },
                            options: this.state.tipo_pago.map(a => a.descripcion),// siempre array
                            defaultValue: this.state.tipo_pago.find(a => a.key == this.props.editObject?.key_tipo_pago)?.descripcion,
                            isRequired: true,
                            onChangeText: (e) => {
                                const tp = this.state.tipo_pago.find(a => a.descripcion == e);
                                if (this.state.tp != tp) {
                                    this.setState({
                                        tp: tp
                                    })
                                }
                            }
                        },
                        "descripcion": {
                            col: "xs-12",
                            style: { paddingStart: 0, fontSize: 10 },
                            labelStyle: { top: -10, },
                            inputStyle: { paddingStart: 8, fontSize: 10 },
                            selectStyle: {
                                fontSize: 10,
                            },
                            label: "Nombre del tipo de pago", placeholder: "Ingresa el nombre del tipo de pago",
                            isRequired: true,
                            defaultValue: this.props.editObject?.descripcion,
                            onSubmitEditing: () => {
                                if (this.form) this.form.submit();
                            },
                            icon: <SView style={{ borderRadius: 4, overflow: "hidden", width: 50, height: 50, backgroundColor: STheme.color.background, borderWidth: 1, borderColor: STheme.color.text + '66' }}>
                                <InputFoto
                                    ref={ref => this._ref.image_sucursal = ref}
                                    src={(SSocket.api as any).empresa + "tipo_pago/" + this.props.editObject?.key}
                                    style={{ width: 50, height: 50, }} />
                            </SView>,
                        },
                        "key_cuenta_contable": {
                            col: "xs-12",
                            type: "select2",
                            label: "Cuenta contable",
                            style: { paddingStart: 0, fontSize: 10 },
                            labelStyle: { top: -10, },
                            inputStyle: { paddingStart: 8, fontSize: 10 },
                            selectStyle: {
                                fontSize: 10,
                            },
                            defaultValue: cuentaToText(this.state.cuentas.find(c => c.key == this.props.editObject?.key_cuenta_contable)),
                            options: this.state.cuentas.filter(c => c.cantidad_hijas <= 0).map(cuentaToText),
                            onChangeText: (e) => {
                                const cuenta = findCuentaText(this.state.cuentas, e);
                                let mt = "";
                                if (cuenta) {
                                    if (cuenta.key_moneda) {
                                        this.form?.setValues({
                                            key_moneda: cuenta?.key_moneda
                                        })
                                    }
                                }
                            },
                            isRequired: true,
                        },
                        "key_moneda": {
                            label: "Tipos de key_moneda",
                            type: "custom",
                            customInputClass: InputSelector,
                            style: { width: "100%" },
                            defaultValue: this.props.editObject?.key_moneda || "",
                            options: this.state.monedas.map((item: any) => ({
                                label: item.observacion,
                                value: item.key,
                                customComponent: (e: any) => <SText fontSize={12} color={STheme.color.lightGray}>{e.data.descripcion}</SText>,
                                data: item
                            }))
                        },
                        "habilita_venta": {
                            col: "xs-5.5 sm-4",
                            style: { paddingStart: 0, fontSize: 10, top: 8, },
                            labelStyle: { left: 0, top: -10, },
                            type: "checkBox",
                            inputStyle: { paddingStart: 8, fontSize: 10 },
                            selectStyle: { fontSize: 10, },
                            label: "Habilitar en Ventas?",
                            defaultValue: this.props.editObject?.habilita_venta,
                        },
                        "habilita_compra": {
                            col: "xs-5.5 sm-4",
                            style: { paddingStart: 0, fontSize: 10, top: 8, },
                            labelStyle: { left: 0, top: -10, },
                            type: "checkBox",
                            inputStyle: { paddingStart: 8, fontSize: 10 },
                            selectStyle: { fontSize: 10, },
                            label: "Habilitar en Compras?",
                            defaultValue: this.props.editObject?.habilita_compra,
                        },
                    }}
                    onSubmit={(data: any) => {
                        data.key = this.props.editObject?.key;
                        const cuenta = findCuentaText(this.state.cuentas, data.key_cuenta_contable);
                        data.key_cuenta_contable = cuenta?.key;
                        data.key_tipo_pago = this.state.tipo_pago.find(a => a.descripcion == data.key_tipo_pago)?.key;
                        data.key_pasarela_empresa = this.state.pasarela_empresa?.key;
                        SNotification.send({
                            key: "tipo_pago",
                            title: "Tipo de pago",
                            type: "loading",
                        });
                        MDL.caja.empresa_tipo_pago_save(data).then((resp: any) => {
                            if (this.props.onSuccess) this.props.onSuccess(resp)
                            this.forceUpdate();
                            SNotification.send({
                                key: "tipo_pago",
                                title: "Tipo de pago guardado",
                                body: "Tipo de pago se ha guardado correctamente.",
                                time: 3000,
                                color: STheme.color.success,
                            });
                        }).catch((e: any) => {
                            if (this.props.onSuccess) this.props.onSuccess(e)
                            console.error("Error al guardar el Tipo de pago:", e);
                            SNotification.send({
                                key: "tipo_pago",
                                title: "Error",
                                body: "No se pudo guardar El tipo de pago.",
                                time: 3000,
                                color: STheme.color.danger,
                            });
                        })
                    }}
                />
                {this.state?.tp?.key == "banco" ? <SelectorPasarelaEmpresa
                    label={"Pasarela de pagos"}
                    placeholder={"Seleccione una pasarela de pagos"}
                    defaultValueTypeKey={this.props.editObject?.key_pasarela_empresa}
                    onChangeSelect={e => {
                        this.setState({ pasarela_empresa: e })
                    }}
                /> : <SHr h={40} />}
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
class Btn extends React.Component<any> {
    render() {
        const styles: any = {
        }
        if (this.props.type == "danger") {
            styles.backgroundColor = STheme.color.danger;
        }
        if (this.props.type == "primary") {
            styles.backgroundColor = STheme.color.primary;
            styles.borderColor = STheme.color.text;
            styles.borderWidth = 1;
        }
        return <SView flex card height={30} center onPress={this.props.onPress} style={styles}>
            <SText>{this.props.label}</SText>
        </SView>
    }
}