import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SText, STheme } from 'servisofts-component';

export default class HoraLabel extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const hora = this.props.mesaje.timestamp * 1000;
        // Aquí puedes formatear la hora como desees, por ejemplo:
        // const formattedTime = new Date(hora).toISOString().slice(11, 16); // Formato HH:mm:ss
        const formattedTime = new SDate(new Date(hora)).toString("hh:mm");
        // No esta otmando en cuenta la zona horaria, si es necesario, puedes ajustarlo según tu necesidad.


        const formattedTimeAMPM = new SDate(new Date(hora)).toString("HH");
        // O simplemente mostrar la hora sin formatear
        // return <Text>{formattedTime}</Text>;
        return <SText clean fontSize={10} color={STheme.color.lightGray} {...this.props}>{formattedTimeAMPM}</SText>
    }
}
