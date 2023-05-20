import { SPage } from "servisofts-component";

import root from "./root";
import test from "./test";
import pendientes from "./pendientes";
import clientesPendientes from "./clientesPendientes";
import clientes_con_deuda from "./clientes_con_deuda";
import proveedores_que_debemos from "./proveedores_que_debemos";
import carrito_de_cuotas from "./carrito_de_cuotas";
import penalidades from "./penalidades";
export default SPage.combinePages("cobranza",
    {
        "": root,
        clientes_con_deuda,
        proveedores_que_debemos,
        carrito_de_cuotas,
        pendientes,
        clientesPendientes,
        penalidades,
        test
    }
)
