import { SPage } from "servisofts-component";
import Model from "../../../../Model";
import list from "./list";
import _new from "./new";
import edit from "./edit";
import sub_producto_detalle from "./sub_producto_detalle";

const model = Model.sub_producto;
export const Parent = {
    name: "sub_producto",
    path: `/restaurante/producto/sub_producto`,
    model
}

export default SPage.combinePages(Parent.name, {
    "": list,
    "list": list,
    "new": _new,
    "edit": edit,
    ...sub_producto_detalle
})
