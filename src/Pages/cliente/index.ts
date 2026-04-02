import { SPage } from "servisofts-component";
import Model from "../../Model";
import list from "./list";
import table from "./table";
import _new from "./new";
import profile from "./profile";
import edit from "./edit";
import _delete from "./delete";
import tabla from "./tabla";
import perfil from "./perfil";
import tabla_transacciones from "./tabla_transacciones";
const model = Model.cliente;

export const Parent = {
    name: "cliente",
    path: `/cliente`,
    model
}
export default SPage.combinePages(Parent.name, {
    "": tabla,
    "list": list,
    "table": table,
    "new": _new,
    "profile": profile,
    "edit": edit,
    "delete": _delete,
    "perfil": perfil,
    "transacciones": tabla_transacciones,
})
