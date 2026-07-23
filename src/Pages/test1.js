import React, { Component } from "react";
import { SPage } from "servisofts-component";
import MDL from "../MDL";
import PopupCarrito from "../Components/CarritoVenta/PopupCarrito";

const ITEMS_QUEMADOS = [
  {
    modelo: {
      key: "modelo-1",
      descripcion: "Laptop HP ProBook 450",
      precio_venta: 4200,
      precio_venta_moneda: 4200,
      venta_moneda: { key: "bs", tipo_cambio: 1 },
    },
    cantidad: 1,
  },
  {
    modelo: {
      key: "modelo-2",
      descripcion: "Mouse inalámbrico Logitech M170",
      precio_venta: 0,
      precio_venta_moneda: 0,
      venta_moneda: { key: "bs", tipo_cambio: 1 },
    },
    cantidad: 3,
  },
  {
    modelo: {
      key: "modelo-3",
      descripcion: "Yogurt Pil 1L",
      precio_venta: 15,
      precio_venta_moneda: 15,
      venta_moneda: { key: "bs", tipo_cambio: 1 },
    },
    cantidad: 10,
  },
  {
    modelo: {
      key: "modelo-4",
      descripcion: "Servicio de Instalación",
      precio_venta: 200,
      precio_venta_moneda: 200,
      venta_moneda: { key: "bs", tipo_cambio: 1 },
      tipo_producto: { tipo: "servicio" },
    },
    cantidad: 1,
  },
  {
    modelo: {
      key: "modelo-5",
      descripcion: "Monitor LG 24 pulgadas",
      precio_venta: 950,
      precio_venta_moneda: 950,
      venta_moneda: { key: "bs", tipo_cambio: 1 },
      stock: 5,
    },
    cantidad: 2,
  },
  {
    modelo: {
      key: "modelo-6",
      descripcion: "Membresía Gym Mensual",
      precio_venta: 150,
      precio_venta_moneda: 150,
      venta_moneda: { key: "bs", tipo_cambio: 1 },
      cantidad_suscriptores: 1,
    },
    cantidad: 1,
  },
  {
    modelo: {
      key: "modelo-7",
      descripcion: "Teclado Mecánico RGB",
      precio_venta: 320,
      precio_venta_moneda: 320,
      venta_moneda: { key: "bs", tipo_cambio: 1 },
      tipoCostos: [
        {
          key_tipo_costo: "comision-vendedor",
          descripcion: "Comisión vendedor",
          monto: 0,
          key_modelo_cliente: null,
          clientes: [],
        },
      ],
    },
    cantidad: 1,
  },
];

export default class Test extends Component {
  componentDidMount() {
    MDL.carrito.carrito_venta.items = ITEMS_QUEMADOS;
    MDL.carrito.calcularValoresCarritDeVentas();
    PopupCarrito.open({});
  }

  render() {
    return <SPage title="Test"></SPage>;
  }
}
