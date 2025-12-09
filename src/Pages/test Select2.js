import React, { Component } from 'react';
import { SForm, SHr, SPage, SText } from 'servisofts-component';

const productosServicios = [
  { key: "ps-001", codigoProducto: "P001", descripcionProducto: "Servicio de Consultoría" },
  { key: "ps-002", codigoProducto: "P002", descripcionProducto: "Mantenimiento de Equipos" },
  { key: "ps-003", codigoProducto: "P003", descripcionProducto: "Venta de Software" }
];

export default class test extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: null, // Guardaremos la opción seleccionada
    };
  }

  actualizarSeleccion = () => {
    if (!this.form) return;
    const values = this.form.getValue();
    const seleccionado = productosServicios.find(
      p => p.codigoProducto === values.codigo_facturacion
    );
    this.setState({ selected: seleccionado });
  }

  render() {
    return (
      <SPage title={"Test"} disableScroll>
        <SForm
          ref={(ref) => this.form = ref}
          row
          style={{ justifyContent: "space-between" }}
          inputs={{
            "codigo_facturacion": {
              col: "xs-12",
              type: "select",
              label: "Código Facturación",
              options: productosServicios.map(a => ({
                key: a.codigoProducto,
                content: `${a.codigoProducto} - ${a.descripcionProducto}`
              })),
              defaultValue: "P003",
              onChangeText: (value) => {
                console.log("Valor seleccionado:", value); // P002, P001, etc.
                this.setState({ selected: value }); // Guarda solo la key
              }
            }
          }}
        />

        <SText>
          {this.state.selected || "Aquí se mostrará el código seleccionado"}
        </SText>

 
   
      </SPage>
    );
  }
}
