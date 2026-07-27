import React, { Component } from 'react';
import { SHr, SIcon, SText, STheme, SView, SPopup, SButtom, SInput, SNotification, SNavigation, SStorage } from 'servisofts-component';
import MDL from '../../../MDL';
import { Linking } from 'react-native';
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
    EditarDetallePopup = ({ factura_key, factura_data, detalleActual, onClose, onConfirm }) => {
        const [detalleText, setDetalleText] = React.useState(JSON.stringify(detalleActual, null, 2));
        const handleConfirm = async () => {
            let nuevoDetalle;
            try {
                nuevoDetalle = JSON.parse(detalleText); // parseamos el JSON editado
            } catch (e) {
                SNotification.send({
                    key: "editarDetalle_" + factura_key,
                    title: "Error en el formato",
                    body: "El detalle debe ser un JSON válido.",
                    color: STheme.color.error,
                    time: 5000,
                });
                return;
            }
            MDL.factura.editarDetalle(factura_key, factura_data, nuevoDetalle).then(e => {
                if (this.props.onReload) this.props.onReload();
                SPopup.close("popup_editar_detalle")

            }).catch(e => { console.error(e); });
        };
        return (
            <SView col={"xs-11 sm-10 md-8 lg-6 xl-4"} height={400} withoutFeedback backgroundColor={STheme.color.background} borderRadius={8} style={{ overflow: "hidden", padding: 16 }}>
                <SText bold fontSize={18} center>Editar Detalle de la Factura</SText>
                <SView height={16} />
                <SInput
                    type="textArea"
                    value={detalleText}
                    onChangeText={setDetalleText}
                    height={250}
                    style={{
                        fontSize: 12,
                        padding: 8,
                        backgroundColor: STheme.color.lightGray + "30",
                    }}
                /><SView row >
                    <SButtom style={{ height: 35 }} type={"danger"} onPress={() => {
                        SPopup.close("popup_editar_detalle")
                    }}>Cancelar</SButtom>
                    <SView width={5} />
                    <SButtom style={{ height: 35 }} type={"success"} onPress={() => {
                        SPopup.close("popup_detalle_factura");
                        handleConfirm();
                    }}>Aceptar</SButtom>
                </SView>{ }
            </SView>
        );
    };
    renderBox() {
        const verificadorAdmin = MDL.usuario.session?.key === '1e4b2e09-94f1-4f9e-9d58-80d4d2f9ab3b';
        const factura = this.props.data;
        const groups = [
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
                    {
                        label: "Editar Data",
                        icon: <SIconApp name='crmeditar' fill='#2b6b17ff' stroke='#2b6b17ff' width={16} />,
                        onPress: () => {
                            SPopup.open({
                                key: "popup_editar_detalle",
                                content: <this.EditarDetallePopup
                                    factura_key={factura.key}
                                    factura_data={factura.data}
                                    detalleActual={factura.data.detalle}
                                    onClose={() => SPopup.close("popup_editar_detalle")}
                                    onConfirm={(nuevoDetalle) => {
                                        SNotification.send({
                                            key: "editarDetalle_" + factura.key,
                                            title: "Detalle actualizado",
                                            body: "El detalle se actualizó correctamente.",
                                            color: STheme.color.success,
                                            time: 5000,
                                        });
                                        SPopup.close("popup_editar_detalle")
                                    }}
                                />
                            });
                        }
                    },
                    {
                        label: "Duplicar Factura",
                        icon: <SIconApp name='Add' fill='#2b6b17ff' stroke='#2b6b17ff' width={16} />,
                        onPress: () => {
                            // Respaldo en localStorage: SNavigation no persiste params tipo objeto
                            // en la URL, por lo que se pierden si el usuario recarga la página.
                            console.clear();
                            console.log(JSON.stringify(factura.data));
                            SStorage.setItem("factura_duplicar_pendiente", JSON.stringify(factura.data));
                            SNavigation.navigate("/facturacion/duplicar", { factura_duplicar: factura.data });
                        }
                    },
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
                    factura.data.leyenda === "" && {
                        label: "Generar Leyenda",
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