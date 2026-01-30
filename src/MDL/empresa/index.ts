import SSocket from "servisofts-socket";
import Model from "../../Model";
import { Empresa, EventListener, Sucursal, TurnoHorarioAtencion } from "./type";
import { SStorage, STheme, SThread } from "servisofts-component";
import { Platform } from "react-native";
import packageInfo from "../../../package.json";
import MDLAbstract from "../MDLAbstract";
import MDL from "..";

export default class empresa extends MDLAbstract<EventListener> {
  select: Empresa | undefined;

  constructor() {
    super();
    this.loadEmpresaFromStorage();
  }

  async componentDidMount() {
    await this.init()
  }

  loadEmpresaFromStorage() {
    SStorage.getItem("empresa_select", (imt: any) => {
      if (!imt) return;
      this.setEmpresa(JSON.parse(imt));
    });
  }

  loadTheme() {
    if (this.select && this.select.theme) {
      STheme.color = {
        ...STheme.color,
        ...this.select.theme,
      };
      STheme.repaint();
    }
  }
  async init() {
    this.loadTheme();
    if (this.select) {
      this.select = await this.getEmpresa(this.select.key);
      this.setEmpresa(this.select);
    }
  }
  setEmpresa(empresa: Empresa) {
    this.select = empresa;
    SStorage.setItem("empresa_select", JSON.stringify(empresa));
    if (empresa.theme) {
      STheme.color = {
        ...STheme.defaultColors,
        ...empresa.theme,
      };
      // STheme.repaint();
    }
    // if (MDL?.caja) {
    //   try {
    //     MDL.caja.getActiva();
    //   } catch (error) {
    //     console.error(error);
    //   }
    // }
    this.dispatchEvent({ type: "onChangeEmpresaSelect", data: empresa });
  }

  async getEmpresa(key: string) {
    const resp: any = await SSocket.sendPromise({
      service: "empresa",
      component: "empresa",
      type: "getByKey",
      key: key,
    });
    return resp.data as Empresa;
  }

  async getAllSucursales(): Promise<Sucursal[]> {
    const resp: any = await SSocket.sendPromise({
      service: "empresa",
      component: "sucursal",
      type: "getByKeyEmpresa",
      key_empresa: MDL.empresa.select?.key,
    });
    return Object.values(resp.data);
  }

  __tipo_pago: any = null;
  async getTipoPago(): Promise<Sucursal[]> {
    if (this.__tipo_pago) return this.__tipo_pago;
    const resp: any = await SSocket.sendPromise({
      service: "empresa",
      component: "tipo_pago",
      type: "getAll",
      key_empresa: MDL.empresa.select?.key,
    });
    this.__tipo_pago = resp.data;
    return this.__tipo_pago;
  }

  async getAllPuntoVentaTipoPago(): Promise<Sucursal[]> {
    const resp: any = await SSocket.sendPromise({
      service: "empresa",
      component: "punto_venta_tipo_pago",
      type: "getAll",
      key_empresa: MDL.empresa.select?.key,
    });
    return resp.data;
  }
  // async punto_venta_tipo_pago_asignado_registro(data: any): Promise<any[]> {
  //   const resp: any = await SSocket.sendPromise({
  //     service: "empresa",
  //     component: "punto_venta_tipo_pago_asignado",
  //     type: "registro",
  //     data: data,
  //     key_empresa: MDL.empresa.select?.key,
  //   });
  //   return resp.data;
  // }

  // async punto_venta_tipo_pago_asignado_eliminar(data: { key_punto_venta: string, key_punto_venta_tipo_pago: string }): Promise<any[]> {
  //   const resp: any = await SSocket.sendPromise({
  //     service: "empresa",
  //     component: "punto_venta_tipo_pago_asignado",
  //     type: "eliminar",
  //     data: data,
  //     key_empresa: MDL.empresa.select?.key,
  //   });
  //   return resp.data;
  // }

  async getByKeyFull(): Promise<any> {
    const resp: any = await SSocket.sendPromise({
      service: "empresa",
      component: "empresa",
      type: "getByKeyFull",
      key: MDL.empresa.select?.key,
    });
    return resp.data;
  }

