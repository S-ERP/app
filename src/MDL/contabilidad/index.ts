import SSocket from "servisofts-socket";
import MDLAbstract from "../MDLAbstract";
import { EventListener } from "./types";
import MDL from "..";
import cuenta_contable from "./cuenta_contable";
import centro_costo_tipo from "./centro_costo_tipo";
import centro_costo from "./centro_costo";
import diario from "./diario";

export default class contabilidad extends MDLAbstract<EventListener> {
  color_tipo = {
    "ACTIVO": "#4CAF50",
    "PASIVO": "#FF9800",
    "PATRIMONIO": "#2196F3",
    "INGRESO": "#9C27B0",
    "GASTO": "#F44336"
  }
  cuenta_contable = new cuenta_contable();
  centro_costo_tipo = new centro_costo_tipo();
  centro_costo = new centro_costo();
  diario = new diario();

  async componentDidMount() {
    this.cuenta_contable.componentDidMount();
  }

  round(val: number) {
    if (isNaN(val)) return 0;
    return Math.round(val * 100) / 100;
  }
  async saveAjusteEmpresa(ajuste: any) {
    const resp: any = await SSocket.sendPromise({
      version: "1.0",
      service: "contabilidad",
      component: "ajuste_empresa",
      type: ajuste.key ? "editar" : "registro",
      data: ajuste,
      key_empresa: MDL.empresa.select?.key,
      key_usuario: MDL.usuario.session?.key,
    });
    return resp.data;
  }
  async getAjustes() {
    const resp: any = await SSocket.sendPromise({
      version: "1.0",
      service: "contabilidad",
      component: "ajuste",
      type: "getAllByEmpresa",
      key_empresa: MDL.empresa.select?.key,
      key_usuario: MDL.usuario.session?.key,
    });
    return resp.data;
  }
  async getAjuste(key: string) {
    const ajustes = await this.getAjustes();
    return ajustes.find((ajuste: any) => ajuste.key === key);
  }
  async getCuentas() {
    const resp: any = await SSocket.sendPromise({
      version: "1.0",
      service: "contabilidad",
      component: "cuenta_contable",
      type: "getAll",
      eliminado: false,
      key_empresa: MDL.empresa?.select?.key,
      key_usuario: MDL.usuario?.session?.key,
    });
    return resp.data;
  }

  ajustesCache: any = {
    data: null,
    key_empresa: "",
    promise: null
  }
  async getAjustesCache() {
    if (MDL.empresa?.select?.key != this.ajustesCache.key_empresa) {
      this.ajustesCache.data = null;
      this.ajustesCache.promise = null;
      this.ajustesCache.key_empresa = MDL.empresa?.select?.key;
    }
    if (this.ajustesCache.data) return this.ajustesCache.data;
    if (this.ajustesCache.promise) return this.ajustesCache.promise;
    this.ajustesCache.promise = SSocket.sendPromise({
      version: "1.0",
      service: "contabilidad",
      component: "ajuste",
      type: "getAllByEmpresa",
      key_empresa: MDL.empresa.select?.key,
      key_usuario: MDL.usuario.session?.key,
    }).then((resp: any) => {
      this.ajustesCache.data = resp.data;  // Guardamos en caché
      this.ajustesCache.promise = null;     // Limpiamos la promesa en curso
      return this.ajustesCache.data;
    }).catch((err: any) => {
      this.ajustesCache.promise = null;     // Limpiar para futuros intentos
      throw err;
    });
    return this.ajustesCache.promise;
  }

  async getAjusteCache(key: string) {
    const ajustes = await this.getAjustesCache();
    return ajustes.find((ajuste: any) => ajuste.key === key);
  }
  cuentasCache: any = {
    data: null,
    key_empresa: "",
    promise: null
  }
  async getCuentasCache() {
    if (MDL.empresa?.select?.key != this.cuentasCache.key_empresa) {
      this.cuentasCache.data = null;
      this.cuentasCache.promise = null;
      this.cuentasCache.key_empresa = MDL.empresa?.select?.key;
    }
    if (this.cuentasCache.data) return this.cuentasCache.data;
    if (this.cuentasCache.promise) return this.cuentasCache.promise;

    this.cuentasCache.promise = SSocket.sendPromise({
      version: "1.0",
      service: "contabilidad",
      component: "cuenta_contable",
      type: "getAll",
      eliminado: false,
      key_empresa: MDL.empresa?.select?.key,
      key_usuario: MDL.usuario?.session?.key,
    }).then((resp: any) => {
      this.cuentasCache.data = resp.data;  // Guardamos en caché
      this.cuentasCache.promise = null;     // Limpiamos la promesa en curso
      return this.cuentasCache.data;
    }).catch((err: any) => {
      this.cuentasCache.promise = null;     // Limpiar para futuros intentos
      throw err;
    });
    return this.cuentasCache.promise;
  }

