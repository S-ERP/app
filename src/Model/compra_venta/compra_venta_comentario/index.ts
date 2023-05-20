import { SModel } from "servisofts-model";
import Action from "./Action";
import Reducer from "./Reducer";



export default new SModel<Action, Reducer>({
    info: {
        service: "compra_venta",
        component: "compra_venta_comentario"
    },
    Columns: {
        "key": { type: "text", pk: true },
        "key_usuario": { type: "text", fk: "usuario" },
        "fecha_on": { type: "timestamp", label: "F. Creacion" },
        "estado": { type: "integer" },
        "key_compra_venta": { type: "text", fk: "compra_venta" },
        "descripcion": { type: "text", },
        "observacion": { type: "text", },
    },
    Action,
    Reducer,
});