import { SModel } from "servisofts-model";
import Action from "./Action";
import Reducer from "./Reducer";


export default new SModel<Action, Reducer>({
    info: {
        service: "notification",
        component: "notification_default"
    },
    Columns: {
        "key": { type: "text", pk: true },
        "fecha_on": { type: "timestamp", label: "F. Creacion" },
        "estado": { type: "integer" },
        "key_usuario": { type: "text", fk: "usuario" },
        "key_servicio": { type: "text", fk: "servicio", },
        "key_empresa": { type: "text", fk: "empresa", },
        "tipo": { type: "text", editable: true },
        "title": { type: "text", editable: true },
        "body": { type: "text", editable: true },
        "image": { type: "text", editable: true },
        "deeplink": { type: "text", editable: true },
        "comentario": { type: "text", editable: true },
    },
    Action,
    Reducer,
});