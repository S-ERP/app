import React, { Component } from 'react';
import {
    SPage,
    SView,
    STheme,
    SText,
    SHr,
} from 'servisofts-component';
import MDL from '../MDL';
import FiltroMoneda from './puntoventa/Components/FiltroMoneda';

export default class Test1 extends Component {

    state = {
        selectedMoneda: MDL.compra_venta.getMonedaSeleccionada() || null, // Objeto moneda seleccionado
    };

    render() {
        const { selectedMoneda } = this.state;

        return (
            <SPage title="Test111111111111111" disableScroll center>

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

                <FiltroMoneda
                    onSelect={(moneda) => {
                        // Actualizamos el estado cuando cambia la moneda en FiltroMoneda
                        this.setState({ selectedMoneda: moneda });
                    }}
                />

            </SPage>
        );
    }
}
