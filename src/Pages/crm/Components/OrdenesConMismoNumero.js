import React, { Component } from "react";
import {
 SDate,
 SHr,
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
// import Model from "../../Model";
export default class OrdenesConMismoNumero extends Component {
 constructor(props) {
  super(props);
  this.state = {};
 }
 componentDidMount() {

  this.traerAllOrdenes();
 }
 async traerAllOrdenes() {
  const resp: any = await SSocket.sendPromise({
   service: "crm",
   component: "cliente_proyecto",
   type: "getConElMismoNumero",
   estado: "cargando",
   key: this?.props?.key_cliente_proyecto
  }, 1000 * 60)
  const obj: any = Object.values(resp.data);
  this.setState({ data_ordenes: obj })
  console.log("componente OrdenesConMismoNumero ", obj)
 }

 pintado() {
  const data = this.state.data_ordenes;
  if (!data) {
   return <SLoad />
  }



  return <>
   {data.map((orden, index) => {

    <SText color="red"> NOmbre: {orden.key} </SText>

   })

   }
  </>
 }

 render() {
  return (
   <SView col={"xs-12 sm-3.8"}>
    <SView
     col={"xs-12"}
     style={{ padding: 16, borderRadius: 16, borderWidth: 2 }}
     border={STheme.color.card}
     backgroundColor={STheme.color.card}
    >
     <SView col="xs-12" row center>
      <SView col="xs-12">

       <SText fontSize={14}>Órdenes con el mismo número {this?.props?.key_cliente_proyecto}</SText>
      </SView>
     </SView>
     {this.pintado()}
     <SText fontSize={14}>mostrar la funcion</SText>

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

    <SView
     col={"xs-12"}
     center
     style={{ padding: 16, borderRadius: 16, borderWidth: 2 }}
     border={STheme.color.card}
     backgroundColor={STheme.color.card}
    >
     <SView col="xs-12" row center>
      <SView col="xs-12">
       <SText fontSize={14}>Órdenes con el mismo número</SText>
      </SView>
     </SView>

     <SHr col={"xs-12"} height={20} />
     <SHr col={"xs-12"} height={1} color={STheme.color.card} />
     <SHr col={"xs-12"} height={10} />

     <SInput
      label={"Comentario"}
      type="textArea"
      placeholder={"Add your comment here..."}
      placeholderTextColor={STheme.color.gray}
      style={{
       textAlignVertical: "top",
       padding: 4,
      }}
     />

     <SHr height={12} />
    </SView>
   </SView>
  );
 }
}
