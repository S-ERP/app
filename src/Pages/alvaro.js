import React, { Component } from 'react';
import { SButtom, SNavigation, SText, STheme, SView } from 'servisofts-component';
import Turnos from './Turnos';

export default class alvaro extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <SView col={"xs-11"} backgroundColor={STheme.color.card} style={{ padding: 16 }}>
                <SText color='blue' fontSize={18} style={{ marginBottom: 16 }}>
                    Se desarrollaron estos módulos de inventario y gestión:
                </SText>

                <SButtom backgroundColor="red"
                    onPress={() => {
                        SNavigation.navigate("/proveedor/perfil");
                    }}
                    style={{ marginBottom: 12 }}
                >
                    <SText color="#fff" fontSize={16}>Formulario de Proveedor</SText>
                </SButtom>

                <SButtom
                    onPress={() => {
                        SNavigation.navigate("/proveedor");
                    }}
                    style={{ marginBottom: 12 }}
                >
                    <SText color="#fff" fontSize={16}>Gestión de Proveedores</SText>
                </SButtom>

                <SButtom
                    onPress={() => {
                        SNavigation.navigate("/inventario/almacen/profile/registro_inventario");
                    }}
                    style={{ marginBottom: 12 }}
                >
                    <SText color="#fff" fontSize={16}>Registro de Inventario</SText>
                </SButtom>

                <SButtom
                    onPress={() => {
                        SNavigation.navigate("/inventario/reporteConteoInventario");
                    }}
                    style={{ marginBottom: 12 }}
                >
                    <SText color="#fff" fontSize={16}>Reporte de Conteo de Inventario</SText>
                </SButtom>

                <SButtom
                    onPress={() => {
                        SNavigation.navigate("/puntoventa");
                    }}
                    style={{ marginBottom: 12 }}
                >
                    <SText color="#fff" fontSize={16}>Punto de Venta</SText>
                </SButtom>

                {/* Ejemplo con parámetro query */}
                <SButtom
                    onPress={() => {

                        SNavigation.navigate("/venta/profile", { pk: 'd801f0ec-6fa7-4772-b4e7-d9698f8346a1' });



                    }}
                    style={{ marginBottom: 12 }}
                >
                    <SText color="#fff" fontSize={16}>Venta con Parámetro (pk)</SText>
                </SButtom>



                {/* <SButtom
                    onPress={() => {
                        // SNavigation.navigate("/venta/profile", { pk: 'd801f0ec-6fa7-4772-b4e7-d9698f8346a1' });
                        // Turnos
                    }}
                    style={{ marginBottom: 12 }}
                >
                    <SText color="#fff" fontSize={16}>turno</SText>
                </SButtom> */}

            </SView>
        );
    }
}
