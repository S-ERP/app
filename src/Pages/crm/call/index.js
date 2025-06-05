import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SIcon, SNavigation, SPage, SText, STheme, SThread, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import SMD from '../../../SMD';
import OrdenesConMismoNumero from '../Components/OrdenesConMismoNumero';
import HorarioDeCliente from '../Components/HorarioDeCliente';
import PopupRazon from '../Components/PopupRazon';
import Model from '../../../Model';
import MenuAcciones from './MenuAcciones';
import ContadorTiempoRestante from './ContadorTiempoRestante';
import Llamada from '../Components/Llamada';
import HistoricoMovimientos from './HistoricoMovimientos';
import Comentario from '../Components/Comentario';

const CardContent = ({ children }) => {
    return <SView col={"xs-12 sm-6 md-6 lg-4"} padding={8} center>
        <SView col={"xs-12"} padding={8}>
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
            this.setState({ data: e })
        })

    }


    render() {
        const { proyecto, state, fecha_on, fecha_edit } = this.state.data || {};
        return <SPage title={"Call"} header={<SView col={"xs-12"} center>
            <SHr />
            <MenuAcciones key_cliente_proyecto={this.pk} />
            <SHr />

        </SView>}

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
                    <Llamada phone={this.state?.data?.cliente?.telefono}/>
                </>}
                {/* <SText onPress={() => {
                    console.log("test", this.horarioDeCliente.state.clienteProyecto);
                }}>{"test"}</SText> */}
                <SView row col={"xs-12"} style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                    <CardContent>
                        <HorarioDeCliente
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
                        <HistoricoMovimientos key_cliente_proyecto={this.pk} />
                    </CardContent>
                </SView>
            </SView>
        </SPage >
    }
}
