import SSocket from "servisofts-socket";
import MDLAbstract from "../MDLAbstract";
import { EventListener } from "./types";
import MDL from "..";


export default class inventario extends MDLAbstract<EventListener> {
  async componentDidMount() {}

  async getAllModeloStock() {
    const resp: any = await SSocket.sendPromise({
      version: "1.0",
      service: "inventario",
      component: "modelo",
      type: "getAllStock",
      key_empresa: MDL.empresa.select?.key,
      key_usuario: MDL.usuario.session?.key,
    });

    return Object.values(resp.data || {});
  }
  async getAllModelo() {
    const resp: any = await SSocket.sendPromise({
      version: "1.0",
      service: "inventario",
      component: "modelo",
      type: "getAll",
      key_empresa: MDL.empresa.select?.key,
      key_usuario: MDL.usuario.session?.key,
    });

    return Object.values(resp.data || {});
  }
  async getAllMarca() {
    const resp: any = await SSocket.sendPromise({
      version: "1.0",
      service: "inventario",
      component: "marca",
      type: "getAll",
      key_empresa: MDL.empresa.select?.key,
      key_usuario: MDL.usuario.session?.key,
    });
    return Object.values(resp.data || {});
  }
  async getAllTipoProducto() {
    const resp: any = await SSocket.sendPromise({
      version: "1.0",
      service: "inventario",
      component: "tipo_producto",
      type: "getAll",
      key_empresa: MDL.empresa.select?.key,
      key_usuario: MDL.usuario.session?.key,
    });
    return Object.values(resp.data || {});
  }
  async getAllAlmacen() {
    const resp: any = await SSocket.sendPromise({
      version: "1.0",
      service: "inventario",
      component: "almacen",
      type: "getAll",
      key_empresa: MDL.empresa.select?.key,
      key_usuario: MDL.usuario.session?.key,
    });
    return Object.values(resp.data || {});
  }
  async saveModelo(modelo: any) {
    if (modelo.key) {
      const resp: any = await SSocket.sendPromise({
        version: "1.0",
        service: "inventario",
        component: "modelo",
        type: "editar",
        data: modelo,
        key_empresa: MDL.empresa.select?.key,
        key_usuario: MDL.usuario.session?.key,
      });
      return resp.data;
    } else {
      const resp: any = await SSocket.sendPromise({
        version: "1.0",
        service: "inventario",
        component: "modelo",
        type: "registro",
        data: modelo,
        key_empresa: MDL.empresa.select?.key,
        key_usuario: MDL.usuario.session?.key,
      });
      return resp.data;
    }
  }
  async saveMarca(marca: any) {
    if (marca.key) {
      const resp: any = await SSocket.sendPromise({
        version: "1.0",
        service: "inventario",
        component: "marca",
        type: "editar",
        data: marca,
        key_empresa: MDL.empresa.select?.key,
        key_usuario: MDL.usuario.session?.key,
      });
      return resp.data;
    } else {
      const resp: any = await SSocket.sendPromise({
        version: "1.0",
        service: "inventario",
        component: "marca",
        type: "registro",
        data: marca,
        key_empresa: MDL.empresa.select?.key,
        key_usuario: MDL.usuario.session?.key,
      });
      return resp.data;
    }
  }
  async saveProducto(producto: any) {
    if (producto.key) {
      const resp: any = await SSocket.sendPromise({
        version: "1.0",
        service: "inventario",
        component: "producto",
        type: "editar",
        data: producto,
        key_empresa: MDL.empresa.select?.key,
        key_usuario: MDL.usuario.session?.key,
      });
      return resp.data;
    } else {
      const resp: any = await SSocket.sendPromise({
        version: "1.0",
        service: "inventario",
        component: "producto",
        type: "registro",
        data: producto,
        key_empresa: MDL.empresa.select?.key,
        key_usuario: MDL.usuario.session?.key,
      });
      return resp.data;
    }
  }
  async saveTipoProducto(tipo_producto: any) {
    if (tipo_producto.key) {
      const resp: any = await SSocket.sendPromise({
        version: "1.0",
        service: "inventario",
        component: "tipo_producto",
        type: "editar",
        data: tipo_producto,
        key_empresa: MDL.empresa.select?.key,
        key_usuario: MDL.usuario.session?.key,
      });
      return resp.data;
    } else {
      const resp: any = await SSocket.sendPromise({
        version: "1.0",
        service: "inventario",
        component: "tipo_producto",
        type: "registro",
        data: tipo_producto,
        key_empresa: MDL.empresa.select?.key,
        key_usuario: MDL.usuario.session?.key,
      });
      return resp.data;
    }
  }

  async getAllProductos(key_modelo: any) {
    if (key_modelo) {
      const resp: any = await SSocket.sendPromise({
        version: "1.0",
        service: "inventario",
        component: "modelo",
        type: "getAllProductos",
        // data: modelo,
        key_modelo: key_modelo,
        key_empresa: MDL.empresa.select?.key,
        key_usuario: MDL.usuario.session?.key,
      });
        console.log("print " + JSON.stringify(resp.data));
      return resp.data;
    }
  }
}