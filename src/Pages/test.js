import React, { Component } from "react";
import { SPage, SText, SView, SInput } from "servisofts-component";
import MDL from "../MDL";
import FiltroSelector2 from "./productos/modelo/Components/FiltroSelector2";

export default class FacturaFormSimple extends Component {
  state = {
    selectedProductoServicio: null,
    selectedUnidadMedida: null,
    descripcionItem: "",
  };

  loadData() {
    console.log("Cargando datos para", this.state.selectedProductoServicio, this.state.selectedUnidadMedida);
  }

  render() {
    return (
      <SPage title="Crear Factura" disableScroll>

        {/* Producto / Servicio */}
        <FiltroSelector2
          ref={(ref) => (this.filtroProductoRef = ref)}
          label="Producto / Servicio"
          loadData={async () =>
            await MDL.factura.getParametrica({ 
              ambiente: MDL.factura.ambiente, 
              parametrica: "productosServicios" 
            })
          }
          mapOption={(a) => ({
            key: String(a.codigoProducto), // 🔹 convertir a string
            nombre: `${a.codigoProducto || ""} - ${a.descripcionProducto || ""}`, // asegurar string
          })}
          onSelect={(item) => {
            // this.filtroProductoRef?.reset(false);
            console.clear();
            console.log("%c" + JSON.stringify(item, null, 2), "color: #2ECC40; font-weight: bold;");
            this.setState({ selectedProductoServicio: item?.key }, () => {
              this.loadData();
            });
          }}
        />

        {/* Unidad de Medida */}
        <FiltroSelector2
          ref={(ref) => (this.filtroUnidadMedidaRef = ref)}
          label="Unidad de Medida"
          loadData={async () =>
            await MDL.factura.getParametrica({ 
              ambiente: MDL.factura.ambiente, 
              parametrica: "unidadMedida" 
            })
          }
          mapOption={(a) => ({
            key: String(a.codigoClasificador), // 🔹 convertir a string
            nombre: a.descripcion || "", // asegurar string
          })}
          onSelect={(item) => this.setState({ selectedUnidadMedida: item })}
        />

        {/* Textarea que reemplaza comillas dobles por simples */}
        <SInput
          type="textArea"
          style={{ fontSize: 12, margin: 8 }}
          value={this.state.descripcionItem}
          placeholder="Escribe aquí la descripción..."
          onChangeText={(text) =>
            this.setState({ descripcionItem: text.replace(/"/g, "'") })
          }
        />

        {/* Mostrar selecciones */}
        <SView padding={8}>
          <SText>
            {this.state.selectedProductoServicio
              ? `Producto: ${this.state.selectedProductoServicio}`
              : "Producto no seleccionado"}
          </SText>
          <SText>
            {this.state.selectedUnidadMedida
              ? `Unidad: ${this.state.selectedUnidadMedida.nombre}`
              : "Unidad no seleccionada"}
          </SText>
          <SText>
            Descripción: {this.state.descripcionItem || "No hay descripción"}
          </SText>
        </SView>
      </SPage>
    );
  }
}