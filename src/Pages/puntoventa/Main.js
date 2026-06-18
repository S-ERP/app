import React, { Component } from "react";
import { SPage, SView, STheme, SNotification, SNavigation } from "servisofts-component";
import Header from "./Components/Header";
import Carrito from "./Components/Carrito";
import Modelo from "./Components/Modelo";
import Categoria from "./Components/Categoria";
import MDL from "../../MDL";

export default class Main extends Component {
    constructor(props) {
        super(props);
        this.selectedTipoKey = "all";
        this.searchText = "";
        this.selectedMoneda = null;
        this.cajaActiva = false;

        this.state = {
            conStock: false,
            conPrecio: true,
            conServicio: false,
        };
    }

    setTipoKey = (key) => {
        this.selectedTipoKey = key;
        this.forceUpdate();
    };

    setSearchText = (text) => {
        this.searchText = text;
        this.forceUpdate();
    };

    setMoneda = (moneda) => {
        this.selectedMoneda = moneda;
        this.forceUpdate();
    };

    setConStock = (value) => {
        this.setState({ conStock: value }, () => {
            this.carritoRef?.ajustarCarrito();
        });
    };

    setConPrecio = (value) => {
        this.setState({ conPrecio: value });
    };

    setConServicio = (value) => {
        this.setState({ conServicio: value });
    };

    async checkCaja() {
        try {
            const activa = await MDL.caja.getActiva();
            this.cajaActiva = !!activa;
            if (this.cajaActiva) {
                this.forceUpdate();
            } else {
                SNotification.send({
                    title: "Caja no aperturada",
                    message: "Debes abrir la caja antes de continuar con las operaciones.",
                    type: "danger",
                    body: "⚠️Debe abrir caja⚠️",
                    color: STheme.color.danger,
                    time: 5000,
                });
                SNavigation.replace("/caja2");
            }
        } catch (e) {
            console.error("Error al obtener estado de caja", e);
        }
    }

    componentDidMount() {
        this.checkCaja();
        this.evento = MDL.compra_venta.addEventListener("carrito_globo", () => {
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        if (this.evento) {
            MDL.compra_venta.removeEventListener(this.evento);
        }
    }

    renderCarrito() {
        return (
            <Carrito
                ref={(ref) => (this.carritoRef = ref)}
                onModificarStock={(key, delta) => this.modeloRef?.modificarStock(key, delta)}
                selectedMoneda={this.selectedMoneda}
                conStock={this.state.conStock}
                onChangeConStock={this.setConStock}
            />
        );
    }

    render() {
        return (
            <SPage disableScroll hidden>
                <Header />
                <SView col="xs-12" row flex>

                    <SView style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
                        {this.renderCarrito()}
                    </SView>

                    <SView
                        col="xs-12 sm-12"
                        style={{
                            borderRightWidth: 1,
                            borderRightColor: STheme.color.card,
                        }}
                    >
                        <Categoria
                            onSelect={this.setTipoKey}
                            selected={this.selectedTipoKey}
                            value={this.searchText}
                            onChangeText={this.setSearchText}
                            selectedMoneda={this.selectedMoneda}
                            onSelectMoneda={this.setMoneda}
                            conStock={this.state.conStock}
                            onChangeConStock={this.setConStock}
                            conPrecio={this.state.conPrecio}
                            onChangeConPrecio={this.setConPrecio}
                            conServicio={this.state.conServicio}
                            onChangeConServicio={this.setConServicio}
                        />
                        {this.cajaActiva && (
                            <Modelo
                                ref={(ref) => (this.modeloRef = ref)}
                                tipoKey={this.selectedTipoKey}
                                searchText={this.searchText}
                                selectedMoneda={this.selectedMoneda}
                                conStock={this.state.conStock}
                                conPrecio={this.state.conPrecio}
                                conServicio={this.state.conServicio}
                                onPressProducto={(producto) => {
                                    this.carritoRef?.addProducto(producto);
                                }}
                            />
                        )}
                    </SView>
                </SView>
            </SPage>
        );
    }
}