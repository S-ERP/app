
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


type FormRegistroDescuentoType = {
    onRegister: (e: any) => void,
    onActualizar: (e: any) => void,
    onCancel?: () => void,
}

export default class FormRegistroDescuento extends Component<FormRegistroDescuentoType & { defaultData?: any }> {
    static open(props: FormRegistroDescuentoType) {
        SPopup.open({
            key: "ppupregistro",
            content: <SView backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 300 }} padding={16} withoutFeedback col={"xs-11"}>
                <FormRegistroDescuento {...props} onRegister={(e) => {
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

    componentDidMount(): void {
        MDL.contabilidad.getCuentasCache().then((cuentas) => {
            console.log("Cuentas cargadas en FormRegistroDescuento", cuentas);
            this.setState({ cuentas });

        })
    }

    render() {

        const { defaultData } = this.props;


        return <SView center>
            <SText bold>{defaultData ? "Editar Proyecto" : "Crear Proyecto"}</SText>

            <SForm
                ref={(ref: any) => this.form = ref}
                inputs={{
                    "descripcion": {
                        label: "Descripción", autoFocus: true, required: true, defaultValue: defaultData?.descripcion,
                        onSubmitEditing: () => {
                            if (this.form) this.form.focus("porcentaje");
                        }
                    },
                    "porcentaje": {
                        label: "Porcentaje", required: true, defaultValue: defaultData?.porcentaje,
                        iconR: <SText>{"%"}</SText>,
                        placeholder: "0.00 - 1.00",
                        onSubmitEditing: () => {
                            if (this.form) this.form.focus("monto");
                        }
                    },
                    "monto": {
                        label: "Monto", required: true, defaultValue: defaultData?.monto,
                        placeholder: "0.00 - 10000.00",
                        iconR: <SText>{"BOB"}</SText>,
                        onSubmitEditing: () => {
                            if (this.form) this.form.focus("key_cuenta_contable");
                        }
                    },
                    "key_cuenta_contable": {
                        label: "Cuenta",
                        required: true, defaultValue: defaultData?.key_cuenta_contable,
                        type: "select2",
                        options: this.state.cuentas.map((cuenta) => cuenta.codigo),
                        placeholder: "Cuenta contable",
                        // iconR: <SText>{"BOB"}</SText>,
                        onSubmitEditing: () => {
                            if (this.form) this.form.submit();
                        }
                    },



                }}
                onSubmit={(e: any) => {

                    const data = { ...defaultData, ...e };
                    const prom = data?.key ? MDL.compra_venta.editarDescuento(data) : MDL.compra_venta.registrarDescuento(data);

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
