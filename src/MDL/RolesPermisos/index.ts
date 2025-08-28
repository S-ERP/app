import { SStorage } from "servisofts-component";
import SSocket from "servisofts-socket";
import MDLAbstract from "../MDLAbstract";
import { EventListener, Rol } from "./types";
import Model from "../../Model";
import MDL from "..";


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

    async registro(key_usuario: string, key_rol: string) {
        const resp: any = await SSocket.sendPromise({
            "version": "1.0",
            "service": "roles_permisos",
            "component": "usuarioRol",
            "type": "registro",
            "estado": "cargando",
            "key_usuario": key_usuario,
            "data": {
                "key_rol": key_rol,
                "key_usuario": key_usuario
            }
        })
        return resp.data;
    }

    async editar(key_usuario: string, data: string[]) {
        const resp: any = await SSocket.sendPromise({
            "version": "1.0",
            "service": "roles_permisos",
            "component": "usuarioRol",
            "type": "editar",
            "estado": "cargando",
            "key_usuario": key_usuario,
            "data": data
        })
        return resp.data;
    }

    async getAllPage() {
        const resp: any = await SSocket.sendPromise({
            "version": "1.0",
            "service": "roles_permisos",
            "component": "page",
            "type": "getAll",
            "estado": "cargando",
            "key_usuario": ""
        })
        return resp.data;
    }
    async getAllPermiso() {
        const resp: any = await SSocket.sendPromise({
            "version": "1.0",
            "service": "roles_permisos",
            "component": "permiso",
            "type": "getAll",
            "estado": "cargando",
            "key_usuario": ""
        })
        return resp.data;
    }
    async getAllRolPermiso(key_rol: string) {
        const resp: any = await SSocket.sendPromise({
            "version": "1.0",
            "service": "roles_permisos",
            "component": "rolPermiso",
            "type": "getAll",
            "estado": "cargando",
            "key_usuario": "",
            "key_rol": key_rol
        })
        return resp.data;
    }
    async editarRolPermiso(obj: any) {
        const resp: any = await SSocket.sendPromise({
            "version": "1.0",
            "service": "roles_permisos",
            "component": "rolPermiso",
            "type": "editar",
            "estado": "cargando",
            "data": obj,
            "key_usuario": MDL.usuario.session?.key,
        })
        return resp.data;
    }
    async registrarRolPermiso(obj: any) {
        const resp: any = await SSocket.sendPromise({
            "version": "1.0",
            "service": "roles_permisos",
            "component": "rolPermiso",
            "type": "registro",
            "estado": "cargando",
            "data": obj,
            "key_usuario": MDL.usuario.session?.key,
        })
        return resp.data;
    }
}