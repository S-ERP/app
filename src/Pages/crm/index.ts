import { SPage, SPageListProps } from 'servisofts-component';
import root from './root';
import proyecto from './proyecto';
// import cliente from './cliente';

export default SPage.combinePages("crm", {
    "": root,
    proyecto,
    // cliente,
});