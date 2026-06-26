import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SForm, SHr, SPopup, SText, STheme, SView, Upload } from 'servisofts-component';
import PButtom from '../../../../Components/PButtom';
import SSocket from 'servisofts-socket';
import MDL from '../../../../MDL';
import Model from '../../../../Model';
import Btn from './Btn';
import InputFoto from '../../../../Components/InputFoto';

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

                maxHeight: "100%",
                // maxWidth: "100%",
                width: "100%",
                maxWidth: 500,
                // width: 500,
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
    _ref: any = {}
    render() {

        {/* necesito que se actualice el componente DinamicTable que lleve el codigo para que se sleeciono por defecto, que on este el de oblivia por defecto  */ }


        return <SView col={"xs-12"} center padding={16}>
            <SText fontSize={16}>{this.props.editObject ? "Editar" : "Crear"}{" sucursal"}</SText>
            <SText fontSize={16} style={{ userSelect: "text" }} >{this.props.editObject?.key}</SText>

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
                            },
                            icon: <SView style={{ borderRadius: 4, overflow: "hidden", width: 50, height: 50, backgroundColor: STheme.color.background, borderWidth: 1, borderColor: STheme.color.text + '66' }}>
                                {/* <SInput ref={ref => this._ref.image_modelo = ref} type='image' height={50} defaultValue={(SSocket.api as any).inventario + "modelo/" + this.props.editObject?.key}/> */}
                                <InputFoto
                                    ref={ref => this._ref.image_sucursal = ref}
                                    src={(SSocket.api as any).empresa + "sucursal/" + this.props.editObject?.key + `?date=${new Date().getTime()}`}
                                    style={{
                                        width: 50,
                                        height: 50,
                                    }} />
                            </SView>,
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
                        }).then((e: any) => {
                            if (this.props.onSuccess) this.props.onSuccess(e)

                            if (this._ref.image_sucursal) {
                                const value = this._ref.image_sucursal.getValue();
                                if (Array.isArray(value)) {
                                    Upload.sendPromise({ file: value[0], compress: false }, (SSocket.api as any).empresa + "upload/sucursal/" + e.data.key)
                                }
                            }
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
