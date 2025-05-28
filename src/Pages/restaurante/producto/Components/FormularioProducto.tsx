import React, { Component, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SHr, SInput, SNavigation, SPage, SPopup, SText, STheme, SThread, SView } from 'servisofts-component';
import Input from './Input';

const color = "#000000"
const colorGray = "#999999"
const colorGray2 = "#BBBBBB"
const colorCard = "#EEEEEE"
const font = 'Montserrat'




export default class FormularioProducto extends Component<any> {
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

        this.props.producto.nombre = resp.nombre;
        this.props.producto.index = resp.index;
        this.props.producto.descripcion = resp.descripcion;
        this.props.producto.key_categoria_producto = resp.key_categoria_producto;
        this.props.producto.precio = resp.precio;
        this.props.producto.limite_compra = resp.limite_compra;

        this.props.producto.categoria = this._inputs["key_categoria_producto"].getData();

        return resp;
        console.log(resp);

    }

    render() {
        const data = this.props.producto ?? {};
        return <SView col={"xs-12"}>
            <SView row col={"xs-12"} style={{
                justifyContent: "space-between"
            }}>
                <Input
                    ref={ref => this._inputs["nombre"] = ref}
                    col={"xs-7"}
                    defaultValue={data.nombre}
                    label={"Nombre del Producto/Item *"}
                    info={"Ejemplo: Hamburguesa clasica, Pir de limón"}
                    placeholder={"Nombre del Producto/Item"}
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
                label={"Descripción del Producto/Item"}
                info={"Ejemplo: 150gr carne, queso cheddar, tocino."}
                placeholder={"Descripción del Producto/Item"}
                multiline
                height={70}
                inputStyle={{
                    paddingTop: 8,
                    textAlignVertical: "top",
                }}
                onSubmitEditing={() => this._inputs["key_categoria_producto"].focus()}
            />
            <SHr h={16} />
            <SView row col={"xs-12"} style={{
                justifyContent: "space-between"
            }}>
                <Input
                    ref={ref => this._inputs["key_categoria_producto"] = ref}
                    col={"xs-7"}
                    onPress={(e: any) => {
                        SNavigation.navigate("/restaurante/categoria_producto/list", {
                            key_restaurante: this.props.key_restaurante,
                            onSelect: (cp: any) => {
                                console.log(cp)
                                this._inputs["key_categoria_producto"].setValue(cp.key)
                                this._inputs["key_categoria_producto"].setData(cp)
                            }
                        })
                    }}
                    defaultData={data.categoria}
                    renderValue={({ data, value }) => {
                        return data?.nombre;
                    }}
                    defaultValue={data.key_categoria_producto}
                    label={"Categoría *"}
                    info={"Ejemplo: Hamburgesas, Bebidas, Postres"}
                    placeholder={"Elegi una Categoría"}
                    onSubmitEditing={() => this._inputs["precio"].focus()}
                />
                <Input
                    ref={ref => this._inputs["precio"] = ref}
                    col={"xs-4.5"}
                    label={"Precio Bs. *"}
                    defaultValue={!data.precio ? null : parseFloat(data.precio).toFixed(2)}
                    keyboardType={"numeric"}
                    // info={"Orden de posicionamiento en lista"}
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
                    placeholder={"Bs. 0,00"}
                    onSubmitEditing={() => this._inputs["limite_compra"].focus()}

                />

            </SView>
            <SHr h={16} />
            <Input
                ref={ref => this._inputs["limite_compra"] = ref}
                col={"xs-7"}
                defaultValue={data.limite_compra}
                label={"Límite de Compra"}
                filter={(e: any) => {
                    return e.replace(/[^0-9]/g, '');
                }}
                info={"Cantidad de productos/items que se podrá comprar en cada pedido"}
                placeholder={"0"}
                keyboardType={"numeric"}
            />
        </SView>
    }
}





