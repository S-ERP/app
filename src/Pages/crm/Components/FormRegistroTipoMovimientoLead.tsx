
import React, { Component } from 'react';
import { View, Text } from 'react-native';
import MDL from '../../../MDL';
import { DinamicTable } from 'servisofts-table';
import { SForm, SHr, SIcon, SNotification, SPopup, SText, STheme, SView } from 'servisofts-component';
import PButtom from '../../../Components/PButtom';


type FormRegistroType = {
    onRegister: (e: any) => void,
    onActualizar: (e: any) => void,
    onCancel?: () => void,
}

export default class FormRegistroTipoMovimientoLead extends Component<FormRegistroType & { defaultData?: any }> {
    static open(props: FormRegistroType) {
        SPopup.open({
            key: "ppupregistro",
            content: <SView backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 300 }} padding={16} withoutFeedback col={"xs-11"}>
                <FormRegistroTipoMovimientoLead {...props} onRegister={(e) => {
                    SPopup.close("ppupregistro")
                    if (props.onRegister) props.onRegister(e)
                }}
                    onCancel={() => {
                        SPopup.close("ppupregistro")
                        if (props.onCancel) props.onCancel()
                    }}
                />
            </SView>
        })
    }
    form: SForm | null = null;
    render() {

        const { defaultData } = this.props;


        return <SView center>
            <SText bold>{defaultData ? "Actualizar Tipo" : "Registrar Tipo de leads"}</SText>
            <SHr height={10} />
            <SForm row ref={(ref: any) => this.form = ref}
                style={{ justifyContent: "space-between" }}
                inputs={{
                    titulo: {
                        col: "xs-12",
                        label: "Título ",
                        required: true,
                        defaultValue: defaultData?.titulo,
                        autoFocus: true,
                        onSubmitEditing: () => this.form?.focus("descripcion"),
                    },
                    descripcion: {
                        col: "xs-12",
                        label: "Descripción",
                        required: true,
                        defaultValue: defaultData?.descripcion,
                        onSubmitEditing: () => this.form?.focus("tipo"),
                    },
                    tipo: {
                        col: "xs-12",
                        label: "Tipo",
                        required: true,
                        type: "select",
                        options: ["cancelado", "double", "spam", "rellamada", "llamada_fallida", "rechazo"].map(a => ({
                            key: a,
                            content: a
                        })),

                        // type: "select", options: (defaultData?.tipo ?? ["cancelacion", "llamada_fallida", "spam"]).map(a => { return { key: a.tipo } }),

                        defaultValue: defaultData?.tipo,
                        onSubmitEditing: () => this.form?.submit(),
                    },

                }}
                onSubmit={(e: any) => {

                    const data = { ...defaultData, ...e };
                    const prom = data?.key ? MDL.crm.tipoMovimientoLead.editar(data) : MDL.crm.tipoMovimientoLead.registrar(data);

                    SNotification.send({ key: "registro", title: "Guardando...", type: "loading" });

                    prom.then((res) => {
                        SNotification.send({ key: "registro", title: data?.key ? "Actualizado" : "Registrado", color: STheme.color.success, time: 5000 });
                        if (data?.key) {
                            this.props.onActualizar?.(res);
                        } else {
                            this.props.onRegister?.(res);
                        }
                        SPopup.close("ppupregistro");
                    }).catch((err) => {
                        SNotification.send({ key: "registro", title: "Error", body: err, color: STheme.color.danger });
                    });



                }}
            />
            <SHr />
            <SView row col={"xs-12"}>
                {this.props.onCancel && <>
                    <PButtom flex type='danger' onPress={() => {
                        if (this.props.onCancel) this.props.onCancel()
                    }}>CANCELAR</PButtom>
                    <SView width={8} />
                </>}


                <PButtom flex type="secondary" onPress={() => this.form?.submit()}>{defaultData ? "ACTUALIZAR" : "ACEPTAR"}</PButtom>

            </SView>
        </SView >
    }
}
