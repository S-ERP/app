import React, { Component } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { SButtom, SDate, SForm, SHr, SIcon, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SThread, SView } from "servisofts-component";
import SSocket from "servisofts-socket";
export default class Producto extends Component {
 constructor(props) {
  super(props);
  this.state = {};
 }
 render() {
  return (
   <SView col={"xs-12"}>
    <SHr height={20} />
    {(this.props.mdl_clienteProyecto_proyecto_producto ?? []).map((mdl_proyecto_producto) => {
     const producto_key = mdl_proyecto_producto?.key;
     return <SView key={producto_key} row center style={{ width: "100%", marginBottom: 8, height: 65 }}>
      <SView row border="transparent" style={{ alignItems: "center", flex: 2 }}>
       <SView style={{ height: 24 }}>
        <SInput type="checkBox" style={{ marginRight: 45 }} value={(mdl_proyecto_producto[producto_key]?.cantidad || 0) > 0} />
       </SView>
       <SText style={{ fontSize: 12, fontWeight: "bold", minWidth: 120 }}>
        {mdl_proyecto_producto?.producto?.nombre} x {mdl_proyecto_producto?.producto?.precio ?? 0} Bs
       </SText>
      </SView>
      <SView center border="transparent" style={{ alignItems: "center", flex: 2, justifyContent: "center", marginBottom: 15 }}>
       <SText style={{ fontSize: 12, marginRight: 8, lineHeight: 24 }}>Cantidad</SText>
       <SView style={{ width: 60, height: 36 }}>
        <SButtom type="primary" children="+" style={{ position: "absolute", left: 53, width: 25, height: 25 }} onPress={() => {
         const productos = mdl_proyecto_producto || {};
         const productoActual = productos[producto_key] || {};
         const cantidadActual = productoActual.cantidad || 0;
         mdl_proyecto_producto[producto_key] = { ...productoActual, cantidad: cantidadActual + 1 };
         this.forceUpdate();
         console.log("key " + producto_key + " actualizada:", mdl_proyecto_producto[producto_key].cantidad);
        }} />
        <SButtom type="primary" children="-" style={{ position: "absolute", right: 70, width: 25, height: 25 }} onPress={() => {
         const productos = mdl_proyecto_producto || {};
         const productoActual = productos[producto_key] || {};
         const cantidadActual = productoActual.cantidad || 0;
         if (cantidadActual > 0) {
          mdl_proyecto_producto[producto_key] = { ...productoActual, cantidad: cantidadActual - 1 };
          this.forceUpdate();
          console.log("key " + producto_key + " actualizada:", mdl_proyecto_producto[producto_key].cantidad);
         }
        }} disabled={!mdl_proyecto_producto.key} />
        <SInput type="number" min={1} value={mdl_proyecto_producto[producto_key]?.cantidad ?? 0} style={{ width: 40, height: 25, textAlign: "center" }} disabled={!mdl_proyecto_producto.key} />
       </SView>
      </SView>
      <SView center border="transparent" style={{ alignItems: "center", flex: 1, justifyContent: "center", marginBottom: 15 }}>
       <SText style={{ fontSize: 12, marginRight: 8, lineHeight: 24 }}>Subtotal</SText>
       <SView style={{ width: 60, height: 36 }}>
        <SInput type="number" min={1} value={((mdl_proyecto_producto?.producto?.precio ?? 0) * (mdl_proyecto_producto[producto_key]?.cantidad ?? 0))} style={{ width: 40, height: 25, textAlign: "center" }} disabled={!mdl_proyecto_producto.key} />
       </SView>
      </SView>
     </SView>;
    })
    }
   </SView>
  );
 }
}
