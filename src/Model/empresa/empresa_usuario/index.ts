import { SModel } from "servisofts-model";
import Action from "./Action";
import Reducer from "./Reducer";

export default new SModel<Action, Reducer>({
    info: {
        service: "empresa",
        component: "empresa_usuario"
    },
    Columns: {
        "key": { type: "text", pk: true },
        "fecha_on": { type: "timestamp", label: "F. registro" },
        "estado": { type: "integer" },
        "key_empresa": { type: "text", fk: "empresa", notNull: true },
        "key_usuario": { type: "text", fk: "usuario" },
        "alias": { type: "text", },
    },
    Action,
    Reducer,
});