import { SPage } from "servisofts-component";
import Model from "../../../Model";
import list from "./list";
import table from "./table";
import _new from "./new";
import profile from "./profile";
import edit from "./edit";
import _delete from "./delete";
const model = Model.asiento_contable;

export const Parent = {
    name: "asiento_contable",
    path: `/contabilidad/asiento_contable`,
    model
}
export default SPage.combinePages(Parent.name, {
    "": list,
    "list": list,
    "table": table,
    "new": _new,
    "profile": profile,
    "edit": edit,
    "delete": _delete
})
