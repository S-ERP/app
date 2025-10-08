import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SDate, SHr, SIcon, SImage, SPage, SText, STheme, SView, SNavigation, SPopup, SLanguage, SList2, SButtom, SInput, SNotification } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import MDL from '../../../MDL';
import { Linking } from 'react-native';
import PButtom from '../../../Components/PButtom';

// import { Parametricas } from "../../../MDL/factura/typeParametricas";


export type BoxMenuPropsType = {
    data: any,
    onReload?: () => void,
}
class BoxMenu extends Component<BoxMenuPropsType> {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    // parametricas: Parametricas = {};


    handlePress() {
        if (!this.props.onPress) return null;

        this.props.onPress(this.props.datas)
    }


    RenderOption = ({ label, icon, onPress }) => {

        // renderOption = (label: string) => {
        return (
            <>
                <SView col={"xs-11"} row center
                    onPress={() => {
                        if (onPress) onPress()
                        // SNavigation.navigate(url, params)
                        SPopup.close("popup_menu_alvaro");
                    }}
                >
                    <SView col={"xs-2"} center height={32}>
                        <SIcon name={icon} height={18} fill={STheme.color.text} />
                    </SView>
                    <SView width={8} />
                    <SView flex  >
                        <SText fontSize={14} >{label}</SText>
                    </SView>

                </SView>
                <SHr height={1} color={STheme.color.card} />
            </>
        );
    }

