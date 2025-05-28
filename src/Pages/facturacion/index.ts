import { SPage } from "servisofts-component";
import root from "./root"
import ajustes from "./ajustes";
import emitir from "./emitir";
import pdf from "./pdf"
import pdfLarge from "./pdfLarge"
import libro_ventas from "./libro_ventas";
import libro_ventas2 from "./libro_ventas2";
import puntos_de_ventas from "./puntos_de_ventas";
import puntos_de_ventas_registro from "./puntos_de_ventas_registro";
import emitir2 from "./emitir2";
import importar from "./importar";
import create from "./create"
import anular_cuf from "./anular_cuf";
export const Parent = {
    name: "facturacion",
    path: `/facturacion`,
}

export default SPage.combinePages(Parent.name, {
    "": root,
    ajustes,
    emitir,
    emitir2,
    create,
    libro_ventas,
    libro_ventas2,
    pdf,
    pdfLarge,
    puntos_de_ventas,
    importar,
    anular_cuf,
    "puntos_de_ventas/registro": puntos_de_ventas_registro

})
