import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SImage, SNavigation, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../Model';
import SSocket from 'servisofts-socket';

export default class MyPerfil extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const usuario = Model.usuario.Action.getUsuarioLog();
        // Model.usuarioPage.Action.getRoles();
        return <SView col={"xs-12"} padding={4} center>
            <SView col={"xs-12"} card padding={8} style={{
                height: 100, 
            }} onPress={() => {
                SNavigation.navigate("/profile")
            }}>
                <SHr />
                <SView row >
                    <SView width={50} height={50} style={{
                        borderRadius: 100,
                        overflow: "hidden",
                        borderColor: STheme.color.primary,
                        borderWidth: 1
                    }}>
                        <SImage src={Model.usuario._get_image_download_path(SSocket.api, usuario.key)} />
                    </SView>
                    <SView flex padding={4} >
                        <SText bold fontSize={12}>{usuario.Nombres} {usuario.Apellidos}</SText>
                        <SText fontSize={10}>{usuario.Correo}</SText>
                    </SView>
                </SView>
                <SHr />
                {/* <SText></SText> */}
            </SView>
        </SView>
    }
}
