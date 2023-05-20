import React, { Component } from 'react';
import SCharts from 'servisofts-charts';
import { SLoad, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../../../Model';

export default class GraficoPorEstado extends Component {
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
        if (!this.loadData()) return <SLoad type='skeleton' col={"xs-12"} height={190} />

        var data_count = {}
        Object.values(this.data).map(obj => {
            if (this.props.key_almacen) {
                if (obj.key_almacen != this.props.key_almacen) return false;
            }
            if (!data_count[obj?.state?.key]) data_count[obj?.state?.key] = { key: obj?.state?.key, val: 0, label: obj?.state?.label, color: obj?.state?.color }
            data_count[obj?.state?.key].val += 1;
            data_count[obj?.state?.key].info = data_count[obj?.state?.key].val;
        })
        console.log(this.data);
        console.log(data_count);
        return <SView col={'xs-12'} height={190} card center>
            <SView height>
                <SCharts type='barras_verticales' config={{
                    grosor: 70
                }}
                    data={Object.values(data_count)} />
            </SView>
        </SView>
    }
}