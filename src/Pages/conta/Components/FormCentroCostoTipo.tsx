
import React, { Component } from 'react';
import { View, Text } from 'react-native';
import MDL from '../../../MDL';
import { DinamicTable } from 'servisofts-table';
import { SForm, SHr, SIcon, SNotification, SPopup, SText, STheme, SView } from 'servisofts-component';
import PButtom from '../../../Components/PButtom';
// import TextArea from '../../../Components/QueryTool/TextArea';
// import SIconApp from '../../../Assets/SIconApp';
// import TextAreaPopup from '../../../Components/QueryTool/TextAreaPopup';
import TextAreaPopupOpenIcon from '../../../Components/QueryTool/TextAreaPopupOpenIcon';
import SelectorCuentaContable from '../../../Components/Selectores/SelectorCuentaContable';


type FormCentroCostoTipoType = {
    onRegister: (e: any) => void,
    onActualizar: (e: any) => void,
    onCancel?: () => void,
}

export default class FormCentroCostoTipo extends Component<FormCentroCostoTipoType & { defaultData?: any }> {
    static open(props: FormCentroCostoTipoType) {
        SPopup.open({
            key: "ppupregistro",
            content: <SView backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 300 }} padding={16} withoutFeedback col={"xs-11"}>
                <FormCentroCostoTipo {...props} onRegister={(e) => {
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
    state = {
        cuentas: [] as any[],
    }

    cuenta: any;

    render() {

        const { defaultData } = this.props;


        return <SView center>
            <SText bold>{defaultData ? "Editar Centro de costo" : "Crear Centro de costo"}</SText>

            <SForm
                ref={(ref: any) => this.form = ref}
                inputs={{
                    "descripcion": {
                        label: "Descripción", autoFocus: true, required: true, defaultValue: defaultData?.descripcion,
                        onSubmitEditing: () => {
                            if (this.form) this.form.focus("porcentaje");
                        }
                    },

                }}
                onSubmit={(e: any) => {

                    const data = { ...defaultData, ...e };
                    const prom = data?.key ? MDL.contabilidad.centro_costo_tipo.editar(data) : MDL.contabilidad.centro_costo_tipo.registrar(data);

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


                    // const cuentaSeleccionada = this.state.cuentas.find((cuenta) => this.cuentaToString(cuenta) === e.key_cuenta_contable);
                    // const data = { ...defaultData, ...e };
                    // if(this.cuenta){
                    //     data.key_cuenta_contable = this.cuenta?.key;
                    // }
                    // const prom = data?.key ? MDL.compra_venta.editarDescuento(data) : MDL.compra_venta.registrarDescuento(data);

                    // SNotification.send({ key: "registro", title: "Guardando...", type: "loading" });

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
