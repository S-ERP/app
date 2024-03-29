import { SModel } from "servisofts-model";
import Action from "./Action";
import Reducer from "./Reducer";

export default new SModel<Action, Reducer>({
    info: {
        service: "inventario",
        component: "tipo_producto"
    },
    Columns: {
        "key": { type: "text", pk: true },
        "tipo": { type: "text", editable: true, },
        "descripcion": { type: "text", notNull: true, editable: true, label: "Descripcion" },
        "observacion": { type: "text", editable: true, label: "Obs." },
        "color": { type: "text", editable: true, label: "Color" },
        "fecha_on": { type: "timestamp", label: "F. Creacion" },
        "estado": { type: "integer" },
        "key_usuario": { type: "text", fk: "usuario" },
        "key_servicio": { type: "text", fk: "servicio" },
        "key_empresa": { type: "text", fk: "empresa" },
        "key_cuenta_contable": { type: "text", fk: "cuenta_contable" },
    },
    image: {
        api: "inventario",
        name: "tipo_producto",
    },
    Action,
    Reducer,

});