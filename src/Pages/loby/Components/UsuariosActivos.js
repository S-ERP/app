import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SImage, SList, SNavigation, SText, STheme, SUuid, SView } from 'servisofts-component';
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


    toChat(key_usuario) {
        const key = Model.empresa.Action.getKey();
        Model.chat.Action.registro({
            data: {
                key: key,
                descripcion: "Chat de la empresa " + Model.empresa.Action.getSelect().razon_social,
                observacion: "--",
                color: "#000000",
                tipo: "empresa",
            },
            users: [
                { key_usuario: Model.usuario.Action.getKey(), tipo: "admin", },
                { key_usuario: key_usuario, tipo: "admin", },
            ],
            key_usuario: Model.usuario.Action.getKey()
        }).then((resp) => {
            SNavigation.navigate("/chat/profile", { pk: key })
        }).catch(e => {
            // Model.chat.Action.CLEAR();
            // Model.chat_usuario.Action.CLEAR();
            SNavigation.navigate("/chat/profile", { pk: key })
        })
    }
    usuarioItem = ({ alias, key_usuario }) => {
        return <SView width={75} height={80} center onPress={() => {
            SNavigation.navigate("/usuario/profile", { pk: key_usuario })
        }}>
            <SView style={{ width: 60, height: 60, borderRadius: 100, }}>
                <SView style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 100,
                    borderWidth: 2,
                    borderColor: STheme.color.card,
                    backgroundColor: STheme.color.card,
                    overflow: "hidden"
                }}>
                    <SImage style={{
                        resizeMode:"cover"
                    }} src={Model.usuario._get_image_download_path(SSocket.api, key_usuario)} />
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
            <SText fontSize={10} col={"xs-12"} bold center row height={13} style={{
                overflow: 'hidden',
            }}>{alias}</SText>

        </SView>
    }
    render() {
        return <SView col={"xs-12"} height={100} >
            <SText bold fontSize={12}> Usuarios</SText>
            <SList
                horizontal
                data={this.state.data}
                render={(a) => this.usuarioItem(a)}
            />
        </SView>
    }
}
