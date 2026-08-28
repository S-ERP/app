import { SPage, SPageListProps } from "servisofts-component";
import root from "./root";
import dashboard from "./dashboard";
// import table from "./table";
export default SPage.combinePages("asistencia", {
  "": root,
  "dashboard": dashboard,
  // table
});
