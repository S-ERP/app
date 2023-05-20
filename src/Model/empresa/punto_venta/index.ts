import { SModel } from "servisofts-model";
import Action from "./Action";
import Reducer from "./Reducer";

export default new SModel<Action, Reducer>({
    info: {
        service: "empresa",
        component: "punto_venta"
    },
    Columns: {
        "key": { type: "text", pk: true },
        "descripcion": { type: "text", notNull: true, editable: true, label: "Descripcion" },
        "observacion": { type: "text", editable: true, label: "Observacion" },
        "fecha_on": { type: "timestamp", label: "F. registro" },
        "estado": { type: "integer" },
        "key_sucursal": { type: "text", fk: "sucursal", notNull: true },
        "key_cuenta_contable": { type: "text", fk: "cuenta_contable", editable: true},
        "key_usuario": { type: "text", fk: "usuario" },
        "direccion": { type: "text", editable: true, label: "Direccion" },
        "lat": { type: "double", editable: true },
        "lng": { type: "double", editable: true },
        "fraccionar_moneda": { type: "boolean", editable: true },
    },
    Action,
    Reducer,
});