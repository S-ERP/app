import React, { Component, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SDate, SHr, SInput, SNavigation, SNotification, SPage, SPopup, SText, STheme, SThread, SUtil, SUuid, SView } from 'servisofts-component';
import Input, { InputValidator } from './Input';
import BtnNaranja from './BtnNaranja';
import { ProductoType, SubProductoType } from '../types';
import Model from '../../../../Model';
import PageTitle from '../../../../Components/PageTitle';

const color = "#000000"
const colorGray = "#999999"
const colorGray2 = "#BBBBBB"
const colorCard = "#EEEEEE"
const font = 'Montserrat'




export default class FormularioOpciones extends Component<any> {

    static openPopup(props: { data: any, onChange: (e: any) => void }) {
        SPopup.open({
            key: "FormularioOpciones",
            type: "2",
            content: <SView col={"xs-12"} height backgroundColor='#000000AA' padding={8} center>
                <SView col={"xs-12 sm-10 md-8 lg-6 xl-4"} backgroundColor={STheme.color.background} borderRadius={16} padding={8} withoutFeedback>
                    <FormularioOpciones data={props.data} onChange={props.onChange.bind(this)} />
                </SView>
            </SView>
        })

    }
    _inputs: any = {}
    // static TOPBAR = <TopBar type={"usuario_back"} />

    state: any;
    constructor(props: any) {
        super(props);
        this.state = {
        };

        // this.key_restaurante = SNavigation.getParam("key_restaurante")
        // this.pk = SNavigation.getParam("pk")

    }


    handleGuardar() {
        let resp: any = {}
        Object.keys(this._inputs).map(k => {
            resp[k] = this._inputs[k].getValue();
        })
        console.log(resp);

    }

    render() {
        const data = this.props.data ?? {};
        return <SView col={"xs-12"} center>
            <SHr h={16} />
            <PageTitle title='AGREGAR OPCIONES' />
            <SHr h={16} />
            <SView row col={"xs-12"} style={{
                justifyContent: "space-between"
            }}>
                <Input
                    ref={ref => this._inputs["nombre"] = ref}
                    col={"xs-7"}
                    defaultValue={data.nombre}
                    label={"Nombre de Opciones *"}
                    placeholder={"Nombre de las Opciones"}
                    info={"Ejemplo: Guarniciones, Toppings, Extras"}
                    onSubmitEditing={() => this._inputs["index"].focus()}
                />
                <Input
                    ref={ref => this._inputs["index"] = ref}
                    col={"xs-4.5"}
                    label={"Index"}
                    defaultValue={data.index}
                    filter={(e: any) => {
                        return e.replace(/[^0-9]/g, '');
                    }}
                    info={"Orden de posicionamiento en lista"}
                    placeholder={"0"}
                    keyboardType={"numeric"}
                    onSubmitEditing={() => this._inputs["descripcion"].focus()}
                />
            </SView>
            <SHr h={16} />
            <Input
                ref={ref => this._inputs["descripcion"] = ref}
                col={"xs-12"}
                defaultValue={data.descripcion}
                label={"Descripción de Opciones"}
                placeholder={"Descripción de las Opciones"}
                info={"Ejemplo: Elegí hasta 3 opciones, Ingredientes extras para agregar"}
                multiline
                height={50}
                inputStyle={{
                    paddingTop: 8,
                    textAlignVertical: "top",
                }}
                onSubmitEditing={() => this._inputs["categoria"].focus()}
            />
            <SHr h={16} />
            <SView row col={"xs-12"} style={{
                justifyContent: "space-between"
            }}>
                <Input
                    ref={ref => this._inputs["cantidad_minima"] = ref}
                    col={"xs-5.8"}
                    label={"Cantidad mínima de Opciones"}
                    defaultValue={data.index}
                    filter={(e: any) => {
                        return e.replace(/[^0-9]/g, '');
                    }}
                    placeholder={"Número de Opciones"}
                    keyboardType={"numeric"}
                    onSubmitEditing={() => this._inputs["descripcion"].focus()}
                />
                <Input
                    ref={ref => this._inputs["cantidad_maxima"] = ref}
                    col={"xs-5.8"}
                    label={"Cantidad máxima de Opciones"}
                    placeholder={"Número de Opciones"}

                    defaultValue={data.index}
                    filter={(e: any) => {
                        return e.replace(/[^0-9]/g, '');
                    }}
                    keyboardType={"numeric"}
                    onSubmitEditing={() => this._inputs["descripcion"].focus()}
                />

            </SView>
            <SText width={210} center fontSize={6.5} font={"Montserrat-SemiBold"} color={colorGray2}>{"Para ingresar una cantidad obligatoria, por ejemplo 2, ingresa el mismo número como mínimo y máximo"}</SText>
            <SHr h={16} />
            <BtnNaranja onPress={() => {
                let SubProducto: SubProductoType;
                let dta: any = {}
                Object.keys(this._inputs).map((a) => {
                    dta[a] = this._inputs[a].getValue();
                })

                const faltantes = InputValidator({
                    data: dta,
                    keys: ["nombre"]
                })
                if (faltantes.length > 0) {
                    SNotification.send({
                        title: "Complete lo campos requeridos.",
                        body: faltantes.join(", "),
                        time: 5000,
                        color: STheme.color.danger,
                    })
                    return;
                }
                if (!data.key) {
                    SubProducto = {
                        key: SUuid(),
                        key_usuario: Model.usuario.Action.getKey(),
                        estado: 1,
                        fecha_on: new SDate().toString() + "",
                        index: dta.index ?? 0,
                        nombre: dta.nombre,
                        descripcion: dta.descripcion,
                        cantidad_seleccion: dta.cantidad_maxima ?? 0,
                        cantidad_seleccion_minima: dta.cantidad_minima ?? 0,
                        key_producto: data.key_producto,
                        sub_producto_detalles: []
                    }
                } else {
                    SubProducto = {
                        ...data,
                        index: dta.index ?? 0,
                        nombre: dta.nombre,
                        descripcion: dta.descripcion,
                        cantidad_seleccion: dta.cantidad_maxima ?? 0,
                        cantidad_seleccion_minima: dta.cantidad_minima ?? 0,
                    }
                }
                if (this.props.onChange) this.props.onChange(SubProducto);
                SPopup.close("FormularioOpciones")
            }}>{"Guardar"}</BtnNaranja>
            <SHr h={16} />
        </SView>
    }
}





