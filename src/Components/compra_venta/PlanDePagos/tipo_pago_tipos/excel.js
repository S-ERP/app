import React, { Component } from 'react';
import { SDate, SExcelReader, SHr, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SView } from 'servisofts-component';
import ListaCuotas from '../ListaCuotas';


const info = {
    key: "excel",
    label: "Excel"
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
            cuotas: []
        };
    }
    getCuotas() {
        return {
            info: { ...this.state },
            arr: this.cuotas
        }
    }
    render() {
        // this.cuotas = calcular_cuotas({
        //     data: this.props.data,
        //     totales: this.props.totales
        // });
        return <SView >
            <SExcelReader onSubmit={(data, callback) => {
                console.log(data);
                this.state.cuotas = data;
                this.setState({ ...this.state })
                callback();
            }} >

                <SView padding={8} card width={100}>
                    <SText>SUBIR EXCEL</SText>
                </SView>
            </SExcelReader>
            <ListaCuotas cuotas={this.state.cuotas} data={{ porcentaje_interes: 1 }} totales={this.props.totales} />
        </SView>
    }
}


const calcular_cuotas = ({ data, totales }) => {
    var monto = totales.subtotal;
    var cuotas = []
    return cuotas;
}
export default {
    info,
    ComponentOpciones,
    calcular_cuotas
}