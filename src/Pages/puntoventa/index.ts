import { SPage } from "servisofts-component";
import Main from "./Main";
import Testx from "./Testx";

export const Parent = {
  name: "puntoventa",
  path: `/puntoventa`,
};
export default SPage.combinePages(Parent.name, {
  "": Main,
  "pdf": Main,
  "test": Testx,
});
