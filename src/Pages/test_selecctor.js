import React, { Component } from "react";
import { SForm, SPage, SText } from "servisofts-component";

// Lista de productos/servicios
const productosServicios = [
  { key: "ps-001", codigo: "P001", descripcion: "Servicio de Consultoría" },
  { key: "ps-002", codigo: "P002", descripcion: "Mantenimiento de Equipos" },
  { key: "ps-003", codigo: "P003", descripcion: "Venta de Software" },
];

export default class Test extends Component {
  state = {
    selected: "P003", // Valor inicial
  };

  render() {
    return (
      <SPage title="Test" disableScroll>
        <SForm
          row
          style={{ justifyContent: "space-between" }}
          inputs={{
            codigo_facturacion: {
              col: "xs-12",
              type: "select",
              label: "Código Facturación",
              options: productosServicios.map((p) => ({
                key: p.codigo,
                content: `${p.codigo} - ${p.descripcion}`,
              })),
              defaultValue: this.state.selected,
              onChangeText: (value) => this.setState({ selected: value }),
            },
          }}
        />

        <SText>
          {this.state.selected
            ? `Seleccionado: ${this.state.selected}`
            : "Aquí se mostrará el código seleccionado"}
        </SText>
      </SPage>
    );
  }
}
