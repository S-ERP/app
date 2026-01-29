import MDL from "..";
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
  selectedMoneda: any = null;
  eventoMoneda: any = null;
  async componentDidMount() {
    this.evento = MDL.compra_venta.addEventListener("moneda_seleccionada", () => {
      const moneda = MDL.compra_venta.getMonedaSeleccionada();
      this.selectedMoneda = moneda;
      this.calcularValoresCarritDeVentas();
    });
  }
  componentWillUnmount(): void {
    if (this.evento) {
      MDL.compra_venta.removeEventListener(this.evento);
    }
  }
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
  calcularValoresCarritDeCompras() {
    const moneda = this.selectedMoneda || MDL.compra_venta.getMonedaSeleccionada();
    let cantidad_items = 0;
    let monto = 0;
    this.carrito_venta.items.forEach(element => {
      cantidad_items += element.cantidad;
      const precio = moneda
        ? element.modelo.precio_venta_moneda / (moneda.tipo_cambio || 1)
        : element.modelo.precio_venta_moneda;
      monto += element.cantidad * precio;
    });
    this.carrito_venta.cantidad_items = cantidad_items;
    this.carrito_venta.monto_total = monto;
    this.dispatchEvent({ type: "handleChange" });
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
  }
  limpiarCarritoVentas = () => {
    this.carrito_venta.items = [];
    this.calcularValoresCarritDeVentas();
  }
  calcularValoresCarritDeVentas() {
    const moneda = this.selectedMoneda || MDL.compra_venta.getMonedaSeleccionada();
    let cantidad_items = 0;
    let monto = 0;
    this.carrito_venta.items.forEach(element => {
      cantidad_items += element.cantidad;
      let precio;
      if (moneda && element.modelo.venta_moneda.key === moneda.key) {
        precio = element.modelo.precio_venta;
      } else {
        const tipoCambioVenta = element.modelo.venta_moneda.tipo_cambio || 1;
        const tipoCambioSeleccionada = moneda.tipo_cambio || 1;
        precio = element.modelo.precio_venta * (tipoCambioVenta / tipoCambioSeleccionada);
      }
      monto += element.cantidad * precio;
    });
    this.carrito_venta.cantidad_items = cantidad_items;
    this.carrito_venta.monto_total = monto;
    this.dispatchEvent({ type: "handleChange" });
  }
  calcularValoresCarritDeVentas2() {
    const moneda = this.selectedMoneda || MDL.compra_venta.getMonedaSeleccionada();
    let cantidad_items = 0;
    let monto = 0;
    console.clear();
    this.carrito_venta.items.forEach(element => {
      cantidad_items += element.cantidad;
      const precio = moneda
        ? element.modelo.precio_venta_moneda / (moneda.tipo_cambio || 1)
        : element.modelo.precio_venta_moneda;
      monto += element.cantidad * precio;
    });
    this.carrito_venta.cantidad_items = cantidad_items;
    this.carrito_venta.monto_total = monto;
    this.dispatchEvent({ type: "handleChange" });
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