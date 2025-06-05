import React, { Component } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { SButtom, SDate, SForm, SHr, SIcon, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SThread, SView } from "servisofts-component";
import SSocket from "servisofts-socket";
import Model from "../../Model";
import MDL from "../../MDL";
import Producto from "./Producto";
import Adicional from "./Adicional";
import DetallesOrden from "./DetallesOrden";

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

 componentDidMount() {
  MDL.crm.clienteProyecto.getFull(this.props.key_cliente_proyecto).then((e) => {
   SSocket.sendPromise({
    "version": "1.0",
    "service": "inventario",
    "component": "producto",
    "type": "getAll",
    "estado": "cargando",
    "key_empresa": Model.empresa.Action.getKey(),
    "key_usuario": Model.usuario.Action.getKey(),
   }).then((producto) => {
    (e?.proyecto_producto ?? []).map((prod) => {
     const productoData = producto.data[prod.key_producto];
     prod.producto = productoData;
    })
    this.forceUpdate()
   })
   this.setState({ clienteProyecto: e })
  })

  this.interval = setInterval(() => {
   this.setState({ fechaHora: new Date() });
  }, 1000);

 }
 componentWillUnmount() {
  clearInterval(this.interval);
 }
 renderActiveForm() {
  const { activeFormTab } = this.state;
  if (!this.state.clienteProyecto?.cliente) return <SLoad />
  if (activeFormTab === "Detalles") {
   return (<DetallesOrden mdl_clienteProyecto_cliente={this.state?.clienteProyecto?.cliente} ></DetallesOrden>);
  }
  if (activeFormTab === "Productos") {
   if (!this.state.productos) { this.state.productos = {}; }
   return (
    <SView col={"xs-12"}>
     <SHr height={20} />
     {(this.state.clienteProyecto?.proyecto_producto ?? []).map((prod) => {
      return (<Producto mdl_proyecto_producto={prod} ></Producto>);
     })
     }
    </SView>
   );
  }

  if (activeFormTab === "Adicional") {
   return <Adicional></Adicional>
  }
  return null;
 }

 handleNextTab = () => {
  const currentIdx = formTabs.indexOf(this.state.activeFormTab);
  if (currentIdx < formTabs.length - 1) {
   this.setState({ activeFormTab: formTabs[currentIdx + 1] });
  }
 };
 handlePrevTab = () => {
  const currentIdx = formTabs.indexOf(this.state.activeFormTab);
  if (currentIdx > 0) {
   this.setState({ activeFormTab: formTabs[currentIdx - 1] });
  }
 };
 render() {
  const { fechaHora } = this.state;

  return (
   <SView col={"xs-12"}    >
    <SView col={"xs-12"} style={{ padding: 16, borderRadius: 16, borderWidth: 2, }} center border={STheme.color.card} backgroundColor={STheme.color.card}>
     <SView col="xs-12" row center>
      <SView col="xs-6">
       <SText fontSize={10}>Horario de cliente</SText>
       <SText fontSize={28}>{fechaHora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
       </SText>
      </SView>
      <SView col="xs-6" style={{ alignItems: "flex-end" }}>
       <SView style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <SView style={{
         paddingHorizontal: 8,
         paddingVertical: 2,
         borderRadius: 4,
         backgroundColor: "red",
         marginRight: 8,
        }}>
         <SText fontSize={10} color="#fff">{this.state?.clienteProyecto?.state}</SText>
        </SView>
        <SView>
         <SText fontSize={10}>ID de la orden</SText>
         <SText fontSize={28}>212</SText>
         <SText fontSize={16}>fecha {this.state.clienteProyecto?.cliente?.fecha_nacimiento} </SText>
         <SText fontSize={12} color={"pink"}>año {this.state.clienteProyecto?.cliente?.edad ? new SDate().addYear((-this.state.clienteProyecto?.cliente?.edad)).toString("yyyy") : ""} </SText>
        </SView>
       </SView>
      </SView>
     </SView>
     <SHr height={12} />
     <SView col={"xs-12"} center height={36}  >
      <SList
       horizontal
       scrollEnabled={false}
       disableScroll={false}
       data={[
        { key: "Detalles", label: "Detalles de la orden", color: color_activado, icono: "addTarea" },
        { key: "Productos", label: "Productos", color: color_activado, icono: "Check" },
        { key: "Adicional", label: "Adicional", color: color_activado, icono: "World" },
       ]}
       render={data => (
        <SView
         height
         center
         card
         style={{
          paddingHorizontal: 8,
          backgroundColor: this.state.activeFormTab === data.key ? color_activado + "88" : color_desactivado + "88"
         }}
         onPress={() => this.setState({ activeFormTab: data.key })}
         row
        >
         <SIcon name={data.icono} width={12} height={12} fill={STheme.color.text} />
         <SView width={8} />
         <SText>{data.label}</SText>
        </SView>
       )}
      />
     </SView>
     <SHr height={16} />
     <ScrollView style={{ width: "100%", paddingBottom: 16 }}>
      <SView col={"xs-12"} row border={"transparent"} >
       {this.renderActiveForm()}
      </SView>
     </ScrollView>
     <SView col="xs-12" row center>
      <SButtom onPress={() => this.handlePrevTab()} style={{ marginRight: 8 }} fontSize={14} type="secondary" >Anterior</SButtom>
      <SButtom onPress={() => this.handleNextTab()} fontSize={14} type="primary" >Siguiente </SButtom>
     </SView>
    </SView>
   </SView>
  );
 }
}
