import { SPage, SPageListProps } from 'servisofts-component';
import root from './root';
import proyecto from './proyecto';

export default SPage.combinePages("crm", {
    "": root,
    proyecto,
});