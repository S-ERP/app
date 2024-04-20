import { SPage } from "servisofts-component";
import Model from "../../../Model";

import root from "./root";

const model = Model.inventario;

export const Parent = {
    name: "inventario",
    path: `/productos/inventario`,
    model
}
export default SPage.combinePages(Parent.name, {
    "": root,

    // "inventario": inventario,
})
