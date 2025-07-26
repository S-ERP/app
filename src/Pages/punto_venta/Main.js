import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SPage, SText, STheme, SView } from 'servisofts-component';
import Header from './Components/Header';
import Carrito from './Components/Carrito';
import Modelo from './Components/Modelo';
import TipoModelo from './Components/Categoria';
import Categoria from './Components/Categoria';


export default class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.selectedTipoKey = "all";
        this.searchText = "";

    }


    componentDidMount() {
        if (typeof window !== "undefined") {
            window.addEventListener("keydown", this.handleKeyDown);
        }
    }

    componentWillUnmount() {
        if (typeof window !== "undefined") {
            window.removeEventListener("keydown", this.handleKeyDown);
        }
    }


    handleKeyDown = (e) => {
        if (e.key === "Escape") {
            this.searchText = "";
            this.forceUpdate();
        }
    };
    setTipoKey = (key) => {
        this.selectedTipoKey = key;
        this.forceUpdate(); // fuerza re-render de Modelo
    };
    setSearchText = (text) => {
        this.searchText = text;
        this.forceUpdate();
    };
    render() {

        let paddingCarrito = 16;
        if (typeof window !== "undefined") {
            const width = window.innerWidth;
            if (width < 600) paddingCarrito = 4; // móvil
            else if (width < 1024) paddingCarrito = 8; // tablet
            else paddingCarrito = 16; // laptop o mayor
        }

        return (<SPage disableScroll hidden>
            <Header value={this.searchText} onChangeText={this.setSearchText} />

            <SView col={"xs-12"} row flex backgroundColor={STheme.color.background}>

                <SView col={"xs-12 sm-12 md-4.5 lg-4"} backgroundColor='red' style={{ padding: paddingCarrito, borderRightWidth: 1, borderRightColor: STheme.color.card }} >
                    <Carrito ref={(ref) => { if (ref) this.carritoRef = ref; }} onModificarStock={(key, delta) => this.modeloRef?.modificarStock(key, delta)} />
                </SView>

                <SView col={"xs-12 sm-12 md-7.5 lg-8"}   >
                    <Categoria onSelect={this.setTipoKey} selected={this.selectedTipoKey} value={this.searchText} onChangeText={this.setSearchText} />
                    <Modelo ref={(ref) => { if (ref) this.modeloRef = ref; }} tipoKey={this.selectedTipoKey} searchText={this.searchText} onPressProducto={(producto) => this.carritoRef?.addProducto(producto)} />
                </SView>
            </SView>
        </SPage>
        );
    }
}
