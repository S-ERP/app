// // key = "tabla"
// // center
// // ref = { ref => this.table = ref }
// // language = "es"
// // selectType = "single"
// // {...Config.table.applyTheme() }

// // colors={{ background: STheme.color.background, header: STheme.color.card }}
// // cellStyle={{ borderWidth: 0 }}
// // textStyle={{ fontSize: 12, color: "white", textAlign: "center" }}

// {/* customComponent={e => <SText flex numberOfLines={e.colData.wrap ? 0 : 1} color={STheme.color.lightGray}>{e.row?.total_perdida}</SText>} */ }

// // Usar expresión regular
// // Si quieres buscar más específicamente dentro de la etiqueta sin importar qué atributos tenga antes o después:
// // Activa la opción de Expresiones Regulares (el icono con .* en la caja de búsqueda).
// // Escribe:

// // <SInput[^>]*style=

//   data.key_usuario = Model.usuario.Action.getKey();
//                     data.key_empresa = this.props.key_empresa;
// // MDL.compra_venta.setSucursalSeleccionada(sucu)
// //     .then(() => {
// //         MDL.compra_venta.sucursalSeleccionada = sucu;
// //         this.setState({ sucursal: sucu });
// //     })
// //     .catch(() => {
// //         console.log("Error al guardar sucursal");
// //     });


// console\.log\(.+\); 
// console\.log\(.+\)


// com
// /\*[\s\S]*?\*/




// style=\{\{([\s\S]*?)\}\}
// style={{ $1 }}
// src\Pages\puntoventa

// ..........

// import React, { Component } from 'react';
// import { View, Text } from 'react-native';
// import { SForm, SHr, SPopup, SText, STheme, SView } from 'servisofts-component';
// import PButtom from '../../../../Components/PButtom';
// import SSocket from 'servisofts-socket';
// import MDL from '../../../../MDL';
// import Model from '../../../../Model';
// import Btn from './Btn';

// type Props = {
//     key_empresa: string,
//     editObject?: any,
//     onCancel?: Function,
//     onSuccess?: Function,
// }

// export default class PopupCrearMoneda extends Component<Props> {

//     static open(props: Props) {
//         SPopup.open({
//             key: "PopupCrearMoneda",
//             content: <SView style={{
//                 maxWidth: "100%",
//                 maxHeight: "100%",
//                 width: 500,
//                 // height: 500,
//                 borderRadius: 8,
//                 borderColor: STheme.color.card,
//                 borderWidth: 1,
//                 backgroundColor: STheme.color.background
//             }} withoutFeedback >
//                 <PopupCrearMoneda {...props} onCancel={() => {
//                     SPopup.close("PopupCrearMoneda")
//                     if (props.onCancel) props.onCancel()
//                 }}
//                     onSuccess={(e: any) => {
//                         SPopup.close("PopupCrearMoneda")
//                         if (props.onSuccess) props.onSuccess(e)
//                     }}

//                 />
//             </SView>
//         })
//     }
//     form: SForm | undefined = undefined;
//     render() {
//         return <SView col={"xs-12"} center padding={16}>
//             <SText fontSize={16}>{this.props.editObject ? "Editar" : "Crear"}{" Crear Moneda"}</SText>
//             <SForm ref={(ref: any) => this.form = ref} row
//                 style={{
//                     justifyContent: "space-between",
//                 }}
//                 inputs={{
//                     "descripcion": {
//                         label: "Nombre de la moneda", placeholder: "Ingresa el nombre de la moneda", isRequired: true, autoFocus: true,
//                         defaultValue: this.props.editObject?.descripcion,
//                         onSubmitEditing: () => {
//                             if (this.form) this.form.focus("observacion");
//                         }
//                     },
//                     "observacion": {
//                         col: "xs-4",
//                         label: "Simbolo", placeholder: "( 'Bs.' , '$' , '$US' )", isRequired: true,
//                         defaultValue: this.props.editObject?.observacion,
//                         onSubmitEditing: () => {
//                             if (this.form) this.form.focus("tipo_cambio");
//                         }
//                     },
//                     "tipo_cambio": {
//                         col: "xs-7.5",
//                         icon: <SView />,
//                         defaultValue: (!this.props.editObject?.tipo_cambio ? "" : parseFloat(this.props.editObject?.tipo_cambio ?? 0).toFixed(2)),

//                         label: "Tipo de cambio", placeholder: "Ingresa el tipo de cambio", type: "money", isRequired: true,
//                         onSubmitEditing: () => {
//                             if (this.form) this.form.submit();
//                         }
//                     },
//                 }}
//                 onSubmit={(data: any) => {

//                     if (this.props.editObject?.key) {


