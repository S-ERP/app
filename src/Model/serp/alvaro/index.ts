import { SModel } from "servisofts-model";
import Action from "./Action";
import Reducer from "./Reducer";

export default new SModel<Action, Reducer>({
    info: {
        component: "alvaro"
    },
    Columns: {
        "key": { type: "text", pk: true },
        "nombre": { type: "text", notNull: true, editable: true },
        "descripcion": { type: "text", editable: true },
        "estado": { type: "integer" },
        "key_usuario": { type: "text", fk: "usuario" },
        "key_empresa": { type: "text", fk: "empresa" },
        "fecha_creacion": { type: "timestamp", label: "Fecha de creación" },
        "fecha_backup": { type: "timestamp", label: "Fecha del backup" },
        "fecha_restauracion": { type: "timestamp", label: "Fecha de restauración" },
        "fecha_eliminacion": { type: "timestamp", label: "Fecha de eliminación" },
        "tamaño": { type: "text", label: "Tamaño del backup" },
        "key_usuario_restauro": { type: "text", fk: "usuario" },
        "key_usuario_elimino": { type: "text", fk: "usuario" }
    },
    image: {
        api: "root",
        name: "alvaro"
    },
    Action,
    Reducer,
});
