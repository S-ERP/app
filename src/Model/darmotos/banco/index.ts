import { SModel } from "servisofts-model";
import Action from "./Action";
import Reducer from "./Reducer";

export default new SModel<Action, Reducer>({
    info: {
        component: "banco"
    },
    Columns: {
        "descripcion": { type: "text", notNull: true, editable: true },
        "observacion": { type: "text", editable: true },
        "key": { type: "text", pk: true },
        "fecha_on": { type: "timestamp", label: "Fecha de creacion" },
        "estado": { type: "integer" },
        "key_usuario": { type: "text", fk: "usuario" },

    },
    image: {
        api: "root",
        name: "banco"
    },
    Action,
    Reducer,
});