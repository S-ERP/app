import React, { Component } from 'react';;
import { connect } from 'react-redux';
import { SDate, SIcon, SLoad, SMath, SNavigation, SPage, SPopup, STable2, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket'
import Model from '../../Model';

class index extends Component {
    constructor(props) {
        super(props);

        this.params = SNavigation.getAllParams();
        this.state = {
            title: "Reporte de ventas",
        };
    }
    componentDidMount() {
        this.getData();
    }

    getLista() {
        const PropsMoney = {
            cellStyle: { textAlign: "end" }, sumar: true, renderTotal: a => SMath.formatMoney(a), render: a => !a ? "" : parseFloat(a ?? 0).toFixed(2)
        }
        var usuarios = Model.usuario.Action.getAll();
        var sucursales = Model.sucursal.Action.getAll();
        if (this.state.error) return <SText color={STheme.color.danger}>{JSON.stringify(this.state.error)}</SText>
        if (!this.state.data || !usuarios || !sucursales) return <SLoad type='skeleton' col={"xs-12"} height />
        return <STable2
            limit={30}
            data={this.state.data}
            filter={(a) => a.tipo == this.params.tipo}
            cellStyle={{
                fontSize: 12,
                height: 40,
            }}
            header={[
                { key: "index", label: "#" },
                { key: "key", label: "Key", width: 300, cellStyle: { fontSize: 8 } },
                { key: "key_usuario", width: 120, render: a => usuarios[a]?.Nombres + " " + usuarios[a]?.Apellidos },
                { key: "fecha_on", width: 120, order: "desc", render: a => SDate.toString(a, { toFormat: "yyyy-MM-dd hh:mm" }) },
                { key: "descripcion", width: 100 },
                { key: "observacion", width: 100 },
                { key: "key_sucursal", width: 120, render: a => sucursales[a]?.descripcion },
                { key: "state", width: 100 },
                { key: "tipo", width: 100, },
                { key: "cliente/nit", width: 100 },
                { key: "cliente/razon_social", width: 150 },
                { key: "cliente/nombres", width: 100 },
                { key: "proveedor/nit", width: 100 },
                { key: "proveedor/razon_social", width: 150 },
                { key: "tipo_pago", width: 100 },
                { key: "cantidad", width: 120, },
                { key: "precio", width: 120, },
                { key: "precio_facturado", width: 120, }
            ]}
        />
    }
    getData() {
        this.setState({ loading: "cargando", error: null, data: null });
        SSocket.sendPromise({
            service: "compra_venta",
            component: "compra_venta",
            type: "reporte",
            key_empresa: Model.empresa.Action.getKey(),
            tipo: "venta",
            // state: "vendido",
            // tipo_pago
            // fecha_inicio
            // fecha_fin
        }).then(resp => {
            this.setState({ loading: false, error: null, data: resp.data });
        }).catch(e => {
            this.setState({ loading: false, error: e.error });
        })
    }
    render() {
        return <SPage title={this.state.title} center disableScroll>
            {this.getLista()}
        </SPage>
    }
}

const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);