import React, { Component } from 'react';
import { SDate, SHr, SImage, SList, SLoad, SMath, SNavigation, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../../MDL';
export default class TotalesVenta extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    data = {}

    componentDidMount() {
        this.getMonedas()
    }

    async getMonedas() {
        try {
            let monedas = await MDL.empresa.getMonedas();
            this.setState({ monedas: monedas });
        } catch (error) {
            console.log(error)
        }
    }

    totales_item({ label, value, bold, bold2 }) {
        return <SView col={"xs-12"} row>
            <SText bold={bold} col={"xs-6 sm-8 md-9"} style={{ alignItems: 'end', textAlign: "end" }}>{label}</SText>
            <SView width={8} />
            <SText flex bold={bold2} style={{ alignItems: 'end', textAlign: "end" }}>{SMath.formatMoney(value)}</SText>
        </SView>
    }

    totales() {
        let t = MDL.compra_venta.getTotales(this.data)
        if (!t) return null;
        this.state.totales = t;
        if (!this.state.monedas) return null;
        let moneda = this.state.monedas.find(m => m.key === this.data.key_moneda) || { observacion: "", descripcion: "" };
        return <SView col={"xs-12"} center>
            <SHr />
            {this.totales_item({ label: `SUBTOTAL ${moneda.observacion}`, bold: true, value: this.state.totales.subtotal })}
            <SHr height={4} />
            {this.totales_item({ label: `DESCUENTO ${moneda.observacion}`, bold: true, value: this.state.totales.descuento })}
            <SHr height={4} />
            {this.totales_item({ label: `TOTAL ${moneda.observacion}`, bold: true, value: this.state.totales.total })}
            <SHr height={4} />
            {this.totales_item({ label: `MONTO GIFCARD ${moneda.observacion}`, bold: true, value: this.state.totales.gifcard })}
            <SHr height={4} />
            {this.totales_item({ label: `TOTAL A PAGAR ${moneda.observacion}`, bold: true, bold2: true, value: this.state.totales.total_a_pagar })}
            <SHr height={4} />
            {this.totales_item({ label: `IMPORTE BASE CREDITO FISCAL ${moneda.observacion}`, bold: true, value: isNaN(this.props.data?.precio_facturado) ? 0 : this.props.data?.precio_facturado })}
            <SHr />
            <SHr />
            <SText bold col={"xs-12"} style={{textTransform:"uppercase"}} >{"SON: " + SMath.numberToLetter(this.state.totales.total_a_pagar, {p: moneda.descripcion, s: moneda.descripcion})}</SText>
            <SHr height={10} />
        </SView>
    }
    render() {
        this.data = this.props.data;
        return this.totales()
    }
}
