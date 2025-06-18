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
import SSocket from "servisofts-socket";
import Chatlead from '../Components/Whatsapp/Chatlead';
import { ScrollView } from 'react-native-gesture-handler';
const CardContent = ({ children }) => {
    return <SView col={"xs-12 sm-6 md-6 lg-4"} padding={0} center>
        <SView col={"xs-12"} padding={4}>
            {children}
        </SView>
    </SView>
}

export default class index extends Component {
    pk = SNavigation.getParam("key");
    state = {
        data: null,
    }
    componentDidMount() {
        MDL.crm.clienteProyecto.getFull(this.pk).then((e) => {
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
                <SView col={"xs-12"} center style={{ position: "absolute" }}>
                    <Llamada ref={ref => this.llamada = ref} />
                </SView>
            }   >
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
                            onChangeCliente={(e) => { }}
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
                        {/* <Chatlead data={this.state?.data} /> */}

                        {/* <Comentario data={this.state.data} /> */}
                        {/* <SText clean >{" "}</SText> */}
                        {/* <Chatlead data={this.state?.data} /> */}
                        <HistoricoMovimientos ref={ref => this.historicoMovimientos = ref} key_cliente_proyecto={this.pk} />
                    </CardContent>
                </SView>
            </SView>
        </SPage >
    }
}
