import { SPage } from "servisofts-component";
import tabla_venta from "./tabla_venta";
import tabla_compra from "./tabla_compra";

export default SPage.combinePages("tableros", {
   "": tabla_venta,
   "tabla_compra": tabla_compra,

});