import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SHr, SIcon, SLoad, SNavigation, SPage, SText, STheme, SThread, SView } from 'servisofts-component';
import Container from '../../../Components/Container';
import Model from '../../../Model';
import PHr from '../../../Components/PHr';

export default class options extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cargar: true
        };
    }

    renderMunuItem({ onPress, label, icon, descripcion }) {
        return <SView col={"xs-5.5"} onPress={onPress} row padding={5}>
            <SView col={"xs-12"} row  card padding={10}>
                <SView width={50} height={50} center backgroundColor={STheme.color.primary} borderRadius={45}>
                    <SIcon name={icon} height={30} width={30} fill={STheme.color.secondary} />
                </SView>
                <SHr width={5} />
                {(label.length > 0) ? <SView width={5} /> : null}
                <PHr />
                <SText bold fontSize={15}>{label}</SText>
                <PHr />
                <SView col={"xs-12"} center>
                    <SText fontSize={12}>{descripcion}</SText>
                </SView>
                <SView />

            </SView>

        </SView>
    }
    content() {

        return <SView col={"xs-12"} center>
            <SView col={"xs-12 sm-10 md-9 lg-7 xl-6 xxl-5"} center row
                style={{
                    flexDirection: 'row',
                    // justifyContent:"space-between",
                    alignItems: 'stretch',
                }}>
                <SHr h={16} />
                <>
                    {this.renderMunuItem({ label: "Activo Fijo", icon: "tpAf", onPress: () => SNavigation.navigate("/menu"), descripcion: "Bienes tangibles o intangibles que su empresa posee y utiliza, como edificios, equipos, vehículos y otros bienes que duran mucho tiempo. " })}
                    {this.renderMunuItem({ label: "Gastos Administartivo", icon: "tpGa", onPress: () => SNavigation.navigate("/menu"), descripcion: "Son los costos asociados con la gestión y el funcionamiento diario de una empresa, como salarios de personal de oficina, alquiler de oficinas, suministros de oficina y otros gastos." })}
                    {this.renderMunuItem({ label: "Inventarios", icon: "tpIn", onPress: () => SNavigation.navigate("/productos/inventario"), descripcion: "Se refiere a todos los bienes tangibles que la empresa tiene en su posesión para la venta. Esto incluye materias primas, productos en proceso y productos terminados." })}
                    {this.renderMunuItem({ label: "Venta de Servicio", icon: "tpVs", onPress: () => SNavigation.navigate("/menu"), descripcion: "Se refiere al proceso de proporcionar servicios intangibles a los clientes a cambio de una compensación financiera." })}
                </>

            </SView >
        </SView >
    }
    render() {
        return <SPage title="Tipo de productos" onRefresh={(e) => {
            this.setState({ cargar: true })
            Model.publicacion.Action.CLEAR();
            return;
        }} >
            <SHr h={16} />
            <SText fontSize={20} bold>Seleccione el tipo de producto</SText>
            <SIcon name={"configuracion"} width={50} height={50} />

            {this.content()}
            <SHr h={100} />
        </SPage>
    }
}
