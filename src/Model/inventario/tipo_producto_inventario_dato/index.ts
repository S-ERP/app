import { SModel } from "servisofts-model";
import Action from "./Action";
import Reducer from "./Reducer";

export default new SModel<Action, Reducer>({
    info: {
        service: "inventario",
        component: "tipo_producto_inventario_dato"
    },
    Columns: {
        "key": { type: "text", pk: true },
        "descripcion": { type: "text", notNull: true, editable: true },
        "observacion": { type: "text", editable: true },
        "fecha_on": { type: "timestamp" },
        "estado": { type: "integer" },
        "key_usuario": { type: "text", fk: "usuario" },
        "key_inventario_dato": { type: "text", fk: "inventario_dato" },
        "key_tipo_producto": { type: "text", fk: "tipo_producto" },

    },
    Action,
    Reducer,
});