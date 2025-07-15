import { SPage } from "servisofts-component";

import root from "./root";
import cuentas from "./cuentas";

export default SPage.combinePages("conta",{
    "":root,
    cuentas
})