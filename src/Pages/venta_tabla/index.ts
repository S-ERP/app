import { SPage } from "servisofts-component";
 import Lista from "./Lista";
import Perfil from "./Perfil";


export const Parent = {
  name: "venta_tabla",
  path: `/venta_tabla`,
//   model,
};
export default SPage.combinePages(Parent.name, {
  "": Lista,
  lista: Lista,
  perfil: Perfil,
});
