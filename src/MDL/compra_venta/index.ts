import { Proyecto, EventListener } from "./type";

import MDLAbstract from "../MDLAbstract";

import proveedor from "./proveedor";

export default class compra_venta extends MDLAbstract<EventListener> {
  proveedor = new proveedor();
  // clienteProyecto = new clienteProyecto();
}
