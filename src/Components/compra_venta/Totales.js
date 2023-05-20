import React, { Component } from 'react';
import { SDate, SHr, SImage, SList, SLoad, SMath, SNavigation, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket'
import Model from '../../Model';
export default class Totales extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    data = {}
    totales_item({ label, value, bold }) {
        return <SView col={"xs-12"} row>
            <SText bold={bold} flex style={{ alignItems: 'end', textAlign: "end" }}>{label}</SText>
            <SView width={8} />
            <SText flex style={{ alignItems: 'end', textAlign: "end" }}>{SMath.formatMoney(value)}</SText>
        </SView>
    }

    totales() {
        var t = Model.compra_venta_detalle.Action.getTotales({
            key_compra_venta: this.data.key
        })
        if (!t) return null;
        this.state.totales = t;
        return <SView col={"xs-12"} center>
            <SHr />
            {this.totales_item({ label: "SUBTOTAL Bs.", value: this.state.totales.subtotal })}
            <SHr height={4} />
            {this.totales_item({ label: "DESCUENTO Bs.", value: this.state.totales.descuento })}
            <SHr height={4} />
            {this.totales_item({ label: "TOTAL Bs.", value: this.state.totales.total })}
            <SHr height={4} />
            {this.totales_item({ label: "MONTO GIFCARD Bs.", value: this.state.totales.gifcard })}
            <SHr height={4} />
            {this.totales_item({ label: "TOTAL A PAGAR Bs.", bold: true, value: this.state.totales.total_a_pagar })}
            <SHr height={4} />
            {this.totales_item({ label: "IMPORTE BASE CREDITO FISCAL", bold: true, value: this.state.totales.credito_fiscal })}
            <SHr />
            <SHr />
            <SText center>{"SON: " + SMath.numberToLetter(this.state.totales.total_a_pagar)}</SText>
        </SView>
    }
    render() {
        this.data = this.props.data;
        return this.totales()
    }
}
