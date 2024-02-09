import { SPage } from "servisofts-component";
import Model from "../../../Model";
import list from "./list";
import table from "./table";
import _new from "./new";
import profile from "./profile";
import edit from "./edit";
import _delete from "./delete";
import root from "./root";
const model = Model.cuenta_centro_costo;

export const Parent = {
    name: "cuenta_centro_costo",
    path: `/contabilidad/cuenta_centro_costo`,
    model
}
export default SPage.combinePages(Parent.name, {
    "": root,
    "list": list,
    "table": table,
    "new": _new,
    "profile": profile,
    "edit": edit,
    "delete": _delete
})
