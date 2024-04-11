import { SModel } from "servisofts-model";
import Action from "./Action";
import Reducer from "./Reducer";

export default new SModel<Action, Reducer>({
    info: {
        component: "tarea"
    },
    Columns: {
        "key": { type: "text", pk: true },
        "descripcion": { type: "text", notNull: true, editable: true, label: "Descripcion" },
        "observacion": { type: "text", editable: true, label: "Observacion" },
        "color": { type: "text", editable: true },
        "fecha_on": { type: "timestamp", label: "F. Creacion" },
        "fecha_inicio": { type: "timestamp", label: "F. Inicio", editable: true, },
        "fecha_fin": { type: "timestamp", label: "F. Fin", editable: true, },
        "estado": { type: "integer" },
        "tiempo_iteracion_seg": { type: "integer", editable: true, },
        "key_usuario": { type: "text", fk: "usuario" },
        "service": { type: "text", editable: true },
        "component": { type: "text", editable: true },

        "type": { type: "text", editable: true },
        "url": { type: "text", editable: true },

    },
    Action,
    Reducer,
});