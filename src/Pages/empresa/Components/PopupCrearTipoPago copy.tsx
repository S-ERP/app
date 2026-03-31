import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import { SForm, SHr, SLoad, SNotification, SPopup, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import MDL from '../../../MDL';
import InputFoto from '../../../Components/InputFoto';
import SelectorPasarelaEmpresa from '../../../Components/Selectores/SelectorPasarelaEmpresa';
import InputSelector from '../../../Components/Selectores/InputSelector';
import CuentasAnidadas from "../../../Pages/conta/cuentas_anidadas";

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
        monedas: [],
        tp: null,
        pasarela_empresa: null,
        cuentaSeleccionada: null
    }

    componentDidMount(): void {
        // Traer tipos de pago
        MDL.caja.tipo_pago_getAll().then(item => {
            this.setState({ tipo_pago: Object.values(item) });
        }).catch(e => console.error(e));
        // Traer monedas
        MDL.empresa.getFull().then(empresa => {
            this.setState({ monedas: empresa.monedas }, () => {
                if (this.form && this.props.editObject?.key_moneda) {
                    const moneda = this.state.monedas.find(c => c.key == this.props.editObject.key_moneda);
                    if (moneda) {
                        this.form.setValues({ key_moneda: moneda.key });
                    }
                }
            });
        });
        // Traer cuentas
        MDL.contabilidad.getCuentas().then(cuentas => {
            const arrCuentas = Object.values(cuentas);
            arrCuentas.forEach((cuenta: any) => {
                const hijas = arrCuentas.filter((c: any) => c.codigo.startsWith(cuenta.codigo) && c.codigo != cuenta.codigo);
                cuenta.cantidad_hijas = hijas.length;
            });
            this.setState({ cuentas: arrCuentas.sort((a: any, b: any) => a.codigo > b.codigo ? 1 : -1) }, () => {
                if (this.form && this.props.editObject?.key_cuenta_contable) {
                    const cuenta = this.state.cuentas.find(c => c.key == this.props.editObject?.key_cuenta_contable);
                    if (cuenta) {
                        this.form.setValues({ key_cuenta_contable: cuenta.key });
                    }
                }
            });
        }).catch(e => console.error(e));
    }

    render() {
        if (!this.state.cuentas || !this.state.monedas || !this.state.tipo_pago) return <SLoad />
        return <SView col={"xs-12"} center padding={16}>
            <SText fontSize={16}>{this.props?.editObject ? "Editar" : "Crear"} Tipo De Pago</SText>
            <SText fontSize={16} style={{ userSelect: "text" }}>{this.props.editObject?.key}</SText>

            <ScrollView>
                <SForm
                    ref={(ref: any) => this.form = ref}
                    row
                    style={{ justifyContent: "space-between" }}
                    inputs={{
                        "key_tipo_pago": {
                            label: "Tipo de Pago",
                            type: "custom",
                            customInputClass: InputSelector,
                            style: { width: "100%", textTransform: "capitalize" },
                            defaultValue: this.props.editObject?.key_tipo_pago || "",
                            options: this.state.tipo_pago.map((item: any) => ({
                                label: item.descripcion,
                                value: item.key,
                                // customComponent: (e: any) => <SText fontSize={12} color={STheme.color.lightGray} style={{ textTransform: "uppercase" }}>{e.data.descripcion}</SText>,
                                data: item
                            })),
                            isRequired: true,
                        },
                        "descripcion": {
                            col: "xs-12",
                            style: { paddingStart: 0, fontSize: 10 },
                            labelStyle: { top: -10 },
                            inputStyle: { paddingStart: 8, fontSize: 10 },
                            label: "Nombre del tipo de pago",
                            placeholder: "Ingresa el nombre del tipo de pago",
                            defaultValue: this.props.editObject?.descripcion,
                            isRequired: true,
                            onSubmitEditing: () => { this.form?.submit() },
                            icon: <SView style={{ borderRadius: 4, overflow: "hidden", width: 50, height: 50, backgroundColor: STheme.color.background, borderWidth: 1, borderColor: STheme.color.text + '66' }}>
                                <InputFoto ref={ref => this._ref.image_sucursal = ref} src={(SSocket.api as any).empresa + "tipo_pago/" + this.props.editObject?.key} style={{ width: 50, height: 50 }} />
                            </SView>
                        },
                        "key_cuenta_contable": {
                            label: "Cuenta Contable",
                            //type: "custom",
                            customInputClass: InputSelector,
                            style: { width: "100%" },
                            defaultValue: this.props.editObject?.key_cuenta_contable || "",
                            value:
                                this.state.cuentaSeleccionada
                                    ? `${this.state.cuentaSeleccionada.codigo} - ${this.state.cuentaSeleccionada.descripcion}`
                                    : ""
                            ,
                            // options: this.state.cuentas.filter(c => c.cantidad_hijas <= 0).map((item: any) => ({
                            //     label: cuentaToText(item),
                            //     value: item.key,
                            //     customComponent: (e: any) => {
                            //         let moneda = this.state.monedas.find((m: any) => m.key == e.data.key_moneda);
                            //         if (!moneda) {
                            //             moneda = this.state.monedas.find((m: any) => m.tipo == "base");
                            //         }
                            //         return <SView>
                            //             <SText fontSize={12} color={STheme.color.lightGray}>{e.data.codigo}</SText>
                            //             <SText fontSize={12} color={STheme.color.lightGray}>{moneda?.descripcion}</SText>
                            //         </SView>
                            //     },
                            //     data: item
                            // })),
                            isRequired: true,
                            onPress: () => {
                                SPopup.open({
                                    key: "popup-cuentas",
                                    content: <SView
                                        style={{
                                            width: "100%",
                                            height: 500,
                                            maxWidth: 1000,
                                            borderRadius: 8,
                                            borderWidth: 1,
                                            borderColor: STheme.color.card,
                                            backgroundColor: STheme.color.background,
                                            overflow: "hidden"

                                        }} withoutFeedback>
                                        <CuentasAnidadas
                                            select={(cuentaSelec: any) => {
                                                console.log("SELECCIONADO:", cuentaSelec)
                                                this.setState({
                                                    cuentaSeleccionada: cuentaSelec
                                                });
                                                SPopup.close("popup-cuentas");
                                            }}
                                        />
                                    </SView>
                                });
                            },
                            onChangeText: (value: string) => {
                                const cuenta = this.state.cuentas.find(c => c.key == value);
                                if (cuenta?.key_moneda) {
                                    this.form?.setValues({ key_moneda: cuenta.key_moneda });
                                }
                            }
                        },
                        "key_moneda": {
                            label: "Tipo de Moneda",
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
                            type: "checkBox",
                            label: "Habilitar en Ventas?",
                            defaultValue: this.props.editObject?.habilita_venta,
                        },
                        "habilita_compra": {
                            col: "xs-5.5 sm-5",
                            type: "checkBox",
                            label: "Habilitar en Compras?",
                            defaultValue: this.props.editObject?.habilita_compra,
                        },
                        "key_pasarela_empresa": {
                            col: "xs-5.5 sm-5",
                            // type: "checkBox",
                            label: "Key Pasarela empresa",
                            defaultValue: this.props.editObject?.key_pasarela_empresa,
                        },
                    }}
                    onSubmit={(data: any) => {
                        data.key = this.props.editObject?.key;
                        SNotification.send({ key: "tipo_pago", title: "Tipo de pago", type: "loading" });
                        MDL.caja.empresa_tipo_pago_save(data).then((resp: any) => {
                            if (this.props.onSuccess) this.props.onSuccess(resp);
                            SNotification.send({
                                key: "tipo_pago",
                                title: "Tipo de pago guardado",
                                body: "Tipo de pago se ha guardado correctamente.",
                                time: 3000,
                                color: STheme.color.success,
                            });
                        }).catch((e: any) => {
                            console.error("Error al guardar el Tipo de pago:", e);
                            SNotification.send({
                                key: "tipo_pago",
                                title: "Error",
                                body: "No se pudo guardar El tipo de pago.",
                                time: 3000,
                                color: STheme.color.danger,
                            });
                        });
                    }}
                />
                {this.state.tp?.key == "banco" ? <SelectorPasarelaEmpresa
                    label={"Pasarela de pagos"}
                    placeholder={"Seleccione una pasarela de pagos"}
                    defaultValueTypeKey={this.props.editObject?.key_pasarela_empresa}
                    onChangeSelect={e => { this.setState({ pasarela_empresa: e }) }}
                /> : <SHr h={40} />}
            </ScrollView>
            <SHr h={16} />
            <SView row col={"xs-12"}>
                {this.props.onCancel && <>
                    <Btn type='danger' label='CANCELAR' onPress={() => this.props.onCancel()} />
                    <SView width={8} />
                </>}
                <Btn type='primary' label='GUARDAR' onPress={() => this.form?.submit()} />
            </SView>
        </SView>
    }
}

class Btn extends React.Component<any> {
    render() {
        const styles: any = {}
        if (this.props.type == "danger") styles.backgroundColor = STheme.color.danger;
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