    renderBox() {

        // console.log("this.props.data", this.props.data)
        const verificadorAdmin = MDL.usuario.session?.key === '1e4b2e09-94f1-4f9e-9d58-80d4d2f9ab3b';


        const factura = this.props.data

        const options = [

            // IMPRESION

            {
                label: "Imprimir tamaño carta", icon: "imprimir", onPress: () => {
                    MDL.factura.imprimir({
                        cuf: factura?.data?.cuf
                    })
                }
            },
            {
                label: "Imprimir tipo rollo", icon: "iconLista", onPress: () => {
                    MDL.factura.imprimir({
                        cuf: factura?.data?.cuf,
                        tipo: "rollo"
                    })
                }
            },

            // VERIFICACIÒN
            {
                label: "Ver en SIAT", icon: "World", onPress: () => {
                    Linking.openURL(factura.data.urlImpuestos)
                }
            },
            {
                label: "Verificar estado", icon: "Check", onPress: () => {
                    MDL.factura.verificarEstado({ cuf: factura.data.cuf }).then(e => {
                        // SNotification.send({"title"})
                    }).catch(e = {

                    })
                }
            },

        ];

        // GESTION
        if (factura.state == "enviada") {
            options.push({
                // label: "Anular factura", icon: <SIcon name='cancelado' fill="#c41919ff" />,

                label: "Anular factura", icon: "cancelado",
                onPress: () => {
                    // TODO
                    if (this.props.anular) this.props.anular({ cuf: factura.data.cuf })
                    // MDL.factura.anular({ cuf: factura.data.cuf })
                }
            })
        }


        if (factura.state == "anulada") {
            options.push({
                label: "Revertir", icon: "revertir", onPress: () => {
                    MDL.factura.revertir({ cuf: factura.data.cuf })
                }
            })
        }
        if (factura.state == "emitida") {
            options.push({


                label: "Reenviar a SIAT", icon: "Reload", onPress: () => {
                    // label: "Reenviar a SIAT", icon: "Reload", onPress: () => {
                    MDL.factura.reenviar({ cuf: factura.data.cuf }).then(() => {

                        MDL.factura.verificarEstado({ cuf: factura.data.cuf }).then(e => {
                            console.log("imprmirrrrrr " + JSON.stringify(e.data.codigoDescripcion))

                            if (e.data.codigoDescripcion === "RECHAZADA") {
                                SNotification.send({
                                    title: "Advertencia",
                                    body: `Error al reenviar la factura.` +
                                        `cusando no funciona o sale error a reeviar factura, se debe contruir, nota al contruir en el boton presionar.\n\n\n` +
                                        `Nota: manteniendo los mismos datos pero con una nueva fecha.`,
                                    color: STheme.color.warning,
                                    time: 15000,
                                });
                            }

                            if (this.props.onReload) this.props.onReload()
                        })



                    }).catch(e => {
                        console.error("Error al reenviar/verificar la factura:", error);
                        SNotification.send({
                            title: "Error",
                            body: "Ocurrió un error al reenviar o verificar la factura. Intente nuevamente.",
                            color: STheme.color.danger,
                            time: 8000,
                        });

                    })
                }
            })
            options.push({
                label: "Reconstruir", icon: "Engranaje", onPress: () => {
                    MDL.factura.reconstruir({ cuf: factura.data.cuf }).then(() => {
                        // MDL.factura.verificarEstado({ cuf: factura.data.cuf }).then(e => {
                        //     if (this.props.onReload) this.props.onReload()
                        // })

                    }).catch(e => {

                    })
                }
            })

            // GESTION
            {
                verificadorAdmin ?
                    options.push({
                        label: "Editar Leyenda",
                        icon: "crmeditar",
                        onPress: async () => {
                            try {
                                // Validar factura.key
                                if (!factura.key) {
                                    SNotification.send({
                                        title: "Error",
                                        message: "No se encontró la clave de la factura.",
                                        color: STheme.color.danger,
                                        time: 5000
                                    });
                                    return;
                                }

                                // Obtener las leyendas disponibles
                                const response = await MDL.factura.getParametrica({
                                    ambiente: MDL.factura.ambiente,
                                    parametrica: "leyendasFactura"
                                });

                                // Verificar si hay leyendas disponibles
                                if (!Array.isArray(response) || response.length === 0) {
                                    SNotification.send({
                                        title: "Error",
                                        message: "No hay leyendas disponibles.",
                                        color: STheme.color.danger,
                                        time: 5000
                                    });
                                    return;
                                }

                                // Seleccionar una leyenda aleatoria
                                const randomIndex = Math.floor(Math.random() * response.length);
                                const leyenda = response[randomIndex].descripcionLeyenda;
                                console.log("Leyenda aleatoria:", leyenda);


                                MDL.factura.editarLeyenda(factura.key, factura.data, leyenda).then(() => {
                                    if (this.props.onReload) this.props.onReload()

                                    SNotification.send({
                                        title: "Éxito",
                                        message: "Leyenda actualizada correctamente.",
                                        color: STheme.color.success,
                                        time: 5000
                                    });


                                    // Cerrar el popup
                                    SPopup.close("popup_menu_alvaro");

                                }).catch(e => {
                                    if (this.props.onReload) this.props.onReload()
                                })


                            } catch (error) {
                                console.error("Error al editar leyenda:", error);
                                SNotification.send({
                                    title: "Error",
                                    message: "No se pudo actualizar la leyenda. Intente de nuevo.",
                                    color: STheme.color.danger,
                                    time: 5000
                                });
                            }
                        }
                    })
                    : ""
            }
            {
                verificadorAdmin ?
                    options.push({
                        label: "Eliminar Factura",
                        icon: "crmeliminar",
                        onPress: () => {
                            MDL.factura.eliminarFactura(factura.key).then(() => {
                                if (this.props.onReload) this.props.onReload()
                            }).catch(e => {
                                if (this.props.onReload) this.props.onReload()
                            })
                        }
                    })
                    : ""
            }
        }
        return (
            <SView
                col={"xs-12"}
                center
                row
                withoutFeedback
                backgroundColor={STheme.color.background}
                style={{
                    borderRadius: 8,
                    overflow: "hidden",
                    borderWidth: 1,
                    //  borderBottomWidth: 2,
                    borderColor: "#66666699",
                }}
            >
                <SView col={"xs-12"} row center  >
                    {options.map(this.RenderOption)}
                </SView>
            </SView>
        );
    }

    render() {
        return (<SView col={"xs-12"} flex center >
            {/* <SText>{JSON.stringify(this.props.data)}</SText> */}
            {this.renderBox()}
            {/* <SHr h={8} /> */}
        </SView >
        );
    }
}
export default (BoxMenu);