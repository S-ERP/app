import { SPage } from "servisofts-component";
import Model from "../../Model";
import root from "./root";

export const Parent = {
    name: "lote",
    path: `/lote`,
}
export default SPage.combinePages(Parent.name, {
    "": root,
})
