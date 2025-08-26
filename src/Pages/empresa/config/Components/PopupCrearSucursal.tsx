import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SForm, SHr, SPopup, SText, STheme, SView } from 'servisofts-component';
import PButtom from '../../../../Components/PButtom';
import SSocket from 'servisofts-socket';
import MDL from '../../../../MDL';
import Model from '../../../../Model';
import Btn from './Btn';

type Props = {
    key_empresa: string,
    editObject?: any,
    onCancel?: Function,
    onSuccess?: Function,
}

export default class PopupCrearSucursal extends Component<Props> {

    static open(props: Props) {
        SPopup.open({
            key: "PopupCrearSucursal",
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
                <PopupCrearSucursal {...props} onCancel={() => {
                    SPopup.close("PopupCrearSucursal")
                    if (props.onCancel) props.onCancel()
                }}
                    onSuccess={(e: any) => {
                        SPopup.close("PopupCrearSucursal")
                        if (props.onSuccess) props.onSuccess(e)
                    }}

                />
            </SView>
        })
    }
    form: SForm | undefined = undefined;
    render() {
        return <SView col={"xs-12"} center padding={16}>
            <SText fontSize={16}>{this.props.editObject ? "Editar" : "Crear"}{" sucursal"}</SText>
            <ScrollView>
                <SForm ref={(ref: any) => this.form = ref}
                    row
                    style={{
                        justifyContent: "space-between",
                    }}
                    inputs={{
                        "descripcion": {
                            label: "Nombre de la sucursal *", placeholder: "Ingresa el nombre de la sucursal", isRequired: true, autoFocus: true,
                            defaultValue: this.props.editObject?.descripcion,
                            onSubmitEditing: () => {
                                if (this.form) this.form.submit();
                            }
                        },
                        "municipio": { label: "Municipio", placeholder: "Ingresa el municipio", defaultValue: this.props.editObject?.municipio, col: "xs-5" },
                        "codigo_facturacion": { label: "Codigo SIAT", placeholder: "", defaultValue: this.props.editObject?.codigo_facturacion, col: "xs-5" },
                        "direccion": { label: "Direccion", placeholder: "Ingresa la direccion", defaultValue: this.props.editObject?.direccion, col: "xs-12" },
                        "telefono": { label: "Telefono", placeholder: "00000000000000000", type: "phone", defaultValue: this.props.editObject?.telefono, col: "xs-5.7" },
                        "correo": { label: "Correo", placeholder: "example@email.com", type: "email", defaultValue: this.props.editObject?.correo, col: "xs-5.7" },
                        "observacion": { label: "Detalles", placeholder: "Ingresa mas detalles sobre la sucursal", type: "textArea", defaultValue: this.props.editObject?.observacion, },

                    }}
                    onSubmit={(data: any) => {
                        SSocket.sendPromise({
                            service: "empresa",
                            component: "sucursal",
                            type: this.props.editObject ? "editar" : "registro",
                            key_usuario: Model.usuario.Action.getKey(),
                            data: {
                                key_empresa: this.props.key_empresa,
                                key_usuario: Model.usuario.Action.getKey(),
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
