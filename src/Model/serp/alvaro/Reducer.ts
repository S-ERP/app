import { SReducer } from "servisofts-model";
import Model from "../..";

export default class Reducer extends SReducer {

    restaurarBackup(state: any, action: any): void {
        if (action.estado != "exito") return;
        console.log("Backup restaurado:", action.data);
    }

    eliminarBackup(state: any, action: any): void {
        if (action.estado != "exito") return;
        console.log("Backup eliminado:", action.mensaje);
    }

    crearBackup(state: any, action: any): void {
        if (action.estado != "exito") return;
        console.log("Backup creado:", action.data);
    }
}
