import SSocket from "servisofts-socket";
import { Proyecto } from "./type";
import Model from "../../Model";
import MDL from "..";

export default class proyecto {

    async getAll() {
        const resp: any = await SSocket.sendPromise({
            service: "crm", component: "proyecto",
            type: "getAll",
            key_usuario: Model.usuario.Action.getKey(),
            key_empresa: Model.empresa.Action.getKey()
        });
        return Object.values(resp.data);
    }
    async getAllFull() {
        const proyectos = await this.getAll();
        const campanas: any = await MDL.crm.campana.getAll();
        proyectos.forEach((proyecto: any) => {
            proyecto.campanas = [];
            Object.keys(campanas).forEach((key) => {
                if (campanas[key].key_proyecto == proyecto.key) {
                    proyecto.campanas.push(campanas[key]);
                }
            });
        });

        const productos: any = await MDL.crm.proyectoProducto.getAllConProductos();
        proyectos.forEach((proyecto: any) => {
            proyecto.productos = [];
            Object.keys(productos).forEach((key) => {
                if (productos[key].key_proyecto == proyecto.key) {
                    proyecto.productos.push(productos[key]);
                }
            });
        });

        return proyectos;
    }
    async registrar(data: Proyecto) {
        data.key_empresa = Model.empresa.Action.getKey();
        const resp: any = await SSocket.sendPromise({ service: "crm", component: "proyecto", type: "registro", data: data, key_usuario: Model.usuario.Action.getKey() })
        return resp.data;
    }
    async editar(data: Proyecto) {
        data.key_empresa = Model.empresa.Action.getKey();
        const resp: any = await SSocket.sendPromise({ service: "crm", component: "proyecto", type: "editar", data: data, key_usuario: Model.usuario.Action.getKey() });
        return resp.data;
    }
    async eliminar(data: Proyecto) {
        data.key_empresa = Model.empresa.Action.getKey();
        const resp: any = await SSocket.sendPromise({ service: "crm", component: "proyecto", type: "editar", data: { ...data, estado: 0 }, key_usuario: Model.usuario.Action.getKey() });
        return resp.data;
    }



}