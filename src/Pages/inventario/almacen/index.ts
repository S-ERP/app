import { SPage } from "servisofts-component";
import Model from "../../../Model";
import list from "./list";
import table from "./table";
import _new from "./new";
import profile from "./profile/index";
import edit from "./edit";
import _delete from "./delete";
import RegistroInventarios from "./RegistroInventarios";
import tabla from "./tabla";
const model = Model.almacen;

export const Parent = {
    name: "almacen",
    path: `/inventario/almacen`,
    model
}

//   "inventario/almacen/profile/registro_inventario": RegistroInventario,

export default SPage.combinePages(Parent.name, {
    "": list,
    "list": list,
    "tabla": tabla,
    "table": tabla,
    "new": _new,
    ...profile,
    "edit": edit,
    "delete": _delete,
    "profile/registro_inventario": RegistroInventarios,
})
