import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SText } from 'servisofts-component';
import SSocket from 'servisofts-socket';

export default class HistoricoMovimientos extends Component {
    constructor(props) {
        super(props);
        this.state = {
            historico: [],
        };
    }

    componentDidMount() {
        SSocket.sendPromise({
            service: "crm",
            component: "cliente_proyecto",
            type: "getHistoricoByKey",
            key: this.props.key_cliente_proyecto
        }).then(e=>{
            this.setState({ historico: e.data });
        }).catch(error => {

        })
    }


    render() {
        return (
            <View>
                <Text> HistoricoMovimientos </Text>
                {this.state.historico.map(e=>{
                    return <SText>{e.state} {e.fecha_on}</SText>
                })}
            </View>
        );
    }
}
