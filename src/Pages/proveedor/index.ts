import { SPage } from "servisofts-component";
import Lista from "./Lista";
import Perfil from "./Perfil";
export const Parent = {
  name: "proveedor",
  path: `/proveedor`,
};
export default SPage.combinePages(Parent.name, {
  "": Lista,
  lista: Lista,
  perfil: Perfil,
});
