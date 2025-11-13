import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SForm, SHr, SIcon, SInput, SLoad, SNotification, SPopup, SText, STheme, SView, Upload } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import MDL from '../../../MDL';
import Btn from '../../empresa/config/Components/Btn';
// import SIconApp from '../../../Assets/SIconApp';
// import BarcodeScanner from '../../../Components/BarcodeScanner';
// import InputFoto from '../../../Components/InputFoto';
// import BarcodeIcon from '../../../Components/BarcodeScanner/BarcodeIcon';
// import TextAreaPopupOpenIcon from '../../../Components/QueryTool/TextAreaPopupOpenIcon';
import SelectorPasarela from '../../../Components/Selectores/SelectorPasarela';

type Props = {
    editObject?: any,
    onCancel?: Function,
    onSuccess?: Function,
}


// const cuentaToText = (c: any) => {
//     if (!c) return "";
//     return `${c.codigo} - ${c.descripcion}`
// }
// const findCuentaText = (arr: any[], text: string) => {
//     const cuenta = arr.find(c => cuentaToText(c) === text);
//     return cuenta ? cuenta : null;
// }
export default class FormularioPasarela extends Component<Props> {

    static open(props: Props) {
        SPopup.open({
            key: "FormularioPasarela",
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
                <FormularioPasarela {...props} onCancel={() => {
                    SPopup.close("FormularioPasarela")
                    if (props.onCancel) props.onCancel()
                }}
                    onSuccess={(e: any) => {
                        SPopup.close("FormularioPasarela")
                        if (props.onSuccess) props.onSuccess(e)
                    }}

                />
            </SView>
        })
    }

    state: any = {
        tipo: MDL.inventario.TIPOS_DE_PRODUCTOS[0].key,
        pasarela: null
    }
    componentDidMount(): void {

        // MDL.contabilidad.getCuentas().then(cuentas => {
        //     const arrCuentas = Object.values(cuentas)
        //     arrCuentas.map((cuenta: any) => {
        //         const hijas = arrCuentas.filter((c: any) => c.codigo.startsWith(cuenta.codigo) && c.codigo != cuenta.codigo);
        //         cuenta.cantidad_hijas = hijas.length

        //     })
        //     this.setState({ cuentas: Object.values(cuentas).sort((a: any, b: any) => (a.codigo > b.codigo) ? 1 : -1) });
        // }).catch(e => {
        //     console.error(e);
        // })

    }


    buildCustmomInputs() {
        const inputs: SForm["props"]["inputs"] = {}
        const pasarela = this.state.pasarela;
        const params = this.props?.editObject?.params ?? {};
        if (pasarela) {
            if (pasarela.params) {
                Object.keys(pasarela.params).map((p) => {
                    inputs[p] = {
                        label: p,
                        defaultValue: params[p]
                    }
                })
            }

        }
        return inputs;
    }


    _ref: any = {}
    form: SForm | undefined = undefined;
    render() {
        // const tipo = MDL.inventario.TIPOS_DE_PRODUCTOS.find(a => a.key == this.state.tipo)
        return <SView col={"xs-12"} center padding={16}>
            <SText fontSize={16}>{this.props.editObject ? "Editar" : "Integrar"}{" Pasarela"}</SText>
            <SView col={"xs-12"}>
                <SelectorPasarela
                    col={"xs-10"}
                    label={"Pasarela"}
                    placeholder={"Seleccione una pasarela de pagos"}
                    defaultValueTypeKey={this.props.editObject?.key_pasarela}
                    onChangeSelect={pasarela => {
                        this.setState({ pasarela: pasarela })
                    }}
                />
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
                            label: "Nombre", placeholder: "Ingresa el nombre",
                            isRequired: true, autoFocus: true,
                            defaultValue: this.props.editObject?.descripcion,
                            onSubmitEditing: () => {
                                // if (this.form) this.form.focus("barcode");
                            }
                        },
                        ...this.buildCustmomInputs(),

                    }}
                    onSubmit={(data: any) => {

                        const obj: any = {
                            key_pasarela: this.state?.pasarela?.key,
                            descripcion: data?.descripcion,
                            key_empresa: MDL.empresa.select?.key,
                        }
                        delete data.descripcion;
                        obj.params = data;
                        console.log(obj);

                        if (this.props.editObject?.key) {
                            MDL.caja.pasarela_empresa.editar({
                                ...this.props.editObject,
                                ...obj
                            }).then(e => {
                                if (this.props.onSuccess) this.props.onSuccess(e);
                            })
                        } else {
                            MDL.caja.pasarela_empresa.registro(obj).then(e => {
                                if (this.props.onSuccess) this.props.onSuccess(e);
                            })
                        }


                    }}

                />
            </SView>
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
