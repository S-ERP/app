// @ts-nocheck
import { SAction } from "servisofts-model";
import Model from "../..";
import SSocket from "servisofts-socket";

export default class Action extends SAction {

    crearBackup(data: any) {
        return new Promise((resolve, reject) => {
            SSocket.sendPromise({
                component: "alvaro",
                type: "crearBackup",
                ...data
            }).then((e: any) => {
                this._dispatch(e);
                resolve(e);
            }).catch(e => {
                reject(e);
            })
        })
    }

    crearBackupBackend(data: any) {
        return new Promise((resolve, reject) => {
            SSocket.sendPromise({
                component: "alvaro",
                type: "crearBackupBackend",
                ...data
            }).then((e: any) => {
                this._dispatch(e);
                resolve(e);
            }).catch(e => {
                reject(e);
            })
        })
    }

    listarBackups(key_empresa: string) {
        return new Promise((resolve, reject) => {
            SSocket.sendPromise({
                component: "alvaro",
                type: "listarBackups",
                key_empresa: key_empresa
            }).then((e: any) => {
                this._dispatch(e);
                resolve(e);
            }).catch(e => {
                reject(e);
            })
        })
    }

    obtenerBackup(key: string) {
        return new Promise((resolve, reject) => {
            SSocket.sendPromise({
                component: "alvaro",
                type: "obtenerBackup",
                key: key
            }).then((e: any) => {
                resolve(e);
            }).catch(e => {
                reject(e);
            })
        })
    }

    restaurarBackup(key_backup: string, key_usuario: string) {
        return new Promise((resolve, reject) => {
            SSocket.sendPromise({
                component: "alvaro",
                type: "restaurarBackup",
                key_backup: key_backup,
                key_usuario: key_usuario
            }).then((e: any) => {
                this._dispatch(e);
                resolve(e);
            }).catch(e => {
                reject(e);
            })
        })
    }

    eliminarBackup(key_backup: string, key_usuario: string) {
        return new Promise((resolve, reject) => {
            SSocket.sendPromise({
                component: "alvaro",
                type: "eliminarBackup",
                key_backup: key_backup,
                key_usuario: key_usuario
            }).then((e: any) => {
                this._dispatch(e);
                resolve(e);
            }).catch(e => {
                reject(e);
            })
        })
    }

    infoServidor() {
        return new Promise((resolve, reject) => {
            SSocket.sendPromise({
                component: "alvaro",
                type: "infoServidor"
            }).then((e: any) => {
                resolve(e);
            }).catch(e => {
                reject(e);
            })
        })
    }

    getAll() {
        var empresa: any = Model.empresa.Action.getSelect();
        if (!empresa) return null;
        return this.getAllByKeyEmpresa(empresa.key)
    }

    getAllByKeyEmpresa(key_empresa: string) {
        var reducer = this._getReducer();
        if (reducer.key_empresa != key_empresa) {
            reducer.data = "";
            reducer.key_empresa = key_empresa;
        }

        return this.listarBackups(key_empresa);
    }

    verBackupBackend() {
        return new Promise((resolve, reject) => {
            SSocket.sendPromise({
                component: "alvaro",
                type: "backend_ver_backup"
            }).then((e: any) => {
                resolve(e);
            }).catch(e => {
                reject(e);
            })
        })
    }

    verBackupFrontend() {
        return new Promise((resolve, reject) => {
            SSocket.sendPromise({
                component: "alvaro",
                type: "frontend_ver_backup"
            }).then((e: any) => {
                resolve(e);
            }).catch(e => {
                reject(e);
            })
        })
    }
}
