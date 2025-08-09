import { SPage } from "servisofts-component";

import root from "./root";
import cuentas from "./cuentas";
import balance from "./balance";
import dimension from "./dimension";

export default SPage.combinePages("conta",{
    "":root,
    cuentas,
    dimension,
    balance
})