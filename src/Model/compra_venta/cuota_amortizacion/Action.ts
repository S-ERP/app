import { SAction } from "servisofts-model";
import Model from "../..";
import SSocket from 'servisofts-socket'
export default class Action extends SAction {


    deleteAll({ key_amortizacion }) {
        return new Promise((resolve, reject) => {
            SSocket.sendPromise({
                ...this.model.info,
                type: "deleteAll",
                key_usuario: Model.usuario.Action.getKey(),
                key_amortizacion: key_amortizacion
            }).then((resp: any) => {
                // this._dispatch({
                //     ...resp,
                //     type: "editar"
                // })
                resolve(resp);
            }).catch(e => {
                reject(e);
            })
        })
    }
}   