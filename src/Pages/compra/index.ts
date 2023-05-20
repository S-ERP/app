import { SPage } from "servisofts-component";

import root from "./root";
import lista from "./lista";
import detalle from "./detalle";
import Model from "../../Model";

import _delete from "./delete";
import _new from "./new";
import cotizacion from "./cotizacion";
import aprobado from "./aprobado";
import comprado from "./comprado";
import denegado from "./denegado";
import profile from "./profile";
import pendientes from "./pendientes";
import edit from "./edit";
const model = Model.compra_venta;

export const Parent = {
    name: "cotizacion",
    path: `/compra`,
    model
}
export default SPage.combinePages("compra",
    {
        "":lista,
        "root": root,
        "new": _new,
        "delete": _delete,
        "edit": edit,
        "cotizacion": cotizacion,
        "aprobado": aprobado,
        "comprado": comprado,
        "denegado": denegado,
        "pendientes": pendientes,
        "profile": profile,
        ...detalle,
    }
)