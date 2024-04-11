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
        "is_stock": { type: "boolean", editable: true, label: "Almacen con stock?" }, // Si esta en true los productos se terminan y tienen cantidad.
        "is_venta": { type: "boolean", editable: true, label: "Almacen para ventas?" },//Si esta en true permite vender del amacen
        "is_entrega": { type: "boolean", editable: true, label: "Requiere entrega?" }, // Si esta en true tiene que entrar al almacen y marcar como entregado
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