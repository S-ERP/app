import { SModel } from "servisofts-model";
import Action from "./Action";
import Reducer from "./Reducer";


export default new SModel<Action, Reducer>({
    info: {
        service: "caja",
        component: "caja_detalle"
    },
    Columns: {
        "key": { type: "text", pk: true },
        "key_usuario": { type: "text", fk: "usuario" },
        "fecha_on": { type: "timestamp", label: "F. Creacion" },
        "estado": { type: "integer" },
        "key_caja": { type: "text", fk: "caja", },
        "key_tipo_pago": { type: "text", fk: "tipo_pago", },
        "descripcion": { type: "text" },
        "monto": { type: "double" },
        "tipo": { type: "text" },
    },
    image: {
        api: "caja",
        name: "caja_detalle"
    },
    Action,
    Reducer,
});