import React, { Component } from 'react';
import { View, Text } from 'react-native';
import SSocket from 'servisofts-socket';
import Model from '../../../Model';
import { SIcon, SInput, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';

export default class Entorno extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ambiente: MDL.factura.ambiente
        };
    }

    componentDidMount() {
    }

    render() {
        return <SView width={150} height={30} style={{
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10,
            backgroundColor: STheme.color.secondary,
            padding: 8,
            borderWidth: 1,
            borderColor: this.props.ambiente == 1 ? STheme.color.success : STheme.color.warning,
        }} row center
            onPress={() => { this.props.onPress() }}
        >
            <SText fontSize={12} color={STheme.color.background} center bold >{this.props.ambiente == 1 ? "PRODUCCIÓN" : "PRUEBA"}</SText>
            <SView flex />
            <SIcon name='Reload' width={10} />
        </SView>
    }
}
