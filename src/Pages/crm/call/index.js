import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SIcon, SLoad, SNavigation, SPage, SText, STheme, SThread, SView } from 'servisofts-component';
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
        if (stageDelivery?.key == "por_llamar") {
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
                <SView col={"xs-12"} center style={{
                    position: "absolute",
                }}>
                    <View style={{
                        top: 35,
                         width: 180,
                    }}>
                        <DraggableView style={{
                            // top: 50,
                            // left: "50%",
                            width: 180,
                            height: 40,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: STheme.color.text,
                            backgroundColor: STheme.color.success
                        }} />
                    </View>
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
                    <Llamada phone={this.state?.data?.cliente?.telefono} />
                </>}
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
                        <HistoricoMovimientos ref={ref => this.historicoMovimientos = ref} key_cliente_proyecto={this.pk} />
                    </CardContent>
                </SView>
            </SView>
        </SPage >
    }
}
