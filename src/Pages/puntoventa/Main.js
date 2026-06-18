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
        this.cajaActiva = false;

        this.state = {
            conStock: false,
            conPrecio: true,
            conServicio: false,
            selectedTipoKey: "all",
            searchText: "",
            selectedMoneda: null,
        };
    }

    setTipoKey = (key) => {
        this.setState({ selectedTipoKey: key });
    };

    setSearchText = (text) => {
        this.setState({ searchText: text });
    };

    setMoneda = (moneda) => {
        this.setState({ selectedMoneda: moneda });
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
                selectedMoneda={this.state.selectedMoneda}
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

                    {this.renderCarrito()}

                    <SView col="xs-12 sm-12" style={{ borderRightWidth: 1, borderRightColor: STheme.color.card }}>
                        <Categoria
                            onSelect={this.setTipoKey}
                            selected={this.state.selectedTipoKey}
                            value={this.state.searchText}
                            onChangeText={this.setSearchText}
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
                                tipoKey={this.state.selectedTipoKey}
                                searchText={this.state.searchText}
                                selectedMoneda={this.state.selectedMoneda}
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