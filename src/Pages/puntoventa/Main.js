import React, { Component } from "react";
import { SPage, SView, STheme, SText, SHr } from "servisofts-component";
import Header from "./Components/Header";
import Carrito from "./Components/Carrito";
import Modelo from "./Components/Modelo";
import Categoria from "./Components/Categoria";
import SIconApp from "../../Assets/SIconApp";
import { Dimensions } from "react-native";
import PopupCarritoFlotante from "./Components/Carrito/PopupCarritoFlotante";
export default class Main extends Component {
    constructor(props) {
        super(props);
        this.selectedTipoKey = "all";
        this.searchText = "";
        this.tamañoMovil = false;
        this.bandera = false;
        this.state = {
            showCarritoModal: false,
            carritoModalData: [],
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
    componentDidMount() {
        this.renderCarrito();
        Dimensions.addEventListener("change", this.onChangeDimensions);
    }
    onChangeDimensions = () => {
        this.forceUpdate();
    };
    componentWillUnmount() {
        Dimensions.removeEventListener("change", this.onChangeDimensions);
    }
    renderCarrito() {
        return (
            <Carrito
                ref={(ref) => (this.carritoRef = ref)}
                onModificarStock={(key, delta) => this.modeloRef?.modificarStock(key, delta)}
            />
        );
    }
    renderCarrito2() {
        return (
            <Carrito
                ref={(ref) => (this.carritoRefModal = ref)}
                onModificarStock={(key, delta) => this.modeloRef?.modificarStock(key, delta)}
            />
        );
    }
    btnFlotante() {
        return (
            <SView col="xs-12 md-0 ">
                <SView
                    backgroundColor="#3B82F6"
                    border={STheme.color.text}
                    style={{
                        position: "absolute",
                        bottom: 20,
                        right: 20,
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                    }}
                    onPress={() => {
                        console.log("prin " + JSON.stringify(this.carritoRef?.carrito))

                        const productos = this.carritoRef?.carrito;

                        // alvaro esta trabajando
                        // PopupCarritoFlotante.open({
                        //     productos: productos
                        // });

                        this.setState({ showCarritoModal: true }, () => {
                            this?.carritoRefModal?.setCarrito(productos);
                            this.forceUpdate();
                        });
                    }}
                >
                    <SIconApp name="carritoproducto" width={28} height={28} fill={STheme.color.text} />
                </SView>
            </SView>
        );
    }
    renderCarritoModal() {
        if (!this.state.showCarritoModal) return null;
        let valor = this.carritoRef?.carrito.length ?? 0;
        return (
            <SView
                col="xs-12"
                height="100%"
                center
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    zIndex: 10000,
                }}
                onPress={() => {
                    this.setState({ showCarritoModal: false });
                }}
            >
                <SView
                    width={350}
                    height={500}
                    backgroundColor={STheme.color.background}
                    style={{
                        borderRadius: 16,
                        padding: 20,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.25,
                        shadowRadius: 5,
                        elevation: 5,
                    }}
                    onPress={(e) => e.stopPropagation()}
                >
                    <SText bold center fontSize={20} style={{ marginBottom: 10 }}>
                        Carrito de Compras
                    </SText>
                    {this.renderCarrito2()}

                </SView>
            </SView>
        );
    }
    getColSize() {
        const width = Dimensions.get('window').width;
        if (width >= 1200) return parseFloat((12 / 8).toFixed(2));
        if (width >= 768) return parseFloat((12 / 4).toFixed(2));
        return parseFloat((12 / 3).toFixed(2));
    }
    render() {
        return (
            <SPage disableScroll hidden>
                <Header />
                <SView col="xs-12" row flex backgroundColor={STheme.color.background}>
                     <SView
                        col="xs-12 sm-12 md-7.5 lg-9"
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
                        />
                        <Modelo
                            ref={(ref) => (this.modeloRef = ref)}
                            tipoKey={this.selectedTipoKey}
                            searchText={this.searchText}
                            onPressProducto={(producto) => {
                                this.carritoRef?.addProducto(producto);
                                this.carritoRefModal?.addProducto?.(producto);
                            }}
                        />
                    </SView>
                    <SView flex
                        col="xs-12 sm-12 md-4.5 lg-3"
                        style={{
                            display: this.getColSize() === 4 ? "none" : "flex",
                            padding: 16,
                            borderLeftWidth: 1,
                            borderLeftColor: STheme.color.card,
                        }}
                    >
                        {this.renderCarrito()}
                    </SView>
                </SView>
                {this.btnFlotante()}
                {this.renderCarritoModal()}
            </SPage>
        );
    }
}
