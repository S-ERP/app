import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SImage, SText, STheme, SView } from 'servisofts-component';
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
                {this.state.historico.sort((a, b) => {
                    return new SDate(b.fecha_on, "yyyy-MM-ddThh:mm:ss").getTime() - new SDate(a.fecha_on, "yyyy-MM-ddThh:mm:ss").getTime();
                }).map(e => {
                    return <SView row center padding={4} style={{
                        borderBottomWidth: 1,
                        borderColor: STheme.color.card,
                        // marginBottom: 4
                    }}>
                        <SText fontSize={10} color={STheme.color.gray}>{new SDate(e.fecha_on, "yyyy-MM-ddThh:mm:ss").toString("yyyy-MM-dd hh:mm")}</SText>
                        <SView width={8} />
                        <SText>{e.state}</SText>
                        <SView flex />
                        <SView width={20} height={20} style={{
                            borderRadius: 100,
                            overflow: "hidden",
                        }}>
                            <SImage src={SSocket.api.root + "usuario/" + e.data?.key_usuario_atiende} style={{ resizeMode: "cover" }} />
                        </SView>
                    </SView>
                })}
            </View>
        );
    }
}
