https://mui.com/x/react-date-pickers/?utm_source=chatgpt.com


https://www.rsuitejs.com/components/date-range-picker/
https://ant.design/components/date-picker

https://react-icons.github.io/react-icons/

https://mui.com/x/react-data-grid/

https://mui.com/x/react-data-grid/


Ahora ./limpiar.js va a funcionar directo.

./test.json — los archivos JSON no se pueden ejecutar, son datos. Para verlo usá:


cat test.json
chmod +x solo sirve para scripts (.js, .sh, .py, etc.).


### Registrar un Producto

1. Ir a **Inventario**.
   1.1. Seleccionar **Stock**.
   - Hacer clic en **Nuevo**.
   - Completar la información del producto:
     - **Nombre del producto**.
     - **Marca**.
     - **Tipo de producto**.
     - **Código de barras** (opcional).
     - **Precio de compra**.
     - **Precio de venta**.
   - Hacer clic en **Guardar**.

## Registrar una Venta

1. Ir a **Ventas**.
   1.1. Seleccionar **Ventas Rápidas**.
   - Agregar los productos al carrito.
   - Seleccionar el **cliente**.
   - Seleccionar el **almacén**.
     - Si no aparece el almacén, abrir la **caja** de la sucursal correspondiente.
   - Seleccionar el **tipo de pago**.
   - Hacer clic en **Guardar**.

   1.2. Seleccionar **Historial de Ventas**.
   - Verificar el registro.

> **Nota:** Verificar el stock en **Inventario → Stock**.

## Registrar una Compra

1. Ir a **Compras**.
   1.1. Seleccionar **Compras Rápidas**.
   - Agregar los productos al carrito.
   - Seleccionar el **proveedor**.
   - Seleccionar el **almacén**.
     - Si no aparece el almacén, abrir la **caja** de la sucursal correspondiente.
   - Seleccionar el **tipo de pago**.
   - Hacer clic en **Guardar**.

   1.2. Seleccionar **Historial de Compras**.
   - Verificar el registro.

> **Nota:** Verificar el stock en **Inventario → Stock**.


// // key = "tabla"
// hola
// // center
// // ref = { ref => this.table = ref }
// // language = "es"
// // selectType = "single"
// // {...Config.table.applyTheme() }

// // colors={{ background: STheme.color.background, header: STheme.color.card }}
// // cellStyle={{ borderWidth: 0 }}
// // textStyle={{ fontSize: 12, color: "white", textAlign: "center" }}

// {/* customComponent={e => <SText flex numberOfLines={e.colData.wrap ? 0 : 1} color={STheme.color.lightGray}>{e.row?.total_perdida}</SText>} */ }

// // Usar expresión regular
// // Si quieres buscar más específicamente dentro de la etiqueta sin importar qué atributos tenga antes o después:
// // Activa la opción de Expresiones Regulares (el icono con .* en la caja de búsqueda).
// // Escribe:

// // <SInput[^>]*style=

//   data.key_usuario = Model.usuario.Action.getKey();
//                     data.key_empresa = this.props.key_empresa;
// // MDL.compra_venta.setSucursalSeleccionada(sucu)
// //     .then(() => {
// //         MDL.compra_venta.sucursalSeleccionada = sucu;
// //         this.setState({ sucursal: sucu });
// //     })
// //     .catch(() => {
// //         console.log("Error al guardar sucursal");
// //     });


// console\.log\(.+\); 
// console\.log\(.+\)


// com
// /\*[\s\S]*?\*/




// style=\{\{([\s\S]*?)\}\}
// style={{ $1 }}
// src\Pages\puntoventa

// ..........

// import React, { Component } from 'react';
// import { View, Text } from 'react-native';
// import { SForm, SHr, SPopup, SText, STheme, SView } from 'servisofts-component';
// import PButtom from '../../../../Components/PButtom';
// import SSocket from 'servisofts-socket';
// import MDL from '../../../../MDL';
// import Model from '../../../../Model';
// import Btn from './Btn';

// type Props = {
//     key_empresa: string,
//     editObject?: any,
//     onCancel?: Function,
//     onSuccess?: Function,
// }

// export default class PopupCrearMoneda extends Component<Props> {

