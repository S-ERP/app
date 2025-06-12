import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SText, STheme } from 'servisofts-component';

export default class HoraLabel extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const hora = this.props.mesaje.timestamp * 1000;
        // Aquí puedes formatear la hora como desees, por ejemplo:
        const formattedTime = new Date(hora).toISOString().slice(11, 16); // Formato HH:mm:ss
        // O simplemente mostrar la hora sin formatear
        // return <Text>{formattedTime}</Text>;
        return <SText fontSize={11} color={STheme.color.lightGray} {...this.props}>{formattedTime}</SText>
    }
}
