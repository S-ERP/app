import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SButtom, SDate, SDatePicker, SForm, SHr, SIcon, SInput, SList, SLoad, SNavigation, SNotification, SPage, SSPiner, SText, STheme, SThread, SUuid, SView } from 'servisofts-component';
// import STextPlay from '../Components/STextPlay';
// import Container from '../Components/Container';
// import SMD from '../SMD';
import MDtest1 from '../SMD/MDtest1';
// import MDtest2 from '../SMD/MDtest2';
// import SwipeableView from '../Components/SwipeableView';
// import Loby from "./loby/root"
// import Publicaciones from "./publicacion/root"
// import Menu from './menu';
import MenuDragable from '../Components/MenuDragable';
import Model from '../Model';
// import MultipageMenu from '../Components/MultipageMenu';
import SSocket from 'servisofts-socket';
import DataBase from '../DataBase';
import { ScrollView } from 'react-native-gesture-handler';
// import { Trigger } from 'servisofts-db';
// import { Image } from 'react-native';

const color_activado = "#262E35";
const color_desactivado = "#F6F7F9";

export default class plantilla extends Component {
 constructor(props) {
  super(props);

  this.state = {
   select: {
    "confirmado": true,
    "Cancelado": true,
    "Double": true,
    "Spam": true,
    "Recall": true,
    "FeactureRecall": true
   },
  };
  this.onSelect = SNavigation.getParam("onSelect");

 }

