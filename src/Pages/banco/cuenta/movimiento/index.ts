import { SPage } from "servisofts-component";
import Model from "../../../../Model";
import list from "./list";
import table from "./table";
import _new from "./new";
import profile from "./profile";
import edit from "./edit";
import _delete from "./delete";

export const Parent = {
    name: "movimiento",
    path: `/banco/cuenta/movimiento`,
    model: Model.cuenta_movimiento
}
export default SPage.combinePages(Parent.name, {
    "": profile,
    "list": list,
    "table": table,
    "new": _new,
    "profile": profile,
    "edit": edit,
    "delete": _delete
})
