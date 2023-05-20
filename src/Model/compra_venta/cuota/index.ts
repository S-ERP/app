import { SModel } from "servisofts-model";
import Action from "./Action";
import Reducer from "./Reducer";

export default new SModel<Action, Reducer>({
    info: {
        service: "compra_venta",
        component: "cuota"
    },
    Columns: {
        "descripcion": { type: "text", notNull: true, editable: true, label: "Descripcion" },
        "observacion": { type: "text", editable: true, label: "Observacion" },
        "codigo": { type: "text", },
        "fecha": { type: "date", },
        "monto": { type: "double" },
        "key_compra_venta": { type: "text", fk: "compra_venta" },
        "key": { type: "text", pk: true },
        "key_usuario": { type: "text", fk: "usuario" },
        "fecha_on": { type: "timestamp", label: "F. Creacion" },
        "estado": { type: "integer" },
    },
    Action,
    Reducer,
});