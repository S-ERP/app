import SSocket from "servisofts-socket";
import MDLAbstract from "../MDLAbstract";
import { EventListener } from "./types";

type CarritoItem = {
  modelo: { descripcion: string, key: string, estado?: number },
  cantidad: number,
  precio: number,

}

export default class carrito extends MDLAbstract<EventListener> {
  async componentDidMount() { }

  carrito_compra: {
    items: CarritoItem[],
    cantidad_items: number,
    monto_total: number,
  } = {
      cantidad_items: 0,
      monto_total: 0,
      items: []
    }


  compararItem = (item: CarritoItem, item2: CarritoItem) => {
    return item.modelo.key == item2.modelo.key;
  }
  removerItemAlCarritoDeCompras = (item: CarritoItem) => {
    const index = this.carrito_compra.items.findIndex(a => this.compararItem(a, item))
    if (index > -1) {
      this.carrito_compra.items.splice(index, 1);
    }
    this.calcularValoresCarritDeCompras();



  }

  calcularValoresCarritDeCompras() {
    let cantidad_items = 0;
    let monto = 0;

    this.carrito_compra.items.forEach(element => {
      cantidad_items += element.cantidad;
      monto += element.cantidad * element.precio;
    });
    this.carrito_compra.cantidad_items = cantidad_items;
    this.carrito_compra.monto_total = monto;
    this.dispatchEvent({
      type: "handleChange"
    });

  }
  agregarItemAlCarritoDeCompras = (item: CarritoItem) => {

    const exist = this.carrito_compra.items.find(a => this.compararItem(a, item))
    if (exist) {
      exist.cantidad++;
    } else {
      this.carrito_compra.items.push(item);
    }
    this.calcularValoresCarritDeCompras();


  }

}
