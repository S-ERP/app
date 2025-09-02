import React, { Component } from "react";
import { SPage, SView, STheme, SText, SHr, SNotification, SNavigation } from "servisofts-component";
import Header from "./Components/Header";
import Carrito from "./Components/Carrito";
import Modelo from "./Components/Modelo";
import Categoria from "./Components/Categoria";
import SIconApp from "../../Assets/SIconApp";
import { Dimensions } from "react-native";
import PopupCarritoFlotante from "./Components/Carrito/PopupCarritoFlotante";
import MDL from "../../MDL";
export default class Main extends Component {
    cajaActiva = false; // 🔹 Bandera sin usar state
    constructor(props) {
        super(props);
        this.selectedTipoKey = "all";
        this.searchText = "";
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
    async checkCaja() {
        try {
            const activa = await MDL.caja.getActiva();
            this.cajaActiva = !!activa;
            if (this.cajaActiva) {
                this.forceUpdate();
            } else {
                SNotification.send({ title: "Caja no aperturada", message: "Debes abrir la caja antes de continuar con las operaciones.", type: "danger", body: "⚠️Debe abrir caja⚠️", color: STheme.color.danger, time: 5000, })
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
                        const productos = this.carritoRef?.carrito;
                        PopupCarritoFlotante.open({
                            productos: productos
                        })
                    }}
                >
                    <SIconApp name="carritoproducto" width={28} height={28} fill={STheme.color.text} />
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
                <Header onSelect={this.setSucursal} />
                <SView col="xs-12" row flex
                >
                    <SView flex
                        col="xs-12 sm-12 md-4.5 lg-3.5"
                        style={{
                            display: this.getColSize() === 4 ? "none" : "flex",
                            padding: 8,
                            borderRightWidth: 1,
                            borderRightColor: STheme.color.card,
                        }}
                    >
                        {this.renderCarrito()}
                    </SView>
                    <SView
                        col="xs-12 sm-12 md-7.5 lg-8.5"
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
                        {this.cajaActiva && <Modelo
                            ref={(ref) => (this.modeloRef = ref)}
                            tipoKey={this.selectedTipoKey}
                            searchText={this.searchText}
                            onPressProducto={(producto) => {
                                this.carritoRef?.addProducto(producto);
                                this.carritoRefModal?.addProducto?.(producto);
                            }}
                        />
                        }
                    </SView>
                </SView>
                {this.btnFlotante()}
            </SPage>
        );
    }
}
