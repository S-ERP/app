import { SPage, SPageListProps } from 'servisofts-component';
import root from './root';
export const Parent = {
    name: "registro",
    path: `/registro`,
}
export default SPage.combinePages(Parent.name, {
    "": root,
});