
import SSocket from "servisofts-socket";
// import { Proyecto } from "./type";
import Model from "../../Model";
import MDL from "..";
// import MDL from "..";

export default class modelo_tag {
  async componentDidMount() { }

  async getAll() {
    const resp: any = await SSocket.sendPromise({
      service: "inventario",
      component: "modelo_tag",
      type: "getAll",
      key_empresa: Model.empresa.Action.getKey(),
    });
    return Object.values(resp.data || {});
    // return resp.data ;
    // return JSON.stringify(resp.data);
  }

  async getByKey(key_modelo_tag: string) {
    const resp: any = await SSocket.sendPromise({
      service: "inventario",
      component: "modelo_tag",
      type: "getByKey",
      key: key_modelo_tag,
      key_empresa: Model.empresa.Action.getKey(),
    });
    return resp.data;
  }

  async editar(data: any) {
    const resp: any = await SSocket.sendPromise({
      service: "inventario",
      component: "modelo_tag",
      type: "editar",
      data: data,
      key_usuario: Model.usuario.Action.getKey(),
    });
    return resp.data;
  }

 
  

  async registrar(data: any) {
    data.key_empresa = MDL.empresa.select?.key;
    const resp: any = await SSocket.sendPromise({
      service: "inventario",
      component: "modelo_tag",
      type: "registro",
      data: data,
      key_usuario: Model.usuario.Action.getKey(),
    });
    return resp.data;
  }
}