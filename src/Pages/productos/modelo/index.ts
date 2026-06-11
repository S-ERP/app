import { SPage } from "servisofts-component";
import Model from "../../../Model";
import list from "./list";
import table from "./table";
import _new from "./new";
import profile from "./profile";
import edit from "./edit";
import _delete from "./delete";
import elavorar from "./elavorar";
import ingrediente from "./ingrediente";
import table2 from "./table2";
const model = Model.modelo;

export const Parent = {
    name: "modelo",
    path: `/productos/modelo`,
    model
}
export default SPage.combinePages(Parent.name, {
    "": list,
    "list": list,
    "select": list,
    "table": table,
    "new": _new,
    "profile": profile,
    "edit": edit,
    "delete": _delete,
    table2,
    ingrediente,
    elavorar
    
})
