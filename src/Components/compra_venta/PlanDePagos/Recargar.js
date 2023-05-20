import React, { Component } from 'react';
import { SDate, SHr, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../Model';
// props = {disabled}
export default class Recargar extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    calcular_cuotas_contado() {
        var monto = this.totales.subtotal;
        var cuotas_arr = []
        cuotas_arr.push({
            codigo: 0,
            descripcion: "Inicial",
            monto: monto,
            // fecha: new SDate(fecha_inicio, "yyyy-MM-dd").toString("yyyy-MM-dd")
            fecha: new SDate().toString("yyyy-MM-dd")
        })

        Model.cuota.Action.registroAll({
            key_compra_venta: this.props.data.key,
            periodicidad_medida: "",
            periodicidad_valor: 0,
            tipo_pago: this.props.tipo_pago,
            key_usuario: Model.usuario.Action.getKey(),
            porcentaje_interes: 0,
            data: cuotas_arr
        }).then((e) => {
            this.setState({ loading: false })
        }).catch((e) => {
            this.setState({ loading: false })
        })
    }

    calcular_cuotas_pp_discrecional() {
        console.log("TODO calcular_cuotas_pp_discrecional")
    }
    calcular_cuotas_pp_financiero() {
        console.log("TODO calcular_cuotas_pp_financiero")
    }
    render() {
        this.totales = Model.compra_venta_detalle.Action.getTotales({
            key_compra_venta: this.props.data.key
        })
        return <SView card style={{ padding: 16 }} onPress={() => {
            // this.calcularCuotas();
            switch (this.props.tipo_pago) {
                case "contado":
                    this.calcular_cuotas_contado();
                    break;
                case "pp_discrecional":
                    this.calcular_cuotas_pp_discrecional();
                    break;
                case "pp_financiero":
                    this.calcular_cuotas_pp_financiero();
                    break;

            }
        }}>
            <SText bold color={STheme.color.danger}>RECALCULAR</SText>
        </SView>
    }
}
