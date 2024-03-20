import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SImage, SText, SView } from 'servisofts-component';
import Model from '../../../Model';
import SSocket from 'servisofts-socket';

export default class MyBilletera extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const usuario = Model.usuario.Action.getUsuarioLog();
        // Model.usuarioPage.Action.getRoles();
        return <SView col={"xs-12"} padding={4} center>
            <SView col={"xs-12"} style={{
                borderRadius: 8,
                height: 100,
                backgroundColor: "#002"
            }} padding={8}>
                <SText color={"#fff"} fontSize={16} font='Cascadia'>BILLETERA MOVIL</SText>
                <SView flex />
                <SText color={"#fff"} fontSize={22} bold col={"xs-12"} style={{
                    alignItems: "flex-end"
                }}>Bs.   0,00</SText>
            </SView>
        </SView>
    }
}
