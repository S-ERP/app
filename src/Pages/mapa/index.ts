import { SPage, SPageListProps } from 'servisofts-component';

import Root from './root';
import aviso from './aviso';

export default SPage.combinePages("mapa", {
    "": Root,
    "aviso": aviso,
});