import { SModel } from "servisofts-model";
import Action from "./Action";
import Reducer from "./Reducer";

export default new SModel<Action, Reducer>({
    info: {
        component: "publicacion_like"
    },
    Columns: {
        "fecha_on": { type: "timestamp", label: "Fecha de registro" },
        "estado": { type: "integer" },
        "key_usuario": { type: "text", fk: "usuario" },
        "key_publicacion": { type: "text", fk: "publicacion" },
        "key": { type: "text", pk: true },
    },
    Action,
    Reducer,
});