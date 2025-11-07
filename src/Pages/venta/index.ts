import { SPage } from "servisofts-component";

import root from "./root";
import Model from "../../Model";

import detalle from "./detalle";

import _delete from "./delete";
import _new from "./new";
import cotizacion from "./cotizacion";
import aprobado from "./aprobado";
import vendido from "./vendido";
import denegado from "./denegado";
import pendientes from "./pendientes";
import profile from "./profile";
import edit from "./edit";
import editar_plan_pagos from "./editar_plan_pagos";
import lista from "./lista";
import tabla from "./tabla";
import import_odoo from "./import_odoo";
const model = Model.compra_venta;

export const Parent = {
    name: "cotizacion",
    path: `/venta`,
    model
}
export default SPage.combinePages("venta",
    {
        "": lista,
        "root": root,
        "new": _new,
        "delete": _delete,
        "edit": edit,
        "cotizacion": cotizacion,
        "aprobado": aprobado,
        "vendido": vendido,
        "pendientes": pendientes,
        "denegado": denegado,
        "profile": profile,
        "tabla": tabla,
        import_odoo,
        editar_plan_pagos,
        ...detalle,
    }
)