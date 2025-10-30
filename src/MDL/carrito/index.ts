import SSocket from "servisofts-socket";
import MDLAbstract from "../MDLAbstract";
import { EventListener } from "./types";

export default class carrito extends MDLAbstract<EventListener> {
  async componentDidMount() { }

  carrito_compra = {
    items: []
  }

  agregarItemAlCarritoDeCompras = (item: any) => {
    this.carrito_compra.items.push(item);
    this.dispatchEvent({
      type: "handleChange"
    });

  }

}
