import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SForm, SHr, SPopup, SText, STheme, SView } from 'servisofts-component';
import PButtom from '../../../../Components/PButtom';
import SSocket from 'servisofts-socket';
import MDL from '../../../../MDL';
import Model from '../../../../Model';
import Btn from './Btn';

type Props = {
    key_sucursal: string,
    editObject?: any,
    onCancel?: Function,
    onSuccess?: Function,
}

export default class PopupCrearPuntoVenta extends Component<Props> {

    static open(props: Props) {
        SPopup.open({
            key: "PopupCrearPuntoVenta",
            content: <SView style={{
                maxWidth: "100%",
                maxHeight: "100%",
                width: 500,
                // height: 500,
                borderRadius: 8,
                borderColor: STheme.color.card,
                borderWidth: 1,
                backgroundColor: STheme.color.background
            }} withoutFeedback >
                <PopupCrearPuntoVenta {...props} onCancel={() => {
                    SPopup.close("PopupCrearPuntoVenta")
                    if (props.onCancel) props.onCancel()
                }}
                    onSuccess={(e: any) => {
                        SPopup.close("PopupCrearPuntoVenta")
                        if (props.onSuccess) props.onSuccess(e)
                    }}

                />
            </SView>
        })
    }
    form: SForm | undefined = undefined;
    render() {
        return <SView col={"xs-12"} center padding={16}>
            <SText fontSize={16}>{this.props.editObject ? "Editar" : "Crear"}{" Punto de Venta"}</SText>
            <SForm ref={(ref: any) => this.form = ref} inputs={{
                "descripcion": {
                    label: "Nombre del Punto de venta *", placeholder: "Ingresa el nombre del Punto de venta", isRequired: true, autoFocus: true,
                    defaultValue: this.props.editObject?.descripcion,
                    onSubmitEditing: () => {
                        if (this.form) this.form.focus("codigo_facturacion");
                    }
                },
                "codigo_facturacion": {
                    label: "Codigo SIAT", placeholder: "", defaultValue: this.props.editObject?.codigo_facturacion, col: "xs-5", onSubmitEditing: () => {
                        if (this.form) this.form.focus("observacion");
                    }
                },
                "observacion": {
                    label: "Detalles", placeholder: "Ingresa mas detalles sobre el punton de venta", type: "textArea", defaultValue: this.props.editObject?.observacion,
                    onSubmitEditing: () => {
                        if (this.form) this.form.submit();
                    }
                },

            }}
                onSubmit={(data: any) => {
                    SSocket.sendPromise({
                        service: "empresa",
                        component: "punto_venta",
                        type: this.props.editObject ? "editar" : "registro",
                        key_usuario: Model.usuario.Action.getKey(),
                        data: {
                            key_sucursal: this.props.key_sucursal,
                            ...(this.props.editObject ?? {}),
                            ...data,

                        }
                    }).then(e => {
                        if (this.props.onSuccess) this.props.onSuccess(e)
                        console.log("response", e);
                    }).catch(e => {
                        console.error("response", e);
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
