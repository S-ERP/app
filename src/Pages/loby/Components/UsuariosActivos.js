import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SImage, SList, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../../Model';

export default class UsuariosActivos extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };

    }
    componentDidMount() {
        SSocket.sendPromise({
            service: "empresa",
            component: "empresa_usuario",
            type: "getAll",
            key_empresa: Model.empresa.Action.getKey()

        }).then(e => {
            this.setState({ data: e.data })
        })
    }

    usuarioItem = ({ alias, key_usuario }) => {
        return <SView width={80} height={80} center>
            <SView style={{ width: 60, height: 60, borderRadius: 100, }}>
                <SView style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 100,
                    borderWidth: 2,
                    borderColor: STheme.color.card,
                    backgroundColor: STheme.color.card,
                    overflow:"hidden"
                }}>

                    <SImage src={Model.usuario._get_image_download_path(SSocket.api, key_usuario)} />
                </SView>
                <SView style={{
                    width: 14,
                    height: 14,
                    borderRadius: 100,
                    backgroundColor: STheme.color.success,
                    position: "absolute",
                    bottom: 0,
                    right: 0
                }} />
            </SView>
            <SText fontSize={10} center row height={13} style={{
                overflow: 'hidden',
            }}>{alias}</SText>

        </SView>
    }
    render() {
        return <SView col={"xs-12"} height={110} >
            <SText> Usuarios</SText>
            <SHr />
            <SList
                horizontal
                data={this.state.data}
                render={(a) => this.usuarioItem(a)}
            />
        </SView>
    }
}
