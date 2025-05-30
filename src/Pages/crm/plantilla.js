import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SButtom, SDate, SDatePicker, SForm, SHr, SIcon, SInput, SList, SLoad, SNavigation, SNotification, SPage, SScroll, SSPiner, SText, STheme, SThread, SUuid, SView } from 'servisofts-component';
// import STextPlay from '../Components/STextPlay';
// import Container from '../Components/Container';
// import SMD from '../SMD';
import { Container } from '../../Components';
import MDtest1 from '../../SMD/MDtest1';
// import MDtest2 from '../SMD/MDtest2';
// import SwipeableView from '../Components/SwipeableView';
// import Loby from "./loby/root"
// import Publicaciones from "./publicacion/root"
// import Menu from './menu';
import MenuDragable from '../../Components/MenuDragable';
import Model from '../../Model';
// import MultipageMenu from '../Components/MultipageMenu';
import SSocket from 'servisofts-socket';
import DataBase from '../../DataBase';
import { ScrollView } from 'react-native-gesture-handler';
// import { Trigger } from 'servisofts-db';
// import { Image } from 'react-native';

const color_activado = "#262E35";
const color_desactivado = "#F6F7F9";
const formTabs = ["Detalles", "Productos", "Adicional"];


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
   activeTab: "Detalles",
   activeFormTab: "Detalles", 
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
 };
 

 renderActiveForm() {
  const { activeFormTab } = this.state;

  if (activeFormTab === "Detalles") {
    return <SForm
  
      inputs={{
        a: { label: "Dirección", col: "xs-12", required: true },
        b: { label: "Cliente", col: "xs-12", required: true },
        c: { label: "Teléfono", col: "xs-6", required: true, type: "phone" },
        d: { label: "Email", col: "xs-8", required: false },
        e: { label: "Ciudad", col: "xs-6", required: true },
        f: { label: "Provincia", col: "xs-6", required: true },
      }}
      
    />;
  }

  if (activeFormTab === "Productos") {
    // Estado local para productos seleccionados y cantidades
    if (!this.state.productos) {
      this.state.productos = {};
    }
    const productos = [
      { key: "producto1", label: "Producto 1" },
      { key: "producto2", label: "Producto 2" },
      { key: "producto3", label: "Producto 3" },
    ];
    return (
      <SView  col={"xs-12"} style={{}}>
        <SHr height={0} />

{productos.map((prod) => {
  const seleccionado = !!this.state.productos[prod.key];
  return (
    <SView
      key={prod.key}
      row
      style={{
        width: "100%",
        alignItems: "center", // Asegura alineado vertical de TODOS los hijos
        marginBottom: 12,
      }}
    >
      {/* Checkbox */}
      <SView style={{ justifyContent: "center", alignItems: "center", marginRight: 8 }}>
        <SInput
          type="checkBox"
          value={seleccionado}
          onChange={(val) => {
            this.setState({
              productos: {
                ...this.state.productos,
                [prod.key]: val ? { cantidad: 1 } : undefined,
              },
            });
          }}
        />
      </SView>

      {/* Label BIEN ALINEADO */}
      <SView style={{
        minWidth: 120,
        justifyContent: "center",
        alignItems: "center", // <-- CLAVE para el alineado
        height: 40 // Usa el mismo alto que el input para asegurar alineado
      }}>
        <SText style={{margin: 0, padding: 0, lineHeight: 40}}>{prod.label}</SText>
      </SView>

      {/* Input de cantidad */}
      <SView style={{
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 32, // Espaciado entre label y cantidad
        gap: 4,
      }}>
        <SText style={{ marginRight: 6, lineHeight: 40 }}>Cantidad</SText>
        <SInput
          type="number"
          min={1}
          defaultValue={this.state.productos[prod.key]?.cantidad || 1}
          style={{ width: 60, height: 40 }}
          onChange={(val) => {
            this.setState({
              productos: {
                ...this.state.productos,
                [prod.key]: {
                  ...this.state.productos[prod.key],
                  cantidad: Number(val) || 1,
                },
              },
            });
          }}
        />
      </SView>
    </SView>
  );
})}
        <SButtom
          style={{ marginTop: 16 }}
          onPress={() => {
            // Aquí puedes manejar el "carrito" con los productos seleccionados y cantidades
            const carrito = Object.entries(this.state.productos)
              .filter(([k, v]) => !!v)
              .map(([k, v]) => ({ key: k, cantidad: v.cantidad }));
            console.log("Carrito:", carrito);
            }}
          >
          </SButtom>
          </SView>
        );
        }

  if (activeFormTab === "Adicional") {
    return <SForm
      // Adicional form config
      inputs={{
        e: { label: "Notas", col: "xs-12", required: false, type: "textarea" },
        f: { label: "Instrucciones especiales", col: "xs-12", required: false },
        g: { label: "Fecha de entrega", col: "xs-6", required: true, type: "date" },
      }}
      onSubmit={(e) => console.log("Adicional form:", e)}
    />;
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

  return <SPage title="Detalles de la orden" center>

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
      
      <SView col={"xs-12"}  style={{ padding: 16, borderRadius: 16, borderWidth: 2,minHeight:515 }} center border={STheme.color.card + "88"} backgroundColor={'#F6F7F9' + "88"}>
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
       <ScrollView style={{ maxHeight: 300, width: "100%" }}>
<SView col={"xs-12"} row border={"transparent"} 
  style={{
 
    alignItems: "flex-start", 
    justifyContent: "center"
  }}
>
    {this.renderActiveForm()}
    

  
      </SView>
        </ScrollView>
        <SView col="xs-12" row center>
          <SButtom
          onPress={() => this.handlePrevTab()}
          style={{ marginRight: 8 }}
          fontSize={14}
          type="secondary"
          >
          Anterior
          </SButtom>
          <SButtom
          onPress={() => this.handleNextTab()}
          fontSize={14}
          type="primary"
          >
          Siguiente
          </SButtom>
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
