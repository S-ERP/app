import { SModel } from "servisofts-model";
import Contabilidad from "servisofts-rn-contabilidad";
import Usuario from "servisofts-rn-usuario";
import Roles_permisos from "servisofts-rn-roles_permisos";
import Chat from 'servisofts-rn-chat'
import empresa from './empresa'
import inventario from "./inventario";
import compra_venta from "./compra_venta";
import caja from "./caja";
import notification from "./notification";
import serp from "./serp";
import redes from "./redes";
import { STheme } from "servisofts-component";

const Model = {
    ...Usuario.Model,
    ...Roles_permisos.Model,
    ...empresa,
    ...inventario,
    ...Contabilidad.Model,
    ...Chat.Model,
    ...compra_venta,
    ...caja,
    ...notification,
    ...serp,
    ...redes,
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
Roles_permisos.init({
    modelusuario: Model.usuario,
});

Contabilidad.init({
    separador:".",
    modelusuario: Model.usuario,
    modelempresa: Model.empresa
})


export default {
    ...Model,
    ...SModel.declare(Model)
}