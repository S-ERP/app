import React, { Component } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { SButtom, SDate, SForm, SHr, SIcon, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SThread, SView } from "servisofts-component";
import SSocket from "servisofts-socket";
// import MDL from "../../MDL";
// import Model from "../../Model";

const color_activado = "#262E35";
const color_desactivado = "#F6F7F9";
const formTabs = ["Detalles", "Productos", "Adicional"];


export default class HorarioCliente extends Component {


 constructor(props) {
  super(props);
  this.state = {
   activeFormTab: "Detalles",
   fechaHora: new Date(),

  };

 }


 render() {
  const { fechaHora } = this.state;

  return (
   <SView col={"xs-12"}    >
<SText color="red"> Alvaro programando</SText>
   </SView>
  );
 }
}
