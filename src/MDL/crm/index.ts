import { Proyecto, EventListener } from "./type";
import proyecto from "./proyecto";
import MDLAbstract from "../MDLAbstract";

export default class crm extends MDLAbstract<EventListener> {
    proyecto = new proyecto();


}