import { SPage } from "servisofts-component";

import root from "./root";
import cuentas from "./cuentas";
import balance from "./balance";
import dimension from "./dimension";
import libro_diario from "./libro_diario";

export default SPage.combinePages("conta",{
    "":root,
    cuentas,
    dimension,
    balance,
    libro_diario
})