import { SAction } from "servisofts-model";
import SSocket from "servisofts-socket"
import Model from "../..";
export default class Action extends SAction {

    dislike(extra?: { key_publicacion, key_usuario }, dislike?: any) {
        return new Promise((resolve, reject) => {
            SSocket.sendPromise({
                ...this.model.info,
                type: "dislike",
                ...extra,
            }).then(e => {
                if (dislike) dislike(extra.key_publicacion)
                Model.publicacion.Action._dispatch({
                    component: "publicacion",
                    type: "dislike",
                    key_publicacion: extra.key_publicacion,
                    key_usuario: Model.usuario.Action.getKey(),
                })
            }).catch(e => {
                reject(e);
            })
        })
    }

    getAllPromise(key) {
        return SSocket.sendPromise({
            ...this.model.info,
            estado: "cargando",
            type: "getAll",
            key_publicacion: key
        })
    }

}