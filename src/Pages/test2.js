import React, { Component } from 'react';
import {
    SPage,
    SView,
    SText,
} from 'servisofts-component';
import MDL from '../MDL';
import FiltroMoneda from './puntoventa/Components/FiltroMoneda';

export default class Test2 extends Component {

    state = {
        selectedMoneda: MDL.compra_venta.getMonedaSeleccionada() || null, // Objeto moneda seleccionado
    };

    componentDidMount() {
        // Suscribirse a cambios de moneda
        this.eventoMoneda = () => {
            const moneda = MDL.compra_venta.getMonedaSeleccionada();
            this.setState({ selectedMoneda: moneda });
        };
        MDL.compra_venta.addEventListener("moneda_seleccionada", this.eventoMoneda);
    }

    componentWillUnmount() {
        // Limpiar la suscripción
        MDL.compra_venta.removeEventListener("moneda_seleccionada", this.eventoMoneda);
    }

    render() {
        const { selectedMoneda } = this.state;

        return (
            <SPage title="Test2222222" disableScroll center>

                <SView col="xs-12" center row style={{ marginBottom: 16 }}>
                    <SView col="xs-12" row>
                        <SText bold>Moneda seleccionada:</SText>
                    </SView>

                    {selectedMoneda ? (
                        <SView col="xs-12" row>
                            <SText>Key: {selectedMoneda.key}</SText>
                            <SText style={{ marginLeft: 12 }}>Descripción: {selectedMoneda.descripcion}</SText>
                            <SText style={{ marginLeft: 12 }}>Observación: {selectedMoneda.observacion || "-"}</SText>
                        </SView>
                    ) : (
                        <SText>No hay moneda seleccionada</SText>
                    )}
                </SView>

                <SView col="xs-2" row  >

                    <FiltroMoneda onSelect={(moneda) => { this.setState({ selectedMoneda: moneda }); }} />
                </SView>

            </SPage>
        );
    }
}
