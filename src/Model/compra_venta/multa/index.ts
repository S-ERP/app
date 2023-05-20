import { SModel } from "servisofts-model";
import Action from "./Action";
import Reducer from "./Reducer";

export default new SModel<Action, Reducer>({
    info: {
        service: "compra_venta",
        component: "multa"
    },
    Columns: {
        "key": { type: "text", pk: true },
        "key_usuario": { type: "text", fk: "usuario" },
        "fecha_on": { type: "timestamp", label: "F. Creacion" },
        "estado": { type: "integer" },
        "descripcion": { type: "text", notNull: true, editable: true, label: "Descripcion" },
        "dias": { type: "integer", editable: true, },
        "monto": { type: "double", editable: true, },
        "key_servicio": { type: "text", fk: "servicio" },
    },
    Action,
    Reducer,
});