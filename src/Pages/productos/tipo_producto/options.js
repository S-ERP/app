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
        return <SView col={"xs-5.5"} card padding={10} onPress={onPress}  row>

            <SView width={50} height={50} center backgroundColor={STheme.color.primary} borderRadius={45}>
                <SIcon name={icon} height={30} width={30} fill={STheme.color.text} />
            </SView>
            <SHr width={5} />
            {(label.length > 0) ? <SView width={5} /> : null}
            {/* <SView width={5} /> */}
            {/* <SView width={8} /> */}
            <PHr />
            <SIcon name={icon} height={30} width={30} fill={STheme.color.danger} />

            <SText bold fontSize={15}>{label}</SText>
            <PHr />
            {/* <SHr h={10} /> */}
            <SView col={"xs-12"} center>
                <SText fontSize={12}>{descripcion}</SText>
            </SView>

        </SView>
    }
    content() {

        return <SView col={"xs-12"} center>
            <SView col={"xs-12 sm-10 md-9 lg-7 xl-6 xxl-5"} center row>
                <SHr h={16} />
                <>
                    {this.renderMunuItem({ label: "Activo Fijo", icon: "tp_af", onPress: () => SNavigation.navigate("/menu"), descripcion: "Bienes tangibles o intangibles que su empresa posee y utiliza, como edificios, equipos, vehículos y otros bienes que duran mucho tiempo. " })}
                    <SView width={8} />
                    {this.renderMunuItem({ label: "Gastos Administartivo", icon: "tp_ga", onPress: () => SNavigation.navigate("/menu"), descripcion: "Son los costos asociados con la gestión y el funcionamiento diario de una empresa, como salarios de personal de oficina, alquiler de oficinas, suministros de oficina y otros gastos." })}

                    <SView width={8} />
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