  _getFullCache: any = {
    data: null,
    key_empresa: "",
    promise: null
  }
  _full: any = null;
  async getFull(): Promise<any> {
    if (this._getFullCache.key_empresa != this.select?.key) {
      this._getFullCache.data = null;
      this._getFullCache.promise = null;
      this._getFullCache.key_empresa = this.select?.key;
    }
    if (this._getFullCache.data) return this._getFullCache.data;
    if (this._getFullCache.promise) return this._getFullCache.promise;
    // if (this._full) {
    //   if (this._full.key === this.select?.key) return this._full;
    // }
    this._getFullCache.promise = SSocket.sendPromise({
      service: "empresa",
      component: "empresa",
      type: "getByKeyFull",
      key: this.select?.key,
    }).then(e => {
      this._getFullCache.data = e.data;  // Guardamos en caché
      this._getFullCache.promise = null;     // Limpiamos la promesa en curso
      return this._getFullCache.data;
    }).catch(e => {
      this._getFullCache.promise = null;     // Limpiar para futuros intentos
      throw e;
    })
    return this._getFullCache.promise;

  }
  setUsuarioLog(data: {
    url: string;
    platform?: string;
    version_app?: string;
    params?: any;
  }) {
    if (!Model.empresa.Action.getKey() || !Model.usuario.Action.getUsuarioLog())
      return;
    data.platform = Platform.OS;
    data.version_app = packageInfo.version;
    SSocket.sendPromise({
      service: "empresa",
      component: "empresa_usuario_log",
      type: "registro",
      key_empresa: Model.empresa.Action.getKey(),
      key_usuario: Model.usuario.Action.getUsuarioLog()?.key,
      data: data,
    })
      .then((e) => {
        // this.setState({ dataLog: e.data })
      })
      .catch((e) => {
        console.error(e);
      });
  }
  async ordenarPaginas(urls: string[], order: "vicita" | "fecha" = "vicita") {
    const resp: any = await SSocket.sendPromise({
      service: "empresa",
      component: "empresa_usuario_log",
      type: "ordenar_paginas",
      order: "vicita",
      key_empresa: Model.empresa.Action.getKey(),
      key_usuario: Model.usuario.Action.getUsuarioLog()?.key,
      data: urls,
    });
    return resp.data as any[];
  }

  async getAllTurno() {
    const resp: any = await SSocket.sendPromise({
      service: "empresa",
      component: "turno",
      type: "getAll",
    });
    return resp.data as Empresa;
  }

  async getAllHorario() {
    const resp: any = await SSocket.sendPromise({
      service: "empresa",
      component: "horario_atencion",
      type: "getAll",
    });
    return resp.data as Empresa;
  }

  async getTurnosHorariosAtencion() {
    const resp: any = await SSocket.sendPromise({
      service: "empresa",
      component: "horario_atencion",
      type: "_get_turno_horarios_atencion",
      key_empresa: Model.empresa.Action.getKey(),
    });
    return resp.data as any[];
  }

  async registroTurnosHorariosAtencion(data: TurnoHorarioAtencion) {
    data.key_usuario = Model.usuario.Action.getKey();
    data.key_empresa = Model.empresa.Action.getKey();
    const resp: any = await SSocket.sendPromise({
      service: "empresa",
      component: "horario_atencion",
      type: "_registroTurnosHorariosAtencion",
      data: data,
    });
    return resp.data;
  }

  async editarTurnosHorariosAtencion(data: TurnoHorarioAtencion) {
    data.key_usuario = Model.usuario.Action.getKey();
    data.key_empresa = Model.empresa.Action.getKey();

    // data.horarios.forEach((h) => (h.dia = "8"));

    const resp: any = await SSocket.sendPromise({
      service: "empresa",
      component: "horario_atencion",
      type: "_editarTurnosHorariosAtencion",
      data: data,
    });
    return resp.data;
  }

  async getByyKeyTurnosHorariosAtencion(parametro: any) {
    const resp: any = await SSocket.sendPromise({
      service: "empresa",
      component: "horario_atencion",
      type: "_getByKeyTurnosHorariosAtencion",
      key_turno: parametro,
    });
    console.log("jajaj ", resp.data);
    return resp.data;
  }


