import { SPage } from "servisofts-component";
import Model from "../../Model";
import root from "./root";
import recuperar from "./recuperar";
import recuperar_codigo from "./recuperar_codigo";
import recuperar_pass from "./recuperar_pass";

const model = Model.rol;
export const Parent = {
    name: "login",
    path: `/login`,
    model
}
export default SPage.combinePages(Parent.name, {
    "": root,
    "root": root,
    "recuperar": recuperar,
    "recuperar_codigo": recuperar_codigo,
    "recuperar_pass": recuperar_pass,
})
