
import React, { Component } from 'react';
import { View, Text } from 'react-native';
import MDL from '../../../MDL';
import { DinamicTable } from 'servisofts-table';
import { SDate, SForm, SHr, SIcon, SNotification, SPopup, SText, STheme, SView } from 'servisofts-component';
import PButtom from '../../../Components/PButtom';


type FormRegistroSuscriptorType = {
    onRegister: (e: any) => void,
    onActualizar: (e: any) => void,
    onCancel?: () => void,
}

export default class FormRegistroSuscriptor extends Component<FormRegistroSuscriptorType & { defaultData?: any }> {
    static open(props: FormRegistroSuscriptorType) {
        SPopup.open({
            key: "ppupregistro",
            content: <SView backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 300 }} padding={16} withoutFeedback col={"xs-11"}>
                <FormRegistroSuscriptor {...props} onRegister={(e) => {
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
            <SText bold>{defaultData ? "Actualizar fecha suscripción" : "Registrar fecha suscripción"}</SText>
            <SHr height={10} />
            <SForm row ref={(ref: any) => this.form = ref}
                style={{ justifyContent: "space-between" }}
                inputs={{
                    fecha_inicio: {
                        col: "xs-12",
                        label: "Fecha inicio",
                        required: true,
                        type: "date",
                        // defaultValue: defaultData?.fecha_inicio,
                        defaultValue: new SDate(defaultData?.fecha_inicio).toString("yyyy-MM-dd"),
                        autoFocus: true,
                        onSubmitEditing: () => this.form?.focus("fecha_inicio"),
                    },
                    fecha_fin: {
                        col: "xs-12",
                        label: "Fecha fin",
                        type: "date",
                        required: true,
                        // defaultValue: defaultData?.fecha_fin,
                        defaultValue: new SDate(defaultData?.fecha_fin).toString("yyyy-MM-dd"),
                        //new SDate(this.props.editObject?.fecha).toString("yyyy-MM-dd")
                        onSubmitEditing: () => this.form?.focus("fecha_fin"),
                    },

                }}
                onSubmit={(e: any) => {

                    const data = { ...defaultData, ...e };
                    // const prom = data?.key ? MDL.crm.cliente.editar(data) : MDL.crm.cliente.registrar(data);

                    //SNotification.send({ key: "registro", title: "Guardando...", type: "loading" });

                    const datosParaEnviar = {
                        key: data.key,
                        key_cliente: data.key_cliente,
                        fecha_inicio: data.fecha_inicio,
                        fecha_fin: data.fecha_fin,
                    };

                    console.log("Datos para enviar:", datosParaEnviar);


                    MDL.inventario.editSuscripcion(datosParaEnviar).then((resp) => {
                        SNotification.send({
                            title: 'Éxito',
                            body: 'Suscripción actualizada correctamente.',
                            time: 3000,
                            color: STheme.color.success,
                        });
                        this.props.onActualizar?.(resp);
                        SPopup.close("ppupregistro");
                    }).catch((err) => {
                        console.error("Error al eliminar el artículo del cliente", err);
                        SNotification.send({
                            title: 'Error',
                            body: 'Suscripción no actualizada.',
                            time: 3000,
                            color: STheme.color.danger,
                        });
                    });



                    // prom.then((res) => {
                    //     SNotification.send({ key: "registro", title: data?.key ? "Actualizado" : "Registrado", color: STheme.color.success, time: 5000 });
                    //     if (data?.key) {
                    //         this.props.onActualizar?.(res);
                    //     } else {
                    //         this.props.onRegister?.(res);
                    //     }
                    //     SPopup.close("ppupregistro");
                    // }).catch((err) => {
                    //     SNotification.send({ key: "registro", title: "Error", body: err, color: STheme.color.danger });
                    // });



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


                <PButtom flex type="primary" onPress={() => this.form?.submit()}>{defaultData ? "ACTUALIZAR" : "ACEPTAR"}</PButtom>

            </SView>
        </SView >
    }
}
