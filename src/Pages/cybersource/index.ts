import { SPage } from "servisofts-component";
import pagos from "./pagos";
import configuracion from "./configuracion";

export default SPage.combinePages("cybersource", {
    "": pagos,
    "configuracion": configuracion,
});
