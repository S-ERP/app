import { SModel } from "servisofts-model";
import Action from "./Action";
import Reducer from "./Reducer";

export default new SModel<Action, Reducer>({
    info: {
        service: "inventario",
        component: "marca"
    },
    Columns: {
        "key": { type: "text", pk: true },
        "descripcion": { type: "text", notNull: true, editable: true, label: "Descripcion" },
        "observacion": { type: "text", editable: true, label: "Observacion" },
        "fecha_on": { type: "timestamp", label: "F. Creacion" },
        "estado": { type: "integer" },
        "key_usuario": { type: "text", fk: "usuario" },
        "key_servicio": { type: "text", fk: "servicio" },

    },
    image: {
        api: "inventario",
        name: "marca",
    },
    Action,
    Reducer,
});