  armarNiveles(cuentas: any[]) {
    const niveles: any = {};
    cuentas.map(e => {
      if (!e?.codigo) return;
      const lvl = e.codigo.length
      niveles[lvl] = true;
    })
    return Object.keys(niveles).map(n => parseInt(n)).sort((a, b) => a - b);
  }
  getCuentasGrafo(cuentas: any[]) {
    cuentas.map(c => {
      // HIJAS: buscar solo las del nivel más cercano
      const posiblesHijas = cuentas.filter(
        h => h.codigo.startsWith(c.codigo) && h.codigo.length > c.codigo.length
      );

      // tomamos la longitud mínima entre las hijas
      const minLen = Math.min(...posiblesHijas.map(h => h.codigo.length), Infinity);

      const hijas = posiblesHijas.filter(h => h.codigo.length === minLen);

      // PADRE: buscar solo el más cercano hacia arriba
      const posiblesPadres = cuentas.filter(
        h => h.codigo.length < c.codigo.length && c.codigo.startsWith(h.codigo)
      );

      // tomamos el padre con mayor longitud (el más cercano)
      const padre = posiblesPadres.sort((a, b) => b.codigo.length - a.codigo.length)[0] || null;

      c.parent = padre;
      c.childrens = hijas;
    });
    return cuentas;
  }
  agruparCuentas(cuentas: any) {
    const mapa: any = {};
    const raiz: any[] = [];

    // Primero, crea un mapa con todos los códigos
    cuentas.forEach((cuenta: any) => {
      cuenta.hijos = [];
      mapa[cuenta.codigo] = cuenta;
    });

    // Ahora, asigna cada cuenta a su padre si existe
    cuentas.forEach((cuenta: any) => {
      const partes = cuenta.codigo.split(".");
      if (partes.length === 1) {
        raiz.push(cuenta); // Es un nodo raíz
      } else {
        const padreCodigo = partes.slice(0, -1).join(".");
        const padre = mapa[padreCodigo];
        if (padre) {
          padre.hijos.push(cuenta);
        } else {
          raiz.push(cuenta); // Si no se encuentra el padre, lo dejamos en la raíz
        }
      }
    });

    return raiz;
  }


  async getNivelesPlanCuentas() {
    return await this.executeFunction("get_niveles_del_plan_de_cuentas", [MDL?.empresa?.select?.key])
  }
  async reporte_balance_general() {
    return await this.executeFunction("reporte_balance_general", [MDL?.empresa?.select?.key])
  }
  async reporte_libro_diario() {
    return await this.executeFunction("reporte_libro_diario", [MDL?.empresa?.select?.key])
  }

  async executeFunction(name: string, params?: any[]) {
    const resp: any = await SSocket.sendPromise({
      service: "contabilidad",
      component: "reporte",
      type: "execute_function",
      func: name,
      params: params?.map((param) => {
        if (typeof param === "string") {
          return "'" + param + "'";
        }
        return param;
      })
    })
    return resp.data as any[];
  }
  async getEnviroment() {
    const resp: any = await SSocket.sendPromise({
      service: "contabilidad",
      component: "enviroment",
      type: "getAll",
      key_empresa: MDL.empresa?.select?.key,
    });
    const agrup: any = {}
    const data = resp.data;
    Object.values(data).map((a: any) => {
      agrup[a.descripcion] = a;
    })
    return agrup
  }

  async getCuentasByAjuste(key_ajuste: string, solo_hijas: boolean) {
    const ajuste = await this.getAjuste(key_ajuste);
    if (!ajuste) throw "Ajuste no encontrado";
    if (!ajuste.ajuste_empresa) throw "El ajuste no se ha configurado.";
    const cuentas = await this.getCuentas();
    const cuentaSelect = cuentas[ajuste.ajuste_empresa.key_cuenta_contable];
    console.log(ajuste, cuentaSelect);
    let arr = Object.values(cuentas);
    arr = arr.filter((cuenta: any) => cuenta.codigo.startsWith(cuentaSelect.codigo))
    if (solo_hijas) {
      arr = arr.filter((cuenta: any) => {
        return arr.filter((hija: any) => hija.codigo.startsWith(cuenta.codigo + ".")).length <= 0;
      })
    }
    return arr.sort((a: any, b: any) => {
      return a.codigo.localeCompare(b.codigo);
    });

  }
  async getCuentasByAjusteCache(key_ajuste: string, solo_hijas: boolean) {
    const ajuste = await this.getAjusteCache(key_ajuste);
    if (!ajuste) throw "Ajuste no encontrado";
    if (!ajuste.ajuste_empresa) throw "El ajuste no se ha configurado.";
    const cuentas = await this.getCuentasCache();
    const cuentaSelect = cuentas[ajuste.ajuste_empresa.key_cuenta_contable];
    console.log(ajuste, cuentaSelect);
    let arr = Object.values(cuentas);
    arr = arr.filter((cuenta: any) => cuenta.codigo.startsWith(cuentaSelect.codigo))
    if (solo_hijas) {
      arr = arr.filter((cuenta: any) => {
        return arr.filter((hija: any) => hija.codigo.startsWith(cuenta.codigo + ".")).length <= 0;
      })
    }
    return arr.sort((a: any, b: any) => {
      return a.codigo.localeCompare(b.codigo);
    });

  }



  format_cuenta_to_string(cuenta: any) {
    return `${cuenta.codigo} - ${cuenta.descripcion}`;
  }

}
