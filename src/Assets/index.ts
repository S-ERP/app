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
import configurar, { ReactComponent as configurarW } from './svg/configurar.svg';
import bgBoton, { ReactComponent as bgBotonW } from './svg/bgBoton.svg';
import cola, { ReactComponent as colaW } from './svg/cola.svg';
import picture, { ReactComponent as pictureW } from './svg/picture.svg';
import hand, { ReactComponent as handW } from './svg/hand.svg';
import chip, { ReactComponent as chipW } from './svg/chip.svg';
import pinchito, { ReactComponent as pinchitoW } from './svg/pinchito.svg';
import notaEsquina, { ReactComponent as notaEsquinaW } from './svg/notaEsquina.svg';
import addUser, { ReactComponent as addUserW } from './svg/addUser.svg';
import history, { ReactComponent as historyW } from './svg/history.svg';
import removeNotes, { ReactComponent as removeNotesW } from './svg/removeNotes.svg';
import remove, { ReactComponent as removeW } from './svg/remove.svg';
import pass, { ReactComponent as passW } from './svg/pass.svg';


import Heart, { ReactComponent as HeartW } from './svg/social/Heart.svg';
import Comment, { ReactComponent as CommentW } from './svg/social/Comment.svg';
import Comment2, { ReactComponent as Comment2W } from './svg/social/Comment2.svg';
import addPublicacion, { ReactComponent as addPublicacionW } from './svg/social/addPublicacion.svg';

import tareaUser, { ReactComponent as tareaUserW } from './svg/tarea/user.svg';
import tarea_engranaje, { ReactComponent as tarea_engranajeW } from './svg/tarea/engranaje.svg';
import tarea_close, { ReactComponent as tarea_closeW } from './svg/tarea/close.svg';
import tarea_label, { ReactComponent as tarea_labelW } from './svg/tarea/label.svg';
import addNotas, { ReactComponent as addNotasW } from './svg/tarea/addNotas.svg';
import addTarea, { ReactComponent as addTareaW } from './svg/tarea/addTarea.svg';
import eliminar, { ReactComponent as eliminarW } from './svg/tarea/eliminar.svg';
import eliminar2, { ReactComponent as eliminar2W } from './svg/tarea/eliminar2.svg';
import emp1, { ReactComponent as emp1W } from './svg/empresa/emp1.svg';
import emp2, { ReactComponent as emp2W } from './svg/empresa/emp2.svg';
import emp3, { ReactComponent as emp3W } from './svg/empresa/emp3.svg';
import emp4, { ReactComponent as emp4W } from './svg/empresa/emp4.svg';
import out, { ReactComponent as outW } from './svg/empresa/out.svg';
import share, { ReactComponent as shareW } from './svg/empresa/share.svg';
import invite, { ReactComponent as inviteW } from './svg/empresa/invite.svg';

import tpAf, { ReactComponent as tpAfW } from './svg/producto/tpAf.svg';
import tpGa, { ReactComponent as tpGaW } from './svg/producto/tpGa.svg';
import tpIn, { ReactComponent as tpInW } from './svg/producto/tpIn.svg';
import tpVs, { ReactComponent as tpVsW } from './svg/producto/tpVs.svg';
import productos, { ReactComponent as productosW } from './svg/producto/productos.svg';
import add1, { ReactComponent as add1W } from './svg/producto/add1.svg';
import deleteAll, { ReactComponent as deleteAllW } from './svg/producto/deleteAll.svg';





const Assets: SAssets = {
    svg: {
        "Logo": { Native: Logo, Web: LogoW },
        "pregunta1": { Native: pregunta1, Web: pregunta1W },
        "logoCompleto": { Native: logoCompleto, Web: logoCompletoW },
        "profile2": { Native: profile2, Web: profile2W },
        "IconChecked": { Native: IconChecked, Web: IconCheckedW },
        "IconCheckedOk": { Native: IconCheckedOk, Web: IconCheckedOkW },
        "empresa": { Native: empresa, Web: empresaW },
        "empresaBuscar": { Native: empresaBuscar, Web: empresaBuscarW },
        "bg1": { Native: bg1, Web: bg1W },
        "img1": { Native: img1, Web: img1W },
        "construEmpresa": { Native: construEmpresa, Web: construEmpresaW },
        "imgFranja": { Native: imgFranja, Web: imgFranjaW },
        "configurar": { Native: configurar, Web: configurarW },
        "bgBoton": { Native: bgBoton, Web: bgBotonW },
        "cola": { Native: cola, Web: colaW },
        "picture": { Native: picture, Web: pictureW },
        "hand": { Native: hand, Web: handW },
        "chip": { Native: chip, Web: chipW },
        "pinchito": { Native: pinchito, Web: pinchitoW },
        "notaEsquina": { Native: notaEsquina, Web: notaEsquinaW },
        "addUser": { Native: addUser, Web: addUserW },
        "history": { Native: history, Web: historyW },
        "removeNotes": { Native: removeNotes, Web: removeNotesW },
        "remove": { Native: remove, Web: removeW },
        "pass": { Native: pass, Web: passW },


        "Heart": { Native: Heart, Web: HeartW },
        "Comment": { Native: Comment, Web: CommentW },
        "Comment2": { Native: Comment2, Web: Comment2W },
        "addPublicacion": { Native: addPublicacion, Web: addPublicacionW },
        "tareaUser": { Native: tareaUser, Web: tareaUserW },
        "tareaengranaje": { Native: tarea_engranaje, Web: tarea_engranajeW },
        "tareaclose": { Native: tarea_close, Web: tarea_closeW },
        "tarealabel": { Native: tarea_label, Web: tarea_labelW },
        "addNotas": { Native: addNotas, Web: addNotasW },
        "addTarea": { Native: addTarea, Web: addTareaW },
        "eliminar": { Native: eliminar, Web: eliminarW },
        "eliminar2": { Native: eliminar2, Web: eliminar2W },
        "emp1": { Native: emp1, Web: emp1W },
        "emp2": { Native: emp2, Web: emp2W },
        "emp3": { Native: emp3, Web: emp3W },
        "emp4": { Native: emp4, Web: emp4W },
        "out": { Native: out, Web: outW },
        "share": { Native: share, Web: shareW },
        "invite": { Native: invite, Web: inviteW },

        "tpAf": { Native: tpAf, Web: tpAfW },
        "tpGa": { Native: tpGa, Web: tpGaW },
        "tpIn": { Native: tpIn, Web: tpInW },
        "tpVs": { Native: tpVs, Web: tpVsW },
        "productos": { Native: productos, Web: productosW },
        "add1": { Native: add1, Web: add1W },
        "deleteAll": { Native: deleteAll, Web: deleteAllW },

    }
}

export default Assets;