import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SImage, SNavigation, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../Model';
import SSocket from 'servisofts-socket'
import Components from '../..';
type indexPropsType = {
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
            }} col={"xs-12"} center>
                <SText color={STheme.color.danger}>Seleccionar sucursal</SText>
            </SView>
        }
        return <SView style={{
            padding: 8
        }} col={"xs-12"} height center>
            <Components.label.float label={"Sucursal"}/>
            <SView col={"xs-12"} center row>
                <SView width={35} height={35} card style={{
                    overflow: "hidden"
                }}>
                    <SImage src={Model.sucursal._get_image_download_path(SSocket.api, obj.key)} />
                </SView>
                <SView width={8} />
                <SText fontSize={18}>{obj.descripcion}</SText>
            </SView>
        </SView>
    }
    render() {
        if (this.props.value) {
            this.state.data = this.props.value;
        }
        return (
            <SView col={"xs-12"} height={60} card onPress={!this.props.disabled ? this.handlePress.bind(this) : null} center>
                {this.render_content()}
            </SView>
        );
    }
}
