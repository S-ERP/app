import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SForm, SHr, SIcon, SInput, SNotification, SPopup, SText, STheme, SView, Upload } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import MDL from '../../../MDL';
import Btn from '../../empresa/config/Components/Btn';
import SIconApp from '../../../Assets/SIconApp';
import BarcodeScanner from '../../../Components/BarcodeScanner';
import InputFoto from '../../../Components/InputFoto';
import BarcodeIcon from '../../../Components/BarcodeScanner/BarcodeIcon';
import TextAreaPopupOpenIcon from '../../../Components/QueryTool/TextAreaPopupOpenIcon';

type Props = {
    editObject?: any,
    onCancel?: Function,
    onSuccess?: Function,
}

export default class FormularioIngrediente extends Component<Props> {

    static open(props: Props) {
        SPopup.open({
            key: "FormularioIngrediente",
            content: <SView style={{
                width: "100%",
                maxHeight: "100%",
                maxWidth: 500,
                // height: 500,
                borderRadius: 8,
                borderColor: STheme.color.card,
                borderWidth: 1,
                backgroundColor: STheme.color.background
            }} withoutFeedback >
                <FormularioIngrediente {...props} onCancel={() => {
                    SPopup.close("FormularioIngrediente")
                    if (props.onCancel) props.onCancel()
                }}
                    onSuccess={(e: any) => {
                        SPopup.close("FormularioIngrediente")
                        if (props.onSuccess) props.onSuccess(e)
                    }}

                />
            </SView>
        })
    }

    state = {
        // key_marca: this.props.editObject?.key_marca,
        // key_tipo_producto: this.props.editObject?.key_tipo_producto,
        // marcas: [],
        // tipo_productos: [],
        descripcion_tipo_producto: "",
        descripcion_marca: "",
    }
    qr_reader_listener: any;
    // qr_reader_listener_picture: any;
    componentDidMount(): void {
        // MDL.inventario.getAllMarca().then((resp: any) => {

        //     this.state.marcas = resp;
        //     if (this.form && this.props.editObject) {
        //         const marca = resp.find((item: any) => item.key == this.props.editObject.key_marca);
        //         this.form.setValues({ "marca": marca.descripcion });
        //     }
        //     this.setState({
        //         marcas: resp
        //     })
        // }).catch((e: any) => {
        //     console.error("Error al cargar marcas", e);
        // })
        // MDL.inventario.getAllTipoProducto().then((resp: any) => {

        //     this.state.tipo_productos = resp;
        //     if (this.form && this.props.editObject) {
        //         const tipo_producto = resp.find((item: any) => item.key == this.props.editObject.key_tipo_producto);
        //         this.form.setValues({ "tipo": tipo_producto.descripcion });
        //     }
        //     this.setState({
        //         tipo_productos: resp
        //     })
        // }).catch((e: any) => {
        //     console.error("Error al cargar marcas", e);
        // })


    }


    buildCustmomInputs() {

    }
    _ref: any = {}
    form: SForm | undefined = undefined;
    render() {
        return <SView col={"xs-12"} center padding={16}>
            <SText fontSize={16}>{this.props.editObject ? "Editar" : "Crear"}{" Ingrediente"}</SText>
            <SHr />
            <SForm ref={(ref: any) => this.form = ref} row
                style={{
                    justifyContent: "space-between",
                }}
                inputs={{
                    "descripcion": {
                        col: "xs-12",
                        style: { paddingStart: 0, marginBottom: 8, },
                        labelStyle: { top: -10, },
                        customStyle: "erp",
                        inputStyle: { paddingStart: 8 },
                        label: "Nombre", placeholder: "Ingresa el nombre",
                        isRequired: true, autoFocus: true,
                        defaultValue: this.props.editObject?.descripcion,
                        onSubmitEditing: () => {
                            if (this.form) this.form.focus("cantidad");
                        }
                    },
                    "cantidad": {
                        col: "xs-5.5 sm-4",
                        customStyle: "erp",
                        defaultValue: !this.props.editObject?.cantidad ? "" : parseFloat(this.props.editObject?.cantidad ?? 0) + "",
                        icon: <SIconApp name='Egreso' width={20} />,
                        label: "Cantidad", placeholder: "0,00", type: "money2",
                        onSubmitEditing: () => {
                            // if (this.form) this.form.focus("precio_venta");
                        }
                    },
                    "is_required": {
                        col: "xs-5.5 sm-4",
                        customStyle: "erp",
                        defaultValue: !!this.props.editObject?.is_required,
                        label: "Requerido?", type: "checkBox",
                        onSubmitEditing: () => {
                            // if (this.form) this.form.focus("precio_venta");
                        }
                    },
                    "bloquear_desensamblaje": {
                        col: "xs-12",

                        customStyle: "erp",
                        inputStyle: {
                            height: 40,
                        },
                        defaultValue: !!this.props.editObject?.bloquear_desensamblaje,
                        label: "Solo para ensamblaje", type: "checkBox",
                        onSubmitEditing: () => {
                            // if (this.form) this.form.focus("precio_venta");
                        }
                    },


                }}
                onSubmit={(data: any) => {
                    console.log(data)
                    const obj: any = {
                        descripcion: data.descripcion,
                        cantidad: parseFloat(data.cantidad ?? 0),
                        is_required: !!data.is_required,
                        bloquear_desensamblaje: !!data.bloquear_desensamblaje,
                    }
                    if (this.props.editObject) {
                        obj.key = this.props.editObject.key;
                    }
                    const kn = "guardando_FormularioIngrediente";
                    SNotification.send({
                        key: kn,
                        title: "Guardando...",
                        body: "Por favor, espere.",
                        type: "loading",
                        color: STheme.color.primary,
                    })

                    MDL.inventario.saveIngrediente(obj).then(async (resp: any) => {
                        if (this.props.onSuccess) {
                            this.props.onSuccess(resp);
                        }
                        SNotification.remove(kn);
                    }).catch((e: any) => {
                        console.error("Error al guardar:", e);
                        SNotification.send({
                            key: kn,
                            title: "Error",
                            body: e.error ?? "Error al guardar.",
                            time: 3000,
                            color: STheme.color.danger,
                        });
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
