import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SNavigation, SText, STheme, SView } from 'servisofts-component';
import Components from '../..';

type indexPropsType = {
    key_sucursal: String,
    value?: any,
    defaultValue?: any,
    onChange?: () => any,
    disabled?: boolean


}
export default class index extends Component<indexPropsType> {
    constructor(props) {
        super(props);
        this.state = {
            data: this.props?.defaultValue
        };
    }
    setValue(obj) {
        if (this.props.onChange) {
            this.props.onChange(obj);
        }
        this.setState({ data: obj })
    }
    getValue() {
        return this.state.data;
    }
    handlePress() {
        SNavigation.navigate("/empresa/punto_venta", {
            key_sucursal: this.props.key_sucursal,
            onSelect: (obj) => {
                this.setValue(obj)
            }
        })
    }

    render_content() {
        var obj = this.state.data;
        if (!obj) {
            return <SView style={{
                padding: 8
            }}>
                <SText color={STheme.color.danger}>Seleccionar punto de venta</SText>
            </SView>
        }
        return <SView style={{
            padding: 4
        }} col={"xs-12"} center>
            <Components.label.float label={"P. de venta"} />
            <SText bold>{obj.descripcion}</SText>
            <SText fontSize={12}>{obj.observacion}</SText>
            <SText color={STheme.color.lightGray} fontSize={10}>Moneda fraccionada: {!!obj.fraccionar_moneda ? "SI" : "NO"}</SText>
        </SView>
    }
    render() {
        if (!this.props.key_sucursal) return null;
        if (this.props.value) {
            this.state.data = this.props.value
        }
        if (this.state.data) {
            if (this.state.data.key_sucursal != this.props.key_sucursal) {
                this.state.data = null;
            }
        }
        return (
            <SView col={"xs-12"} height={50} card onPress={!this.props.disabled ? this.handlePress.bind(this) : null} center>
                {this.render_content()}
            </SView>
        );
    }
}
