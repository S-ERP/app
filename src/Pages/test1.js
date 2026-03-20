import React, { Component } from "react";
import { SPage, SText } from "servisofts-component";
import FiltroSelector from "./productos/modelo/Components/FiltroSelector";
import MDL from "../MDL";

export default class index extends Component {
  state = {
    ambiente: MDL.factura.ambiente,

    selectedTipoDocumento: null,
    selectedProductoServicio: null,
    selectedUnidadMedida: null,
  };

  /**
   * getFiltro: Función reutilizable para crear FiltroSelector
   * @param label - Título del filtro
   * @param parametrica - Nombre de la parametrica en el backend
   * @param keyField - Propiedad para la key del item
   * @param labelField - Propiedad para mostrar (opcional si no se usa customMapOption)
   * @param stateKey - Nombre del estado donde se guarda la selección
   * @param customMapOption - Función personalizada para construir {key, nombre}
   */
  getFiltro = ({ label, parametrica, keyField, labelField, stateKey, customMapOption }) => (
    <FiltroSelector
      label={label}
      loadData={async () =>
        await MDL.factura.getParametrica({
          ambiente: this.state.ambiente,
          parametrica,
        })
      }
      mapOption={
        customMapOption ||
        ((a) => ({
          key: a[keyField],
          nombre: a[labelField],
        }))
      }
      onSelect={(item) => this.setState({ [stateKey]: item })}
    />
  );

  render() {
    return (
      <SPage title="Paramétricas" disableScroll>
        
        {/* TIPO DOCUMENTO IDENTIDAD */}
        {this.getFiltro({
          label: "Tipo Documento",
          parametrica: "tipoDocumentoIdentidad",
          keyField: "codigoClasificador",
          labelField: "descripcion",
          stateKey: "selectedTipoDocumento",
        })}

        {/* PRODUCTO / SERVICIO (combinación de código y descripción) */}
        {this.getFiltro({
          label: "Producto / Servicio",
          parametrica: "productosServicios",
          keyField: "codigoProducto",
          stateKey: "selectedProductoServicio",
          customMapOption: (a) => ({
            key: a.codigoProducto,
            nombre: `${a.codigoProducto} - ${a.descripcionProducto}`,
          }),
        })}

        {/* UNIDAD DE MEDIDA */}
        {this.getFiltro({
          label: "Unidad de Medida",
          parametrica: "unidadMedida",
          keyField: "codigoClasificador",
          labelField: "descripcion",
          stateKey: "selectedUnidadMedida",
        })}

        {/* RESULTADOS */}
        <SText>
          {this.state.selectedTipoDocumento
            ? `Tipo Documento: ${this.state.selectedTipoDocumento.nombre}`
            : "Seleccione tipo de documento"}
        </SText>

        <SText>
          {this.state.selectedProductoServicio
            ? `Producto: ${this.state.selectedProductoServicio.nombre}`
            : "Seleccione producto/servicio"}
        </SText>

        <SText>
          {this.state.selectedUnidadMedida
            ? `Unidad de Medida: ${this.state.selectedUnidadMedida.nombre}`
            : "Seleccione unidad de medida"}
        </SText>

      </SPage>
    );
  }
}