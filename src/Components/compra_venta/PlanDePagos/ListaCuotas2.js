import React, { Component } from 'react';
import { SDate, SHr, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../Model';
// props = {disabled}
export default class ListaCuotas extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    totales_item({
        codigo,
        descripcion,
        monto,
        fecha,
        interes,
        capital,
        saldo_capital,
        pagos_acumulados
    }) {
        return <SView col={"xs-12"} row>
            <SView flex>
                <SText bold flex fontSize={14}># {codigo} - {descripcion}</SText>
                <SText flex fontSize={10} color={STheme.color.lightGray} >{new SDate(fecha, "yyyy-MM-dd").toString("dd de MONTH, yyyy")}</SText>
            </SView>
            <SView width={8} />
            <SText style={{ alignItems: 'end', textAlign: "end" }} fontSize={14}>{SMath.formatMoney(monto)}</SText>
            <SHr />
            <SView col={"xs-12"}>
                <SText flex fontSize={10} color={STheme.color.lightGray} >Capital: {capital ?? 0}</SText>
                <SText flex fontSize={10} color={STheme.color.lightGray} >Interes: {interes ?? 0}</SText>
                <SText flex fontSize={10} color={STheme.color.lightGray} >Saldo capital: {saldo_capital ?? 0}</SText>
                <SText flex fontSize={10} color={STheme.color.lightGray} >Pagos acumulados: {pagos_acumulados ?? 0}</SText>
            </SView>
            <SHr />
            <SHr height={1} color={STheme.color.card} />
        </SView>
    }
    render() {
        var cuotas = Model.cuota.Action.getAllByKeyCompraVenta({
            key_compra_venta: this.props.data.key
        })

        this.totales = Model.compra_venta_detalle.Action.getTotales({
            key_compra_venta: this.props.data.key
        })

        if (!cuotas) return <SLoad />
        this.cuotas = Object.values(cuotas)

        // console.log(this.props.data)
        var interes = parseFloat(this.props.data.porcentaje_interes);
        var capital_amortizado = 0;

        var saldo_capital = this.totales.subtotal;
        // var cuotas_con_capital = []
        var pagos_acumulados = 0;
        this.cuotas.map((cuota, i) => {
            cuota.monto_interes = (saldo_capital * (interes / 100));
            cuota.monto_capital = parseFloat(cuota.monto) - cuota.monto_interes;
            saldo_capital = saldo_capital - cuota.monto_capital;
            cuota.saldo_capital = saldo_capital;
            pagos_acumulados += parseFloat(cuota.monto);
            cuota.pagos_acumulados = pagos_acumulados;
        })

        return <SList
            data={this.cuotas}
            render={(data) => {
                return this.totales_item({
                    codigo: data.codigo,
                    descripcion: data.descripcion,
                    monto: data.monto,
                    fecha: data.fecha,
                    interes: SMath.formatMoney(data.monto_interes),
                    capital: SMath.formatMoney(data.monto_capital),
                    saldo_capital: SMath.formatMoney(data.saldo_capital),
                    pagos_acumulados: SMath.formatMoney(data.pagos_acumulados)
                })
            }}
        />
    }
}
