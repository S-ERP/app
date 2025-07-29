import React, { Component } from "react";
import { SPage, SView, STheme, SText } from "servisofts-component";
import Header from "./Components/Header";
import Carrito from "./Components/Carrito";
import Modelo from "./Components/Modelo";
import Categoria from "./Components/Categoria";
import SIconApp from "../../Assets/SIconApp";

export default class Main extends Component {
    constructor(props) {
        super(props);
        this.selectedTipoKey = "all";
        this.searchText = "";
        this.tamañoMovil = false;
    }

    setTipoKey = (key) => {
        this.selectedTipoKey = key;
        this.forceUpdate();
    };

    setSearchText = (text) => {
        this.searchText = text;
        this.forceUpdate();
    };

    renderCarrito() {
        return <Carrito ref={(ref) => (this.carritoRef = ref)} onModificarStock={(key, delta) => this.modeloRef?.modificarStock(key, delta)} />;
    }

    renderProductos() {
        if (this.tamañoMovil) return;
        return (
            <>
                <SView col="xs-12 sm-12 md-7.5 lg-9" style={{ borderRightWidth: 1, borderRightColor: STheme.color.card }}>
                    <Categoria
                        onSelect={this.setTipoKey}
                        selected={this.selectedTipoKey}
                        value={this.searchText}
                        onChangeText={this.setSearchText}
                    />
                    <Modelo
                        ref={(ref) => (this.modeloRef = ref)}
                        tipoKey={this.selectedTipoKey}
                        searchText={this.searchText}
                        onPressProducto={(producto) => this.carritoRef?.addProducto(producto)}
                    />
                </SView>

                <SView col="xs-0 sm-12 md-4.5 lg-3" style={{ padding: 16, borderLeftWidth: 1, borderLeftColor: STheme.color.card }}> {this.renderCarrito()} </SView>
            </>
        );
    }



    renderMovil() {
        if (!this.tamañoMovil) return;

        return (
            <>
                <SView col="xs-12 sm-0 md-0" style={{ padding: 16, borderLeftWidth: 1, borderLeftColor: STheme.color.card }}> {this.renderCarrito()} </SView>

                <SView col="xs-0 sm-12 md-12"
                    style={{ padding: 16, borderLeftWidth: 1, borderLeftColor: STheme.color.card }}
                    onPress={() => { this.tamañoMovil = false; this.forceUpdate(); }}
                >
                    <SText>Recargar Página: {JSON.stringify(this.tamañoMovil)}</SText>
                </SView>
            </>
        );
    }

    btnFlotante() {
        return <SView col="xs-12 md-0 ">
            <SView backgroundColor="#3B82F6" border={STheme.color.text} style={{ position: "absolute", bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: "center", alignItems: "center" }}
                onPress={() => {
                    this.tamañoMovil = !this.tamañoMovil;
                    this.forceUpdate();
                }}
            >
                <SIconApp name="carritoproducto" width={28} height={28} fill={STheme.color.text}   />
            </SView>
        </SView>
    }

    render() {
        return (
            <SPage disableScroll hidden>
                <Header />
                <SView col="xs-12" row flex backgroundColor={STheme.color.background} >
                    {this.renderProductos()}
                    {this.renderMovil()}
                </SView>
                {this.btnFlotante()}
            </SPage>
        );
    }
}
