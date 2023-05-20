import { SPage } from "servisofts-component";
import Model from "../../Model";
import list from "./list";
import table from "./table";
import _new from "./new";
import profile from "./profile/index";
import edit from "./edit";
import _delete from "./delete";
import moneda from "./moneda";
import punto_venta from "./punto_venta";
const model = Model.empresa;

export const Parent = {
    name: "empresa",
    path: `/empresa`,
    model
}
export default SPage.combinePages(Parent.name, {
    "": list,
    "list": list,
    "table": table,
    "new": _new,
    ...profile,
    "edit": edit,
    "delete": _delete,
    ...moneda,
    ...punto_venta
})
