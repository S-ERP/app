import { SPage, SPageListProps } from "servisofts-component";
import root from "./root";
import proyecto from "./proyecto";
import cliente from "./cliente";
import operador from "./operador";
import detalleLlamada from "./detalleLlamada";
import plantilla from "./plantilla";
// import dashboard from "./dashboard";
import dashboard2 from "./dashboard2";
import dashboardDelivery from "./dashboardDelivery";
import dashboardGeneral from "./dashboardGeneral";
import lead from "./lead";
import tipoMovimientoLead from "./tipoMovimientoLead";
import llamar from "./llamar";
import call from "./call"
import campana from "./campana";
import graficos from "./graficos";

export default SPage.combinePages("crm", {
  "": root,
  proyecto,
  cliente,
  operador,
  detalleLlamada,
  plantilla,
  // dashboard,
  dashboard2,
  dashboardDelivery,
  dashboardGeneral,
  lead,
  tipoMovimientoLead,
  llamar,
  campana,
  graficos,
  call
});
