import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SLoad, SNavigation, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../Model';

type indexPropsType = {
    key_cuenta_contable: any,
    codigo: String,
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
        SNavigation.navigate("/contabilidad/cuentas", {
            codigo: this.props.codigo,
            onSelect: (obj) => {
                this.setValue(obj)
                SNavigation.goBack();
            }
        })
    }

    render_content() {
        var obj = this.state.data;
        if (!obj || !obj?.key) {
            return <SView style={{
                padding: 8
            }}>
                <SText color={STheme.color.danger}>Seleccionar Cuenta Contable</SText>
            </SView>
        }
        return <SView style={{
            padding: 8
        }}>
            <SText>{obj.codigo} {obj.descripcion}</SText>
        </SView>
    }
    render() {
        if (this.props.value) {
            this.state.data = this.props.value;
        }
        if (this.props.key_cuenta_contable) {
            if (!this.state.data) {
                var data = Model.cuenta_contable.Action.getByKey(this.props.key_cuenta_contable);
                if (!data) return <SLoad />
                this.state.data = data;
            }
        }
        return (
            <SView col={"xs-12"} height={50} card onPress={!this.props.disabled ? this.handlePress.bind(this) : null} center>
                {this.render_content()}
            </SView>
        );
    }
}
