import React, { Component } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { SButtom, SDate, SForm, SHr, SIcon, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SView } from "servisofts-component";
import SSocket from "servisofts-socket";
import MDL from "../../../MDL";

const color_activado = "#262E35";
const color_desactivado = "#F6F7F9";
const formTabs = ["Detalles", "Productos", "Adicional"];

export default class HorarioDeCliente extends Component {
 constructor(props) {
  super(props);
  this.state = { activeFormTab: "Detalles" };
 }

 componentDidMount() {
  MDL.crm.clienteProyecto.getFull(this.props.key_cliente_proyecto).then((e) => {
   this.setState({ clienteProyecto: e })
  })
 }


 // handleClienteChange = (key, value) => {
 //  this.state.clienteProyecto.cliente[key] = value;
 //  deberia cambiar la key fecha_nacimiento a esto  this.state.clienteProyecto?.cliente?.edad ? new SDate().addYear((-this.state.clienteProyecto?.cliente?.edad)).toString("yyyy") : ""

 //  this.forceUpdate();
 // };

 handleClienteChange = (key, value) => {
  this.state.clienteProyecto.cliente[key] = value;

  // Si se está actualizando la edad, recalcular la fecha_nacimiento
  if (key === "edad") {
   const edad = parseInt(value);
   if (!isNaN(edad) && edad >= 0 && edad <= 99) {
    const añoNacimiento = new SDate().addYear(-edad).toString("yyyy-MM-dd");
    this.state.clienteProyecto.cliente["fecha_nacimiento"] = añoNacimiento;
   } else {
    this.state.clienteProyecto.cliente["fecha_nacimiento"] = "";
   }
  }
  console.log("handle " + this.state.clienteProyecto.cliente[key])
  console.log("handle año " + this.state.clienteProyecto.cliente["fecha_nacimiento"])

  this.forceUpdate();
 };

 renderActiveForm() {
  const { activeFormTab } = this.state;
  if (!this.state.clienteProyecto?.cliente) return <SLoad />
  if (activeFormTab === "Detalles") {
   return <SForm
    col={"xs-12"} row
    style={{
     justifyContent: "space-between",
    }}
    inputProps={{
     style: { height: 40, borderColor: STheme.color.gray },
    }}
    inputs={{
     nombres: { label: "Nombre de Cliente", col: "xs-12", required: true, defaultValue: this.state?.clienteProyecto?.cliente?.nombres ?? "", onChangeText: e => this.handleClienteChange("nombres", e) },
     fecha_nacimiento: { label: "Edad", col: "xs-12", type: "number", maxLength: 2, required: true, defaultValue: this.state?.clienteProyecto?.cliente?.edad ?? "", onChangeText: e => this.handleClienteChange("edad", e) },
     currier: { label: "Currier", col: "xs-12", required: true, defaultValue: this.state.clienteProyecto?.cliente?.currier ?? "", onChangeText: e => this.handleClienteChange("currier", e) },
     departamente: { label: "Departamente", col: "xs-3.9", required: true, defaultValue: this.state.clienteProyecto?.cliente?.departamente ?? "", onChangeText: e => this.handleClienteChange("departamente", e) },
     provincia: { label: "Provincia", col: "xs-3.9", required: true, defaultValue: this.state.clienteProyecto?.cliente?.provincia ?? "", onChangeText: e => this.handleClienteChange("provincia", e) },
     distrito: { label: "Distrito", col: "xs-3.9", required: true, defaultValue: this.state.clienteProyecto?.cliente?.distrito ?? "", onChangeText: e => this.handleClienteChange("distrito", e) },
     dirección: { label: "Dirección", col: "xs-12", required: true, defaultValue: this.state.clienteProyecto?.cliente?.direccion ?? "", onChangeText: e => this.handleClienteChange("direccion", e) },
     latitud: { label: "Latitud", col: "xs-5.9", required: true, defaultValue: this.state.clienteProyecto?.cliente?.lat ?? "", onChangeText: e => this.handleClienteChange("lat", e) },
     longitud: { label: "Longitud", col: "xs-5.9", required: true, defaultValue: this.state.clienteProyecto?.cliente?.lng ?? "", onChangeText: e => this.handleClienteChange("lng", e) },
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
     notas: { label: "Notas", col: "xs-12", required: false, type: "textarea" },
     especiales: { label: "Instrucciones especiales", col: "xs-12", required: false },
     entrega: { label: "Fecha de entrega", col: "xs-12", required: true, type: "date" },
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
   <SView col={"xs-12"}    >
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
         <SText fontSize={10} color="#fff">{this.state?.clienteProyecto?.state}</SText>
        </SView>

        <SView>
         <SText fontSize={10}>ID de la orden</SText>
         <SText fontSize={28}>212</SText>
         <SText fontSize={16}>Edad {this.state.clienteProyecto?.cliente?.edad} </SText>
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
