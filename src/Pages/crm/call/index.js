import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SIcon, SImage, SInput, SLoad, SNavigation, SPage, SText, STheme, SThread, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import SMD from '../../../SMD';
import OrdenesConMismoNumero from '../Components/OrdenesConMismoNumero';
import PopupRazon from '../Components/PopupRazon';
import Model from '../../../Model';
import MenuAcciones from './MenuAcciones';
import ContadorTiempoRestante from './ContadorTiempoRestante';
import Llamada from '../Components/Llamada';
import HistoricoMovimientos from './HistoricoMovimientos';
import Comentario from '../Components/Comentario';
import HorarioCliente from '../Components/DetalleLead/HorarioCliente';
import MenuAccionesDelivery from './MenuAccionesDelivery';
import MenuAccionesDespacho from './MenuAccionesDespacho';
import DraggableView from './DragableView';
import Chatwhatsapp from '../Components/ChatWhatsapp';
import SSocket from "servisofts-socket";

const CardContent = ({ children }) => {
    return <SView col={"xs-12 sm-6 md-6 lg-4"} padding={0} center>
        <SView col={"xs-12"} padding={4}>
            {children}
        </SView>
    </SView>
}


export default class index extends Component {
    pk = SNavigation.getParam("key");
    // state = {
    //     data: null,
    // }

    state = {
        data: null,

        mensaje: "",
        mensajes: [
            { id: 1, texto: "Buenas, vi tu anuncio del monitor. ¿Sigue en venta?", hora: "6:42 p.m.", enviado: true, fecha: "Ayer" },
            { id: 2, texto: "Hola, sí. Es un Samsung de 27 pulgadas, full HD.", hora: "6:44 p.m.", enviado: false, fecha: "Ayer" },
            { id: 3, texto: "¿Funciona todo bien? ¿Tiene detalles?", hora: "6:45 p.m.", enviado: true, fecha: "Ayer" },
            { id: 4, texto: "Está en buen estado, sin rayones. Lo vendo porque actualicé setup.", hora: "6:47 p.m.", enviado: false, fecha: "Ayer" },
            { id: 5, texto: "Perfecto, me interesa.", hora: "9:12 a.m.", enviado: true, fecha: "Hoy" },
            { id: 6, texto: "¿Podemos encontrarnos hoy en la tarde por el centro?", hora: "9:13 a.m.", enviado: true, fecha: "Hoy" },
            { id: 7, texto: "Sí, tipo 5 p.m. por la plaza principal te va?", hora: "9:15 a.m.", enviado: false, fecha: "Hoy" }
        ]


    }
    componentDidMount() {

        MDL.crm.clienteProyecto.getFull(this.pk).then((e) => {
            // if (e.state != "en_proceso") {
            //     SNavigation.goBack();
            //     return;
            // }
            if (this.historicoMovimientos) {
                this.historicoMovimientos.componentDidMount();
            }
            this.setState({ data: e })
        })

    }


    renderPorLlamar() {
        return <SText padding={8} card
            onPress={() => {
                MDL.crm.clienteProyecto.editar({
                    key: this.pk,
                    state: "en_proceso",
                    key_usuario_atiende: Model.usuario.Action.getKey(),
                }).then(() => {
                    this.componentDidMount();
                })
            }}>{"Atender venta"}</SText>
    }
    renderAntenderDelivery() {
        return <SText padding={8} card
            onPress={() => {
                MDL.crm.clienteProyecto.editar({
                    key: this.pk,
                    state: "delivery_en_proceso",
                    key_usuario_atiende: Model.usuario.Action.getKey(),
                }).then(() => {
                    this.componentDidMount();
                })
            }}>{"Atender delivery"}</SText>
    }

    renderMenuByState() {
        const { proyecto, state, fecha_on, fecha_edit } = this.state.data || {};
        const stage = MDL.crm.clienteProyecto.stages.find((stage) => stage.states.includes(state));
        const stageDelivery = MDL.crm.clienteProyecto.stagesDelivery.find((stage) => stage.states.includes(state));

        if (stage?.key == "por_llamar") {
            return this.renderPorLlamar();
        }
        if (state == "en_proceso") {
            return <MenuAcciones key_cliente_proyecto={this.pk} onChange={() => {
                this.componentDidMount();
            }} />
        }
        if (stageDelivery?.key == "por_llamar_delivery") {
            return this.renderAntenderDelivery();
        }
        if (state == "delivery_en_proceso") {
            return <MenuAccionesDelivery key_cliente_proyecto={this.pk} onChange={() => {
                this.componentDidMount();
            }} />
        }
        if (state == "despacho") {
            return <MenuAccionesDespacho key_cliente_proyecto={this.pk} onChange={() => {
                this.componentDidMount();
            }} />
        }

    }


    renderHeader() {
        return (
            <SView col={"xs-12"} row style={{ backgroundColor: STheme.color.card, padding: 15, borderBottomWidth: 1, borderBottomColor: "green" }}>
                <SView col={"xs-8"} row style={{ justifyContent: "flex-start" }}>
                    <SView width={40} height={40} style={{ borderRadius: 100, overflow: "hidden" }}>
                        <SImage enablePreview src={SSocket.api.root + "usuario/1e4b2e09-94f1-4f9e-9d58-80d4d2f9ab3b"} style={{ resizeMode: "cover" }} />
                    </SView>
                    <SText color={"white"} fontSize={18}> </SText>
                    <SText color={"white"} fontSize={18} bold>+591 75395848</SText>
                </SView>
                <SView col={"xs-4"} row center style={{ justifyContent: "flex-end" }}>
                    <SIcon name='drive-menu' fill='white' width={18} height={18} />
                </SView>
            </SView>
        )
    }

