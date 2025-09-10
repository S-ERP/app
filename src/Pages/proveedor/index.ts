import { SPage } from "servisofts-component";
 import Lista from "./Lista";
import Perfil from "./Perfil";
import Pagos from "./Pagos";
import Pagos3 from "./Pagos3";
export const Parent = {
  name: "proveedor",
  path: `/proveedor`,
};
export default SPage.combinePages(Parent.name, {
  "": Lista,
  "pagos": Pagos,
  "pagos3": Pagos3,
  lista: Lista,
  perfil: Perfil,
});
