import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import { SForm, SHr, SNotification, SPopup, SText, STheme, SView, Upload } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import MDL from '../../../../MDL';
import Btn from './Btn';
import InputFoto from '../../../../Components/InputFoto';
type Props = {
    key_empresa: string,
    editObject?: any,
    onCancel?: Function,
    onSuccess?: Function,
}
export default class PopupCrearAlmacen extends Component<Props> {
    static open(props: Props) {
        SPopup.open({
            key: "PopupCrearAlmacen",
            content: <SView style={{
                maxHeight: "100%",
                width: "100%",
                maxWidth: 500,
                borderRadius: 8,
                borderColor: STheme.color.card,
                borderWidth: 1,
                backgroundColor: STheme.color.background
            }} withoutFeedback >
                <PopupCrearAlmacen {...props} onCancel={() => {
                    SPopup.close("PopupCrearAlmacen")
                    if (props.onCancel) props.onCancel()
                }}
                    onSuccess={(e: any) => {
                        SPopup.close("PopupCrearAlmacen")
                        if (props.onSuccess) props.onSuccess(e)
                    }}
                />
            </SView>
        })
    }
    form: SForm | undefined = undefined;
    _ref: any = {}
    state: any = {
        sucursales: []  // inicializamos vacio
    }
    componentDidMount(): void {
        MDL.empresa.getAllSucursales().then(item => {
            this.setState({
                sucursales: Object.values(item).map((suc: any) => ({
                    key: suc.key?.toString(),  // ⚡ convertir key a string
                    content: `Suc.- ${suc.descripcion}`
                }))
            });
        }).catch(e => console.error(e));
    }
    render() {
        return <SView col={"xs-12"} center padding={16}>
            <SText fontSize={16}>{this.props?.editObject ? "Editar" : "Crear"}{" Almacén"}</SText>
            <ScrollView>
                <SForm ref={(ref: any) => this.form = ref}
                    row
                    style={{
                        justifyContent: "space-between",
                    }}
                    inputs={{
                        "descripcion": {
                            label: "Nombre del almacén *", placeholder: "Ingresa el nombre del almacén", isRequired: true, autoFocus: true,
                            defaultValue: this.props.editObject?.descripcion,
                            onSubmitEditing: () => {
                                if (this.form) this.form.submit();
                            },
                            icon: <SView style={{ borderRadius: 4, overflow: "hidden", width: 50, height: 50, backgroundColor: STheme.color.background, borderWidth: 1, borderColor: STheme.color.text + '66' }}>
                                <InputFoto
                                    ref={ref => this._ref.image_sucursal = ref}
                                    src={(SSocket.api as any).empresa + "sucursal/" + this.props.editObject?.key}
                                    style={{ width: 50, height: 50, }} />
                            </SView>,
                        },
                        "key_sucursal": {
                            label: "Sucursal",
                            placeholder: "Seleccione sucursal",
                            type: "select",
                            col: "xs-12",
                            style: { paddingStart: 0, fontSize: 10 },
                            labelStyle: { top: -10, },
                            inputStyle: { paddingStart: 8, fontSize: 10 },
                            options: this.state.sucursales,   // siempre array
                            defaultValue: this.props.editObject?.key_sucursal?.toString() ?? null,
                            isRequired: true,
                        },
                        "observacion": { label: "Observación", placeholder: "observación", defaultValue: this.props.editObject?.observacion, col: "xs-12" },
                        "is_stock": {
                            label: "¿Almacén con stock?",
                            type: "select",
                            options: ["si", "no"],
                            defaultValue: this.props.editObject?.is_stock ? "si" : "no",
                            col: "xs-12",
                        },
                        "is_venta": {
                            label: "¿Almacén para ventas?",
                            type: "select",
                            options: ["si", "no"],
                            defaultValue: this.props.editObject?.is_venta ? "si" : "no",
                            col: "xs-12",
                        },
                        "is_entrega": {
                            label: "¿Requiere entrega?",
                            type: "select",
                            options: ["si", "no"],
                            defaultValue: this.props.editObject?.is_entrega ? "si" : "no",
                            col: "xs-12",
                        },
                    }}
                    onSubmit={(data: any) => {
                        data.is_stock = data.is_stock === "si";
                        data.is_venta = data.is_venta === "si";
                        data.is_entrega = data.is_entrega === "si";
                        data.key = this.props.editObject?.key;
                        console.log("picaso " + JSON.stringify(data))

                        MDL.inventario.saveAlmacen({ data }).then((resp: any) => {
                            if (this.props.onSuccess) this.props.onSuccess(resp)

                            if (this._ref.image_sucursal) {
                                const value = this._ref.image_sucursal.getValue();
                                if (Array.isArray(value)) {
                                    Upload.sendPromise({ file: value[0], compress: false }, (SSocket.api as any).empresa + "upload/sucursal/" + resp.key)
                                }
                            }
                            this.forceUpdate();
                            SNotification.send({
                                title: "Almacen guardada",
                                body: "Almacen se ha guardado correctamente.",
                                time: 3000,
                                color: STheme.color.success,
                            });


                        }).catch((e: any) => {
                            if (this.props.onSuccess) this.props.onSuccess(e)
                            console.error("Error al guardar la Almacen:", e);
                            SNotification.send({
                                title: "Error",
                                body: "No se pudo guardar la Almacen.",
                                time: 3000,
                                color: STheme.color.danger,
                            });
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

