import { SPage } from "servisofts-component";

import asiento_compra from "./asiento_compra";
import asiento_venta from "./asiento_venta";
import root from "./root";

export const Parent = {
  name: "asientos_automaticos",
  path: `/contabilidad/asientos_automaticos`,
};
export default SPage.combinePages(Parent.name, {
  "": root,
  compra: asiento_compra,
  venta: asiento_venta,
});
