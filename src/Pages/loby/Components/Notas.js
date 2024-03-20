import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SHr, SList, SNavigation, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../../Model';

export default class Notas extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };

    }
    componentDidMount() {
        SSocket.sendPromise({
            component: "nota",
            type: "getAll",
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey()
        }).then(e => {
            this.setState({ data: e.data })
        })
    }

    Item = ({ observacion, fecha_on, cantidad_participantes, key }) => {
        return <SView padding={4} >
            <SView style={{
                width: 120,
                height: 110,
                backgroundColor: "#EDE485",
                borderBottomRightRadius: 10
            }} padding={4} onPress={() => { SNavigation.navigate("/nota", { pk: key }) }}>
                <SHr />
                <SView col={"xs-12"} flex style={{
                    overflow: "hidden"
                }}>
                    <SText fontSize={12} color={"#000"}>{observacion}</SText>
                </SView>
                <SView row>
                    <SText color={"#666"} fontSize={10}>{new SDate(fecha_on, "yyyy-MM-ddThh:mm:ss").toString("MON dd, yyyy")}</SText>
                    <SView flex />
                    <SText color={"#666"} fontSize={10}>+ {cantidad_participantes}</SText>
                </SView>
            </SView>
        </SView>
    }
    render() {
        return <SView col={"xs-12"} >
            <SView row>
                <SText> Notas</SText>
                <SView width={8} />
                <SText onPress={() => SNavigation.navigate("/nota")}> + </SText>
            </SView>
            <SHr />
            <SList
                horizontal
                data={this.state.data}
                render={(a) => this.Item(a)}

            />
        </SView>
    }
}
