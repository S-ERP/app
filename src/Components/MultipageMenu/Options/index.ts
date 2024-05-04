import AppIcon from "./AppIcon";
import Clock from "./Clock";
import ClockCircle from "./ClockCircle";
import Default from "./Default";
import Notas from "./Notas";
import page from "./page"
import salir from "./salir"

import NotasList from "../../../Pages/loby/Components/Notas";
import UsuariosActivos from "../../../Pages/loby/Components/UsuariosActivos";
import Actividades from "../../../Pages/loby/Components/Actividades";
import PerfilEmpresa from "../../../Pages/loby/Components/PerfilEmpresa";
import MenuOpciones from "../../../Pages/loby/Components/MenuOpciones";
import MyPerfil from "../../../Pages/loby/Components/MyPerfil";
import MyBilletera from "../../../Pages/loby/Components/MyBilletera";
export type WidgetProps = {
    x: number, y: number, w: number, h: number,
}



export default { 
    AppIcon,
    Clock,
    ClockCircle,
    Default,
    Notas,
    page,
    salir,
    NotasList,
    UsuariosActivos,
    Actividades,
    PerfilEmpresa,
    MenuOpciones,
    MyPerfil,
    MyBilletera
}