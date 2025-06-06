import { Proyecto, EventListener } from "./type";
import proyecto from "./proyecto";
import cliente from "./cliente";
import MDLAbstract from "../MDLAbstract";
import campana from "./campana";
import clienteProyecto from "./clienteProyecto";
import tipoMovimientoLead from "./tipoMovimientoLead";
import proyectoProducto from "./proyectoProducto";
import paises from "./paises";
export default class crm extends MDLAbstract<EventListener> {
    paises = paises

    
    proyecto = new proyecto();
    clienteProyecto = new clienteProyecto();
    cliente = new cliente();
    campana = new campana();
    tipoMovimientoLead = new tipoMovimientoLead();
    proyectoProducto = new proyectoProducto();

}