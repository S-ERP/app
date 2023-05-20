import { SAction } from "servisofts-model";
import Model from "../..";
import SSocket from 'servisofts-socket'

export default class Action extends SAction {

    getAll(extra?: {}) {
        return super.getAll({
            key_usuario: Model.usuario.Action.getKey(),
            ...extra
        });
    }

}   