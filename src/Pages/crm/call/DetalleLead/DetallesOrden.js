import React, { Component } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { SButtom, SDate, SForm, SHr, SIcon, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SThread, SView } from "servisofts-component";
import SSocket from "servisofts-socket";
import MDL from "../../../../MDL";
export default class DetallesOrden extends Component {

 constructor(props) {
  super(props);
  this.state = {};
 }

 handleClienteChange = (key, value) => {

  // if (this.props.mdl_clienteProyecto_cliente[key]) return;
  this.props.mdl_clienteProyecto_cliente[key] = value;

  // Si se está actualizando la edad, recalcular la fecha_nacimiento
  if (key === "edad") {
   const edad = parseInt(value);
   if (!isNaN(edad) && edad >= 0 && edad <= 99) {
    const añoNacimiento = new SDate().addYear(-edad).toString("yyyy-MM-dd");
    this.props.mdl_clienteProyecto_cliente["fecha_nacimiento"] = añoNacimiento;
   } else {
    this.props.mdl_clienteProyecto_cliente["fecha_nacimiento"] = "";
   }
  }
  console.log("handle " + this.props.mdl_clienteProyecto_cliente[key])
  console.log("handle año " + this.props.mdl_clienteProyecto_cliente["fecha_nacimiento"])

  new SThread(3000, "edit_client", true).start(() => {
   MDL.crm.cliente.editar({
    ...this.props.mdl_clienteProyecto_cliente
   })
  })

  this.forceUpdate();
 };
 render() {
  return <SForm
   col={"xs-12"} row style={{ justifyContent: "space-between" }}
   inputProps={{
    style: { height: 40, borderColor: STheme.color.gray },
   }}
   inputs={{
    nombres: { label: "Nombre de Cliente", col: "xs-12", required: true, defaultValue: this.props.mdl_clienteProyecto_cliente?.nombres ?? "", onChangeText: e => this.handleClienteChange("nombres", e) },
    fecha_nacimiento: {
     label: "Edad", col: "xs-12", type: "number", maxLength: 2, required: true,
     defaultValue: this.props.mdl_clienteProyecto_cliente?.fecha_nacimiento ? new SDate().toString("yyyy") - new SDate(this.props.mdl_clienteProyecto_cliente?.fecha_nacimiento).toString("yyyy") : "",
     onChangeText: e => this.handleClienteChange("edad", e)
    },
    currier: { label: "Currier", col: "xs-12", required: true, defaultValue: this.props.mdl_clienteProyecto_cliente?.currier ?? "", onChangeText: e => this.handleClienteChange("currier", e) },
    departamento: { label: "Departamento", col: "xs-4.6", required: true, defaultValue: this.props.mdl_clienteProyecto_cliente?.departamento ?? "", onChangeText: e => this.handleClienteChange("departamento", e) },
    provincia: { label: "Provincia", col: "xs-3.5", required: true, defaultValue: this.props.mdl_clienteProyecto_cliente?.provincia ?? "", onChangeText: e => this.handleClienteChange("provincia", e) },
    distrito: { label: "Distrito", col: "xs-3.5", required: true, defaultValue: this.props.mdl_clienteProyecto_cliente?.distrito ?? "", onChangeText: e => this.handleClienteChange("distrito", e) },
    dirección: { label: "Dirección", col: "xs-12", required: true, defaultValue: this.props.mdl_clienteProyecto_cliente?.direccion ?? "", onChangeText: e => this.handleClienteChange("direccion", e) },
    latitud: { label: "Latitud", col: "xs-5.9", type: "number", required: true, defaultValue: this.props.mdl_clienteProyecto_cliente?.lat ?? "", onChangeText: e => this.handleClienteChange("lat", e) },
    longitud: { label: "Longitud", col: "xs-5.9", type: "number", required: true, defaultValue: this.props.mdl_clienteProyecto_cliente?.lng ?? "", onChangeText: e => this.handleClienteChange("lng", e) },
   }}
  />;
 }
}