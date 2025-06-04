import SSocket from "servisofts-socket";
import { Campana, Proyecto, ProyectoProducto } from "./type";
import Model from "../../Model";

export default class proyectoProducto {

 async getAll() {
  const resp: any = await SSocket.sendPromise({ service: "crm", component: "proyecto_producto", type: "getAll", key_usuario: Model.usuario.Action.getKey() });
  return Object.values(resp.data);
 }
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