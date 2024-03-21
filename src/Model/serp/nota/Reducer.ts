import { SReducer } from "servisofts-model";
import Model from "../..";

export default class Reducer extends SReducer {


    quitarUsuario(state: any, action: any): void {
        console.log("QUIERO EDITAR LAS NOTAS PARA ELIMIAR SI ES NECESARIO");
        if (action.estado != "exito") return;
    }
}