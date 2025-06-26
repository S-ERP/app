import { SStorage } from "servisofts-component";
import SSocket from "servisofts-socket";
import CryptoJS from 'crypto-js';
import MDLAbstract from "../MDLAbstract";
import { EventListener, Usuario } from "./types";


export default class usuario extends MDLAbstract<EventListener> {
    session?: Usuario;
    constructor() {
        super();
        this.session = undefined;
    }
    async componentDidMount() {
        await this._loadSessionFromStorage();
        return

    }

    _loadSessionFromStorage = async () => {
        const data = await SStorage.getItem("usr_log")
        const user = JSON.parse(data);
        if (!!user) {
            this.session = user;
        }
        this._loadSessionFromServer();
    }
    _loadSessionFromServer = async () => {
        if (!this.session) return;
        const userlist = await this.getByKeys([this.session.key]);
        if (userlist.length > 0) {
            this.session = userlist[0];
            this.dispatchEvent({ type: "changeSessionStatus", session: this.session })
            SStorage.setItem("usr_log", JSON.stringify(this.session));
        }
    }

    _setSession = (session: Usuario) => {
        this.session = session;
        this.dispatchEvent({ type: "changeSessionStatus", session: this.session })
        SStorage.setItem("usr_log", JSON.stringify(this.session));
    }

    login = async (data: { usuario: string, password: string }) => {
        if (!data.usuario) throw "El usuario es requerido";
        if (!data.password) throw "La contraseña es requerida";
        try {
            data["password"] = CryptoJS.MD5(data["password"]).toString();
            const response: any = await SSocket.sendPromise({
                version: "2.0",
                service: "usuario",
                component: "usuario",
                type: "login",
                data: data
            });
            const user: Usuario = response.data;
            this.session = user;
            this.dispatchEvent({ type: "changeSessionStatus", session: this.session })
            SStorage.setItem("usr_log", JSON.stringify(user));
            return user;
        } catch (error: any) {
            if (error?.error == "error_password") {
                throw "Error en la contraseña"
            }
            throw "Error en la petición"
        }
    }

    logout = async () => {
        SStorage.removeItem("usr_log");
        this.session = undefined;
        this.dispatchEvent({ type: "changeSessionStatus", session: this.session })

    }


    getByKeys = async (keys: string[]) => {
        // let keys = [...new Set(Object.values(e.data).map(a => a.key_usuario).filter(key => key !== null))

        const request = {
            version: "2.0",
            service: "usuario",
            component: "usuario",
            type: "getAllKeys",
            keys: keys,
        }
        const response: any = await SSocket.sendHttpAsync(SSocket.api.root + "api", request)
        const data = Object.values(response.data).map((a: any) => a.usuario) as Usuario[];
        return data;
    }



    registro = async (data: Usuario) => {
        data.Password = CryptoJS.MD5(data.Password ?? "").toString();
        try {
            const response: any = await SSocket.sendPromise({
                version: "2.0",
                service: "usuario",
                component: "usuario",
                type: "registro",
                cabecera: "usuario_app",
                data: data
            });
            this.session = response.data;
            this.dispatchEvent({ type: "changeSessionStatus", session: this.session })
            SStorage.setItem("usr_log", JSON.stringify(this.session));

            return response.data;

        } catch (error) {
            console.log("error", error)
            throw "Error en la petición";
        }

    }

    addRolDriver = async (p: { key_usuario: string }) => {
        try {
            const response: any = await SSocket.sendPromise({
                "version": "1.0",
                "service": "roles_permisos",
                "component": "usuarioRol",
                "type": "registro",
                "estado": "cargando",
                "data": {
                    "key_rol": "b8920e90-1cbd-4fac-b740-62fac4d22bbd",
                    "key_usuario": p.key_usuario
                },
                "key_usuario": p.key_usuario,
            });
            return response.data;

        } catch (error) {
            console.log("error", error)
            throw "Error en la petición";
        }

    }
    validateRegistro = async (data: Usuario) => {
        data.Password = CryptoJS.MD5(data.Password ?? "").toString();
        try {
            const response: any = await SSocket.sendPromise({
                version: "2.0",
                service: "usuario",
                component: "usuario",
                type: "validateRegistro",
                cabecera: "usuario_app",
                data: data
            });
            console.log(response.data);
            return response.data;

        } catch (error: any) {
            if (error.error) {
                const usr_repetido: Usuario = error.error
                Object.keys(usr_repetido).map((key) => {
                    const k: keyof Usuario = key as keyof Usuario;
                    const value = usr_repetido[k];
                    if (data[k] == value) {
                        throw "Ya existe un usuario con este " + key;
                    }
                })
            }
            // console.log("error", error)
            throw "Error en la petición";
        }

    }

    editar = async (data: Usuario) => {
        // data.Password = CryptoJS.MD5(data.Password ?? "").toString();
        try {
            const response: any = await SSocket.sendPromise({
                version: "2.0",
                service: "usuario",
                component: "usuario",
                type: "editar",
                cabecera: "usuario_app",
                key_usuario: this.session?.key,
                data: data
            });
            if (response.data.key == this.session?.key) {


                this._loadSessionFromServer();
                // this.session = response.data;
                // this.dispatchEvent({ type: "changeSessionStatus", session: this.session })
                // SStorage.setItem("usr_log", JSON.stringify(this.session));
            }
            console.log(response.data);
            return response.data;

        } catch (error: any) {
            console.log("error", error);
            throw "Error en la petición";
        }

    }

}