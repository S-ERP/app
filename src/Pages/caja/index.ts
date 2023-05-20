import { SPage } from "servisofts-component";

import root from "./root";
import caja from "./caja";
import caja_detalle from "./caja_detalle";
import tipo_pago from "./tipo_pago";
import fraccionar from "./fraccionar";
export default SPage.combinePages("caja",
    {
        "": root,
        "tipo_pago": tipo_pago,
        "fraccionar": fraccionar,
        ...caja,
        ...caja_detalle

    }
)