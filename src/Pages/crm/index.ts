import { SPage, SPageListProps } from "servisofts-component";
import root from "./root";
import proyecto from "./proyecto";
import cliente from "./cliente";
import operador from "./operador";
import detalleLlamada from "./detalleLlamada";
import plantilla from "./plantilla";
import dashboard from "./dashboard";
import lead from "./lead";
import tipoMovimientoLead from "./tipoMovimientoLead";
import llamar from "./llamar";

export default SPage.combinePages("crm", {
  "": root,
  proyecto,
  cliente,
  operador,
  detalleLlamada,
  plantilla,
  dashboard,
  lead,
  tipoMovimientoLead,
  llamar
});
