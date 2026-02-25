import { SPage } from "servisofts-component";

import root from "./root";
import cuentas from "./cuentas";
import cuentas_t from "./cuentas_t";
import balance from "./balance";
import dimension from "./dimension";
import libro_diario from "./libro_diario";
import report_config from "./report_config";
import centro_costo from "./centro_costo";
import centro_costo2 from "./centro_costo2";
import centrocostojp from "./centrocostojp";
import diario from "./diario"
import gestion from "./gestion"
export default SPage.combinePages("conta", {
    "": root,
    cuentas,
    cuentas_t,
    dimension,
    balance,
    libro_diario,
    diario,
    centro_costo,
    centro_costo2,
    centrocostojp,
    ...gestion,
    ...report_config,

})