import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SNavigation, SText, STheme, SView } from 'servisofts-component';

type indexPropsType = {
    key_empresa: any,
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
        SNavigation.navigate("/sucursal/list", {
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
                <SText color={STheme.color.danger}>Seleccionar sucursal</SText>
            </SView>
        }
        return <SView style={{
            padding: 8
        }}>
            <SText>{obj.descripcion}</SText>
        </SView>
    }
    render() {
        if (this.props.value) {
            this.state.data = this.props.value;
        }
        return (
            <SView col={"xs-12"} height={50} card onPress={!this.props.disabled ? this.handlePress.bind(this) : null} center>
                {this.render_content()}
            </SView>
        );
    }
}
