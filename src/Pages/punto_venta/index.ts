import { SPage } from "servisofts-component";
import Carrito from "./Components/Carrito";
import Header from "./Components/Header";
import Modelo from "./Components/Modelo";
import TipoModelo from "./Components/Categoria";
import Main from "./Main";


// export const Parent = {
//   name: "puntoventa",
//   path: `/puntoventa`,
//   //   model,
// };
export default SPage.combinePages("punto_venta", {
  "": Main,
  carrito: Carrito,
  header: Header,
  modelo: Modelo,
  tipomodelo: TipoModelo,
});
