import React, { Component } from "react";
import { SPage } from "servisofts-component";
import MDL from "../MDL";
import PopupCarrito from "../Components/CarritoCompra/PopupCarrito";

const ITEMS_QUEMADOS = [
  {
    modelo: {
      key: "modelo-1",
      descripcion: "Laptop HP ProBook 450",
      precio_compra: 3500,
      precio_compra_moneda: 3500,
      venta_moneda: { key: "bs", tipo_cambio: 1 },
      fecha_vencimiento: null,
    },
    cantidad: 2,
    precio: 3500,
  },
  {
    modelo: {
      key: "modelo-2",
      descripcion: "Mouse inalámbrico Logitech M170",
      precio_compra: 0,
      precio_compra_moneda: 45,
      venta_moneda: { key: "bs", tipo_cambio: 1 },
      fecha_vencimiento: null,
    },
    cantidad: 5,
    precio: 45,
  },
  {
    modelo: {
      key: "modelo-3",
      descripcion: "Yogurt Pil 1L (perecedero)",
      precio_compra: 12.5,
      precio_compra_moneda: 12.5,
      venta_moneda: { key: "bs", tipo_cambio: 1 },
      fecha_vencimiento: "2026-08-15T00:00:00",
    },
    cantidad: 10,
    precio: 12.5,
  },
];

export default class Test extends Component {
  componentDidMount() {
    MDL.carrito.carrito_compra.items = ITEMS_QUEMADOS;
    MDL.carrito.calcularValoresCarritDeCompras();
    PopupCarrito.open({});
  }

  render() {
    return <SPage title="Test"></SPage>;
  }
}
