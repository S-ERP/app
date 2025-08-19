import { SStorage } from "servisofts-component";
import SSocket from "servisofts-socket";
import MDLAbstract from "../MDLAbstract";
import { EventListener, Rol } from "./types";
import Model from "../../Model";


export default class RolesPermisos extends MDLAbstract<EventListener> {

    async loadPermissions() {
        const key_usuario = Model.usuario.Action.getKey();
        const key_empresa = Model.empresa.Action.getKey();
        if (!key_usuario) {
            throw "No hay usuario logueado";
        }
        if (!key_empresa) {
            throw "No hay empresa seleccionada";
        }
        const state = Model.usuarioPage.Action._getState();
        console.log("RolesPermisos", state.usuarioPageReducer)

        if (state.usuarioPageReducer.data) {
            return state.usuarioPageReducer.data;
        }
        // Cargar permisos del usuario
        const resp: any = await SSocket.sendPromise({
            "version": "1.0",
            "service": "roles_permisos",
            "component": "usuarioPage",
            "type": "getAll",
            "estado": "cargando",
            "key_usuario": key_usuario,
            "key_empresa": key_empresa
        })

        console.log("Permisos cargados", resp);
        if (!resp.data) {
            throw "No se pudieron cargar los permisos";
        }
        state.usuarioPageReducer.data = resp.data;
        state.usuarioPageReducer.roles = resp.rol;
        return resp.data;
    }


    getPermiso({ url, permiso }: { url: string, permiso: string }) {
        const key_empresa = Model.empresa.Action.getKey();
        return Model.usuarioPage.Action.getPermiso({
            url: url,
            permiso: permiso,
            key_empresa: key_empresa,
            loading: ""
        })
    }

    async getPermisoAsync({ url, permiso }: { url: string, permiso: string }) {
        await this.loadPermissions();
        return this.getPermiso({ url, permiso });
    }

    async getAllEmpresa() {
        const resp: any = await SSocket.sendPromise({
            "version": "1.0",
            "service": "roles_permisos",
            "component": "rol",
            "type": "getAll",
            "estado": "cargando",
            "key_empresa": Model.empresa.Action.getKey()
        })
        return resp.data;
    }



    async getAllUserRolesByKeyUser(keys: string[]) {
        const resp: any = await SSocket.sendPromise({
            "version": "1.0",
            "service": "roles_permisos",
            "component": "usuarioRol",
            "type": "getAllByUsuarios",
            "estado": "cargando",
            "keys": keys
        })
        return resp.data;
    }
}