//                         const serverData = {
//                             ...data,
//                             key: this.props.editObject.key
//                         }
//                         SSocket.sendPromise({
//                             service: "empresa",
//                             component: "empresa_moneda", // 🔥 corregido
//                             type: "editar",
//                             data: serverData,
//                             key_usuario: MDL.usuario.session?.key,
//                         }).then((resp) => {
//                             this.props.onSuccess?.(resp);

//                         }).catch(err => {
//                             console.error("response", err);
//                         })
//                     } else {
//                          SSocket.sendPromise({
//                             service: "empresa",
//                             component: "empresa_moneda",
//                             type: "registro",
//                             key_usuario: Model.usuario.Action.getKey(),
//                             data: {
//                                 key_empresa: this.props.key_empresa,
//                                 key_usuario: Model.usuario.Action.getKey(),
//                                 ...data,
//                             }
//                         }).then(e => {
//                             this.props.onSuccess?.(e);
//                         }).catch(e => {
//                             console.error("response", e);
//                             this.props.onSuccess?.(e);
//                         })
//                     }

//                 }}


//             />
//             <SHr h={16} />
//             <SView row col={"xs-12"}>
//                 {this.props.onCancel && <>
//                     <Btn type='danger' label='CANCELAR' onPress={() => {
//                         if (this.props.onCancel) this.props.onCancel()
//                     }} />
//                     <SView width={8} />
//                 </>}

//                 <Btn type='primary' label='GUARDAR' onPress={() => {
//                     if (this.form) this.form.submit();
//                 }} />

//             </SView>
//         </SView>
//     }
// }
,,,,,,,,,,,,,,,,,,,,,


