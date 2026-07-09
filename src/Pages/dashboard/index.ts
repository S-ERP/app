import { SPage } from "servisofts-component";
import ventas from "./ventas";
import inventario from "./inventario";
import cajas from "./cajas";


export default SPage.combinePages("dashboard", {
   "": ventas,
   // "ventas": ventas,
   "inventario": inventario,
   "cajas": cajas,
  



});