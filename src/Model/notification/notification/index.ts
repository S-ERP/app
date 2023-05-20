import { SModel } from "servisofts-model";
import Action from "./Action";
import Reducer from "./Reducer";


export default new SModel<Action, Reducer>({
    info: {
        service: "notification",
        component: "notification"
    },
    Columns: {
        "key": { type: "text", pk: true },
        "key_usuario": { type: "text", fk: "usuario" },
        "fecha_on": { type: "timestamp", label: "F. Creacion" },
        "estado": { type: "integer" },
        "key_servicio": { type: "text", fk: "servicio", },
        "descripcion": { type: "text", },
        "observacion": { type: "text", },
        "data": { type: "text", },
        "tipo": { type: "text", },
    },
    Action,
    Reducer,
});