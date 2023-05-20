import React, { Component } from 'react';
import { SHr, SImage, SList, SLoad, SNavigation, SPopup, SScrollView2, SScrollView3, SText, STheme, SUuid, SView } from 'servisofts-component';
import { connect } from 'react-redux';
import Model from '../../../../Model';
import SSocket from "servisofts-socket"
import { SCharts } from 'servisofts-charts'
class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };

    }
    loadData() {
        this.sucursales = Model.sucursal.Action.getAll({});
        this.compras_ventas = Model.compra_venta.Action.getAll({});
        this.data = Model.compra_venta_detalle.Action.comprasSinRecepcionar({ key_sucursal: "" });
        if (!this.data) return false
        if (!this.compras_ventas) return false
        if (!this.sucursales) return false
        let compras_sin_recepcionar = this.data;
        this.data_chart = [];
        Object.values(compras_sin_recepcionar).map((csr) => {
            csr.compra_venta = this.compras_ventas[csr.key_compra_venta];
        })
        Object.values(this.sucursales).map(suc => {
            var arr = Object.values(compras_sin_recepcionar).filter(a => a.compra_venta.key_sucursal == suc.key);
            var cant = 0;
            arr.map(o => cant += o.cantidad)
            this.data_chart.push({ key: suc.key, val: arr.length, label: suc.descripcion, info: cant })
        })
        return true;
    }
    render_grafico() {
        var props_imp = {
            col: "xs-12",
            card: true,
            margin: 4,
            height: 300,
        }
        if (!this.loadData()) return <SLoad type='skeleton' {...props_imp} />

        // console.log(this.data_chart)
        return <>
            <SView {...props_imp}>
                <SCharts
                    type='barras_verticales'
                    config={{
                        grosor: 70,
                        separacion: 10,
                    }}
                    data={this.data_chart}
                    fill={STheme.color.card}
                    onSelect={(obj) => {
                        SPopup.confirm({
                            title: "Esta seguro que quiere salir del DashBoard?",
                            message: "Se le enviara a la lista de almecenes en esta sucursal para que pueda realizar la recepcion de los productos.",
                            onPress: () => { SNavigation.replace("/sucursal/profile/almacen", { pk: obj.key }) }
                        })
                    }}
                />
            </SView>
        </>

    }

    render() {
        return <SView col={"xs-12"} center >
            <SText col={"xs-12"} center bold color={STheme.color.lightGray}>Productos pendientes de almacenar.</SText>
            <SHr />
            <SView row col={"xs-12"}>
                {this.render_grafico()}
            </SView>
        </SView>
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);