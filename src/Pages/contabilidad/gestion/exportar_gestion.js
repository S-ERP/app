import { Component } from 'react';
import { SDate, SIcon, SLoad, SNavigation, SPage, SPopup, STable2, SText, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket'

export default class index extends Component {
  constructor(props) {
    super(props);

    let pk = SNavigation.getParam("pk");
    this.state = {
      title: "Exportar gestion",
      func: "exportar_excel_asientos_by_key_gestion",
      params: ["'" + pk + "'"],
    };
  }
  componentDidMount() {
    this.getData();
  }

  getLista() {
    if (!this.state.data) return <SLoad type='skeleton' col={"xs-12"} height />
    return <STable2
      limit={30}
      data={this.state.data}
      cellStyle={{
        fontSize: 12,
        height: 30,
      }}
      header={[
        { key: "index", label: "#" },
        { width: 80, key: "gestion" },
        { width: 100, key: "numero_cuenta" },
        { width: 250, key: "descripcion_cuenta" },
        { width: 50, key: "tipo" },
        { width: 80, key: "codigo" },
        { width: 80, key: "debe", sumar: true },
        { width: 80, key: "haber", sumar: true },
        { width: 80, key: "moneda" },
        { width: 250, key: "glosa" },
        { width: 250, key: "descripcion" },
        { width: 250, key: "observacion" },
        { width: 100, key: "fecha_contable" },
        { width: 100, key: "fecha_registro" },
      ]}
    />
  }
  getData() {
    this.setState({ loading: "cargando", data: null });
    SSocket.sendPromise({
      service: "contabilidad",
      component: "reporte",
      type: "execute_function",
      func: this.state.func,
      params: this.state.params,
    }).then(resp => {
      this.setState({ loading: false, data: resp.data });
    }).catch(e => {
      this.setState({ loading: false, error: e });
    })
  }
  render() {
    return <SPage title={this.state.title} disableScroll>
      {this.getLista()}
    </SPage>
  }
}