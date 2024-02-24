import { SAssets } from 'servisofts-component';

import Logo, { ReactComponent as LogoW } from './svg/logo.svg';
import logoCompleto, { ReactComponent as logoCompletoW } from './svg/logoCompleto.svg';
import profile2, { ReactComponent as profile2W } from './svg/profile2.svg';
import IconChecked, { ReactComponent as IconCheckedW } from './svg/iconChecked.svg';
import IconCheckedOk, { ReactComponent as IconCheckedOkW } from './svg/iconCheckedOk.svg';
import InputPassword, { ReactComponent as InputPasswordW } from './svg/InputPassword.svg';


const Assets: SAssets = {
    svg: {
        "Logo": { Native: Logo, Web: LogoW },
        "logoCompleto": { Native: logoCompleto, Web: logoCompletoW },
        "profile2": { Native: profile2, Web: profile2W },
        "IconChecked": { Native: IconChecked, Web: IconCheckedW },
        "IconCheckedOk": { Native: IconCheckedOk, Web: IconCheckedOkW },
        "InputPassword": { Native: InputPassword, Web: InputPasswordW },
    }
}

export default Assets;