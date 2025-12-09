import MDLAbstract from "../MDLAbstract";
import SSocket from "servisofts-socket";
import MDL from "..";
import { SDate } from "servisofts-component";

export default class caja extends MDLAbstract<any> {
  async componentDidMount() {
  }
  
  async getAll() {
    const resp: any = await SSocket.sendPromise({
      component: "habilidad",
      type: "getAll",
      key_empresa: MDL.empresa.select?.key,
    })
    return Object.values(resp.data || {})
  }

  async registro(data: any) {
    // IMPORTANTE: Los datos deben ir dentro de un objeto 'data' 
    // o directamente como propiedades adicionales
    const resp: any = await SSocket.sendPromise({
      component: "habilidad",
      type: "registro",
      key_empresa: MDL.empresa.select?.key,
      key_usuario: MDL.usuario.session?.key,
      data: data // ← ESTO ES CLAVE: los datos van en propiedad 'data'
    })
    return resp.data
  }

  async editar(data: any) {
    // IMPORTANTE: Los datos deben ir dentro de un objeto 'data' 
    // o directamente como propiedades adicionales
    const resp: any = await SSocket.sendPromise({
      component: "habilidad",
      type: "editar",
      key_empresa: MDL.empresa.select?.key,
      key_usuario: MDL.usuario.session?.key,
      data: data // ← ESTO ES CLAVE: los datos van en propiedad 'data'
    })
    return resp.data
  }
}