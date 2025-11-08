import SSocket from "servisofts-socket";
import MDLAbstract from "../MDLAbstract";
import { EventListener } from "./types";

export type CarritoItem = {
  modelo: { descripcion: string, key: string, estado?: number },
  cantidad: number,
  precio: number,

}

export default class carritoVenta extends MDLAbstract<EventListener> {
  async componentDidMount() { }

  carrito_venta: {
    items: CarritoItem[],
    cantidad_items: number,
    monto_total: number,
    key_almacen?: string,
    key_proveedor?: string,
  } = {
      cantidad_items: 0,
      monto_total: 0,
      items: [],
    }


  compararItem = (item: CarritoItem, item2: CarritoItem) => {
    return item.modelo.key == item2.modelo.key;
  }
  removerItemAlCarritoDeVentas = (item: CarritoItem) => {
    const index = this.carrito_venta.items.findIndex(a => this.compararItem(a, item))
    if (index > -1) {
      this.carrito_venta.items.splice(index, 1);
    }
    this.calcularValoresCarritDeVentas();


  }
  limpiarCarritoVentas = () => {
    this.carrito_venta.items = [];
    this.calcularValoresCarritDeVentas();
  }

  calcularValoresCarritDeVentas() {
    let cantidad_items = 0;
    let monto = 0;

    this.carrito_venta.items.forEach(element => {
      cantidad_items += element.cantidad;
      monto += element.cantidad * element.precio;
    });
    this.carrito_venta.cantidad_items = cantidad_items;
    this.carrito_venta.monto_total = monto;
    this.dispatchEvent({
      type: "handleChange"
    });

  }
  agregarItemAlCarritoDeVentas = (item: CarritoItem) => {

    const exist = this.carrito_venta.items.find(a => this.compararItem(a, item))
    if (exist) {
      exist.cantidad++;
    } else {
      this.carrito_venta.items.push(item);
    }
    this.calcularValoresCarritDeVentas();


  }

  

}
