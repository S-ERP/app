import { Component } from 'react';
import { connect } from 'react-redux';
import { SDate, SIcon, SLoad, SMath, SNavigation, SPage, SPopup, STable2, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket'
import Model from '../../Model';

class index extends Component {
  constructor(props) {
    super(props);

    this.params = SNavigation.getAllParams();
    this.state = {
      title: "Reporte de " + this.params.tipo,
      func: "reporte_compras_ventas_cuotas",
      // params: [`'${this.params.fecha_inicio}'`, `'${this.params.fecha_fin}'`],
      params: [`'\${servicio.key}'`],
    };
  }
  componentDidMount() {
    // this.setState({ loading: false, error: null, data: require("./data.json") });
    this.getData();
  }

  getLista() {
    const PropsMoney = {
      cellStyle: { textAlign: "end" }, sumar: true, renderTotal: a => SMath.formatMoney(a), render: a => !a ? "" : parseFloat(a ?? 0).toFixed(2)
    }
    var usuarios = Model.usuario.Action.getAll();
    if (this.state.error) return <SText color={STheme.color.danger}>{JSON.stringify(this.state.error)}</SText>
    if (!this.state.data || !usuarios) return <SLoad type='skeleton' col={"xs-12"} height />
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
        { key: "fecha_on", width: 120, order: "desc", render: a => SDate.toString(a, { toFormat: "yyyy-MM-dd hh:mm" }) },
        { key: "cliente/nit", width: 100 },
        { key: "cliente/razon_social", width: 150 },
        { key: "tipo", width: 100 },
        { key: "proveedor/nit", width: 100 },
        { key: "proveedor/razon_social", width: 150 },
        { key: "descripcion", width: 200 },
        { key: "tipo_pago", width: 100 },
        { key: "monto_cuotas", width: 100, ...PropsMoney },
        { key: "cuotas", width: 100, center: true, sumar: true, renderTotal: a => a.toFixed(0) },
        { key: "monto_cuotas_pagadas", width: 100, ...PropsMoney },
        { key: "cuotas_pagadas", width: 100, center: true, sumar: true, renderTotal: a => a.toFixed(0) },
        { key: "monto_cuotas_retrasadas", width: 100, ...PropsMoney },
        { key: "cuotas_retrasadas", width: 100, center: true, sumar: true, renderTotal: a => a.toFixed(0) },
        { key: "monto_cuotas_vencidas", width: 100, ...PropsMoney },
        { key: "cuotas_vencidas", width: 100, center: true, sumar: true, renderTotal: a => a.toFixed(0) },
        { key: "monto_cuotas_ejecucion", width: 100, ...PropsMoney },
        { key: "cuotas_ejecucion", width: 100, center: true, sumar: true, renderTotal: a => a.toFixed(0) },
        { key: "monto_cuotas_castigado", width: 100, ...PropsMoney },
        { key: "cuotas_castigado", width: 100, center: true, sumar: true, renderTotal: a => a.toFixed(0) },
        { key: "fecha_primer_cuota", width: 120, render: a => SDate.toString(a, { toFormat: "yyyy-MM-dd hh:mm" }) },
        { key: "fecha_ultima_cuota", width: 120, render: a => SDate.toString(a, { toFormat: "yyyy-MM-dd hh:mm" }) },
        { key: "key_usuario", width: 120, render: a => usuarios[a]?.Nombres + " " + usuarios[a]?.Apellidos },
        { key: "state", width: 100 },
        { key: "key", label: "Key", width: 300, cellStyle: { fontSize: 8 } },
      ]}
    />
  }
  getData() {
    this.setState({ loading: "cargando", error: null, data: null });
    SSocket.sendPromise({
      service: "compra_venta",
      component: "reporte",
      type: "execute_function",
      func: this.state.func,
      params: this.state.params,
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