    renderFechaSeparador(fecha) {
        return (
            <SView col={"xs-12"} center style={{ margin: 10 }}>
                <SView style={{ backgroundColor: "#182229", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 }}>
                    <SText color={"#8696a0"} fontSize={12}>{fecha}</SText>
                </SView>
            </SView>
        );
    }

    renderMensaje(mensaje) {
        const isEnviado = mensaje.enviado;
        return (
            <SView col={"xs-12"} key={mensaje.id} border={"transparent"} style={{ marginBottom: 2 }}>
                <SView style={{ alignSelf: isEnviado ? "flex-end" : "flex-start", backgroundColor: isEnviado ? "#005c4b" : "#202c33", borderRadius: 8, padding: 12, marginHorizontal: 10, width: "auto", maxWidth: "100%" }}>
                    <SText color={"white"} fontSize={14}>{mensaje.texto}</SText>
                </SView>
                <SView style={{ alignSelf: isEnviado ? "flex-end" : "flex-start", marginHorizontal: 15, width: "auto", maxWidth: "100%", }}>
                    <SText color={"#8696a0"} fontSize={11}>{mensaje.hora} {isEnviado && <SText color={"#53bdeb"}>✓✓</SText>}</SText>
                </SView>
            </SView>
        );
    }

    renderChat() {
        let fechaActual = "";
        return (
            <SView col={"xs-12"} flex style={{ backgroundColor: "#0b141a", paddingBottom: 20 }}>
                {this.state.mensajes.map((mensaje) => {
                    const mostrarFecha = fechaActual !== mensaje.fecha;
                    if (mostrarFecha) fechaActual = mensaje.fecha;
                    return (
                        <SView col={"xs-12"} key={`container-${mensaje.id}`}>
                            {mostrarFecha && this.renderFechaSeparador(mensaje.fecha)}
                            {this.renderMensaje(mensaje)}
                        </SView>
                    );
                })}
            </SView>
        );
    }


    renderBarraEntrada() {
        return (<SView col={"xs-12"} row style={{ backgroundColor: STheme.color.card, padding: 15, bottom: 0, left: 0, right: 0 }}>
            <SView style={{ marginRight: 15 }}><SIcon name='add1' fill='white' width={18} /></SView>
            <SView style={{ marginRight: 15 }}><SIcon name='addTarea' fill='white' width={18} /></SView>
            <SView flex style={{ marginRight: 15 }}>
                <SInput placeholder="Escribe un mensaje" placeholderTextColor="#8696a0" style={{ backgroundColor: "#2a3942", borderRadius: 20, paddingHorizontal: 20, color: "white", borderWidth: 0 }} />
            </SView>
            <SView onPress={() => { alert("mensaje enviado") }}
            ><SIcon name='MessageSend' fill='white' width={18} /></SView>
        </SView>
        )
    }

    render() {
        const { proyecto, state, fecha_on, fecha_edit } = this.state.data || {};
        if (this.state.data == null) return <SPage title={"Call"} >
            <SLoad />
        </SPage >
        return <SPage title={"Call"} header={<SView col={"xs-12"} center>
            <SHr />
            {this.renderMenuByState()}
            <SHr />


        </SView >}
            footer={
                <SView col={"xs-12"} center style={{
                    position: "absolute",
                }}>
                    <Llamada ref={ref => this.llamada = ref} />
                </SView>
            }

        >
            <SView col={"xs-12"} center>
                {!this.state?.data?.fecha_edit || this.state?.data?.state != "en_proceso" ? null : <>
                    <SHr h={16} />
                    <ContadorTiempoRestante key_cliente_proyecto={this.pk} fecha_start={fecha_edit ?? fecha_on}
                        onTimeEnd={() => {
                            new SThread(5000, true, "ContadorTiempoRestante").start(() => {
                                this.componentDidMount();
                            })
                        }} />
                    <SHr h={16} />
                    {/* <Llamada phone={this.state?.data?.cliente?.telefono} /> */}
                </>}
                <SText padding={8} card onPress={() => {
                    this.llamada.llamar(this.state?.data?.cliente?.telefono);
                }}>{"LLAMAR"}</SText>
                <SView row col={"xs-12"} style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                    <CardContent>
                        <HorarioCliente
                            ref={ref => this.horarioDeCliente = ref}
                            key_cliente_proyecto={this.pk}
                            clienteProyecto={this.state?.data}
                            onChangeCliente={(e) => {

                            }}
                        />
                    </CardContent>
                    <CardContent>
                        <SView col={"xs-12"} padding={8}>
                            <SMD padding={0} fontSize={12} space={0}>{proyecto?.guion}</SMD>
                        </SView>
                    </CardContent>
                    <CardContent>
                        <OrdenesConMismoNumero key_cliente_proyecto={this.pk} />
                        <Comentario data={this.state.data} />
                        <SView col={"xs-12"}>
                            <SView col={"xs-12"} style={{ padding: 16, borderRadius: 16, borderWidth: 2 }} border={STheme.color.card} backgroundColor={STheme.color.card}>
                                <SHr />
                                <SText color={"white"} fontSize={14}>Chat</SText>
                                <SHr />
                                {this.renderHeader()}
                                {this.renderChat()}
                                {this.renderBarraEntrada()}
                            </SView>
                        </SView>


                        <HistoricoMovimientos ref={ref => this.historicoMovimientos = ref} key_cliente_proyecto={this.pk} />
                    </CardContent>
                </SView>
            </SView>
        </SPage >
    }
}
