import { SPage } from "servisofts-component";
import Lista from "./Lista";
import Perfil from "./Perfil";
import tabla_transacciones from "./tabla_transacciones";
export const Parent = {
  name: "proveedor",
  path: `/proveedor`,
};
export default SPage.combinePages(Parent.name, {
  "": Lista,
  lista: Lista,
  perfil: Perfil,
  "transacciones": tabla_transacciones,
});
