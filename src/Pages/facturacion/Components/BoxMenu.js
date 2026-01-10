import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    SDate, SHr, SIcon, SImage, SPage, SText, STheme,
    SView, SNavigation, SPopup, SLanguage, SList2,
    SButtom, SInput, SNotification
} from 'servisofts-component';
import SSocket from 'servisofts-socket';
import MDL from '../../../MDL';
import { Linking } from 'react-native';
import PButtom from '../../../Components/PButtom';
import SIconApp from '../../../Assets/SIconApp';

export type BoxMenuPropsType = {
    data: any,
    onReload?: () => void,
}

class BoxMenu extends Component<BoxMenuPropsType> {
    constructor(props) {
        super(props);
        this.state = {};
    }

    handlePress() {
        if (!this.props.onPress) return null;
        this.props.onPress(this.props.datas)
    }

    // ✅ Corregido: soporte para íconos tipo string o JSX
    RenderOption = ({ label, icon, onPress }) => {
        return (
            <>
                <SView
                    col={"xs-11"}
                    row
                    center
                    onPress={() => {
                        if (onPress) onPress();
                        SPopup.close("popup_menu_alvaro");
                    }}
                >
                    <SView col={"xs-2"} center height={32}>
                        {typeof icon === "string"
                            ? <SIcon name={icon} height={18} fill={STheme.color.text} />
                            : icon
                        }
                    </SView>
                    <SView width={8} />
                    <SView flex>
                        <SText fontSize={14}>{label}</SText>
                    </SView>
                </SView>
                <SHr height={1} color={STheme.color.card} />
            </>
        );
    }

