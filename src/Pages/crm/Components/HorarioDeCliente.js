import React, { Component } from "react";
import { ScrollView } from "react-native-gesture-handler";
import {
 SButtom,
 SDate,
 SForm,
 SHr,
 SIcon,
 SImage,
 SInput,
 SList,
 SLoad,
 SMath,
 SNavigation,
 SText,
 STheme,
 SView,
} from "servisofts-component";
import SSocket from "servisofts-socket";

const color_activado = "#262E35";
const color_desactivado = "#F6F7F9";

export default class HorarioDeCliente extends Component {
 constructor(props) {
  super(props);
  this.state = { activeFormTab: "Detalles" };
 }

 componentDidMount() {
 }

 renderActiveForm() {
  const { activeFormTab } = this.state;
  if (!this.props.clienteProyecto?.cliente) return <SLoad />
  if (activeFormTab === "Detalles") {
   return <SForm
    col={"xs-12"} row
    style={{
     justifyContent: "space-between",
    }}
    inputProps={{
     col: "xs-12", style: { width: "100%", height: 40, borderColor: STheme.color.gray },
    }}
    inputs={{
     a: { label: "Nombre de Cliente", col: "xs-12", required: true },
     b: { label: "Edad", col: "xs-12", required: true },
     c: { label: "Currier", col: "xs-12", required: true },
     d: { label: "Departamente", col: "xs-3.9", required: true },
     e: { label: "Provincia", col: "xs-3.9", required: true },
     f: { label: "Distrito", col: "xs-3.9", required: true },
     g: { label: "Dirección", col: "xs-12", required: true },
     h: { label: "Latitud", col: "xs-5.9", required: true },
     i: { label: "Longitud", col: "xs-5.9", required: true, }
    }}
   />;
  }

  if (activeFormTab === "Productos") {
   if (!this.state.productos) {
    this.state.productos = {};
   }
   const productos = [
    { key: "producto1", label: "Producto 1" },
    { key: "producto2", label: "Producto 2" },
    { key: "producto3", label: "Producto 3" },
   ];

   return (
    <SView col={"xs-12"}>
     <SHr height={20} />
     {productos.map((prod) => {
      const seleccionado = !!this.state.productos[prod.key];
      return (
       <SView
        key={prod.key}
        row center
        style={{ width: "80%", marginBottom: 24, height: 65, marginLeft: "15%", }} >
        <SView row style={{ alignItems: "center", }}>
         <SView style={{ height: 24 }}>
          <SInput type="checkBox" style={{ marginRight: 45 }} value={(this.state.productos[prod.key]?.cantidad || 0) > 0}
           onChange={(val) => {
            if (!val) {
             this.setState({ productos: { ...this.state.productos, [prod.key]: undefined, }, });
            } else {
             this.setState({
              productos: { ...this.state.productos, [prod.key]: { cantidad: 1 }, },
             });
            }
           }}
          />
         </SView>
         <SText
          style={{
           fontSize: 12,
           fontWeight: "bold",
           minWidth: 120,
          }}
         >
          {prod.label}
         </SText>
        </SView>

        <SView center style={{
         alignItems: "center",
         flex: 1.5,
         justifyContent: "center",
         marginBottom: 15,
        }}>
         <SText
          style={{
           fontSize: 12,
           marginRight: 8,
           lineHeight: 24,
          }}
         >
          Cantidad
         </SText>
         <SView style={{
          width: 60, // Ancho fijo para el input
          height: 36, // Altura fija para el input
         }}>
          <SButtom
           type="primary"
           children="+"
           style={{
            position: "absolute",
            left: 53,
            width: 25,
            height: 25,

           }}
           onPress={() => {
            const cantidadActual = this.state.productos[prod.key]?.cantidad || 0;
            this.setState({
             productos: {
              ...this.state.productos,
              [prod.key]: {
               ...this.state.productos[prod.key],
               cantidad: cantidadActual + 1,
              },
             },
            });
           }}
          />
          <SButtom
           type="primary"
           children="-"
           style={{
            position: "absolute",
            right: 70,
            width: 25,
            height: 25,

           }}
           onPress={() => {
            const cantidadActual = this.state.productos[prod.key]?.cantidad || 0;
            if (cantidadActual > 0) {
             this.setState({
              productos: {
               ...this.state.productos,
               [prod.key]: {
                ...this.state.productos[prod.key],
                cantidad: cantidadActual - 1,
               },
              },
             });
            }
           }}
           disabled={!seleccionado}
          />
          <SInput
           type="number"
           min={1}
           value={seleccionado ? this.state.productos[prod.key]?.cantidad : "0"}
           style={{
            width: 40,
            height: 25,
            textAlign: "center",
           }}
           onChange={(val) => {
            this.setState({
             productos: {
              ...this.state.productos,
              [prod.key]: {
               ...this.state.productos[prod.key],
               cantidad: Number(val) || 0,
              },
             },
            });
           }}
           disabled={!seleccionado}
          />
         </SView>
        </SView>
       </SView>
      );
     })
     }
    </SView>
   );
  }

  if (activeFormTab === "Adicional") {
   return <SForm
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
 render() {
  return (
   <SView col={"xs-12 sm-3.8"}    >
    <SView col={"xs-12"} style={{ padding: 16, borderRadius: 16, borderWidth: 2, }} center border={STheme.color.card} backgroundColor={STheme.color.card}>
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
         <SText fontSize={10} color="#fff">{this.props?.clienteProyecto?.state}</SText>
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
