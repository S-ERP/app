import { SPage } from "servisofts-component";
import Model from "../../Model";
import list from "./list";
import table from "./table";
import _new from "./new";
import profile from "./profile/index";
import edit from "./edit";
import _delete from "./delete";
import paso1 from "./paso1";
import Tabla from "./Tabla";
const model = Model.sucursal;

export const Parent = {
    name: "sucursal",
    path: `/sucursal`,
    model
}
export default SPage.combinePages(Parent.name, {
    "": Tabla,
    "list": list,
    // "table": table,
    "table": Tabla,
    "new": _new,
    ...profile,
    "edit": edit,
    "delete": _delete,
    "paso1": paso1,
    // "tabla": Tabla,

})
