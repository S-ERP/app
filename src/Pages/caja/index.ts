import { SPage } from "servisofts-component";

import root from "./root";
import caja from "./caja";
import caja_detalle from "./caja_detalle";
import tipo_pago from "./tipo_pago";
import fraccionar from "./fraccionar";
import history from "./history";
import historyTabla from "./historyTabla";
export default SPage.combinePages("caja",
    {
        // "": root,
        "caja2": root,
        "tipo_pago": tipo_pago,
        "fraccionar": fraccionar,
        "history": history,
        "history2": historyTabla,
        ...caja,
        ...caja_detalle

    }
)