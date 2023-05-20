import React, { Component } from 'react';
import { SButtom, SHr, SIcon, SImage, SList, SLoad, SMath, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../Model';
import _types from './_types';
import SSocket from 'servisofts-socket';
import Components from '../../../Components';
export default class Cajero extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }


    render() {
        var data = this.props.data;
        var usuario = Model.usuario.Action.getByKey(data.key_usuario);
        if (!usuario) return <SLoad />
        return (<SView col={"xs-12"} card style={{
            padding: 4
        }}>
            <Components.label.float label={"Cajero"} />
            <SView col={"xs-12"} row center style={{
                padding: 4
            }}>
                <Components.usuario.ProfileImage key_usuario={data.key_usuario} size={20} />
                <SView width={8} />
                <SText>{usuario?.Nombres} {usuario?.Apellidos}</SText>
            </SView>
        </SView>
        );
    }
}