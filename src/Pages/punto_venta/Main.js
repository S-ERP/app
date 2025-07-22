import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SPage, SText, STheme, SView } from 'servisofts-component';
import Header from './Components/Header';
import Carrito from './Components/Carrito';
import Modelo from './Components/Modelo';
import TipoModelo from './Components/TipoModelo';


export default class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.selectedTipoKey = "all";
    }

    setTipoKey = (key) => {
        this.selectedTipoKey = key;
        this.forceUpdate(); // fuerza re-render de Modelo
    };

    render() {
        return (<SPage disableScroll>
            <Header></Header>

            <SView col={"xs-12"} row flex backgroundColor={STheme.color.secondary}>
                {/* <SView col={"xs-12"} row backgroundColor={"#F8F9FA"}> */}


                <SView col={"xs-4"} style={{ padding: 16, borderRightWidth: 1, borderRightColor: STheme.color.card + "99" }} >
                    <Carrito></Carrito>
                </SView>

                <SView col={"xs-8"}   >
                    {/* <SView col={"xs-8"} style={{ padding: 16}} > */}
                    <TipoModelo onSelect={this.setTipoKey} selected={this.selectedTipoKey} ></TipoModelo>
                    <Modelo tipoKey={this.selectedTipoKey}></Modelo>
                </SView>
            </SView>
        </SPage>
        );
    }
}
