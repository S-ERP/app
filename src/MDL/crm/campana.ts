import SSocket from "servisofts-socket";
import { Campana, Cliente, Proyecto } from "./type";
import Model from "../../Model";

export default class campana {

  async getAll() {
    const resp: any = await SSocket.sendPromise({ service: "crm", component: "campana", type: "getAll", key_usuario: Model.usuario.Action.getKey() });
    return Object.values(resp.data);
  }
  async registrar(data: Campana) {
    //   data.key_empresa = Model.empresa.Action.getKey();
    const resp: any = await SSocket.sendPromise({ service: "crm", component: "campana", type: "registro", data: data, key_usuario: Model.usuario.Action.getKey() })
    return resp.data;
  }
  async me_interesa(data:any) {
    //   data.key_empresa = Model.empresa.Action.getKey();
    const resp: any = await SSocket.sendPromise({ service: "crm", component: "campana", type: "me_interesa", ...data, key_usuario: Model.usuario.Action.getKey() })
    return resp.data;
  }
  async editar(data: Campana) {
    //   data.key_empresa = Model.empresa.Action.getKey();
    const resp: any = await SSocket.sendPromise({ service: "crm", component: "campana", type: "editar", data: data, key_usuario: Model.usuario.Action.getKey() });
    return resp.data;
  }
  async eliminar(data: Campana) {
    //   data.key_empresa = Model.empresa.Action.getKey();
    const resp: any = await SSocket.sendPromise({ service: "crm", component: "campana", type: "editar", data: { ...data, estado: 0 }, key_usuario: Model.usuario.Action.getKey() });
    return resp.data;
  }
}