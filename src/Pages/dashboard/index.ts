import { SPage } from "servisofts-component";
import ventas from "./ventas";
import inventario from "./inventario";


export default SPage.combinePages("dashboard", {
   "": ventas,
   // "ventas": ventas,
   "inventario": inventario,
  



});