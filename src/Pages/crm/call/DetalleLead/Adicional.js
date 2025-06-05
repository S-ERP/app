import React, { Component } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { SButtom, SDate, SForm, SHr, SIcon, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SThread, SView } from "servisofts-component";
import SSocket from "servisofts-socket";
export default class Adicional extends Component {

 constructor(props) {
  super(props);
  this.state = { };
 }
 render() {
  return <SForm
   inputs={{
    notas: { label: "Notas", col: "xs-12", required: false, type: "textarea" },
    especiales: { label: "Instrucciones especiales", col: "xs-12", required: false },
    entrega: { label: "Fecha de entrega", col: "xs-12", required: true, type: "date" },
   }}
   onSubmit={(e) => console.log("Adicional form:", e)}
  />;
 }
}