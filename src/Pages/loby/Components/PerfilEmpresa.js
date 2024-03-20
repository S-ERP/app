import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SImage, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../Model';
import SSocket from 'servisofts-socket';

export default class PerfilEmpresa extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const empresa = Model.empresa.Action.getSelect();
        // Model.usuarioPage.Action.getRoles();
        return <SView col={"xs-12"} padding={8} style={{
            height: 140,
        }} center>
            <SHr />
            <SView width={100} height={100} style={{
                borderRadius: 100,
                borderWidth: 2,
                borderColor: STheme.color.card,
                overflow: "hidden"
            }}>
                <SImage src={Model.empresa._get_image_download_path(SSocket.api, empresa.key)} />
            </SView>
            <SHr />
            <SView padding={4}>
                <SText bold fontSize={20}>{empresa.razon_social}</SText>
            </SView>
            <SHr />
        </SView>
    }
}
