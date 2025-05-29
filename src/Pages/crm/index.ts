import { SPage, SPageListProps } from 'servisofts-component';
import root from './root';
import proyecto from './proyecto';
import cliente from './cliente';
import dashboard from './dashboard';
export default SPage.combinePages("crm", {
    "": root,
    proyecto,
    cliente,
    dashboard
});