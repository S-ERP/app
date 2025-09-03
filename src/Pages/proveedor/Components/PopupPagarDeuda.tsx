import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import { SForm, SHr, SNotification, SPopup, SText, STheme, SView, Upload } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import MDL from '../../../MDL';
import InputFoto from '../../../Components/InputFoto';
import Btn from './Btn';
type Props = {
    key_empresa: string,
    editObject?: any,
    onCancel?: Function,
    onSuccess?: Function,
}
export default class PopupPagarDeuda extends Component<Props> {
    static open(props: Props) {
        SPopup.open({
            key: "PopupPagarDeuda",
            content: <SView style={{
                maxWidth: "100%",
                maxHeight: "100%",
                width: 500,
                borderRadius: 8,
                borderColor: STheme.color.card,
                borderWidth: 1,
                backgroundColor: STheme.color.background
            }} withoutFeedback >
                <PopupPagarDeuda {...props} onCancel={() => {
                    SPopup.close("PopupPagarDeuda")
                    if (props.onCancel) props.onCancel()
                }}
                    onSuccess={(e: any) => {
                        SPopup.close("PopupPagarDeuda")
                        if (props.onSuccess) props.onSuccess(e)
                    }}
                />
            </SView>
        })
    }
    form: SForm | undefined = undefined;
    _ref: any = {}
    render() {
        return <SView col={"xs-12"} center padding={16}>
            <SText fontSize={16}>{this.props?.editObject ? "Editar" : "Crear"}{" Proveedor"}</SText>
            <ScrollView>


 
                <SForm ref={(ref: any) => this.form = ref} row style={{ justifyContent: "space-between" }}
                    inputs={{
                         "nombre": { label: "Nombre del contacto", placeholder: "Nombre del contacto", defaultValue: this.props.editObject?.nombre, col: "xs-12" },
                        "telefono": { label: "Teléfono", placeholder: "Teléfono", type: "telefono", defaultValue: this.props.editObject?.telefono, col: "xs-12" },
                    }}
                    onSubmit={(val: any) => {
                        const data = {
                            ...val,
                            key_cuenta_contable: "1.0.1",
                        };
                    
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
