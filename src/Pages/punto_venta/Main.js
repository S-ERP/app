import React, { Component } from "react";
import { View, Text } from "react-native";
import { SNavigation, SPage, SText, STheme, SView } from "servisofts-component";
import Header from "./Components/Header";
import Carrito from "./Components/Carrito";
import Modelo from "./Components/Modelo";
import TipoModelo from "./Components/Categoria";
import Categoria from "./Components/Categoria";
import SIconApp from "../../Assets/SIconApp";

export default class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.selectedTipoKey = "all";
    this.searchText = "";
    this.tamañoMovil = false;
  }
  setTipoKey = (key) => {
    this.selectedTipoKey = key;
    this.forceUpdate(); // fuerza re-render de Modelo
  };
  setSearchText = (text) => {
    this.searchText = text;
    this.forceUpdate();
  };

  componentDidMount() {
    this.columna_2();
    this.columna_1();
  }

  columna_1() {
    if (!this.tamañoMovil) {
      return (
        <SView
          col={" xs-12 sm-12 md-7.5 lg-9"}
          style={{ borderRightWidth: 2 }}
          backgroundColor="pink"
        >
          <Categoria
            onSelect={this.setTipoKey}
            selected={this.selectedTipoKey}
            value={this.searchText}
            onChangeText={this.setSearchText}
          />
          <Modelo
            ref={(ref) => {
              if (ref) this.modeloRef = ref;
            }}
            tipoKey={this.selectedTipoKey}
            searchText={this.searchText}
            onPressProducto={(producto) =>
              this.carritoRef?.addProducto(producto)
            }
          />
        </SView>
      );
    }
    // console.log("miralo " + JSON.stringify(this.colmi))

    return null;
  }
  columna_2() {
    if (this.tamañoMovil) {
      return (
        <SView
          ref={(ref) => (this.data_columna_2 = ref)}
          col={"xs-12 sm-12 md-4.5 lg-12"}
          backgroundColor={"red"}
          style={{
            padding: 16,
            borderRightWidth: 1,
            borderRightColor: STheme.color.card,
            borderLeftWidth: 1,
            borderLeftColor: STheme.color.card,
          }}
        >
          <Carrito
            ref={(ref) => {
              if (ref) this.carritoRef = ref;
            }}
            onModificarStock={(key, delta) =>
              this.modeloRef?.modificarStock(key, delta)
            }
          />
        </SView>
      );
    }

    return null;
  }

  render() {
    // const screenSize = this.colmi.getData; // xs, sm, md, lg, xl
    // const isMobile = screenSize == "xs" || screenSize == "sm";

    // console.log("miralo " + JSON.stringify(screenSize))

    return (
      <SPage disableScroll hidden>
        <Header value={this.searchText} onChangeText={this.setSearchText} />

        <SView col={"xs-12"} row flex backgroundColor={STheme.color.background}>
          {this.columna_1()}

          {this.columna_2()}

          {/* {isMobile &&
                    <SView
                        style={{
                            position: "fixed",
                            bottom: 16,
                            right: 16,
                            width: 56,
                            height: 56,
                            borderRadius: 28,
                            backgroundColor: STheme.color.primary,
                            justifyContent: "center",
                            alignItems: "center",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                            zIndex: 999
                        }}
                        onPress={() => {
                            this.tamañoMovil = !this.tamañoMovil;
                            this.forceUpdate();
                        }}
                    >
                        <SIconApp name="Carrito" width={28} height={28} fill="#fff" />
                    </SView>
                } */}

          <SView
            style={{
              position: "fixed",
              bottom: 16,
              right: 16,
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: STheme.color.primary,
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
              zIndex: 999,
            }}
            onPress={() => {
              this.tamañoMovil = !this.tamañoMovil;
              const asdsad = this.data_columna_2.col;
              console.log(
                "------------------------------------ " + JSON.stringify(asdsad)
              );

              this.forceUpdate();
            }}
          >
            <SIconApp name="Carrito" width={28} height={28} fill="#fff" />
          </SView>
        </SView>
      </SPage>
    );
  }
}
