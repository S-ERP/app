import React, { Component } from 'react';
import { SImage, STheme } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import SIconApp from '../../../../Assets/SIconApp';
export default class FotoCliente extends Component {
    render() {
        const data = this.props.data;
        if (!data) return null;
        const url = SSocket.api.crm + "cliente/" + data?.key;

        return !data?.key ? <SIconApp name='profile2' width={20} fill={STheme.color.text} /> : <SImage src={url} style={{ resizeMode: "cover" }} />;
    }
}
