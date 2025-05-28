import { SPage } from "servisofts-component";
import Model from "../../../../../Model";
import _new from "./new";
import edit from "./edit";

const model = Model.sub_producto_detalle;
export const Parent = {
    name: "sub_producto_detalle",
    path: `/restaurante/producto/sub_producto/sub_producto_detalle`,
    model
}

export default SPage.combinePages(Parent.name, {
    "new": _new,
    "edit": edit,
})
