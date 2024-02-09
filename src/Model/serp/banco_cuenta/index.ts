import { SModel } from "servisofts-model";
import Action from "./Action";
import Reducer from "./Reducer";

export default new SModel<Action, Reducer>({
    info: {
        component: "banco_cuenta"
    },
    Columns: {
        "descripcion": { type: "text",label:"Cuenta", notNull: true, editable: true },
        "observacion": { type: "text", editable: true },
        "key": { type: "text", pk: true },
        "fecha_on": { type: "timestamp", label: "Fecha de creacion" },
        "estado": { type: "integer" },
        "key_usuario": { type: "text", fk: "usuario" },
        "key_banco": { type: "text", fk: "banco" },
    },
    Action,
    Reducer,
});