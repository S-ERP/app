import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SNotification, SPage, SText, STheme } from 'servisofts-component';
import MDL from '../../../MDL';

export default class index2 extends React.Component {
    _____ambiente = MDL.factura.getAmbiente();

    constructor(props: any) {
        super(props);
        this.state = {
        };
    }




    componentDidMount(): void {
        SNotification.send({
            key: "ambienteFacturacion",
            title: this._____ambiente === 1 ? "Modo PRODUCCIÓN" : "Modo PRUEBA",
            body: this._____ambiente === 1 ? "Estás en modo de facturación PRODUCCIÓN." : "Estás en modo de facturación de PRUEBA",
            color: this._____ambiente === 1 ? STheme.color.success : STheme.color.warning,
            time: 10000,
        })

    }

    render() {
        return <SPage title={`Emitir Factura (Ambiente: ${this._____ambiente === 1 ? "Producción ✅" : "Prueba 🛠️"})`}>
            <SText>{this._____ambiente}</SText>
        </SPage>

    }
}
