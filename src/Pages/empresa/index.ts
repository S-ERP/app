import { SPage } from "servisofts-component";
import Model from "../../Model";
import list from "./list";
import table from "./table";
import _new from "./new";
import new_ from "./new_";
import profile from "./profile/index";
import edit from "./edit";
import _delete from "./delete";
import moneda from "./moneda";
import punto_venta from "./punto_venta";
import init from "./init"
import start from "./start"
import paso1 from "./paso1"
import paso2 from "./paso2"
const model = Model.empresa;

export const Parent = {
    name: "empresa",
    path: `/empresa`,
    model
}
export default SPage.combinePages(Parent.name, {
    // "": start,
    "": list,
    "list": list,
    init,
    "table": table,
    "new": _new,
    "new_": new_,
    ...profile,
    "edit": edit,
    "delete": _delete,
    ...moneda,
    ...punto_venta,
    "paso1":paso1,
    "paso2":paso2,
})