[
    {
        "key": "ctrl+d",
        "command": "copyRelativeFilePath",
        "when": "filesExplorerFocus"
    },
    {
        "key": "ctrl+1",
        "command": "editor.action.commentLine",
        "when": "editorTextFocus && !editorReadonly"
    },
    {
        "key": "f1",
        "command": "workbench.action.openSettingsJson"
    },
    // {
    //     "key": "f3",
    //     "command": "editor.foldLevel2",
    //     "when": "editorTextFocus"
    // },
    // {
    //     "key": "f4",
    //     "command": "editor.unfoldAll",
    //     "when": "editorTextFocus"
    // },
    {
        "key": "f4",
        "command": "editor.action.joinLines",
        "when": "editorTextFocus"
    },
    {
        "key": "f3",
        "command": "multiCommand.toggleFoldAlvaro",
        "when": "editorTextFocus"
    },
    {
        "key": "f8",
        "command": "editor.foldAll",
        "when": "editorTextFocus"
    },
    {
        "key": "shift+f8",
        "command": "editor.unfoldAll",
        "when": "editorTextFocus"
    },
    // {
    //     "key": "f2",
    //     "command": "multiCommand.toggleFoldLevel2",
    //     "when": "editorTextFocus"
    // },
    //     {
    //     "key": "f2",
    //     "command": "multiCommand.colapsarTodoAlvaro",
    //     "when": "editorTextFocus"
    // }
    {
        "key": "f2",
        "command": "editor.toggleFold",
        "when": "editorTextFocus"
    },
    //    {
    //         "key": "f2",
    //         "command": "editor.foldAll",
    //         "when": "editorTextFocus"
    //     },
    // {
    //     "key": "f2",
    //     "command": "workbench.action.findInFiles",
    //     "when": "editorTextFocus"
    // },
    // {
    //     "key": "f5",
    //     "command": "workbench.action.replaceInFiles",
    //     "when": "!inDebugMode"
    // },
    // {
    //     "key": "f5",
    //     "command": "workbench.action.debug.continue",
    //     "when": "inDebugMode"
    // },
    {
        "key": "f5",
        "command": "runCommands",
        "args": {
            "commands": [
                {
                    "command": "workbench.action.debug.continue",
                    "when": "inDebugMode"
                },
                {
                    "command": "workbench.action.replaceInFiles",
                    "when": "!inDebugMode"
                }
            ]
        }
    },
    // {
    //     "key": "f2",
    //     "command": "workbench.action.openGlobalKeybindingsFile"
    // },
    // {
    //     "key": "f3",
    //     "command": "workbench.action.openSnippets"
    // },
    // {
    //     "key": "f4",
    //     "command": "workbench.action.splitEditor"
    // },
    // {
    //     "key": "f5",
    //     "command": "editor.action.revealDefinition"
    // },
    // {
    //     // recargar toda el vs
    //     "key": "f6",
    //     "command": "workbench.action.reloadWindow"
    // },
    {
        // abrir y cerrar terminar
        "key": "f7",
        "command": "workbench.action.terminal.toggleTerminal"
    },
    // {
    //     "key": "f8",
    //     "command": "workbench.action.findInFiles"
    // },
    {
        // abrir cualquie json que no puedo acceder facilemnte
        "key": "f9",
        "command": "workbench.action.gotoLine"
    },
    {
        "key": "f5",
        "command": "mysql.runSQLWithoutParse",
        "when": "editorLangId =~ /sql|dbclient-js|cql|postgres/ || resourceFilename =~ /.sql$/"
    },
    // {
    //     "key": "f2",
    //     "version": "2.0.0",
    //     "tasks": [
    //         {
    //             "label": "npm run web",
    //             "type": "shell",
    //             "command": "npm run web",
    //             "group": {
    //                 "kind": "build",
    //                 "isDefault": true
    //             },
    //             "presentation": {
    //                 "reveal": "always",
    //                 "panel": "shared"
    //             }
    //         }
    //     ]
    // }
][
    {
        "key": "ctrl+d",
        "command": "copyRelativeFilePath",
        "when": "filesExplorerFocus"
    },
    {
        "key": "ctrl+1",
        "command": "editor.action.commentLine",
        "when": "editorTextFocus && !editorReadonly"
    },
    {
        "key": "f1",
        "command": "workbench.action.openSettingsJson"
    },
    // {
    //     "key": "f3",
    //     "command": "editor.foldLevel2",
    //     "when": "editorTextFocus"
    // },
    // {
    //     "key": "f4",
    //     "command": "editor.unfoldAll",
    //     "when": "editorTextFocus"
    // },
    {
        "key": "f4",
        "command": "editor.action.joinLines",
        "when": "editorTextFocus"
    },
    {
        "key": "f3",
        "command": "multiCommand.toggleFoldAlvaro",
        "when": "editorTextFocus"
    },
    {
        "key": "f8",
        "command": "editor.foldAll",
        "when": "editorTextFocus"
    },
    {
        "key": "shift+f8",
        "command": "editor.unfoldAll",
        "when": "editorTextFocus"
    },
    // {
    //     "key": "f2",
    //     "command": "multiCommand.toggleFoldLevel2",
    //     "when": "editorTextFocus"
    // },
    //     {
    //     "key": "f2",
    //     "command": "multiCommand.colapsarTodoAlvaro",
    //     "when": "editorTextFocus"
    // }
    {
        "key": "f2",
        "command": "editor.toggleFold",
        "when": "editorTextFocus"
    },
    //    {
    //         "key": "f2",
    //         "command": "editor.foldAll",
    //         "when": "editorTextFocus"
    //     },
    // {
    //     "key": "f2",
    //     "command": "workbench.action.findInFiles",
    //     "when": "editorTextFocus"
    // },
    // {
    //     "key": "f5",
    //     "command": "workbench.action.replaceInFiles",
    //     "when": "!inDebugMode"
    // },
    // {
    //     "key": "f5",
    //     "command": "workbench.action.debug.continue",
    //     "when": "inDebugMode"
    // },
    {
        "key": "f5",
        "command": "runCommands",
        "args": {
            "commands": [
                {
                    "command": "workbench.action.debug.continue",
                    "when": "inDebugMode"
                },
                {
                    "command": "workbench.action.replaceInFiles",
                    "when": "!inDebugMode"
                }
            ]
        }
    },
    // {
    //     "key": "f2",
    //     "command": "workbench.action.openGlobalKeybindingsFile"
    // },
    // {
    //     "key": "f3",
    //     "command": "workbench.action.openSnippets"
    // },
    // {
    //     "key": "f4",
    //     "command": "workbench.action.splitEditor"
    // },
    // {
    //     "key": "f5",
    //     "command": "editor.action.revealDefinition"
    // },
    // {
    //     // recargar toda el vs
    //     "key": "f6",
    //     "command": "workbench.action.reloadWindow"
    // },
    {
        // abrir y cerrar terminar
        "key": "f7",
        "command": "workbench.action.terminal.toggleTerminal"
    },
    // {
    //     "key": "f8",
    //     "command": "workbench.action.findInFiles"
    // },
    {
        // abrir cualquie json que no puedo acceder facilemnte
        "key": "f9",
        "command": "workbench.action.gotoLine"
    },
    {
        "key": "f5",
        "command": "mysql.runSQLWithoutParse",
        "when": "editorLangId =~ /sql|dbclient-js|cql|postgres/ || resourceFilename =~ /.sql$/"
    },
    // {
    //     "key": "f2",
    //     "version": "2.0.0",
    //     "tasks": [
    //         {
    //             "label": "npm run web",
    //             "type": "shell",
    //             "command": "npm run web",
    //             "group": {
    //                 "kind": "build",
    //                 "isDefault": true
    //             },
    //             "presentation": {
    //                 "reveal": "always",
    //                 "panel": "shared"
    //             }
    //         }
    //     ]
    // }
]