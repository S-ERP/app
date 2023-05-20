import { SModel } from "servisofts-model";
import Action from "./Action";
import Reducer from "./Reducer";

export default new SModel<Action, Reducer>({
    info: {
        service: "inventario",
        component: "almacen"
    },
    Columns: {
        "key_sucursal": { type: "text", fk: "sucursal", notNull: true, label: "Sucursal", editable: true },
        "key": { type: "text", pk: true },
        "descripcion": { type: "text", editable: true, label: "Descripcion", notNull: true, },
        "observacion": { type: "text", editable: true, label: "Observacion" },
        "fecha_on": { type: "timestamp", label: "F. Creacion" },
        "estado": { type: "integer" },
        "key_usuario": { type: "text", fk: "usuario" },


    },
    image: {
        api: "inventario",
        name: "almacen",
    },
    Action,
    Reducer,
});