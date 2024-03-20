import { SPage } from "servisofts-component";
import root from "./root"

export const Parent = {
    name: "facturacion",
    path: `/facturacion`,
}
export default SPage.combinePages(Parent.name, {
    "": root,

})
