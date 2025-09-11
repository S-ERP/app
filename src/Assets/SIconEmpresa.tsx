import React from "react"
import MDL from "../MDL"
import SIconApp, { AllIconNames, SIconAppType } from "./SIconApp"

type iconstTypes = "editar" | "eliminar" | "ver"


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
        "eliminarI",
    ],
    ver: [
        "Eyes"
    ]

}




const iconConfigEmpresa: iconsConfigEmpresaTypes = {
    editar: {
        name: "Pencil",

    },
    eliminar: {
        name: "Delete"
    },
    ver: {
        name: "Eyes"
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