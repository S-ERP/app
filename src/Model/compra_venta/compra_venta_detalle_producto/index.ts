import { SModel } from "servisofts-model";
import Action from "./Action";
import Reducer from "./Reducer";



export default new SModel<Action, Reducer>({
    info: {
        service: "compra_venta",
        component: "compra_venta_detalle_producto"
    },
    Columns: {
        "key": { type: "text", pk: true },
        "key_usuario": { type: "text", fk: "usuario" },
        "fecha_on": { type: "timestamp", label: "F. Creacion" },
        "estado": { type: "integer" },
        "key_compra_venta_detalle": { type: "text", fk: "compra_venta_detalle" },
        "key_producto": { type: "text", fk: "producto" },
    },
    Action,
    Reducer,
});