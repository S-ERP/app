import React, { useState } from "react";
import { SForm, SHr, SImage, SInput, SPage, SText, STheme, SView, SDate, SNotification } from "servisofts-component";
import MDL from "../../MDL";
import SSocket from "servisofts-socket";
import { Container } from "../../Components";

export default class Dashboard extends React.Component {
    state = {
        clientes: [],
        sucursales: [],
        resultado: null,
        paquete: null,
        selectedSucursal: null,
    };

    componentDidMount() {

        this.loadData().then((data) => {
            this.setState({ clientes: data });
        });
    }



    async loadData() {

    }



    render() {

        return (
            <SPage title={"Dashboard de Asistencias"} center>
                <Container>
                    <SView col={"xs-12"} center>
                        <SText fontSize={18} bold>
                            Dashboard de Asistencias
                        </SText>
                    </SView>
                </Container>
            </SPage>
        );
    }


}

