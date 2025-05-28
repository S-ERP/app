import React, { Component, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SDate, SHr, SInput, SNavigation, SNotification, SPage, SPopup, SText, STheme, SThread, SUtil, SUuid, SView } from 'servisofts-component';
import Input, { InputValidator } from './Input';
import BtnNaranja from './BtnNaranja';
import { ProductoType, SubProductoDetalleType, SubProductoType } from '../types';
import Model from '../../../../Model';
import PageTitle from '../../../../Components/PageTitle';

const color = "#000000"
const colorGray = "#999999"
const colorGray2 = "#BBBBBB"
const colorCard = "#EEEEEE"
const font = 'Montserrat'




export default class FormularioSubProductos extends Component<any> {

    static openPopup(props: { data: any, onChange: (e: any) => void }) {
        SPopup.open({
            key: "FormularioSubProductos",
            type: "2",
            content: <SView col={"xs-12"} height backgroundColor='#000000AA' padding={8} center>
                <SView col={"xs-12 sm-10 md-8 lg-6 xl-4"} backgroundColor={STheme.color.background} borderRadius={16} padding={8} withoutFeedback>
                    <FormularioSubProductos data={props.data} onChange={props.onChange.bind(this)} />
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
            <PageTitle title='AGREGAR SUBPRODUCTOS'/>
            <SHr h={16} />
            <SView row col={"xs-12"} style={{
                justifyContent: "space-between"
            }}>
                <Input
                    ref={ref => this._inputs["nombre"] = ref}
                    col={"xs-7"}
                    defaultValue={data.nombre}
                    label={"Nombre de Subproducto *"}
                    placeholder={"Nombre de Subproducto"}
                    info={"Ejemplo: Arroz, papa frita, plátano, fresas, leche condensada"}
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
                label={"Descripción de Subproducto"}
                placeholder={"Descripción de Subproducto"}
                info={"Ejemplo: Porción, unidad, 150gr."}
                multiline
                height={50}
                inputStyle={{
                    paddingTop: 8,
                    textAlignVertical: "top",
                }}
                onSubmitEditing={() => this._inputs["precio"].focus()}
            />
            <SHr h={16} />
            <SView row col={"xs-12"} style={{
                justifyContent: "space-between"
            }}>
                <Input
                    ref={ref => this._inputs["precio"] = ref}
                    col={"xs-4.5"}
                    label={"Precio Bs."}
                    placeholder={"Bs. 0,00"}
                    defaultValue={!data.precio ? null : parseFloat(data.precio ?? 0).toFixed(2)}
                    keyboardType={"numeric"}
                    info={"En caso que tenga un costo, se adicionará al precio del producto"}
                    filter={(e: any) => {
                        // Permite solo números, un único punto o coma
                        let numericText = e.replace(/[^0-9.,]/g, '');

                        // Reemplaza comas con puntos para manejar ambos como decimales
                        numericText = numericText.replace(/,/g, '.');

                        const parts = numericText.split('.');

                        if (parts.length > 2) {
                            // Si hay más de un punto, elimina los extras
                            numericText = parts[0] + '.' + parts[1];
                        }

                        if (parts[1] && parts[1].length > 2) {
                            // Limita a dos decimales
                            numericText = parts[0] + '.' + parts[1].slice(0, 2);
                        }
                        return numericText

                    }}
                // onSubmitEditing={() => this._inputs["limite_compra"].focus()}

                />

            </SView>
            <SText width={210} center fontSize={6.5} font={"Montserrat-SemiBold"} color={colorGray2}>{"Para ingresar una cantidad obligatoria, por ejemplo 2, ingresa el mismo número como mínimo y máximo"}</SText>
            <SHr h={16} />
            <BtnNaranja onPress={() => {
                let SubProductoDetalle: SubProductoDetalleType;
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
                    SubProductoDetalle = {
                        key: SUuid(),
                        key_usuario: Model.usuario.Action.getKey(),
                        estado: 1,
                        fecha_on: new SDate().toString() + "",
                        index: dta.index ?? 0,
                        nombre: dta.nombre,
                        descripcion: dta.descripcion,
                        precio: dta.precio,
                        key_sub_producto: data.key_sub_producto,
                    }
                } else {
                    SubProductoDetalle = {
                        ...data,
                        index: dta.index ?? 0,
                        nombre: dta.nombre,
                        descripcion: dta.descripcion,
                        precio: dta.precio,
                    }
                }
                if (this.props.onChange) this.props.onChange(SubProductoDetalle);
                SPopup.close("FormularioSubProductos")
            }}>{"Guardar"}</BtnNaranja>
            <SHr h={16} />
        </SView>
    }
}





