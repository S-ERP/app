import { SPage } from "servisofts-component";
import Lista from "./Lista";
export const Parent = {
  name: "tag",
  path: `/tag`,
};
export default SPage.combinePages(Parent.name, {
  "": Lista,
  lista: Lista,
});
