import { SPage, SPageListProps } from 'servisofts-component';
import root from './root';
import proyecto from './proyecto';
import cliente from './cliente';
import operador from './operador';
import detalleLlamada from './detalleLlamada';
import plantilla from './plantilla';

export default SPage.combinePages("crm", {
    "": root,
    proyecto,
    cliente,
    operador,
    detalleLlamada,
    plantilla,
});