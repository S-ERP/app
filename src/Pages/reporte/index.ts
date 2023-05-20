import { SPage } from "servisofts-component";

import root from "./root";
import balance from "./balance";
import cajas_activas from "./cajas_activas";
import cajas_historico from "./cajas_historico";
import dashboard from "./dashboard";
import inventario from "./Inventario";
import reporte_compras_ventas_cuotas from "./reporte_compras_ventas_cuotas";
import reporte_ventas_vendedores from "./reporte_ventas_vendedores";
import reporte_compras_compradores from "./reporte_compras_compradores";

export default SPage.combinePages("reporte",
    {
        "": root,
        "balance": balance,
        "cajas_activas": cajas_activas,
        "cajas_historico": cajas_historico,
        "dashboard": dashboard,
        "inventario": inventario,
        reporte_compras_ventas_cuotas,
        reporte_ventas_vendedores,
        reporte_compras_compradores

    }
)