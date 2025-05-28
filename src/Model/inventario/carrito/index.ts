import { SModel } from "servisofts-model";
import Action from "./Action";
import Reducer from "./Reducer";

export default new SModel<Action, Reducer>({
    info: {
        component: "carrito",
        
    },
    Columns: {
        // "catcod": { type: "text", pk: true },
        // "nombre": { type: "text", editable: true },
        // "nivel": { type: "integer", editable: true },
    },
    Action,
    Reducer,
});