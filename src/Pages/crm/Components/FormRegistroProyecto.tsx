
import React, { Component } from 'react';
import { View, Text } from 'react-native';
import MDL from '../../../MDL';
import { DinamicTable } from 'servisofts-table';
import { SForm, SHr, SIcon, SNotification, SPopup, SText, STheme, SView } from 'servisofts-component';
import PButtom from '../../../Components/PButtom';
import TextArea from '../../../Components/QueryTool/TextArea';
import SIconApp from '../../../Assets/SIconApp';
import TextAreaPopup from '../../../Components/QueryTool/TextAreaPopup';
import TextAreaPopupOpenIcon from '../../../Components/QueryTool/TextAreaPopupOpenIcon';


type FormRegistroType = {
    onRegister: (e: any) => void,
    onActualizar: (e: any) => void,
    onCancel?: () => void,
}

export default class FormRegistroProyecto extends Component<FormRegistroType & { defaultData?: any }> {
    static open(props: FormRegistroType) {
        SPopup.open({
            key: "ppupregistro",
            content: <SView backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 300 }} padding={16} withoutFeedback col={"xs-11"}>
                <FormRegistroProyecto {...props} onRegister={(e) => {
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
            <SText bold>{defaultData ? "Editar Proyecto" : "Crear Proyecto"}</SText>

            <SForm
                ref={(ref: any) => this.form = ref}
                inputs={{
                    "nombre": {
                        label: "Nombre del proyecto", autoFocus: true, required: true, defaultValue: defaultData?.nombre, onSubmitEditing: () => {
                            if (this.form) this.form.focus("description");
                        }
                    },
                    "descripcion": {
                        label: "Descripcion del proyecto", required: true, defaultValue: defaultData?.descripcion, type: "textArea",

                        iconR: <TextAreaPopupOpenIcon
                            type={"MD"}
                            title='Descripción del proyecto'
                            getDefaultValue={() => {
                                return this.form?.getValues()?.descripcion || defaultData?.descripcion || "";
                            }}
                            onChangeText={(text: string) => {
                                if (this.form) {
                                    this.form.setValues({ "descripcion": text });
                                }
                            }} />,
                        onSubmitEditing: () => {
                            if (this.form) this.form.focus("guion");
                            // if (this.form) this.form.submit();
                        }
                    },
                    "guion": {
                        label: "Guion del proyecto", defaultValue: defaultData?.guion, type: "textArea",
                        height: 100,

                        iconR: <TextAreaPopupOpenIcon
                            type={"MD"}
                            title='Guion del proyecto'
                            getDefaultValue={() => {
                                return this.form?.getValues()?.guion || defaultData?.guion || "";
                            }}
                            onChangeText={(text: string) => {
                                if (this.form) {
                                    this.form.setValues({ "guion": text });
                                }
                            }} />,

                        onSubmitEditing: () => {
                            if (this.form) this.form.submit();
                        }
                    }
                }}
                onSubmit={(e: any) => {

                    const data = { ...defaultData, ...e };
                    const prom = data?.key ? MDL.crm.proyecto.editar(data) : MDL.crm.proyecto.registrar(data);

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

                    // MDL.crm.proyecto.registrar(e).then((e: any) => {
                    //     SNotification.send({
                    //         key: "registro",
                    //         title: "Registrado con exito",
                    //         color: STheme.color.success,
                    //         time: 5000,
                    //     })
                    //     if (this.props.onRegister) this.props.onRegister(e)
                    // }).catch((e: any) => {
                    //     SNotification.send({
                    //         key: "registro",
                    //         title: "Error al registrar",
                    //         body: e,
                    //         color: STheme.color.danger,
                    //         time: 5000,
                    //     })
                    // })

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

                <PButtom flex type="primary" onPress={() => this.form?.submit()}>{defaultData ? "ACTUALIZAR" : "CREAR"}</PButtom>

                {/* <PButtom flex type='primary' onPress={() => {
                    if (this.form) this.form.submit();
                }}>CREAR</PButtom> */}
            </SView>
        </SView >
    }
}
