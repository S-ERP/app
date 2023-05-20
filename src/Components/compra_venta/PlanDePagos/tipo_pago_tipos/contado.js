import React, { Component } from 'react';
import { SDate, SHr, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SView } from 'servisofts-component';
import ListaCuotas from '../ListaCuotas';


const info = {
    key: "contado",
    label: "Al contado"
}


class ComponentOpciones extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tipo_pago: info.key,
            numero_cuotas: 0,
            fecha_inicio: new SDate().toString("yyyy-MM-dd"),
            periodicidad_medida: "month",
            periodicidad_valor: 1,
            porcentaje_interes: 0,
            cuota_inicial: 0,
        };
    }
    getCuotas() {
        return {
            info: { ...this.state },
            arr: this.cuotas
        }
    }
    render() {
        this.cuotas = calcular_cuotas({
            data: this.props.data,
            totales: this.props.totales
        });
        return <SView >
            <ListaCuotas cuotas={this.cuotas} data={this.state} totales={this.props.totales} />
        </SView>
    }
}


const calcular_cuotas = ({ data, totales }) => {
    var monto = totales.subtotal;
    var cuotas = []
    cuotas.push({
        codigo: 0,
        descripcion: "Inicial",
        monto: monto,
        fecha: new SDate().toString("yyyy-MM-dd")
    })
    return cuotas;
}
export default {
    info,
    ComponentOpciones,
    calcular_cuotas
}