  // const moneda_ = {
  //                                           ...e.row,
  //                                           estado: 0,
  //                                       }
  //                                       SSocket.sendPromise({
  //                                           service: "empresa",
  //                                           component: "empresa_moneda", // 🔥 corregido
  //                                           type: "editar",
  //                                           data: moneda_,
  //                                           key_usuario: MDL.usuario.session?.key,
  //                                       }).then(() => {
  //                                           this.table.loadData();
  //                                           this.forceUpdate();
  //                                       }).catch(err => {
  //                                           console.error("response", err);
  //                                       })



  async getMonedas(): Promise<any> {
    const resp: any = await SSocket.sendPromise({
      service: "empresa",
      component: "empresa",
      type: "getByKeyFull",
      key: MDL.empresa.select?.key,
    });
    return resp.data.monedas;
  }

  async registrarMoneda(data: any) {
    data.key_usuario = MDL.usuario.session?.key;
    data.key_empresa = MDL.empresa.select?.key;

    const resp: any = await SSocket.sendPromise({
      service: "empresa",
      component: "empresa_moneda",
      type: "registro",
      key_turno: MDL.usuario.session?.key,
      data: data,
    });
    console.log("jajajsssssss ", resp.data);
    return resp;
  }

  async editarMoneda(data: any) {
    data.key_usuario = MDL.usuario.session?.key;
    data.key_empresa = MDL.empresa.select?.key;

    const resp: any = await SSocket.sendPromise({
      service: "empresa",
      component: "empresa_moneda",
      type: "editar",
      key_turno: MDL.usuario.session?.key,
      data: data,
    });
    console.log("jajajsssssss ", resp.data);
    return resp.data;
  }

  async getHistorialMoneda(key: any) {
    const resp: any = await SSocket.sendPromise({
      service: "empresa",
      component: "empresa_moneda",
      type: "getByKeyHistorialMoneda",
      key: key,

    });
    console.log("jajajsssssss ", resp.data);
    return resp.data;
  }


  // async getEmpresa(key: string) {
  //   const resp: any = await SSocket.sendPromise({
  //     service: "empresa",
  //     component: "empresa",
  //     type: "getByKey",
  //     key: key,
  //   });
  //   return resp.data as Empresa;
  // }






  async tipo_pagoGetFullCaja(key_punto_venta: any) {
    const tipo_pago = await MDL.caja.tipo_pago_getAll()
    const data = await MDL.empresa.getFull()
    const cuentas = await MDL.contabilidad.getCuentasCache();
    // const suc = data.sucursales.find((suc: any) => suc.puntos_venta.find(pv => pv.key == key_punto_venta));
    // const pv = suc.puntos_venta.find((pv: any) => pv.key == key_punto_venta);
    // this.moneda = data.monedas.find(a => a.key == this.props.key_moneda);
    const moneda_base = data.monedas.find(a => a.tipo == "base");
    let pvtp = await MDL.caja.empresa_tipo_pago_getAll({ key_punto_venta: key_punto_venta })
    pvtp = Object.values(pvtp);
    // if (this.pvtp.length <= 0) {
    //si no tiene tipos de pago asignados, asignar todos los tipos de pago
    pvtp = pvtp.map(item => {
      item.cuenta = cuentas[item.key_cuenta_contable]
      const moneda = data.monedas.find(a => a.key == item?.cuenta?.key_moneda);
      item.moneda = moneda ?? moneda_base;
      // item.moneda = data.monedas.find(a => a.key == item.key_moneda)
      item.tipo_pago = tipo_pago[item.key_tipo_pago];
      // item.monto = this.props.montoMaximo ?? 0;
      // if (this.props.montoMaximoPorTipo && this.props.montoMaximoPorTipo[item.key_tipo_pago]) {
      // item.monto = this.props.montoMaximoPorTipo[item.key_tipo_pago];
      // }
      return { ...item };
    });
    // }
    // if (this.props.solo_para_caja) {
    // this.pvtp = this.pvtp.filter(a => a.tipo_pago?.pasa_por_caja);
    // }
    pvtp.sort((a, b) => {
      return a.tipo_pago?.orden - b.tipo_pago?.orden
    })
    return pvtp;
  }


}
