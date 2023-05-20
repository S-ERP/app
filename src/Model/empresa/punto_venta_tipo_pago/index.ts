import { SModel } from "servisofts-model";
import Action from "./Action";
import Reducer from "./Reducer";

export default new SModel<Action, Reducer>({
    info: {
        service: "empresa",
        component: "punto_venta_tipo_pago"
    },
    Columns: {
        "key": { type: "text", pk: true },
        "fecha_on": { type: "timestamp", label: "F. registro" },
        "estado": { type: "integer" },
        "key_usuario": { type: "text", fk: "usuario" },
        "key_punto_venta": { type: "text", fk: "punto_venta", notNull: true },
        "key_tipo_pago": { type: "text", fk: "tipo_pago", notNull: true },
    },
    Action,
    Reducer,
});