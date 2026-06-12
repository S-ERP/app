
import SSocket from "servisofts-socket";
// import { Proyecto } from "./type";
import Model from "../../Model";
import MDL from "..";
// import MDL from "..";

export default class proveedor {
  // export default class proveedor extends MDLAbstract<EventListener> {
  async componentDidMount() { }

  async getAllProveedor() {
    const resp: any = await SSocket.sendPromise({
      service: "inventario",
      component: "proveedor",
      type: "getAll",
      key_empresa: Model.empresa.Action.getKey(),
    });


    return Object.values(resp.data || {});
    // return resp.data ;
    // return JSON.stringify(resp.data);
  }

  async getByKey(key_proveedor: string) {
    const resp: any = await SSocket.sendPromise({
      service: "inventario",
      component: "proveedor",
      type: "getByKey",
      key: key_proveedor,
      key_empresa: Model.empresa.Action.getKey(),
    });
    return resp.data;
  }

  async editar(data: any) {

    // console.log("editar aqui vemos " + JSON.stringify(data))
    // return;

    const resp: any = await SSocket.sendPromise({
      service: "inventario",
      component: "proveedor",
      type: "editar",
      data: data,
      key_usuario: Model.usuario.Action.getKey(),
    });
    return resp.data;
  }
// richard

 async registrar(data: Cliente) {
    data.key_empresa = Model.empresa.Action.getKey();
    const resp: any = await SSocket.sendPromise({
      service: "crm",
      component: "cliente",
      type: "registro",
      data: data,
      key_usuario: Model.usuario.Action.getKey(),
    });
    return resp.data;
  }

  // async registrar(data: any) {
  //   data.key_empresa = MDL.empresa.select?.key;
  //   // data.nombre = "oruro";
  //   // data.nit = "10";

  //   // console.log("registrar aqui vemos " + JSON.stringify(data))
  //   // return;
  //   const resp: any = await SSocket.sendPromise({
  //     service: "inventario",
  //     component: "proveedor",
  //     type: "registro",
  //     data: data,
  //     key_usuario: Model.usuario.Action.getKey(),
  //   });
  //   return resp.data;
  // }
}