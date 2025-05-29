import { Proyecto, EventListener } from "./type";
import proyecto from "./proyecto";
import cliente from "./cliente";
import MDLAbstract from "../MDLAbstract";
import campana from "./campana";
export default class crm extends MDLAbstract<EventListener> {
    proyecto = new proyecto();
    cliente = new cliente();
    campana = new campana();
}