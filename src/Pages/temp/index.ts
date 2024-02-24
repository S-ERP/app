import { SPage } from "servisofts-component";
import Model from "../../Model";
import root from "./root";

export const Parent = {
    name: "temp",
    path: `/temp`,
}
export default SPage.combinePages(Parent.name, {
    "": root,
})
