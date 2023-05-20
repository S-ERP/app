import { SModel } from "servisofts-model";
import Action from "./Action";
import Reducer from "./Reducer";

export default new SModel<Action, Reducer>({
    info: {
        service: "inventario",
        component: "producto_historico"
    },
    Columns: {
        "key": { type: "text", pk: true },
        "key_modelo": { type: "text", fk: "modelo", notNull: true, label: "Modelo" },
        "descripcion": { type: "text", editable: true, notNull: true, label: "Descripcion" },
        "observacion": { type: "text", editable: true, label: "Observacion" },
        "precio_compra": { type: "double", editable: true, label: "P. de compra", notNull: true },
        "fecha_on": { type: "timestamp" },
        "estado": { type: "integer" },
        "key_usuario": { type: "text", fk: "usuario" },
        "key_producto": { type: "text", fk: "producto" },

    },
    Action,
    Reducer,
});