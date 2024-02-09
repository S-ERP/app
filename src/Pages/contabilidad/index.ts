import { SPage } from "servisofts-component";

import root from "./root";
import gestion from "./gestion";
import cuenta_contable from "./cuenta_contable";
import centro_costo from "./centro_costo";
import plan_unico_cuenta from "./plan_unico_cuenta";
import centro_costo_detalle from "./centro_costo_detalle";
import asiento_contable from "./asiento_contable";
import asiento_contable_detalle from "./asiento_contable_detalle";
import cuentas from "./cuentas";
import cuenta_centro_costo from "./cuenta_centro_costo";
import asiento from "./asiento";
import asientos from "./asientos";

import balance_general from "./balance_general";
import estado_resultado from "./estado_resultado";
import sumas_saldos from "./sumas_saldos";
import libro_diario from "./libro_diario";
import mayores from "./mayores";
import asientos_automaticos from "./asientos_automaticos";
import test from "./test";
import ajustes from "./ajustes";
export const Parent = {
    title: "Contabilidad",
    name: "contabilidad",
    path: "/contabilidad"
}
export default SPage.combinePages(Parent.name,
    {
        "": root,
        test,
        "asiento": asiento,
        "asientos": asientos,
        "cuentas": cuentas,
        "balance_general": balance_general,
        "estado_resultado": estado_resultado,
        "sumas_saldos": sumas_saldos,
        "libro_diario": libro_diario,
        "mayores": mayores,
        ajustes,
        ...cuenta_centro_costo,
        ...gestion,
        ...cuenta_contable,
        ...centro_costo,
        ...plan_unico_cuenta,
        ...centro_costo_detalle,
        ...asiento_contable,
        ...asiento_contable_detalle,
        ...asientos_automaticos,

    }
)