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
// import { Trigger } from 'servisofts-db';
// import { Image } from 'react-native';
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
                  "Feacture recall": true,
              },
          };
  this.onSelect = SNavigation.getParam("onSelect");

 }

     optionItem({ key, label, color }) {
         // if (key == "Exportar") return this.renderExportExcel();
         var select = !!this.state.select[key]
         return <>
             <SView height center card style={{
                 paddingLeft: 8,
                 paddingRight: 8,
                 opacity: select ? 1 : 0.5,
                 backgroundColor: color + "88"
             }} onPress={() => {

                 // if (!select) {
                 //     this.state.select[key] = true;
                 // } else {
                 //     delete this.state.select[key];
                 // }
                 // this.setState({ ...this.state })
             }} row>
                 {!select ? null : <> <SIcon name={"Close"} width={12} height={12} fill={STheme.color.text} /> <SView width={8} /></>}
                 <SText>{label}</SText>
             </SView>
             <SView width={4} />
         </>
     }
 renderLista() {
  return <SView col={"xs-12"} height={38} row>
   <SList
    horizontal
    data={[
     { key: "Exportar", label: "Exportar" },
     { key: "Vigente", label: "Vigente", color: STheme.color.success },
     { key: "Vencido", label: "Vencido", color: STheme.color.warning },
     { key: "Ejecucion", label: "Ejecucion", color: STheme.color.danger },
     { key: "Castigado", label: "Castigado", color: STheme.color.danger }
    ]}
    render={data => this.optionItem(data)}
   />
   {/* {this.renderExportExcel()} */}
   {/* <SView width={4} />
      {this.optionItem({ key: "Vigente", label: "Vigente", color: STheme.color.success })}
      {this.optionItem({ key: "Vencido", label: "Vencido", color: STheme.color.warning })}
      {this.optionItem({ key: "Ejecucion", label: "Ejecucion", color: STheme.color.danger })}
      {this.optionItem({ key: "Castigado", label: "Castigado", color: STheme.color.danger })} */}
  </SView>
 }
 render() {

  return <SPage disableScroll hidden center>

<SView col={"xs-12"} center>
                    <SView col={"xs-11 sm-10 md-8 lg-6 xl-4"} center>
    <SHr />
                        {this.renderLista()}
                        <SHr />
                    </SView>
                </SView>
   <SText>Detalles de la orden</SText>

   <SView col={"xs-11"} row flex center>
    <SView col={"xs-3.8"}>
     <SView col={"xs-12"} row border={"red"} >
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
    <SView flex/>
    <SView col={"xs-3.8"}>
     <SView col={"xs-12"} row border={"red"} >
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
    <SView flex />
    <SView col={"xs-3.8"}>
     <SView col={"xs-12"} row border={"red"} >
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
  </SPage>
 }
}
