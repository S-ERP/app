import React, { Component } from "react";
import { SPage, SView, STheme, SText, SHr, SNotification, SNavigation } from "servisofts-component";
import Header from "./Components/Header";
import Carrito from "./Components/Carrito";
import Modelo from "./Components/Modelo";
import Categoria from "./Components/Categoria";
import { Dimensions } from "react-native";
import MDL from "../../MDL";

export default class Main extends Component {
    constructor(props) {
        super(props);
        this.selectedTipoKey = "all";
        this.searchText = "";
        this.selectedMoneda = null;
        this.cajaActiva = false;

        this.state = {
            showCarritoModal: false,
            carritoModalData: [],
            conStock: false, // Mover conStock al estado, inicializado en false
            conPrecio: true, // Mover conStock al estado, inicializado en false
            conServicio: false, // Mover conServicio al estado, inicializado en false
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
            this.carritoRef?.ajustarCarrito(); // Ajustar carrito después de actualizar el estado
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
        this.renderCarrito();
        Dimensions.addEventListener("change", this.onChangeDimensions);
        this.evento = MDL.compra_venta.addEventListener("carrito_globo", () => {
            this.forceUpdate()
        });
    }

    onChangeDimensions = () => {
        this.forceUpdate();
    };

    componentWillUnmount() {
        Dimensions.removeEventListener("change", this.onChangeDimensions);
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
                conStock={this.state.conStock} // Usar estado conStock
                onChangeConStock={this.setConStock} // Pasar función para actualizar conStock
            />
        );
    }

    // btnFlotante() {
    //let cantidadItems = MDL.compra_venta.totalItemsCarrito;
    //return (
    //<SView col="xs-12 md-0">
    //<SView
    //backgroundColor="#3B82F6"
    //border={STheme.color.text}
    //style={{
    //position: "absolute",
    //bottom: 20,
    //right: 20,
    //width: 56,
    //height: 56,
    //borderRadius: 28,
    //justifyContent: "center",
    //alignItems: "center",
    //zIndex: 1000,
    //}}
    //onPress={() => {
    //const productos = this.carritoRef?.carrito;
    //PopupCarritoFlotante.open({
    //productos: productos,
    //});

    //}}
    //>
    //<SIconApp name="carritoproducto" width={28} height={28} fill={STheme.color.text} />
    //{cantidadItems > 0 && (
    //<SView
    //style={{
    //position: "absolute",
    //top: -8,
    //right: -8,
    //backgroundColor: STheme.color.danger,
    //borderRadius: 12,
    //width: 24,
    //height: 24,
    //justifyContent: "center",
    //alignItems: "center",
    //borderWidth: 2,
    //borderColor: STheme.color.background,
    //}}
    //>
    //<SText fontSize={12} bold color={STheme.color.white}>
    //{cantidadItems}
    //</SText>
    //</SView>
    //)}
    //</SView>
    //</SView>
    //);
    // }

    getColSize() {
        const width = Dimensions.get("window").width;
        if (width >= 1200) return parseFloat((12 / 8).toFixed(2));
        if (width >= 768) return parseFloat((12 / 4).toFixed(2));
        return parseFloat((12 / 3).toFixed(2));
    }

    render() {
        return (
            <SPage disableScroll hidden>
                <Header onSelect={this.setSucursal} />
                <SView col="xs-12" row flex>

                    {/* CARRITO INVISIBLE */}
                    <SView style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
                        {this.renderCarrito()}
                    </SView>

                    {/* <SView
flex
col="xs-12 sm-12 md-4.5 lg-3.5"
style={{
display: this.getColSize() === 4 ? "none" : "flex",
padding: 8,
borderRightWidth: 1,
borderRightColor: STheme.color.card,
}}
>
{this.renderCarrito()}
</SView> */}
                    <SView
                        col="xs-12 sm-12 "
                        style={{
                            display: this.state.showCarritoModal ? "none" : "flex",
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
                            conStock={this.state.conStock} // Usar estado conStock
                            onChangeConStock={this.setConStock} // Pasar función para actualizar conStock
                            conPrecio={this.state.conPrecio}// <-- Pasar prop
                            onChangeConPrecio={this.setConPrecio}// <-- Pasar función
                            conServicio={this.state.conServicio}
                            onChangeConServicio={this.setConServicio}
                        />
                        {this.cajaActiva && (
                            <Modelo
                                ref={(ref) => (this.modeloRef = ref)}
                                tipoKey={this.selectedTipoKey}
                                searchText={this.searchText}
                                selectedMoneda={this.selectedMoneda}
                                conStock={this.state.conStock} // Usar estado conStock
                                conPrecio={this.state.conPrecio}// <-- Pasar prop
                                conServicio={this.state.conServicio}
                                onPressProducto={(producto) => {
                                    // MDL.carrito.agregarItemAlCarritoDeVentas(producto)
                                    this.carritoRef?.addProducto(producto);
                                    this.carritoRefModal?.addProducto?.(producto);
                                }}
                            />
                        )}
                    </SView>
                </SView>
                {/* {this.btnFlotante()} */}
            </SPage>
        );
    }
}