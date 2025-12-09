import { SPage } from "servisofts-component";
import Model from "../../../Model";
import root from "./root";

const model = Model.caja;

export const Parent = {
    name: "gestion",
    path: `/conta/gestion`,
    model
}
export default SPage.combinePages(Parent.name, {
    "": root,
    "root": root,

})
