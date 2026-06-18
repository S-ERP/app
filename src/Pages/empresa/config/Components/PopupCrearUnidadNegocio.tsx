import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SForm, SHr, SPopup, SText, STheme, SUuid, SView } from 'servisofts-component';
import PButtom from '../../../../Components/PButtom';
import SSocket from 'servisofts-socket';
import MDL from '../../../../MDL';
import Model from '../../../../Model';
import Btn from './Btn';

type Props = {
    editObject?: any,
    onCancel?: Function,
    onSuccess?: Function,

}


export default class PopupCrearUnidadNegocio extends Component<Props> {
    state: any = {
        sucursales: []  // inicializamos vacio
    }

    static open(props: Props) {
        SPopup.open({
            key: "PopupCrearUnidadNegocio",
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
                <PopupCrearUnidadNegocio {...props} onCancel={() => {
                    SPopup.close("PopupCrearUnidadNegocio")
                    if (props.onCancel) props.onCancel()
                }}
                    onSuccess={(e: any) => {
                        SPopup.close("PopupCrearUnidadNegocio")
                        if (props.onSuccess) props.onSuccess(e)
                    }}

                />
            </SView>
        })
    }
    form: SForm | undefined = undefined;
    render() {
        return <SView col={"xs-12"} center padding={16}>
            <SText fontSize={16}>{this.props.editObject ? "Editar" : "Crear"}{"Unidad de Negocio"}</SText>
            <SText fontSize={16} style={{ userSelect: "text" }} >{this.props.editObject?.key}</SText>
            <SForm ref={(ref: any) => this.form = ref}
                row
                style={{
                    justifyContent: "space-between",
                }}
                inputs={{
                    "descripcion": {
                        label: "Nombre del la unidad de negocio*", placeholder: "Ingresa el nombre", isRequired: true, autoFocus: true,
                        defaultValue: this.props.editObject?.descripcion,
                    },

                }}
                onSubmit={(data: any) => {
                    MDL.empresa.execute_function("json_upsert", ["unidad_negocio", [{
                        key: this.props?.editObject?.key ?? SUuid(),
                        key_empresa: MDL.empresa?.select?.key,
                        descripcion: data.descripcion,
                        key_usuario: MDL.usuario?.session?.key,

                    }]]).then(e => {
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
