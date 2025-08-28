import SSocket from "servisofts-socket";
import { Campana, Proyecto, ProyectoProducto } from "./type";
import Model from "../../Model";
import MDL from "..";

export default class proyectoProducto {

  async getAll() {
    const resp: any = await SSocket.sendPromise({ service: "crm", component: "proyecto_producto", type: "getAll", key_usuario: Model.usuario.Action.getKey() });
    return Object.values(resp.data);
  }
  async getAllConProductos() {
    const resp: any = await SSocket.sendPromise({ service: "crm", component: "proyecto_producto", type: "getAll", key_usuario: Model.usuario.Action.getKey() });
    const respProductos: any = await MDL.inventario.getAllModeloStock("");

    const arr = Object.values(resp.data);
    
    arr.forEach((obj: any) => {
      obj.producto = respProductos.find((producto: any) => producto.key == obj.key_modelo);
    })
    return arr;
  }
  // async getAllConProductos() {
  //   const resp: any = await SSocket.sendPromise({ service: "crm", component: "proyecto_producto", type: "getAll", key_usuario: Model.usuario.Action.getKey() });
  //   const respProductos: any = await SSocket.sendPromise({
  //     "service": "inventario",
  //     "component": "producto",
  //     "type": "getCategoriasProductosDetallePartner",
  //     "key_empresa": Model.empresa.Action.getKey(),
  //     "key_usuario": Model.usuario.Action.getKey(),
  //   })

  //   const arr = Object.values(resp.data);
  //   const productos: any = {};
  //   respProductos.data.forEach((cat: any) => {
  //     cat.productos.forEach((producto: any) => {
  //       productos[producto.key] = producto;
  //     });
  //   })
  //   arr.forEach((obj: any) => {
  //     obj.producto = productos[obj.key_producto];
  //   })
  //   return arr;
  // }
  async registrar(data: ProyectoProducto) {
    //   data.key_empresa = Model.empresa.Action.getKey();
    const resp: any = await SSocket.sendPromise({ service: "crm", component: "proyecto_producto", type: "registro", data: data, key_usuario: Model.usuario.Action.getKey() })
    return resp.data;
  }
  async editar(data: ProyectoProducto) {
    //   data.key_empresa = Model.empresa.Action.getKey();
    const resp: any = await SSocket.sendPromise({ service: "crm", component: "proyecto_producto", type: "editar", data: data, key_usuario: Model.usuario.Action.getKey() });
    return resp.data;
  }
  async eliminar(data: ProyectoProducto) {
    //   data.key_empresa = Model.empresa.Action.getKey();
    const resp: any = await SSocket.sendPromise({ service: "crm", component: "proyecto_producto", type: "editar", data: { ...data, estado: 0 }, key_usuario: Model.usuario.Action.getKey() });
    return resp.data;
  }
}