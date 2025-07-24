import React, { Component } from 'react';
import { SImage, STheme } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import SIconApp from '../../../Assets/SIconApp';
// src={"https://https://crm.servisofts.com/http/cliente.servisofts.com/http/cliente/"

export default class FotoCliente extends Component {
    render() {
        const data = this.props.data;
        if (!data) return null;
        const url = SSocket.api.crm + "cliente/" + data?.key;
        console.log("print url " + JSON.stringify(url));

        return !data?.key ? <SIconApp name='profile2' width={20} fill={STheme.color.text} /> : <SImage src={url} style={{ resizeMode: "cover" }} />;
    }
}
