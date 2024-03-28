import { SPage } from "servisofts-component";
import root from "./root"
import ajustes from "./ajustes";
import emitir from "./emitir";
import pdf from "./pdf"
import libro_ventas from "./libro_ventas";
export const Parent = {
    name: "facturacion",
    path: `/facturacion`,
}
export default SPage.combinePages(Parent.name, {
    "": root,
    ajustes,
    emitir,
    libro_ventas,
    pdf

})
