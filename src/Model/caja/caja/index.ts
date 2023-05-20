import { SModel } from "servisofts-model";
import Action from "./Action";
import Reducer from "./Reducer";


export default new SModel<Action, Reducer>({
    info: {
        service: "caja",
        component: "caja"
    },
    Columns: {
        "key": { type: "text", pk: true },
        "key_usuario": { type: "text", fk: "usuario" },
        "fecha_on": { type: "timestamp", label: "F. Creacion" },
        "estado": { type: "integer" },
        "key_servicio": { type: "text", fk: "servicio", },
        "key_punto_venta": { type: "text", fk: "punto_venta", },
        "fecha_cierre": { type: "timestamp", label: "F. Cierre" },
    },
    Action,
    Reducer,
});