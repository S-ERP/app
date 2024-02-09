import { SPage } from "servisofts-component";
import Model from "../../../Model/";
import Root from "./root";
const model = Model.cuenta_contable;

export const Parent = {
    name: "plan_unico_cuenta",
    path: `/contabilidad/plan_unico_cuenta`,
    model
}
export default SPage.combinePages(Parent.name, {
    "": Root,
})
