import MDL from "..";
import MDLAbstract from "../MDLAbstract";
import { EventListener } from "./types";

export type CarritoItem = {
  modelo: { descripcion: string; key: string; estado?: number };
  cantidad: number;
  precio: number;
};

export type CarritoItemVenta = {
  modelo: { descripcion: string; key: string; estado?: number };
  cantidad: number;
  precio: number;
  key_modelo_cliente: string;
};

export default class carrito extends MDLAbstract<EventListener> {
  selectedMoneda: any = null;
  eventoMoneda: any = null;

  async componentDidMount() {
    this.evento = MDL.compra_venta.addEventListener("moneda_seleccionada", () => {
      const moneda = MDL.compra_venta.getMonedaSeleccionada();
      this.selectedMoneda = moneda;
      this.calcularValoresCarritDeCompras();
    });
  }

  componentWillUnmount(): void {
    if (this.evento) {
      MDL.compra_venta.removeEventListener(this.evento);
    }
  }

  carrito_compra: {
    items: CarritoItem[];
    cantidad_items: number;
    monto_total: number;
    key_almacen?: string;
    key_proveedor?: string;
  } = {
    items: [],
    cantidad_items: 0,
    monto_total: 0,
  };

  compararItem = (item: CarritoItem, item2: CarritoItem) => {
    return item.modelo.key == item2.modelo.key;
  };

  agregarItemAlCarritoDeCompras = (item: CarritoItem) => {
    const exist = this.carrito_compra.items.find((a) => this.compararItem(a, item));
    if (exist) {
      exist.cantidad++;
    } else {
      this.carrito_compra.items.push(item);
    }
    this.calcularValoresCarritDeCompras();
  };

  removerItemAlCarritoDeCompras = (item: CarritoItem) => {
    const index = this.carrito_compra.items.findIndex((a) => this.compararItem(a, item));
    if (index > -1) {
      this.carrito_compra.items.splice(index, 1);
    }
    this.calcularValoresCarritDeCompras();
  };

  limpiarCarritoCompras = () => {
    this.carrito_compra.items = [];
    this.calcularValoresCarritDeCompras();
  };

  // 🔥 Corregido: ahora usa carrito_compra.items en lugar de carrito_venta
  calcularValoresCarritDeCompras() {
    let cantidad_items = 0;
    let monto = 0;

    this.carrito_compra.items.forEach((item) => {
      cantidad_items += item.cantidad;
      monto += item.cantidad * item.precio; // usa el precio del item
    });

    this.carrito_compra.cantidad_items = cantidad_items;
    this.carrito_compra.monto_total = monto;

    // Notifica a cualquier listener para actualizar el UI
    this.dispatchEvent({ type: "handleChange" });
  }

  // ---------------------- Carrito de ventas (no tocamos) ----------------------
  carrito_venta: {
    items: CarritoItemVenta[];
    cantidad_items: number;
    monto_total: number;
    key_almacen?: string;
    key_proveedor?: string;
  } = {
    items: [],
    cantidad_items: 0,
    monto_total: 0,
  };
}
