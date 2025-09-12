import { SPage } from "servisofts-component";
 import Lista from "./Lista";
import Perfil from "./Perfil";
import Pagos from "./Pagos";
export const Parent = {
  name: "proveedor",
  path: `/proveedor`,
};
export default SPage.combinePages(Parent.name, {
  "": Lista,
  "pagos": Pagos,
  lista: Lista,
  perfil: Perfil,
});