//     static open(props: Props) {
//         SPopup.open({
//             key: "PopupCrearMoneda",
//             content: <SView style={{
//                 maxWidth: "100%",
//                 maxHeight: "100%",
//                 width: 500,
//                 // height: 500,
//                 borderRadius: 8,
//                 borderColor: STheme.color.card,
//                 borderWidth: 1,
//                 backgroundColor: STheme.color.background
//             }} withoutFeedback >
//                 <PopupCrearMoneda {...props} onCancel={() => {
//                     SPopup.close("PopupCrearMoneda")
//                     if (props.onCancel) props.onCancel()
//                 }}
//                     onSuccess={(e: any) => {
//                         SPopup.close("PopupCrearMoneda")
//                         if (props.onSuccess) props.onSuccess(e)
//                     }}

//                 />
//             </SView>
//         })
//     }
//     form: SForm | undefined = undefined;
//     render() {
//         return <SView col={"xs-12"} center padding={16}>
//             <SText fontSize={16}>{this.props.editObject ? "Editar" : "Crear"}{" Crear Moneda"}</SText>
//             <SForm ref={(ref: any) => this.form = ref} row
//                 style={{
//                     justifyContent: "space-between",
//                 }}
//                 inputs={{
//                     "descripcion": {
//                         label: "Nombre de la moneda", placeholder: "Ingresa el nombre de la moneda", isRequired: true, autoFocus: true,
//                         defaultValue: this.props.editObject?.descripcion,
//                         onSubmitEditing: () => {
//                             if (this.form) this.form.focus("observacion");
//                         }
//                     },
//                     "observacion": {
//                         col: "xs-4",
//                         label: "Simbolo", placeholder: "( 'Bs.' , '$' , '$US' )", isRequired: true,
//                         defaultValue: this.props.editObject?.observacion,
//                         onSubmitEditing: () => {
//                             if (this.form) this.form.focus("tipo_cambio");
//                         }
//                     },
//                     "tipo_cambio": {
//                         col: "xs-7.5",
//                         icon: <SView />,
//                         defaultValue: (!this.props.editObject?.tipo_cambio ? "" : parseFloat(this.props.editObject?.tipo_cambio ?? 0).toFixed(2)),

//                         label: "Tipo de cambio", placeholder: "Ingresa el tipo de cambio", type: "money", isRequired: true,
//                         onSubmitEditing: () => {
//                             if (this.form) this.form.submit();
//                         }
//                     },
//                 }}
//                 onSubmit={(data: any) => {

//                     if (this.props.editObject?.key) {


//                         const serverData = {
//                             ...data,
//                             key: this.props.editObject.key
//                         }
//                         SSocket.sendPromise({
//                             service: "empresa",
//                             component: "empresa_moneda", // 🔥 corregido
//                             type: "editar",
//                             data: serverData,
//                             key_usuario: MDL.usuario.session?.key,
//                         }).then((resp) => {
//                             this.props.onSuccess?.(resp);

//                         }).catch(err => {
//                             console.error("response", err);
//                         })
//                     } else {
//                          SSocket.sendPromise({
//                             service: "empresa",
//                             component: "empresa_moneda",
//                             type: "registro",
//                             key_usuario: Model.usuario.Action.getKey(),
//                             data: {
//                                 key_empresa: this.props.key_empresa,
//                                 key_usuario: Model.usuario.Action.getKey(),
//                                 ...data,
//                             }
//                         }).then(e => {
//                             this.props.onSuccess?.(e);
//                         }).catch(e => {
//                             console.error("response", e);
//                             this.props.onSuccess?.(e);
//                         })
//                     }

//                 }}


//             />
//             <SHr h={16} />
//             <SView row col={"xs-12"}>
//                 {this.props.onCancel && <>
//                     <Btn type='danger' label='CANCELAR' onPress={() => {
//                         if (this.props.onCancel) this.props.onCancel()
//                     }} />
//                     <SView width={8} />
//                 </>}

//                 <Btn type='primary' label='GUARDAR' onPress={() => {
//                     if (this.form) this.form.submit();
//                 }} />

//             </SView>
//         </SView>
//     }
// }
 