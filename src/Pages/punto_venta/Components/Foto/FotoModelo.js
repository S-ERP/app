import React, { Component } from 'react';
import { SImage, STheme } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import SIconApp from '../../../../Assets/SIconApp';
const sinFoto = 'https://cauder.com/wp-content/uploads/2020/12/producto-sin-imagen-600x600.jpg';
export default class FotoModelo extends Component {
    time = Date.now();
    render() {
        const data = this.props.data;
        if (!data) return null;
        const url = SSocket.api.inventario + "modelo/.128_" + data?.key + "?date=" + this.time;
        console.log("modelo url " + JSON.stringify(url));
        return !data?.key ? <SIconApp name='Caja' width={20} fill={STheme.color.text} /> : <SImage src={url}  />;
    }
}
