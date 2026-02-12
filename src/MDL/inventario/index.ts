import SSocket from "servisofts-socket";
import MDLAbstract from "../MDLAbstract";
import { EventListener } from "./types";
import MDL from "..";
import proveedor from "./proveedor";
import tag from "./tag";
import modelo_tag from "./modelo_tag";
import asistencia from "./asistencia";
import marca from "./marca";
export default class inventario extends MDLAbstract<EventListener> {
  async componentDidMount() { }
  proveedor = new proveedor();
  tag = new tag();
  modelo_tag = new modelo_tag();
  asistencia = new asistencia();
  marca = new marca();
  TIPOS_DE_PRODUCTOS = [
    {
      key: "inventario",
      cuentas: ["key_cuenta_contable", "key_cuenta_contable_ganancia", "key_cuenta_contable_costo"]
    },
    {
      key: "consumible",
      cuentas: ["key_cuenta_contable_ganancia", "key_cuenta_contable_costo"]
    }, {
      key: "activo_fijo",
      cuentas: ["key_cuenta_contable", "key_cuenta_contable_ganancia", "key_cuenta_contable_costo", "key_cuenta_contable_depreciacion_activo", "key_cuenta_contable_depreciacion_gasto"]
    }, {
      key: "servicio",
      cuentas: ["key_cuenta_contable_ganancia", "key_cuenta_contable_costo"]
    }
  ]
  async getPizarraIngrediente() {
    const resp: any = await SSocket.sendPromise({
      version: "1.0",
      service: "inventario",
      component: "ingrediente",
      type: "getPizarra",
      key_empresa: MDL.empresa.select?.key,
      key_usuario: MDL.usuario.session?.key,
    });
    return Object.values(resp.data || {});
  }
  async execute_function(func: string, params: string[]) {
    let newParams: any = [];
    if (params) {
      params.map(p => {
        if (typeof p == "string") {
          p = "'" + p + "'"
        }
        newParams.push(p)
      })
    }
    const resp: any = await SSocket.sendPromise({
      service: "inventario",
      component: "reporte",
      type: "execute_function",
      func: func,
      params: newParams,
    });
    return resp.data || [];
  }
  async getAllModeloStock(_key_almacen: string, _key_sucursal: string) {
    const resp: any = await SSocket.sendPromise({
      version: "1.0",
      service: "inventario",
      component: "modelo",
      type: "getAllStock",
      key_empresa: MDL.empresa.select?.key,
      key_usuario: MDL.usuario.session?.key,
      key_almacen: _key_almacen,
      key_sucursal: _key_sucursal,
      // key_sucursal: '83b86c27-e05c-4de8-bbbe-7b3ec842a20d',
      // key_sucursal: 'a23a8cd5-840d-4099-9ddc-1a906913c8e2',
    });
    return Object.values(resp.data || {});
  }
  async getContactosByModelo(_key_modelo: string) {
    const resp: any = await SSocket.sendPromise({
      service: "inventario",
      component: "reporte",
      type: "execute_function",
      func: "_get_contactos_bymodelo",
      params: ["'" + _key_modelo + "'"],
    });
    return Object.values(resp.data || {});
  }
  async getTipoCostosByModelo(_key_modelo: string) {
    const resp: any = await SSocket.sendPromise({
      service: "inventario",
      component: "reporte",
      type: "execute_function",
      func: "_get_tipo_costo_bymodelo",
      params: ["'" + _key_modelo + "'"],
    });
    return Object.values(resp.data || {});
  }
  async getAllAsistencias() {
    const resp: any = await SSocket.sendPromise({
      version: "1.0",
      service: "inventario",
      component: "asistencia",
      type: "getAll",
      key_empresa: MDL.empresa.select?.key,
    });
    return Object.values(resp.data || {});
  }
  async getModelosByCliente(key_cliente: string) {
    const resp: any = await SSocket.sendPromise({
      version: "1.0",
      service: "inventario",
      component: "modelo_cliente",
      type: "getByKeyCliente",
      key_empresa: MDL.empresa.select?.key,
      key_usuario: MDL.usuario.session?.key,
      key_cliente: key_cliente,
    });
    return Object.values(resp.data || {});
  }
  async saveModeloCliente(modelo_cliente: {
    key?: string,
    key_cliente: string,
    estado?: number
  }) {
    const resp: any = await SSocket.sendPromise({
      version: "1.0",
      service: "inventario",
      component: "modelo_cliente",
      type: "registro",
      data: modelo_cliente,
      key_empresa: MDL.empresa.select?.key,
      key_usuario: MDL.usuario.session?.key,
    });
    return resp.data;
  }
  async editModeloCliente(modelo_cliente: {
    key?: string,
    key_cliente: string,
    estado?: number
  }) {
    const resp: any = await SSocket.sendPromise({
      version: "1.0",
      service: "inventario",
      component: "modelo_cliente",
      type: "editar",
      data: modelo_cliente,
      key_empresa: MDL.empresa.select?.key,
      key_usuario: MDL.usuario.session?.key,
    });
    return resp.data;
  }
  async getAllModeloStockBySucursal(key_sucursal: string) {
    const resp: any = await SSocket.sendPromise({
      version: "1.0",
      service: "inventario",
      component: "modelo",
      type: "getAllStock",
      key_empresa: MDL.empresa.select?.key,
      key_usuario: MDL.usuario.session?.key,
      key_sucursal: key_sucursal,
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
  async getAllTipoCosto() {
    const resp: any = await SSocket.sendPromise({
      version: "1.0",
      service: "inventario",
      component: "tipo_costo",
      type: "getAll",
      key_empresa: MDL.empresa.select?.key,
      key_usuario: MDL.usuario.session?.key,
    });
    return Object.values(resp.data || {});
  }
  async editSuscripcion(modelo_cliente: {
    key?: string,
    key_cliente: string,
    fecha_inicio: string,
    fecha_fin: string,
    estado?: number
  }) {
    const resp: any = await SSocket.sendPromise({
      version: "1.0",
      service: "inventario",
      component: "suscripcion",
      type: "editar",
      data: modelo_cliente,
      key_empresa: MDL.empresa.select?.key,
      key_usuario: MDL.usuario.session?.key,
    });
    return resp.data;
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
  async saveIngrediente(ingrediente: any) {
    if (ingrediente.key) {
      const resp: any = await SSocket.sendPromise({
        version: "1.0",
        service: "inventario",
        component: "ingrediente",
        type: "editar",
        data: ingrediente,
        key_empresa: MDL.empresa.select?.key,
        key_usuario: MDL.usuario.session?.key,
      });
      return resp.data;
    } else {
      const resp: any = await SSocket.sendPromise({
        version: "1.0",
        service: "inventario",
        component: "ingrediente",
        type: "registro",
        data: ingrediente,
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
  async saveReceta(receta: any) {
    const resp: any = await SSocket.sendPromise({
      version: "1.0",
      service: "inventario",
      component: "receta",
      type: "save",
      data: receta,
      key_empresa: MDL.empresa.select?.key,
      key_usuario: MDL.usuario.session?.key,
    });
    return resp.data;
  }
  async deleteReceta(key: any) {
    const resp: any = await SSocket.sendPromise({
      version: "1.0",
      service: "inventario",
      component: "receta",
      type: "editar",
      data: {
        key: key,
        estado: 0
      },
      key_empresa: MDL.empresa.select?.key,
      key_usuario: MDL.usuario.session?.key,
    });
    return resp.data;
  }
  async saveAlmacen(almacen: any) {
    almacen.data.key_empresa = MDL.empresa.select?.key;
    if (almacen.data.key) {
      const resp: any = await SSocket.sendPromise({
        version: "1.0",
        service: "inventario",
        component: "almacen",
        type: "editar",
        data: almacen.data,
        key_empresa: MDL.empresa.select?.key,
        key_usuario: MDL.usuario.session?.key,
      });
      return resp.data;
    } else {
      const resp: any = await SSocket.sendPromise({
        version: "1.0",
        service: "inventario",
        component: "almacen",
        type: "registro",
        data: almacen.data,
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
  async saveTipoCosto(tipo_costo: any) {
    if (tipo_costo.key) {
      const resp: any = await SSocket.sendPromise({
        version: "1.0",
        service: "inventario",
        component: "tipo_costo",
        type: "editar",
        data: tipo_costo,
        key_empresa: MDL.empresa.select?.key,
        key_usuario: MDL.usuario.session?.key,
      });
      return resp.data;
    } else {
      const resp: any = await SSocket.sendPromise({
        version: "1.0",
        service: "inventario",
        component: "tipo_costo",
        type: "registro",
        data: tipo_costo,
        key_empresa: MDL.empresa.select?.key,
        key_usuario: MDL.usuario.session?.key,
      });
      return resp.data;
    }
  }
  async editarModeloProveedor(data: any) {
    const resp: any = await SSocket.sendPromise({
      version: "1.0",
      service: "inventario",
      component: "modelo_proveedor",
      type: "editar",
      data: data,
      key_usuario: MDL.usuario.session?.key,
    });
    return resp.data;
  }
  async saveModeloProveedor(modelo_proveedor: {
    key?: string,
    key_modelo: string,
    key_proveedor: string,
    estado?: number
  }) {
    if (modelo_proveedor.key) {
      const resp: any = await SSocket.sendPromise({
        version: "1.0",
        service: "inventario",
        component: "modelo_proveedor",
        type: "editar",
        data: modelo_proveedor,
        key_empresa: MDL.empresa.select?.key,
        key_usuario: MDL.usuario.session?.key,
      });
      return resp.data;
    } else {
      const resp: any = await SSocket.sendPromise({
        version: "1.0",
        service: "inventario",
        component: "modelo_proveedor",
        type: "registro",
        data: modelo_proveedor,
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
        key_modelo: key_modelo,
        key_empresa: MDL.empresa.select?.key,
        key_usuario: MDL.usuario.session?.key,
      });
      return resp.data;
    }
  }
  async exec(query: string) {
    const resp: any = await SSocket.sendPromise({
      version: "1.0",
      service: "inventario",
      component: "db",
      type: "exec",
      query: query,
    });
    return resp.data;
  }
  async getAllConteoManualInventario() {
    const resp: any = await SSocket.sendPromise({
      service: "inventario",
      component: "conteo_manual_inventario",
      type: "getAll",
      key_almacen: MDL.empresa.select?.key,
    });
    return Object.values(resp.data || {});
  }
  async aplicar_cardex(_key_conteo: string) {
    const resp: any = await SSocket.sendPromise({
      service: "inventario",
      component: "conteo_manual_inventario",
      type: "aplicar_cardex",
      key_usuario: MDL.usuario.session?.key,
      key_empresa: MDL.empresa.select?.key,
      key_conteo: _key_conteo,
    });
    return Object.values(resp.data || {});
  }
  async anular_cardex(_key_conteo: string) {
    const resp: any = await SSocket.sendPromise({
      service: "inventario",
      component: "conteo_manual_inventario",
      type: "anular_cardex",
      key_empresa: MDL.empresa.select?.key,
      key_conteo: _key_conteo,
    });
    return Object.values(resp.data || {});
  }
  async saveConteoManualInventario(obj: any) {
    if (!obj.key) {
      const resp: any = await SSocket.sendPromise({
        service: "inventario",
        component: "conteo_manual_inventario",
        type: "registro",
        data: obj.data,
        key_almacen: obj.key_almacen,
        key_usuario: MDL.usuario.session?.key,
      });
      this.dispatchEvent({
        type: "chavalEventos",
      });
      return resp.data;
    }
  }
  async updateConteoManualInventario(
    data: any[],
    key_almacen: string,
    key_contador: string
  ) {
    const resp: any = await SSocket.sendPromise({
      service: "inventario",
      component: "conteo_manual_inventario",
      type: "editar",
      data: data,
      key_almacen: key_almacen,
      key_usuario: MDL.usuario.session?.key,
      key: key_contador,
    });
    this.dispatchEvent({
      type: "chavalEventos",
    });
    return resp.data;
  }
  async getAll_reporte_conteo_inventario_detallado(fecha_inicio: string, fecha_fin: string) {
    const resp: any = await SSocket.sendPromise({
      service: "inventario",
      component: "conteo_manual_inventario",
      type: "getAll_reporte_conteo_inventario_detallado",
      key_empresa: MDL.empresa.select?.key,
      fecha_inicio: fecha_inicio,
      fecha_fin: fecha_fin,
    });
    return resp.data;
  }
  async getByKey_reporte_conteo_inventario_detallado(key_contador: any) {
    const resp: any = await SSocket.sendPromise({
      service: "inventario",
      component: "conteo_manual_inventario",
      type: "getByKeyConteo",
      key_contador: key_contador,
    });
    return resp.data;
  }
}
