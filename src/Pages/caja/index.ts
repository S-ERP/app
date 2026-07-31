import { SPage } from "servisofts-component";

import root from "./root";
import caja from "./caja";
import caja_detalle from "./caja_detalle";
import tipo_pago from "./tipo_pago";
import fraccionar from "./fraccionar";
import history from "./history";
import historyTabla from "./historyTabla";
import reporteCajas from "./reporteCajas";
import reporteMoviminetos from "./reporteMoviminetos";
import recurrente from "./recurrente";
import misReporteMoviminetos from "./misReporteMoviminetos";
import ventas_caja from "./ventas_caja";
import detalle_caja from "./detalle_caja";
import anuladas_caja from "./anuladas_caja";
export default SPage.combinePages("caja",
    {
        // "": root,
        "caja2": root,
        "tipo_pago": tipo_pago,
        "fraccionar": fraccionar,
        "history": history,
        "reporte_cajas": reporteCajas,
        "reporte_movimientos": reporteMoviminetos,
        "mis_reporte_movimientos": misReporteMoviminetos,

        "history2": historyTabla,
        "ventas_caja": ventas_caja,
        "detalle_caja": detalle_caja,
        "anuladas_caja": anuladas_caja,
        recurrente,
        ...caja,
        ...caja_detalle

    }
)