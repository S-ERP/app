import { SPage } from "servisofts-component";
import root from "./root";
import medicos from "./medicos";
import servicios from "./servicios";


export default SPage.combinePages("grupal", {
   "": root,
   "medicos": medicos,
   "servicios": servicios,
   // "tabla_compra": tabla_compra,



});