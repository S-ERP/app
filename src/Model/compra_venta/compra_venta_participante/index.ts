import { SModel } from "servisofts-model";
import Action from "./Action";
import Reducer from "./Reducer";



export default new SModel<Action, Reducer>({
    info: {
        service: "compra_venta",
        component: "compra_venta_participante"
    },
    Columns: {
        "key": { type: "text", pk: true },
        "key_usuario": { type: "text", fk: "usuario" },
        "fecha_on": { type: "timestamp", label: "F. Creacion" },
        "estado": { type: "integer" },
        "key_compra_venta": { type: "text", fk: "compra_venta" },
        "key_usuario_participante": { type: "text", fk: "usuario" },
    },
    Action,
    Reducer,
});