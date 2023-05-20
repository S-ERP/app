import { SModel } from "servisofts-model";
import Action from "./Action";
import Reducer from "./Reducer";

export default new SModel<Action, Reducer>({
    info: {
        service: "inventario",
        component: "producto_inventario_dato"
    },
    Columns: {
        "key": { type: "text", pk: true },
        "descripcion": { type: "text", notNull: true, editable: true, label: "Descripcion" },
        "observacion": { type: "text", editable: true, label: "Acronimo" },
        "fecha_on": { type: "timestamp", label: "F. Creacion" },
        "estado": { type: "integer" },
        "key_usuario": { type: "text", fk: "usuario" },
        "key_producto": { type: "text", fk: "producto" },
        "key_inventario_dato": { type: "text", fk: "inventario_dato" },

    },
    Action,
    Reducer,
});