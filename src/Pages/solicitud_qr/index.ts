import { SPage } from "servisofts-component";
import root from "./root";
import reporte from "./reporte";
import mispagos from "./mispagos";


export const Parent = {
    name: "solicitud_qr",
    path: `/solicitud_qr`,
}
export default SPage.combinePages(Parent.name, {
    "": root,
    reporte,
    mispagos
})
