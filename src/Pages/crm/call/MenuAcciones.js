import React, { Component } from 'react';
import { SDate, SHr, SIcon, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import PopupRazon from '../Components/PopupRazon';
import PopupRellamada from '../Components/PopupRellamada';
import Model from '../../../Model';


const OptionItem = ({ key, label, color, icono, onPress }) => {
    return <>
        <SView backgroundColor='transparent' center style={{ alignItems: "center", padding: 4, }}>
            <SView center style={{
                paddingLeft: 16,
                paddingRight: 16,
                padding: 8,
                opacity: 1,
                borderWidth: 1,
                borderColor: STheme.color.card,
                backgroundColor: color,
                borderRadius: 8,
            }} onPress={onPress} row>
                <SIcon name={icono} width={12} height={12} fill={STheme.color.text} />
                <SView width={8} />
                <SText fontSize={12}>{label}</SText>
            </SView>
        </SView>
    </>
};


export default class MenuAcciones extends Component<{ key_cliente_proyecto: string, onChange?: any }> {
    pk = SNavigation.getParam("key");
    state = {
        data: null,
    }

    handleChange = (type, e) => {
        if (this.props.onChange) {
            this.props.onChange(type, e);
            return;
        }
    }

    render() {
        const space = 16;
        return <SView row center>
            <OptionItem icono={"confirmar"}
                label={"Confirmado"} color={STheme.color.success} onPress={() => {
                    if (window.confirm("¿Estás seguro de que quieres Confirmado, continuar?")) {
                        console.log("Confirmado");
                        MDL.crm.clienteProyecto.editar({
                            key: this.pk,
                            state: "confirmado",
                            key_usuario_atiende: Model.usuario.Action.getKey(),
                            key_tipo_movimiento_lead: "confirmado"
                        }).then(e => {
                            this.handleChange("confirmado", e);
                        })
                    } else {
                        console.log("Cancelado");
                    }
                }} />



            <OptionItem icono={"confirmar"}
                label={"Entrega Express"} color={STheme.color.success} onPress={() => {


                    SPopup.confirm({
                        title: "Confirmar Entrega Express",
                        message: "¿Estás seguro de que deseas proceder con *Entrega Express*?",
                        onPress: () => {
                            console.log("✅ Entrega Express confirmada");
                            MDL.crm.clienteProyecto.editar({
                                key: this.pk,
                                state: "confirmado",
                                key_tipo_movimiento_lead: "entrega_express",
                                key_usuario_atiende: Model.usuario.Action.getKey(),
                            }).then((res) => {
                                this.handleChange("confirmado", res);
                                SNotification.send({
                                    key: "entrega_express_ok",
                                    title: "Entrega Express",
                                    body: "El proceso fue confirmado correctamente.",
                                    type: "success",
                                    time: 1500
                                });
                            }).catch(err => {
                                console.error("❌ Error al confirmar Entrega Express:", err);
                                SNotification.send({
                                    key: "entrega_express_error",
                                    title: "Error al confirmar",
                                    body: "Hubo un problema al confirmar. Intenta nuevamente.",
                                    type: "error",
                                    color: STheme.color.error,
                                    time: 3000
                                });
                            });
                        },
                        onCancel: () => {
                            console.log("❌ Entrega Express cancelada por el usuario");
                        }
                    });



                }} />



            <OptionItem icono={"cancelado"}
                label={"Cancelado"}
                color={STheme.color.gray}
                onPress={() => {
                    PopupRazon.open(
                        ({
                            tipo: "cancelado",
                            onRegister: (e) => {
                                MDL.crm.clienteProyecto.editar({
                                    key: this.props.key_cliente_proyecto,
                                    state: "cancelado",
                                    key_tipo_movimiento_lead: e.selectedOption.key,
                                    key_usuario_atiende: Model.usuario.Action.getKey(),
                                }).then(e => {
                                    this.handleChange("cancelado", e);
                                })
                            }
                        }))
                }} />



            <OptionItem icono={"double"}
                label={"Doble"} color={STheme.color.gray} onPress={() => {
                    PopupRazon.open(
                        ({
                            tipo: "double",
                            onRegister: (e) => {
                                MDL.crm.clienteProyecto.editar({
                                    key: this.props.key_cliente_proyecto,
                                    state: "double",
                                    key_tipo_movimiento_lead: e.selectedOption.key,
                                    key_usuario_atiende: Model.usuario.Action.getKey(),
                                }).then(e => {
                                    this.handleChange("double", e);
                                })
                            }
                        }))
                }} />



            <OptionItem icono={"spam"}
                label={"Spam"} color={STheme.color.gray}
                onPress={() => {
                    PopupRazon.open(
                        ({
                            tipo: "spam",
                            onRegister: (e) => {
                                MDL.crm.clienteProyecto.editar({
                                    key: this.props.key_cliente_proyecto,
                                    state: "spam",
                                    key_tipo_movimiento_lead: e.selectedOption.key,
                                    key_usuario_atiende: Model.usuario.Action.getKey(),
                                }).then(e => {
                                    this.handleChange("spam", e);
                                })
                            }
                        }))
                }} />



            <OptionItem icono={"recall"}
                label={"Llamar luego"} color={STheme.color.warning}
                onPress={() => {
                    PopupRellamada.open(({
                        onRegister: (e) => {
                            MDL.crm.clienteProyecto.editar({
                                key: this.props.key_cliente_proyecto,
                                state: "rellamada",
                                key_tipo_movimiento_lead: "",
                                fecha_rellamada: e.fecha_rellamada,
                                key_usuario_atiende: Model.usuario.Action.getKey(),
                            }).then(e => {
                                this.handleChange("rellamada", e);
                            })

                        }
                    }))

                }} />



            <OptionItem icono={"llamadafallida"} label={"Llamada fallida"} color={STheme.color.gray} onPress={() => {
                PopupRazon.open(
                    ({
                        tipo: "llamada_fallida",
                        onRegister: (e) => {
                            MDL.crm.clienteProyecto.editar({
                                key: this.props.key_cliente_proyecto,
                                state: "llamada_fallida",
                                key_tipo_movimiento_lead: e.selectedOption.key,
                                key_usuario_atiende: Model.usuario.Action.getKey(),
                            }).then(e => {
                                this.handleChange("llamada_fallida", e);
                            })
                        }
                    }))
            }} />

        </SView>
    }

}
