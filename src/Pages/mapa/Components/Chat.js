import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SImage, SList, SNavigation, SText, STheme, SUuid, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../../Model';

export default class Chat extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    toChat() {
        const key = Model.empresa.Action.getKey();
        SNavigation.navigate("/chat", { pk: key })

        return;
        Model.chat.Action.registro({
            data: {
                key: key,
                descripcion: Model.empresa.Action.getSelect().razon_social,
                observacion: "--",
                color: "#000000",
                tipo: "empresa",
            },
            users: [
                { key_usuario: Model.usuario.Action.getKey(), tipo: "admin", },
                // { key_usuario: key_usuario, tipo: "admin", },
            ],
            key_usuario: Model.usuario.Action.getKey()
        }).then((resp) => {
        }).catch(e => {
            // Model.chat.Action.CLEAR();
            // Model.chat_usuario.Action.CLEAR();
            SNavigation.navigate("/chat", { pk: key })
        })
    }
    render() {
        if (this.props.children) return <SView onPress={() => this.toChat()}>{this.props.children}</ SView>
        return <SText padding={8} card border={STheme.color.primary} onPress={() => this.toChat()}>{this.props.label ?? "Chat"}</SText>

    }
}
