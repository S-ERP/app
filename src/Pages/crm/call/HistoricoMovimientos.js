import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SText, STheme, SView } from 'servisofts-component';
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
        }).then(e => {
            this.setState({ historico: e.data });
        }).catch(error => {

        })
    }


    render() {
        return (
            <View>
                <Text> HistoricoMovimientos </Text>
                {this.state.historico.map(e => {
                    return <SView row center padding={4}>
                        <SText fontSize={10} color={STheme.color.gray}>{new SDate(e.fecha_on, "yyyy-MM-ddThh:mm:ss").toString("yyyy-MM-dd hh:mm")}</SText>
                        <SView width={8} />
                        <SText>{e.state}</SText>
                        <SView flex />
                    </SView>
                })}
            </View>
        );
    }
}
