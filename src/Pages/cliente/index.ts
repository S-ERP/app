import { SPage } from "servisofts-component";
import Model from "../../Model";
import list from "./list";
import table from "./table";
import _new from "./new";
import profile from "./profile";
import edit from "./edit";
import _delete from "./delete";
import clienteCrm from "../crm/cliente"
import tabla from "./tabla";
import Cobros from "./Cobros";
const model = Model.cliente;

export const Parent = {
    name: "cliente",
    path: `/cliente`,
    model
}
export default SPage.combinePages(Parent.name, {
    // "": list,
    "": tabla,
    // "": clienteCrm ,
    "list": list,
    "cobros": Cobros,
    "table": table,
    "new": _new,
    "profile": profile,
    "edit": edit,
    "delete": _delete
})
