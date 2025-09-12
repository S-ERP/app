import React from "react"
import MDL from "../MDL"
import SIconApp, { AllIconNames, SIconAppType } from "./SIconApp"

type iconstTypes = "editar" | "eliminar" | "ver" | "adicionar" | "Ajustes" | "Usuario" | "menu" | "productos" | "permisos" | "Pagos" | "imagenes" | "salir" | "reportes" | "direccion" | "alertas" | "llamadas" | "otros"


type inconParamsTypes = { [key in iconstTypes]: AllIconNames[] }
type iconsConfigEmpresaTypes = { [key in iconstTypes]: SIconAppType }


export const inconParams: inconParamsTypes = {
    editar: [
        "Pencil",
        "Edit",
        "crmeditar"
    ],
    eliminar: [
        "Delete",
        "eliminar",
        "eliminar2",
        "eliminarI",
        "deleteAll",
        "NoDelete",
        "remove",
        "removeNotes",
        "Close",
        "crmeliminar",
        "spam"
    ],
    ver: [
        "Eyes",
        "hand"
    ],
    adicionar: [
        "Add",
        "add1",
        "addNotas",
        "addPublicacion",
        "addUser",
        "addTarea",
        "adicional",
        "adicionar",
        "empresa",
        "iconAdd",
        "ctaAsiento"

    ],
    Ajustes: [
        "Ajustes",
        "configurar",
        "crmmovimiento",
        "ctaAjuste",
        "ctaAjuste2",
        "emp2",
        "Engranaje",
        "Parameter"
    ],
    Usuario: [
        "Muser",
        "tareaUser",
        "addUser",
        "ifoto",
        "invite",
        "profile2",
    ],
    menu: [
        "Menu",
        "Menu2",
        "menuAll",
        "drive-menu",
        "widget",
        "crmdashboardgeneral"
    ],
    productos: [
        "productos",
        "blender/group",
        "barcode",
        "Carrito",
        "carritoproducto",
        "Paquete",
        "producto",
        "tarealabel",
        "tpIn",
        "Favorito",
        "Favorito2",
        "Heart",
        "sucursal"
    ],
    permisos: [
        "permisos",
        "Lock",
        "LockOutline",
        "pass",
        "Profanity"
    ],
    Pagos: [
        "Card",
        "Cheque",
        "Money",
        "pagocheque",
        "pagoefectivo",
        "pagopagare",
        "pagoqr",
        "pagotarjeta",
        "pagotransferencia",
        "tpGa",
        "Caja",
        "Tranfer",
        "iconPesos"

    ],
    imagenes: [
        "Galeria",
        "addPublicacion",
        "Camara",
        "iback",
        "itema"

    ],
    salir: [
        "Salir",
        "confirmar",
        "Off",
        "out"

    ],
    reportes: [
        "tarea",
        "crmdproyecto",
        "crmpdarchivo",
        "drive-file",
        "drive-folder",
        "drive-icon",
        "Excel",
        "iconLista",
        "imprimir"
    ],
    direccion: [
        "Arrow",
        "Back",
        "blender/mesh",
        "crmllamadatasaconversion",
        "crmplay",
        "Egreso",
        "Ingreso",
        "MessageSend",
        "Reload",
        "Reserve",
        "revertir",
        "Traspaso",
        "ubiPermiso",
        "pinchito",
        "mapIcon",
        "Marker",
        "iconRight"
    ],
    alertas: [
        "AlertOutline",
        "campana",
        "cancelado",
        "emp3",
        "Notify",
        "toolinfo",
        "toolquestion",
        "Wifi"
    ],
    llamadas: [
        "crmllamadacompletada",
        "Comment",
        "Comment2",
        "crmmicrofono",
        "guion",
        "llamadafallida",
        "microfono",
        "recall",
        "whatsapp"

    ],
    otros: [
        "bien",
        "Check",
        "crmpause",
        "ctaHome",
        "double",
        "Emoji",
        "empresaBuscar",
        "Evento",
        "IconChecked",
        "IconCheckedOk",
        "iconEdifcio",
        "iThree",
        "Moon",
        "Search",
        "share",
        "Sun",
        "tpVs",
        "World"
    ]

}




const iconConfigEmpresa: iconsConfigEmpresaTypes = {
    editar: {
        name: "Edit",

    },
    eliminar: {
        name: "Delete"
    },
    ver: {
        name: "Eyes"
    },
    adicionar: {
        name: "Add"
    },
    Ajustes: {
        name: "Ajustes"
    },
    Usuario: {
        name: "Muser"
    },
    menu: {
        name: "Menu"
    },
    productos: {
        name: "productos"
    },
    permisos: {
        name: "permisos"
    },
    Pagos: {
        name: "Card"
    },
    imagenes: {
        name: "Galeria"
    },
    salir: {
        name: "Salir"
    },
    reportes: {
        name: "tarea"
    },
    direccion: {
        name: "Arrow"
    },
    alertas: {
        name: "AlertOutline"
    },
    llamadas: {
        name: "crmllamadacompletada"
    },
    otros: {
        name: "Check",
    }

}

export const buildIconEmpresa = (name: keyof typeof inconParams) => {
    const key_empresa = MDL.empresa?.select?.key;
    return iconConfigEmpresa[name]
}

const SIconEmpresa = ({ type }: { type: keyof typeof inconParams }) => {

    return <SIconApp
        {...buildIconEmpresa(type)} />

}
export default SIconEmpresa