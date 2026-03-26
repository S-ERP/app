import React, { Component } from "react";
import { SHr, SInput, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../MDL";
import FiltroSelector from "./productos/modelo/Components/FiltroSelector";
import FechaFullFilter from "../Components/FechaFullFilter";
import CuentasAnidadas from "../Pages/conta/cuentas_anidadas";
import { ScrollView } from "react-native";


export default class FacturaFormSimple extends Component {
  state = {
    selectedProductoServicio: null,
    selectedUnidadMedida: null,
    selectedSucursal: null,
    descripcionItem: "",
    fecha_inicio: null,
    fecha_fin: null,
    cuentaSeleccionada: null
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

        <SHr height={30} />

        {/* POPUP CUENTAS ANIDADOS */}
        <SView
          col={"xs-12 sm-8 lg-6"}
          row
          center
          // style={{ flexWrap: "wrap", gap: 12 }}
        >
          <SInput
            label={"Plan de cuentas"}
            ref={ref => this.inputRef = ref}
            customStyle={"erp"}
            value={
              this.state.cuentaSeleccionada
                ? `${this.state.cuentaSeleccionada.codigo} - ${this.state.cuentaSeleccionada.descripcion}`
                : ""
            }
            onChange={(e) => {
              console.log("Cuentas ", e);
            }}

            onPress={(e) => {
              SPopup.open({
                key: "popup-cuentas",
                content: <SView 
                style={{
                  width: "100%",
                  height: 500,
                  maxWidth: 1000,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: STheme.color.card,
                  backgroundColor: STheme.color.background,
                  overflow:"hidden"
                  
                }} >
                  <ScrollView 
                    ref={ref => this.scrollViewVertical = ref}
                    contentContainerStyle={{
                      minHeight: "100%",
                    }}
                  >
                    <CuentasAnidadas
                      select={(cuentaSelect) => {
                        console.log("SELECCIONADO:", cuentaSelect)
                        this.setState({
                          cuentaSeleccionada: cuentaSelect
                        });
                        SPopup.close("popup-cuentas");
                      }}
                    />
                  </ScrollView>
                </SView>
              });
            }}
          />
        </SView>
      </SPage>
    );
  }
}