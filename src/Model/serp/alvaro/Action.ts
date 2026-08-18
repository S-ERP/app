// @ts-nocheck
import { SAction } from "servisofts-model";
import Model from "../..";
import SSocket from "servisofts-socket";

export default class Action extends SAction {

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

    crearBackupFrontend(data: any) {
        return new Promise((resolve, reject) => {
            SSocket.sendPromise({
                component: "alvaro",
                type: "crearBackupFrontend",
                ...data
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

    eliminarBackupBackend(ruta: string) {
        return new Promise((resolve, reject) => {
            SSocket.sendPromise({
                component: "alvaro",
                type: "eliminarBackupBackend",
                ruta: ruta
            }).then((e: any) => {
                resolve(e);
            }).catch(e => {
                reject(e);
            })
        })
    }

    restaurarBackupBackend(ruta: string) {
        return new Promise((resolve, reject) => {
            SSocket.sendPromise({
                component: "alvaro",
                type: "restaurarBackupBackend",
                ruta: ruta
            }).then((e: any) => {
                resolve(e);
            }).catch(e => {
                reject(e);
            })
        })
    }

    eliminarBackupFrontend(ruta: string) {
        return new Promise((resolve, reject) => {
            SSocket.sendPromise({
                component: "alvaro",
                type: "eliminarBackupFrontend",
                ruta: ruta
            }).then((e: any) => {
                resolve(e);
            }).catch(e => {
                reject(e);
            })
        })
    }

    restaurarBackupFrontend(ruta: string) {
        return new Promise((resolve, reject) => {
            SSocket.sendPromise({
                component: "alvaro",
                type: "restaurarBackupFrontend",
                ruta: ruta
            }).then((e: any) => {
                resolve(e);
            }).catch(e => {
                reject(e);
            })
        })
    }
}
