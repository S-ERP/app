import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SImage, SInput, SText, STheme, SView } from 'servisofts-component';
import SIconApp from '../../../../Assets/SIconApp';
import SSocket from 'servisofts-socket';
import Input from '../../../restaurante/producto/Components/Input';

export default class ProductoItem extends Component {

    constructor(props) {
        super(props);
        this.state = {
            cantidad: 0,
            subtotal: 0,
            precio: 0,
        }
        this.reloadFromProps();
    }

    componentDidMount() {
        // this.reloadFromProps();
        // this.forceUpdate();
        // if (this.props.onLoad) {
        //     this.props.onLoad(this);
        // }
    }
    setCantidad(cantidad) {
        this.state.cantidad = cantidad;
        this.state.subtotal = (this.state.precio * (this.state.cantidad || 1));
        this.state.subtotal = parseFloat(this.state.subtotal.toFixed(2));
        if (this.inputPrecio) this.inputPrecio.setValue(this.state.subtotal);
        this.forceUpdate();
        this.updateCarrito()
        if (this.props.onChange) {
            this.props.onChange(this.props.data.carrito_edit);
        }

    }

    setPrecio(subtotal) {
        this.state.subtotal = parseFloat(subtotal) || 0;
        this.state.precio = (this.state.subtotal / (this.state.cantidad || 1)) || 0;
        this.state.precio = parseFloat(this.state.precio.toFixed(2));
        this.updateCarrito()
        if (this.props.onChange) {
            this.props.onChange(this.props.data.carrito_edit);
        }
    }

    updateCarrito() {
        if (this.state.cantidad <= 0) {
            delete this.props.data.carrito_edit
            return;
        }
        this.props.data.carrito_edit = {
            key_proyecto_producto: this.props.data?.producto?.key || this.props.data?.carrito?.key_proyecto_producto,
            key_producto: this.props.data?.producto?.key_producto || this.props.data?.carrito?.key_producto,
            key_modelo: this.props.data?.producto?.key_modelo || this.props.data?.carrito?.key_modelo,
            nombre: this.props.data?.producto?.producto?.descripcion,
            cantidad: this.state.cantidad || this.props.data?.carrito?.cantidad || 0,
            subtotal: this.state.subtotal || this.props.data?.carrito?.subtotal || 0,
        }
        if (this.props.data?.carrito?.key) {
            this.props.data.carrito_edit.key = this.props.data.carrito.key;
        }

    }

    reloadFromProps() {
        const { data } = this.props;
        const proyecto_producto = data?.producto;
        const producto = proyecto_producto?.producto;
        const carrito = data?.carrito;
        const editable = !!producto;

        this.state.cantidad = carrito?.cantidad || 0;
        if (carrito?.subtotal) {
            this.state.precio = (carrito?.subtotal / this.state.cantidad) || 0;
        } else {
            this.state.precio = producto?.precio_venta || 0;
        }

        this.state.subtotal = (this.state.precio * (this.state.cantidad || 1));
        if (this.inputPrecio) this.inputPrecio.setValue(this.state.subtotal.toString());
        if (this.inputCantidad) this.inputCantidad.setValue(this.state.cantidad);
        this.updateCarrito();
    }



