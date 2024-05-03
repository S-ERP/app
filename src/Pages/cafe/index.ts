import { SPage } from "servisofts-component";
import Model from "../../Model";
import root from "./root";

export const Parent = {
    name: "cafe",
    path: `/cafe`,
}
export default SPage.combinePages(Parent.name, {
    "": root,
})
