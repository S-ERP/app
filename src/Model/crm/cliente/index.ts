import { SModel } from "servisofts-model";
import Action from "./Action";
import Reducer from "./Reducer";

export default new SModel<Action, Reducer>({
    info: {
        service: "crm",
        component: "cliente"
    },
    Columns: {
        "key": { type: "text", pk: true },
        "fecha_on": { type: "timestamp", label: "Fecha de registro" },
        "estado": { type: "integer" },
        "key_servicio": { type: "text", fk: "servicio" },
        "key_empresa": { type: "text", fk: "empresa" },
        "key_usuario": { type: "text", fk: "usuario" },
        "nombres": { type: "text", editable: true, label: "Nombre" },
        "apellidos": { type: "text", editable: true, label: "Apellidos" },
        "nit": { type: "text", editable: true, label: "NIT" },
        "razon_social": { type: "text", editable: true, label: "R.Z." },
        "telefono": { type: "text", editable: true, label: "Telefono" },
        "correo": { type: "text", editable: true, label: "Correo" },
        "fecha_nacimiento": { type: "date", editable: true, },
        "sexo": { type: "text", editable: true, },
        "direccion": { type: "text", editable: true, label: "Direccion" },
        "lat": { type: "text", editable: true, },
        "lng": { type: "text", editable: true, },
   

    },
    image: {
        api: "crm",
        name: "cliente"
    },
    Action,
    Reducer,
});