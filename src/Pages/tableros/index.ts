import { SPage } from "servisofts-component";
import tabla_venta from "./tabla_venta";
import tabla_compra from "./tabla_compra";
import tabla_productos from "./tabla_productos";
import tabla_inventario from "./tabla_inventario.js";
import tabla_valor_stock from "./tabla_valor_stock.js";

export default SPage.combinePages("tableros", {
   "": tabla_venta,
   "tabla_compra": tabla_compra,
   "tabla_productos": tabla_productos,
   "tabla_inventario": tabla_inventario,
   "tabla_valor_stock":tabla_valor_stock




});