 optionItem({ key, label, color, icono }) {
  // if (key == "Exportar") return this.renderExportExcel();
  var select = !!this.state.select[key]
  return <>
   <SView height center card style={{
    paddingLeft: 8,
    paddingRight: 8,
    opacity: select ? 1 : 0.5,
    backgroundColor: select ? color_activado + "88" : color_desactivado + "88",
    // backgroundColor: color + "88"
   }} onPress={() => {

    // if (!select) {
    //     this.state.select[key] = true;
    // } else {
    //     delete this.state.select[key];
    // }
    // this.setState({ ...this.state })
   }} row>
    {!select ? null : <> <SIcon name={icono} width={12} height={12} fill={STheme.color.text} /> <SView width={8} /></>}
    <SText>{label}</SText>
   </SView>
   <SView width={4} />
  </>
 }
 renderLista() {
  return <SView col={"xs-12"} height={38} border={"transparent"}>
   <SList
    horizontal
    // center
    // flexEnd
    // scrollEnabled
    // scrollEnabled={false}
    data={[
     { key: "confirmado", label: "confirmado", color: color_activado, icono: "addTarea" },
     { key: "Cancelado", label: "Cancelado", color: color_activado, icono: "Check" },
     { key: "Double", label: "Double", color: color_activado, icono: "World" },
     { key: "Spam", label: "Spam", color: color_activado, icono: "Egreso" },
     { key: "Recall", label: "Recall", color: color_activado, icono: "tpGa" },
     { key: "FeactureRecall", label: "Feacture recall", color: color_activado, icono: "productos" }

    ]}
    render={data => this.optionItem(data)}
   />
  </SView>
 }
 render() {

  // const proyectos = await MDL.crm.proyecto.getAll();
  // const campanas = await MDL.crm.campana.getAll();
  // proyectos.forEach(proyecto => {
  //  proyecto.campanas = [];
  //  Object.keys(campanas).forEach(key => {
  //   if (campanas[key].key_proyecto == proyecto.key) {
  //    proyecto.campanas.push(campanas[key]);
  //   }
  //  });
  // })
  // return proyectos;

  return <SPage disableScroll hidden center>

   <SView col={"xs-11"} center row border="transparent">
    <SHr />
    <SView col={"xs-12"} center row backgroundColor='transparent'>
     {this.renderLista()}
    </SView>
    <SHr />

    <SText>Detalles de la orden</SText>

    <SHr />
    <SView col={"xs-12"} row     >

     <SView col={"xs-3.8"} center  >
      <SView col={"xs-12"} style={{ padding: 16, borderRadius: 16, borderWidth: 2 }} center border={STheme.color.card + "88"} backgroundColor={'#F6F7F9' + "88"}>
       <SView col="xs-12" row center>
        <SView col="xs-6">
         <SText fontSize={10}>Horario de cliente</SText>
         <SText fontSize={28}>20:56</SText>
        </SView>

        <SView col="xs-6" style={{ alignItems: "flex-end" }}>
         {/* Contenedor que alinea el 'Nuevo' arriba */}
         <SView style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <SView style={{
           paddingHorizontal: 8,
           paddingVertical: 2,
           borderRadius: 4,
           backgroundColor: "red",
           marginRight: 8,
          }}>
           <SText fontSize={10} color="#fff">Nuevo</SText>
          </SView>

          <SView>
           <SText fontSize={10}>ID de la orden</SText>
           <SText fontSize={28}>212</SText>
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
          { key: "confirmado", label: "detalles de la orden", color: color_activado, icono: "addTarea" },
          { key: "Cancelado", label: "Productos", color: color_activado, icono: "Check" },
          { key: "Double", label: "Adicional", color: color_activado, icono: "World" },
         ]}
         render={data => this.optionItem(data)}
        />
       </SView>
       <SHr height={16} />
       <SView col={"xs-12"} row border={"transparent"} >
        <SForm row ref={(ref: any) => this.form = ref}
         style={{ justifyContent: "space-between" }}
         inputs={{
          aaaaaaaaaa: {
           col: "xs-12",
           label: "Busqueda de direccion",
           required: true,
           // defaultValue: defaultData?.nombres,
           autoFocus: true,
           onSubmitEditing: () => this.form?.focus("apellidos"),
          },
          bbbbbbbb: {
           col: "xs-12",
           label: "Customer",
           required: true,
           // defaultValue: defaultData?.apellidos,
           onSubmitEditing: () => this.form?.focus("telefono"),
          },
          cccccc: {
           col: "xs-3.8",
           label: "index",
           required: true,
           // defaultValue: defaultData?.telefono,
           type: "phone",
           onSubmitEditing: () => this.form?.focus("correo"),
          },
          dddddddd: {
           col: "xs-3.8",
           label: "Provincia",
           type: "email",
           required: true,
           // defaultValue: defaultData?.correo,
           onSubmitEditing: () => this.form?.focus("nit"),
          },
          eeeee: {
           col: "xs-3.8",
           label: "Distrito",
           // defaultValue: defaultData?.nit,
           required: true,
           onSubmitEditing: () => this.form?.focus("razon_social"),
          },
          ffffffff: {
           col: "xs-5.8",
           label: "Corregimiento",
           // defaultValue: defaultData?.nit,
           required: true,
           onSubmitEditing: () => this.form?.focus("razon_social"),
          },
          ggggggggggg: {
           col: "xs-5.8",
           label: "Estimate delivery time",
           // defaultValue: defaultData?.nit,
           required: true,
           onSubmitEditing: () => this.form?.focus("razon_social"),
          },
          hhhhhhh: {
           col: "xs-12",
           label: "descripcion",
           // defaultValue: defaultData?.razon_social,
           required: true,
           onSubmitEditing: () => this.form?.focus("direccion"),
          },

         }}
         onSubmit={(e: any) => {

          console.log("bienvenido")


         }} />
       </SView>
      </SView>
     </SView>

     <SView flex />

     <SView col={"xs-3.8"} center row height  >
      <SView col={"xs-12"} style={{ padding: 16, borderRadius: 16, borderWidth: 2 }} center border={STheme.color.card + "88"} backgroundColor={'#F6F7F9' + "88"}>
       <SView col="xs-12" row center>
        <SView col="xs-12">
         <SText fontSize={10}>Script del proyecto</SText>
         <SText fontSize={28}>Runnix TEST</SText>
        </SView>
        <SView col={"xs-12"} style={{ maxHeight: 150, overflow: "hidden" }} >
         <ScrollView>
          {/* <SMD space={1} fontSize={9} >{e.data}</SMD> */}
         </ScrollView>
        </SView>
        <SHr height={32} />
        <SView col="xs-12" row center>
         <SView col="xs-6">
          <SText fontSize={14}>1. Saldos</SText>
         </SView>
         <SView col="xs-6" style={{ alignItems: "flex-end" }}>
          <SView style={{ flexDirection: "row", alignItems: "flex-start" }}>
           <SText fontSize={14}>+</SText>
          </SView>
         </SView>
        </SView>
        <SHr height={12} />
        <SView col="xs-12" row center>
         <SView col="xs-6">
          <SText fontSize={14}>1. Saldos</SText>
         </SView>
         <SView col="xs-6" style={{ alignItems: "flex-end" }}>
          <SView style={{ flexDirection: "row", alignItems: "flex-start" }}>
           <SText fontSize={14}>+</SText>
          </SView>
         </SView>
        </SView>
        <SHr height={12} />
        <SView col="xs-12" row center>
         <SView col="xs-6">
          <SText fontSize={14}>1. Saldos</SText>
         </SView>
         <SView col="xs-6" style={{ alignItems: "flex-end" }}>
          <SView style={{ flexDirection: "row", alignItems: "flex-start" }}>
           <SText fontSize={14}>+</SText>
          </SView>
         </SView>
        </SView>
        <SHr height={12} />
        <SView col="xs-12" row center>
         <SView col="xs-6">
          <SText fontSize={14}>1. Saldos</SText>
         </SView>
         <SView col="xs-6" style={{ alignItems: "flex-end" }}>
          <SView style={{ flexDirection: "row", alignItems: "flex-start" }}>
           <SText fontSize={14}>+</SText>
          </SView>
         </SView>
        </SView>
        <SHr height={300} />
       </SView>
      </SView>
     </SView>


     <SView flex />

     <SView col={"xs-3.8"}  >
      <SView col={"xs-12"} center style={{ padding: 16, borderRadius: 16, borderWidth: 2 }} border={STheme.color.card + "88"} backgroundColor={"#F6F7F9" + "88"}>
       <SView col="xs-12" row center>
        <SView col="xs-12">
         <SText fontSize={14}>Órdenes con el mismo número</SText>
        </SView>
       </SView>

       <SHr col={"xs-12"} height={20} />
       <SHr col={"xs-12"} height={1} color={STheme.color.card} />
       <SHr col={"xs-12"} height={10} />

       {[
        { status: "Pagado", color: "#A3B7F0" },
        { status: "Doble", color: "#272E35" },
        { status: "Cancelado", color: "#272E35" },
        { status: "Nuevo", color: "#A2B9F3" },
       ].map((item, index) => (
        <React.Fragment key={index}>
         <SView col="xs-12" row center>
          <SView col="xs-4" row>
           <SView
            style={{
             paddingHorizontal: 8,
             paddingVertical: 4,
             borderRadius: 8,
             backgroundColor: item.color,
             marginRight: 8,
            }}
           >
            <SText fontSize={14} color="#fff">
             {item.status}
            </SText>
           </SView>
          </SView>
          <SView col="xs-4">
           <SText>Alividol</SText>
          </SView>
          <SView col="xs-4">
           <SText>28070</SText>
          </SView>
         </SView>

         <SHr col={"xs-12"} height={10} />
         <SHr col={"xs-12"} height={1} color={STheme.color.card} />
         <SHr col={"xs-12"} height={10} />
        </React.Fragment>
       ))}

       <SHr height={12} />
      </SView>

      <SHr height={16} />


      <SView col={"xs-12"} center style={{ padding: 16, borderRadius: 16, borderWidth: 2 }} border={STheme.color.card + "88"} backgroundColor={"#F6F7F9" + "88"}>
       <SView col="xs-12" row center>
        <SView col="xs-12">
         <SText fontSize={14}>Órdenes con el mismo número</SText>
        </SView>
       </SView>

       <SHr col={"xs-12"} height={20} />
       <SHr col={"xs-12"} height={1} color={STheme.color.card} />
       <SHr col={"xs-12"} height={10} />


       <SHr height={12} />
      </SView>
     </SView>



    </SView>
   </SView>
  </SPage>
 }
}
