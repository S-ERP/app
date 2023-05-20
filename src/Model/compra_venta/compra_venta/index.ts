import { SModel } from "servisofts-model";
import Action from "./Action";
import Reducer from "./Reducer";

export type compra_venta_state = "cotizacion" | "aprobado" | "denegado" | "comprado" | "vendido";

export default new SModel<Action, Reducer>({
    info: {
        service: "compra_venta",
        component: "compra_venta"
    },
    Columns: {
        "key_servicio": { type: "text", fk: "servicio" },
        "key_sucursal": { type: "text", fk: "sucursal" },
        "descripcion": { type: "text", notNull: true, editable: true, label: "Descripcion" },
        "observacion": { type: "text", editable: true, label: "Observacion" },
        "state": { type: "text", label: "State" },
        "tipo": { type: "text" },
        "cliente": { type: "json" },
        "proveedor": { type: "json" },
        "key": { type: "text", pk: true },
        "key_usuario": { type: "text", fk: "usuario" },
        "fecha_on": { type: "timestamp", label: "F. Creacion"},
        "estado": { type: "integer" },
    },
    Action,
    Reducer,
});