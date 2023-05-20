import React, { Component } from 'react';
import SCharts from 'servisofts-charts';
import { SLoad, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../../../Model';

export default class GraficoPorTipos extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };

    }

    loadData() {
        this.data = Model.producto.Action.getAllRecursive();
        this.ventas_sin_entregar = Model.compra_venta_detalle.Action.ventasSinEntregar({});
        if (!this.data) return null;
        if (!this.ventas_sin_entregar) return null;
        return true;
    }
    render() {
        if (!this.loadData()) return <SLoad type='skeleton' col={"xs-12"} height={160} />

        var data_count = {}
        Object.values(this.data).map(obj => {
            if (this.props.key_almacen) {
                if (obj.key_almacen != this.props.key_almacen) return false;
            }
            if (!data_count[obj?.modelo.tipo_producto?.key]) data_count[obj?.modelo.tipo_producto?.key] = { key: obj?.modelo.tipo_producto?.key, val: 0, label: obj?.modelo.tipo_producto?.descripcion, color: obj?.modelo.tipo_producto?.color }
            data_count[obj?.modelo.tipo_producto?.key].val += 1;
            data_count[obj?.modelo.tipo_producto?.key].info = data_count[obj?.modelo.tipo_producto?.key].val;

        })
        console.log(this.data);
        console.log(data_count);
        return <SView col={'xs-12'} height={160} card>
            <SCharts type='torta' config={{
                grosor: 40
            }}
                data={Object.values(data_count)} />
        </SView>
    }
}