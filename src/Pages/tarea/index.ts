import { SPage } from "servisofts-component";
import Model from "../../Model";
import list from "./list";
import table from "./table";
import _new from "./new";
import profile from "./profile";
import edit from "./edit";
import _delete from "./delete";
import reto from "./reto";
import dia from "./dia";
const model = Model.tarea;

export const Parent = {
    name: "tarea",
    path: `/tarea`,
    model
}
export default SPage.combinePages(Parent.name, {
    "": list,
    reto,
    "dia": dia,
    "list": list,
    "table": table,
    "new": _new,
    "profile": profile,
    "edit": edit,
    "delete": _delete,
})
