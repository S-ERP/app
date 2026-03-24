import React, { Component } from "react";
import { SPage, SText, SView } from "servisofts-component";
import MDL from "../MDL";
import FiltroSelector from "./productos/modelo/Components/FiltroSelector";
import FechaFullFilter from "../Components/FechaFullFilter";

export default class FacturaFormSimple extends Component {
  state = {
    selectedProductoServicio: null,
    selectedUnidadMedida: null,
    selectedSucursal: null,
    descripcionItem: "",
    fecha_inicio: null,
    fecha_fin: null,
  };

  loadData() {
    console.log("📦 loadData()");
    console.log("Sucursal:", this.state.selectedSucursal);
    console.log("Fechas:", this.state.fecha_inicio, this.state.fecha_fin);
  }

  render() {
    return (
      <SPage title="Crear Factura" disableScroll>

        {/* FILTRO FECHAS */}
        <FechaFullFilter
          key_opciones="este_mes" 
          fecha_inicio={this.state.fecha_inicio}
          fecha_fin={this.state.fecha_fin}
          onChange={e => {
            console.log("📅 Cambio fechas:", e);

            this.setState({
              fecha_inicio: e.fecha_inicio,
              fecha_fin: e.fecha_fin
            }, () => {
              console.log("📅 State actualizado:", this.state);
              this.loadData();
            });
          }}
        />

        {/* FILTRO SUCURSAL */}
        <SView
          col={"xs-12 sm-5 lg-1.6"}
          row
          center
          style={{ flexWrap: "wrap", gap: 12 }}
        >
          <FiltroSelector
            ref={ref => (this.filtroSucursalRef = ref)}
            label="Sucursal"
            loadData={MDL.empresa.getAllSucursales}
            mapOption={a => ({ key: a.key, nombre: a.descripcion })}
            onSelect={item => {
              console.log("🏪 Sucursal seleccionada:", item);

              this.setState({ selectedSucursal: item }, () => {
                console.log("🏪 State actualizado:", this.state);
                this.loadData();
              });
            }}
          />
        </SView>

        {/* ESTADO ACTUAL */}
        <SView padding={8}>
          <SText>
            📅 Inicio: {this.state.fecha_inicio ?? "N/A"} {"\n"}
            📅 Fin: {this.state.fecha_fin ?? "N/A"} {"\n"}
            🏪 Sucursal: {this.state.selectedSucursal?.nombre ?? "Todas"}
          </SText>
        </SView>

      </SPage>
    );
  }
}