import { SModel } from "servisofts-model";
import Action from "./Action";
import Reducer from "./Reducer";

export default new SModel<Action, Reducer>({
    info: {
        service: "compra_venta",
        component: "cuota_amortizacion"
    },
    Columns: {
        "descripcion": { type: "text", notNull: true, editable: true, label: "Descripcion" },
        "observacion": { type: "text", editable: true, label: "Observacion" },
        "fecha": { type: "date", },
        "monto": { type: "double" },
        "key_cuota": { type: "text", fk: "cuota" },
        "key": { type: "text", pk: true },
        "key_usuario": { type: "text", fk: "usuario" },
        "fecha_on": { type: "timestamp", label: "F. Creacion" },
        "estado": { type: "integer" },
    },
    Action,
    Reducer,
});