import MDLAbstract from "../MDLAbstract";
import { EventListener } from "./types";
export type CarritoItem = {
  modelo: { descripcion: string, key: string, estado?: number },
  cantidad: number,
  precio: number,
}
export type CarritoItemVenta = {
  modelo: { descripcion: string, key: string, estado?: number },
  cantidad: number,
  precio: number,
  key_modelo_cliente: string,
}
export default class carrito extends MDLAbstract<EventListener> {
  async componentDidMount() { }
  carrito_compra: {
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
  removerItemAlCarritoDeCompras = (item: CarritoItem) => {
    const index = this.carrito_compra.items.findIndex(a => this.compararItem(a, item))
    if (index > -1) {
      this.carrito_compra.items.splice(index, 1);
    }
    this.calcularValoresCarritDeCompras();
  }
  limpiarCarritoCompras = () => {
    this.carrito_compra.items = [];
    this.calcularValoresCarritDeCompras();
  }
  // 0️⃣1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣
  //aqui se hace el calculo del subtotal para
  calcularValoresCarritDeCompras() {
    let cantidad_items = 0;
    let monto = 0;
    this.carrito_compra.items.forEach(element => {
      cantidad_items += element.cantidad;
      monto += element.cantidad * element.modelo?.precio_venta_moneda;;
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
  //VENTA
  carrito_venta: {
    items: CarritoItemVenta[],
    cantidad_items: number,
    monto_total: number,
    key_almacen?: string,
    key_proveedor?: string,
  } = {
      cantidad_items: 0,
      monto_total: 0,
      items: [],
    }
  compararItemVenta = (item: CarritoItemVenta, item2: CarritoItemVenta) => {
    return item.modelo.key == item2.modelo.key;
  }
  removerItemAlCarritoDeVentas = (item: CarritoItemVenta) => {
    const index = this.carrito_venta.items.findIndex(a => this.compararItemVenta(a, item))
    if (index > -1) {
      this.carrito_venta.items.splice(index, 1);
    }
    this.calcularValoresCarritDeVentas();
    // const dataSelect_ = this.carrito_venta.items;
    // SStorage.setItem("dataSelectServicios", JSON.stringify(dataSelect_));
  }
  limpiarCarritoVentas = () => {
    this.carrito_venta.items = [];
    this.calcularValoresCarritDeVentas();
  }
  // aqui hace el calsucolo del subtotal y asi lo lleva a los tipos de pagos
  calcularValoresCarritDeVentas() {
    let cantidad_items = 0;
    let monto = 0;
    this.carrito_venta.items.forEach(element => {
      cantidad_items += element.cantidad;
      monto += element.cantidad * element.modelo?.precio_venta_moneda;
    });
    this.carrito_venta.cantidad_items = cantidad_items;
    this.carrito_venta.monto_total = monto;
    this.dispatchEvent({
      type: "handleChange"
    });
  }
  agregarItemAlCarritoDeVentas = (item: CarritoItemVenta) => {
    const exist = this.carrito_venta.items.find(a => this.compararItemVenta(a, item))
    if (exist) {
      exist.cantidad++;
    } else {
      this.carrito_venta.items.push(item);
    }
    this.calcularValoresCarritDeVentas();
  }
}