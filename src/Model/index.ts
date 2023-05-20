import { SModel } from "servisofts-model";
import Contabilidad from "servisofts-rn-contabilidad";
import Usuario from "servisofts-rn-usuario";
import Roles_permisos from "servisofts-rn-roles_permisos";
import empresa from './empresa'
import inventario from "./inventario";
import compra_venta from "./compra_venta";
import caja from "./caja";
import notification from "./notification";
import darmotos from "./darmotos";

const Model = {
    ...Usuario.Model,
    ...Roles_permisos.Model,
    ...empresa,
    ...inventario,
    ...Contabilidad.Model,
    ...compra_venta,
    ...caja,
    ...notification,
    ...darmotos
}

Usuario.init({
    cabecera: "usuario_app",
    Columns: {
        "key": { type: "text", pk: true },
        "Nombres": { type: "text", notNull: true, editable: true },
        "Apellidos": { type: "text", notNull: true, editable: true },
        "CI": { type: "text", notNull: true, editable: true },
        "Correo": { type: "text", notNull: true, editable: true },
        "Telefono": { type: "text", editable: true },
        "Password": { type: "text", notNull: true, editable: true },
    },
});
Roles_permisos.init({});

export default {
    ...Model,
    ...SModel.declare(Model)
}