    renderBox() {
        const verificadorAdmin = MDL.usuario.session?.key === '1e4b2e09-94f1-4f9e-9d58-80d4d2f9ab3b';
        const factura = this.props.data;

        // ✅ Estructura agrupada por secciones
        const groups = [
            // {
            //     title: "CONSULTA",
            //     items: [
            //         { label: "Ver detalles", icon: "ver", onPress: () => console.log("Detalles") },
            //         { label: "Descargar PDF", icon: "pdf", onPress: () => console.log("Descargar PDF") },
            //     ]
            // },
            {
                title: "IMPRESIÓN",
                items: [
                    {
                        label: "Imprimir (Carta)", icon: "imprimir", onPress: () => {
                            MDL.factura.imprimir({ cuf: factura?.data?.cuf, tipo: "carta" });
                        }
                    },
                    {
                        label: "Imprimir (Rollo)", icon: "iconLista", onPress: () => {
                            MDL.factura.imprimir({ cuf: factura?.data?.cuf, tipo: "rollo" });
                        }
                    },
                ].filter(Boolean) // <-- esto limpia los falsos
            },
            {
                title: "VERIFICACIÓN",
                items: [
                    {
                        label: "Ver en SIAT", icon: "World", onPress: () => {
                            Linking.openURL(factura.data.urlImpuestos);
                        }
                    },
                    {
                        label: "Verificar estado", icon: "tareaclose", onPress: () => {
                            // MDL.factura.verificarEstado({ cuf: factura.data.cuf });
                            MDL.factura.verificarEstado({ cuf: factura.data.cuf })
                                .then(e => { })
                                .catch(e => { console.error(e); });

                        }
                    },
                    factura.state === "emitida" && {
                        label: "Reenviar a SIAT", icon: "Reload", onPress: () => {
                            MDL.factura.reenviar({ cuf: factura.data.cuf })
                                .then(() => {
                                    MDL.factura.verificarEstado({ cuf: factura.data.cuf }).then(e => {
                                        if (e.data.codigoDescripcion === "RECHAZADA") {
                                            SNotification.send({
                                                title: "Advertencia",
                                                body:
                                                    "Error al reenviar la factura. " +
                                                    "Si no funciona, reconstruya la factura con una nueva fecha.",
                                                color: STheme.color.warning,
                                                time: 15000,
                                            });
                                        }
                                        if (this.props.onReload) this.props.onReload();
                                    });
                                })
                                .catch(error => {
                                    console.error("Error al reenviar/verificar la factura:", error);
                                    SNotification.send({
                                        title: "Error",
                                        body: "Ocurrió un error al reenviar o verificar la factura. Intente nuevamente.",
                                        color: STheme.color.danger,
                                        time: 8000,
                                    });
                                });
                        }
                    },
                    factura.state === "emitida" && {
                        label: "Reconstruir", icon: "Engranaje", onPress: () => {
                            MDL.factura.reconstruir({ cuf: factura.data.cuf }).then(() => {
                                if (this.props.onReload) this.props.onReload();
                            }).catch(e => { console.error(e); });
                        }
                    },
                ].filter(Boolean) // <-- esto limpia los falsos
            },
            {
                title: "GESTIÓN",
                items: [

                    factura.state === "anulada" && {
                        label: "Revertir factura",
                        icon: <SIconApp name='Reload' fill='#ff9900ff' stroke='#ff9900ff' width={16} />,

                        onPress: () => {
                            MDL.factura.revertir({ cuf: factura.data.cuf });
                        }
                    },
                    factura.state === "enviada" && {
                        label: "Anular factura",
                        icon: <SIconApp name='cancelado' fill='#db0606ff' stroke='#db0606ff' width={16} />,
                        onPress: () => {
                            if (this.props.anular)
                                this.props.anular({ cuf: factura.data.cuf })
                        }
                    },
                    factura.state === "emitida" && {
                        label: "Editar Leyenda",
                        icon: <SIconApp name='crmeditar' fill='#2b6b17ff' stroke='#2b6b17ff' width={16} />,
                        onPress: async () => {
                            try {
                                if (!factura.key) {
                                    SNotification.send({
                                        title: "Error",
                                        message: "No se encontró la clave de la factura.",
                                        color: STheme.color.danger,
                                        time: 5000
                                    });
                                    return;
                                }

                                const response = await MDL.factura.getParametrica({
                                    ambiente: MDL.factura.ambiente,
                                    parametrica: "leyendasFactura"
                                });

                                if (!Array.isArray(response) || response.length === 0) {
                                    SNotification.send({
                                        title: "Error",
                                        message: "No hay leyendas disponibles.",
                                        color: STheme.color.danger,
                                        time: 5000
                                    });
                                    return;
                                }

                                const randomIndex = Math.floor(Math.random() * response.length);
                                const leyenda = response[randomIndex].descripcionLeyenda;
                                // console.log("Leyenda aleatoria:", leyenda);
                                MDL.factura.editarLeyenda(factura.key, factura.data, leyenda).then(e => {
                                    if (this.props.onReload) this.props.onReload();
                                }).catch(e => { console.error(e); });

                                SNotification.send({
                                    title: "Éxito",
                                    message: "Leyenda actualizada correctamente.",
                                    color: STheme.color.success,
                                    time: 5000
                                });

                                SPopup.close("popup_menu_alvaro");
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
                    },
                    factura.state === "emitida" && {
                        label: "Eliminar Factura",
                        icon: <SIconApp name='crmeliminar' fill='#db0606ff' stroke='#db0606ff' width={16} />,
                        onPress: () => {
                            MDL.factura.eliminarFactura(factura.key).then(() => {
                                if (this.props.onReload) this.props.onReload();
                            }).catch(e => { console.error(e); });
                        }
                    }
                ].filter(Boolean) // <-- esto limpia los falsos
            }
        ];

        // ✅ Render de grupos
        return (
            <SView
                col={"xs-12"}
                backgroundColor={STheme.color.background}
                style={{
                    borderRadius: 8,
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: "#66666699",
                }}
            >
                {groups.map((group, gi) => (
                    <SView key={gi} col={"xs-12"}>
                        <SView col={"xs-12"} style={{ paddingHorizontal: 8, paddingTop: 8, paddingBottom: 1 }} >
                            <SText color={STheme.color.text + "99"}>
                                {group.title}
                            </SText>
                        </SView>
                        {group.items.map((opt, i) => (
                            <this.RenderOption key={i} {...opt} />
                        ))}
                        {gi !== groups.length - 1 && <SHr height={1} color={STheme.color.card} />}
                    </SView>
                ))}
            </SView>
        );
    }


    render() {
        return (
            <SView col={"xs-12"} flex center>
                {this.renderBox()}
            </SView>
        );
    }
}

export default BoxMenu;
