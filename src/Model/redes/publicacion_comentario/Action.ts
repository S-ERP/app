import { SAction } from "servisofts-model";
import SSocket from "servisofts-socket"
import Model from "../..";
export default class Action extends SAction {

    getAllPromise(key) {
        return SSocket.sendPromise({
            ...this.model.info,
            estado: "cargando",
            type: "getAll",
            key_publicacion: key
        })
    }

}