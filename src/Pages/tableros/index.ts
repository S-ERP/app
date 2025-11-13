import { SPage } from "servisofts-component";
import tabla_venta from "./tabla_venta";

export default SPage.combinePages("tableros", {
   "": tabla_venta,
});