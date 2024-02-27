import { SAssets } from 'servisofts-component';

import Logo, { ReactComponent as LogoW } from './svg/logo.svg';
import logoCompleto, { ReactComponent as logoCompletoW } from './svg/logoCompleto.svg';
import profile2, { ReactComponent as profile2W } from './svg/profile2.svg';
import IconChecked, { ReactComponent as IconCheckedW } from './svg/iconChecked.svg';
import IconCheckedOk, { ReactComponent as IconCheckedOkW } from './svg/iconCheckedOk.svg';
import pregunta1, { ReactComponent as pregunta1W } from './svg/pregunta1.svg';
import empresa, { ReactComponent as empresaW } from './svg/empresa.svg';
import empresaBuscar, { ReactComponent as empresaBuscarW } from './svg/empresaBuscar.svg';
import bg1, { ReactComponent as bg1W } from './svg/bg1.svg';
import img1, { ReactComponent as img1W } from './svg/img1.svg';
import construEmpresa, { ReactComponent as construEmpresaW } from './svg/construEmpresa.svg';
import imgFranja, { ReactComponent as imgFranjaW } from './svg/imgFranja.svg';


const Assets: SAssets = {
    svg: {
        "Logo": { Native: Logo, Web: LogoW },
        "pregunta1": { Native: pregunta1, Web: pregunta1W },
        "logoCompleto": { Native: logoCompleto, Web: logoCompletoW },
        "profile2": { Native: profile2, Web: profile2W },
        "IconChecked": { Native: IconChecked, Web: IconCheckedW },
        "IconCheckedOk": { Native: IconCheckedOk, Web: IconCheckedOkW },
        "empresa": { Native: empresaBuscar, Web: empresaW },
        "empresaBuscar": { Native: empresaBuscar, Web: empresaBuscarW },
        "bg1": { Native: bg1, Web: bg1W },
        "img1": { Native: img1, Web: img1W },
        "construEmpresa": { Native: construEmpresa, Web: construEmpresaW },
        "imgFranja": { Native: imgFranja, Web: imgFranjaW },
        
    }
}

export default Assets;