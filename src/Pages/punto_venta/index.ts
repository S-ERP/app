import { SPage } from "servisofts-component";
import Carrito from "./Components/Carrito";
import Header from "./Components/Header";
import Modelo from "./Components/Modelo";
import TipoModelo from "./Components/Categoria";
import Main from "./Main";
import ConfirmarPago from "./Components/Carrito/ConfirmarPago";
import Galaxia from "./Galaxia";
export default SPage.combinePages("punto_venta", {
//   "": Main,
  "": Galaxia,
  carrito: Carrito,
  header: Header,
  modelo: Modelo,
  tipomodelo: TipoModelo,
  confirmarpago: ConfirmarPago,
});
