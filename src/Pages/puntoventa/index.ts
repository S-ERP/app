import { SPage } from "servisofts-component";
import Main from "./Main";
export const Parent = {
  name: "puntoventa",
  path: `/puntoventa`,
};
export default SPage.combinePages(Parent.name, {
  "": Main,
  "pdf": Main,
});
