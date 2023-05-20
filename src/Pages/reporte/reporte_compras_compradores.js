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
      title: "Reporte de compradores " + this.params.fecha_inicio + " " + this.params.fecha_fin,
      func: "reporte_compras_compradores",
      // params: [`'${this.params.fecha_inicio}'`, `'${this.params.fecha_fin}'`],
      params: [`'\${servicio.key}'`, `'${this.params.fecha_inicio}'`, `'${this.params.fecha_fin}'`],
    };
  }
  componentDidMount() {
    // this.setState({ loading: false, error: null, data: require("./data.json") });
    this.getData();
  }

  getLista() {
    const PropsAll = {
      width: 120, center: true, sumar: true, renderTotal: a => (a ?? 0).toFixed(0)
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
        { key: "key_usuario-ci", label: "CI", width: 100, render: a => usuarios[a]?.CI },
        { key: "key_usuario", width: 200, render: a => usuarios[a]?.Nombres + " " + usuarios[a]?.Apellidos },
        { key: "count", label: "# Todos", ...PropsAll },
        { key: "cantidad_comprado", label: "# Compras", ...PropsAll },
        { key: "cantidad_cotizacion", label: "# Cotizaciones", ...PropsAll },
        { key: "cantidad_aprobado", label: "# Aprobados", ...PropsAll },
        { key: "cantidad_denegado", label: "# Denegados", ...PropsAll },
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