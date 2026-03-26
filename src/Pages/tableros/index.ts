import { SPage } from "servisofts-component";
import tabla_venta from "./tabla_venta";
import tabla_compra from "./tabla_compra";
import tabla_productos from "./tabla_productos";
import tabla_inventario from "./tabla_inventario.js";
import tabla_valor_stock from "./tabla_valor_stock.js";
import tabla_alvaro from "./tabla_alvaro";
import tabla_alvaro2 from "./tabla_alvaro2";
import tabla_ventas_dia from "./tabla_ventas_dia";
import tabla_ventas_mes from "./tabla_ventas_mes";
import tabla_compras_dia from "./tabla_compras_dia";
import tabla_compras_mes from "./tabla_compras_mes";
import tabla_productos_dia from "./tabla_productos_dia";

export default SPage.combinePages("tableros", {
   "": tabla_venta,
   "tabla_compra": tabla_compra,
   "tabla_productos": tabla_productos,
   "tabla_inventario": tabla_inventario,
   "tabla_valor_stock": tabla_valor_stock,
   "tabla_alvaro": tabla_alvaro,
   "tabla_ventas_dia": tabla_ventas_dia,
   "tabla_ventas_mes": tabla_ventas_mes,
   "tabla_compras_dia": tabla_compras_dia,
   "tabla_compras_mes": tabla_compras_mes,
   "tabla_alvaro2": tabla_alvaro2,
   "tabla_productos_dia": tabla_productos_dia




});