    render() {
        const { data } = this.props;
        const proyecto_producto = data?.producto;
        const producto = proyecto_producto?.producto;
        const carrito = data?.carrito;
        const editable = !!producto;




        return <SView col={"xs-12"} padding={4}  >
            <SView row col={"xs-12"} center style={{
                opacity: this.state.cantidad <= 0 ? 0.4 : 1
            }}>
                <SView width={30} height={30} center style={{
                    borderRadius: 4,
                    overflow: "hidden",
                    backgroundColor: STheme.color.card,
                }}>
                    <SImage src={SSocket.api.inventario + "modelo/" + (producto?.key || carrito?.key_modelo)} style={{
                        resizeMode: "cover",
                    }} />
                </SView>
                <SView width={4} />
                <SView flex>
                    <SText bold>{producto?.descripcion || carrito?.nombre}</SText>
                    <SView row>
                        {producto && <SText clean style={{
                            fontSize: 10,
                            backgroundColor: STheme.color.warning,
                            padding: 2,
                            borderRadius: 4,

                        }}>Bs. {(producto?.precio_venta ?? 0)}</SText>}
                    </SView>
                </SView>
                <InputCantidad ref={(ref) => this.inputCantidad = ref} value={carrito?.cantidad ?? 0} onChange={(value) => {
                    this.setCantidad(value);
                }}
                    disabled={!editable}
                />
                <SView width={50} height={30}>
                    {/* <SInput ref={(ref) => this.inputPrecio = ref}
                        type="number"
                        defaultValue={} height={30} icon={<SView />}
                        style={{ padding: 0, paddingLeft: 4, paddingRight: 4, textAlign: "right", opacity: !editable ? 0.7 : 1, }}
                        onChangeText={v => {
                            this.setPrecio(v);
                        }}
                        disabled={!editable}
                    /> */}

                    <Input
                        ref={(ref) => this.inputPrecio = ref}
                        // col={"xs-4.5"}
                        height={30}
                        // label={"Precio Bs. *"}
                        defaultValue={!this.state.subtotal ? null : parseFloat(this.state.subtotal ?? "0").toFixed(2)}
                        keyboardType={"numeric"}
                        inputStyle={{
                            textAlign: "right",
                            paddingEnd: 4,
                            paddingStart: 0,
                        }}
                        disabled={!editable}
                        onChangeText={v => {
                            this.setPrecio(v);
                        }}
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
                    // onSubmitEditing={() => this._inputs["limite_compra"].focus()}

                    />
                    {producto && <SText clean style={{
                        position: "absolute",
                        right: 0, bottom: -10,
                        fontSize: 10,
                        backgroundColor: STheme.color.warning,
                        padding: 2,
                        borderRadius: 4,
                        textDecorationLine: "line-through"
                    }}>Bs. {(producto?.precio_venta ?? 0) * (this.state.cantidad || 1)}</SText>}
                </SView>


            </SView>
            {!proyecto_producto && <SText fontSize={10} color={STheme.color.warning}>Warning: El producto ya no se encuentra en el proyecto!</SText>}

            {/* <SHr h={4} />
            <SView onPress={() => {
                console.log(this.props.data)
            }}>
                <SText color={!!carrito ? STheme.color.success : STheme.color.warning}>Tiene carrito? {!!carrito ? "SI" : "NO"}</SText>
                {!!carrito && <SView style={{ paddingStart: 8 }}>
                    <SText>Nombre: {carrito?.nombre ?? ""}</SText>
                    <SText>{carrito?.cantidad ?? 0} x  Bs.{0}  = Bs.{carrito?.subtotal ?? 0}</SText>
                </SView>}
                <SHr h={4} />
                <SText color={!!producto ? STheme.color.success : STheme.color.warning}>Tiene producto? {!!producto ? "SI" : "NO"}</SText>
                {!!producto && <SView style={{ paddingStart: 8 }}>
                    <SText>Nombre: {producto?.nombre ?? ""}</SText>
                    <SText>Precio: {producto?.precio ?? 0}</SText>
                </SView>}
            </SView> */}
        </SView >
    }
}




class InputCantidad extends Component {
    state = {
        value: this.props.value || 0,
    }

    setValue = (value) => {
        if (this.props.disabled) return;
        if (value < 0) {
            value = 0;
        }
        this.setState({ value });
        if (this.props.onChange) this.props.onChange(value);
    }
    render() {
        const height = 25
        const disabled = this.props.disabled
        const opacity = (this.state.value <= 0 || disabled) ? 0.4 : 1;
        return <SView row width={90} >
            <SView style={{
                width: height, height: height, borderRadius: 100,
                backgroundColor: STheme.color.secondary,
                opacity: opacity,
                transform: [{ translateX: +5 }]
            }} card center
                onPress={this.props.disabled ? null : () => {
                    this.setValue(this.state.value - 1);
                }}>
                <SText fontSize={22} color={STheme.color.primary} >{"-"}</SText>
            </SView>
            <SView flex height={height}>
                <SInput style={{
                    padding: 0,
                    paddingLeft: 0,
                    paddingRight: 0,
                    textAlign: "center",
                    fontSize: 12,
                }} height={height} type="number" value={this.state.value} onChangeText={(value) => {
                    this.setValue(value);
                }}
                    onKeyPress={(e) => {
                        // Cuando aga hacia arriba o abajo, se incrementa o decrementa la value
                        if (e.nativeEvent.key === "ArrowUp") {
                            this.setValue(this.state.value + 1);
                            e.preventDefault(); // Evita el comportamiento por defecto del input
                        } else if (e.nativeEvent.key === "ArrowDown") {
                            this.setValue(this.state.value - 1);
                            e.preventDefault(); // Evita el comportamiento por defecto del input
                        }
                    }}
                    disabled={this.props.disabled}
                />
            </SView>
            <SView style={{
                width: height, height: height, borderRadius: 100,
                backgroundColor: STheme.color.secondary,
                opacity: disabled ? 0.4 : 1,
                transform: [{ translateX: -5 }]
            }} card center onPress={this.props.disabled ? null : () => {
                this.setValue(this.state.value + 1);
            }}>
                <SText fontSize={14} bold color={STheme.color.primary}>{"+"}</SText>
            </SView>

        </SView>
    }
}