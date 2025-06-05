import React, { Component } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { SButtom, SDate, SForm, SHr, SIcon, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SThread, SView } from "servisofts-component";
import SSocket from "servisofts-socket";
import MDL from "../../../MDL";
export default class Etiqueta extends Component {

 constructor(props) {
  super(props);
  this.state = {};
 }
 render() {
  return <SView col={"xs-12"} row center>
   <SView style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, backgroundColor: MDL.crm.clienteProyecto.stageColor[this.props.tipo_leads] ?? STheme.color.card, marginRight: 8 }}>
    <SText fontSize={10} color={STheme.color.text} center>{this.props.tipo_leads}</SText>
   </SView>
   <SView flex />
  </SView>
 }
}