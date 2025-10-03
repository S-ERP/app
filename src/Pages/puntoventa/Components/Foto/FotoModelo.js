import React, { Component } from 'react';
import { SImage, STheme } from 'servisofts-component';
import SSocket from 'servisofts-socket';
const sinFoto = 'https://cauder.com/wp-content/uploads/2020/12/producto-sin-imagen-600x600.jpg';
export default class FotoModelo extends Component {
    prefix = this.props.prefix ?? ".128_"
    time = Date.now();
    render() {
        const data = this.props.data;
        const url = SSocket.api.inventario + "modelo/" + this.prefix + data?.key + "?date=" + this.time;
        return <SImage src={url} style={{ overflow: "hidden", resizeMode: "cover", borderRadius: 8, width: "100%" }} />
    }
}
