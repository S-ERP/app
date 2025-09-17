import SSocket from "servisofts-socket";
import MDLAbstract from "../MDLAbstract";
import { EventListener } from "./types";
import MDL from "..";
import proveedor from "./proveedor";

export default class inventario extends MDLAbstract<EventListener> {
  async componentDidMount() { }

  proveedor = new proveedor();

  TIPOS_DE_PRODUCTOS = [
    {
      key: "inventario",
      cuentas: ["key_cuenta_contable", "key_cuenta_contable_ganancia", "key_cuenta_contable_costo"]
    },
    {
      key: "consumible",
      cuentas: ["key_cuenta_contable_ganancia", "key_cuenta_contable_costo"]
    },{
      key: "activo_fijo",
      cuentas: ["key_cuenta_contable", "key_cuenta_contable_ganancia", "key_cuenta_contable_costo", "key_cuenta_contable_depreciacion_activo", "key_cuenta_contable_depreciacion_gasto"]
    }, {
      key: "servicio",
      cuentas: ["key_cuenta_contable_ganancia", "key_cuenta_contable_costo"]
    }
  ]

  async getAllModeloStock(_key_almacen: string) {
    const resp: any = await SSocket.sendPromise({
      version: "1.0",
      service: "inventario",
      component: "modelo",
      type: "getAllStock",
      key_empresa: MDL.empresa.select?.key,
      key_usuario: MDL.usuario.session?.key,
      key_almacen: _key_almacen,
    });
    console.log("getAllModeloStock", resp.data);
    return Object.values(resp.data || {});
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
    console.log("getAllModeloStock", resp.data);
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
  async saveAlmacen(almacen: any) {
    almacen.data.key_empresa = MDL.empresa.select?.key;
    if (almacen.data.key) {
      // console.log("ALmacen editado " + JSON.stringify(almacen))
      // return;
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
      // console.log("ALmacen save " + JSON.stringify(almacen))
      // return;
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
        // data: modelo,
        key_modelo: key_modelo,
        key_empresa: MDL.empresa.select?.key,
        key_usuario: MDL.usuario.session?.key,
      });
      console.log("print " + JSON.stringify(resp.data));
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
    console.log("aplicar_cardex", resp.data);
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
    console.log("aplicar_cardex", resp.data);
    return Object.values(resp.data || {});
  }
  //   async saveModelo(modelo: any) {
  //     if (modelo.key) {
  //       const resp: any = await SSocket.sendPromise({
  //         version: "1.0",
  //         service: "inventario",
  //         component: "modelo",
  //         type: "editar",
  //         data: modelo,
  //         key_empresa: MDL.empresa.select?.key,
  //         key_usuario: MDL.usuario.session?.key,
  //       });
  //       return resp.data;
  //     } else {
  //       const resp: any = await SSocket.sendPromise({
  //         version: "1.0",
  //         service: "inventario",
  //         component: "modelo",
  //         type: "registro",
  //         data: modelo,
  //         key_empresa: MDL.empresa.select?.key,
  //         key_usuario: MDL.usuario.session?.key,
  //       });
  //       return resp.data;
  //     }
  //   }
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
  //   async updateConteoManualInventario(
  //     data: any[],
  //     key_cliente_proyecto: string
  //   ) {
  //     // data.key_empresa = Model.empresa.Action.getKey();
  //     const resp: any = await SSocket.sendPromise({
  //       service: "crm",
  //       component: "cliente_proyecto",
  //       type: "editarCarrito",
  //       key_cliente_proyecto: key_cliente_proyecto,
  //       data: data,
  //       key_usuario: Model.usuario.Action.getKey(),
  //     });
  //     return resp.data;
  //   }
  async updateConteoManualInventario(
    data: any[],
    key_almacen: string,
    key_contador: string
  ) {
    // if (obj.key) {
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
    // }
  }
  async getAll_reporte_conteo_inventario_detallado() {
    const resp: any = await SSocket.sendPromise({
      service: "inventario",
      component: "conteo_manual_inventario",
      type: "getAll_reporte_conteo_inventario_detallado",
      key_empresa: MDL.empresa.select?.key,
    });
    return resp.data;
  }
  async getByKey_reporte_conteo_inventario_detallado(key_contador: any) {
    const resp: any = await SSocket.sendPromise({
      service: "inventario",
      component: "conteo_manual_inventario",
      type: "getByKeyConteo",
      key_contador: key_contador,
      //   key_almacen: key_contador,
    });
    //    return Object.values(resp.data || {});
    return resp.data;
  }
  // async getAll_reporte_conteo_inventario_detallado() {
  // const resp: any = await SSocket.sendPromise({
  //   service: "inventario",
  //   component: "conteo_manual_inventario",
  //   type: "getAll_reporte_conteo_inventario_detallado",
  //   key_empresa: MDL.empresa.select?.key,
  //  });
  // return resp.data;
  // }
  // {/* <DinamicTable.Col key="key_usuario" label="Usuario" width={250} data={(e) => e.row?.key_usuario} /> */}
}
