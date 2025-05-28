import { SPage } from "servisofts-component";
import Model from "../../../Model";
import list from "./list";
import _new from "./new";
import edit from "./edit";

const model = Model.categoria_producto;
export const Parent = {
    name: "categoria_producto",
    path: `/restaurante/categoria_producto`,
    model
}
export default SPage.combinePages(Parent.name, {
    "": list,
    "list": list,
    "new": _new,
    "edit": edit,
})
