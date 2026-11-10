import { SPage } from "servisofts-component";
import pagos from "./pagos";
import configuracion from "./configuracion";
import contratos from "./contratos";
import contrato from "./contrato";
import cobros from "./cobros";
import ordenes from "./ordenes";
import tienda from "./tienda";
import liquidaciones from "./liquidaciones";

export default SPage.combinePages("cybersource", {
    "": pagos,
    "configuracion": configuracion,
    "contratos": contratos,
    "contrato": contrato,
    "cobros": cobros,
    "ordenes": ordenes,
    "tienda": tienda,
    "liquidaciones": liquidaciones,
});
