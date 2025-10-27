import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SForm, SHr, SPopup, SText, STheme, SView } from 'servisofts-component';
import Btn from './Btn';
import MDL from "../../../MDL"
type Props = {
    editObject?: any,
    onCancel?: Function,
    onSuccess?: Function,
}
export default class FormDiario extends Component<Props> {
    static open(props: Props) {
        SPopup.open({
            key: "FormDiario",
            content: <SView style={{
                maxWidth: 500,
                maxHeight: "100%",
                width: "100%",
                // height: 500,
                borderRadius: 8,
                borderColor: STheme.color.card,
                borderWidth: 1,
                backgroundColor: STheme.color.background
            }} withoutFeedback >
                <FormDiario {...props} onCancel={() => {
                    SPopup.close("FormDiario")
                    if (props.onCancel) props.onCancel()
                }}
                    onSuccess={(e: any) => {
                        SPopup.close("FormDiario")
                        if (props.onSuccess) props.onSuccess(e)
                    }}
                />
            </SView>
        })
    }
    form: SForm | undefined = undefined;
    render() {
        return <SView col={"xs-12"} center padding={16}>
            <SText fontSize={16}>{this.props.editObject ? "Editar" : "Crear"}{" Diario"}</SText>
            <SForm ref={(ref: any) => this.form = ref} row
                style={{
                    justifyContent: "space-between",
                }}
                inputs={{
                    "tipo": {
                        col: "xs-4",
                        // icon: <SView />,
                        type: "select2",
                        defaultValue: this.props.editObject?.tipo || "",
                        options: ["Ventas", "Compras", "Efectivo", "Banco", "Varios"],
                        label: "Tipo", placeholder: "Ingresa el tipo",
                        onSubmitEditing: () => {
                            if (this.form) this.form.focus("descripcion");
                        }
                    },
                    "codigo": {
                        col: "xs-4",
                        label: "Codigo corto", placeholder: "[CODIGO]", isRequired: true,
                        defaultValue: this.props.editObject?.codigo,
                        onSubmitEditing: () => {
                            if (this.form) this.form.focus("tipo_cambio");
                        }
                    },
                    "descripcion": {
                        col: "xs-7.5",
                        label: "Nombre del diario", placeholder: "Ingresa el nombre del diario", isRequired: true, autoFocus: true,
                        defaultValue: this.props.editObject?.descripcion,
                        onSubmitEditing: () => {
                            // if (this.form) this.form.focus("observacion");
                            if (this.form) this.form.submit();
                        }
                    },


                }}
                onSubmit={(data: any) => {
                    if (this.props.editObject) {
                        MDL.contabilidad.diario.editar({
                            ...this.props.editObject,
                            ...data,
                        }).then(e => {
                            if (this.props.onSuccess) this.props.onSuccess(e)
                            console.log("response", e);
                        }).catch(e => {
                            if (this.props.onSuccess) this.props.onSuccess(e)
                            console.error("response", e);
                        })
                        // return;
                    } else {
                        MDL.contabilidad.diario.registrar(data).then(e => {
                            if (this.props.onSuccess) this.props.onSuccess(e)
                            console.log("response", e);
                        }).catch(e => {
                            if (this.props.onSuccess) this.props.onSuccess(e)
                            console.error("response", e);
                        })
                        // crear
                    }
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
