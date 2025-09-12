import { SPage } from "servisofts-component";
 import Lista from "./Lista";
import Perfil from "./Perfil";
import Pagos from "./Pagos";
import Pagos3 from "./Pagos3";
import Pagos2 from "./Pagos";
import PagosSuper from "./PagosSuper";
export const Parent = {
  name: "proveedor",
  path: `/proveedor`,
};
export default SPage.combinePages(Parent.name, {
  "": Lista,
  "pagos": Pagos,
  "pagos2": PagosSuper,
  lista: Lista,
  perfil: Perfil,
});
