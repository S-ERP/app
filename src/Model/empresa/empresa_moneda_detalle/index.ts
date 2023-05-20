import { SModel } from "servisofts-model";
import Action from "./Action";
import Reducer from "./Reducer";

export default new SModel<Action, Reducer>({
    info: {
        service: "empresa",
        component: "empresa_moneda_detalle"
    },
    Columns: {
        "key": { type: "text", pk: true },
        "key_empresa_moneda": { type: "text", fk: "empresa_moneda", notNull: true },
        "valor": { type: "double", notNull: true, editable: true, },
        "tipo": { type: "text", editable: true, label: "Tipo" },
        "fecha_on": { type: "timestamp", label: "F. registro" },
        "estado": { type: "integer" },
        "key_usuario": { type: "text", fk: "usuario" },
    },
    image: {
        api: "empresa",
        name: "empresa_moneda_detalle"
    },
    Action,
    Reducer,
});