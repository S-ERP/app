import React, { Component } from 'react';
import { FlatList } from 'react-native';
import { SText, SView } from 'servisofts-component';



export default class Carrito extends Component {
    constructor(props) {
        super(props);
        this.state = {
            carrito: []
        };
    }

    /**
     * Agrega un producto al carrito. Si ya existe, incrementa cantidad.
     */
    addProducto = (producto) => {
        const carrito = [...this.state.carrito];
        const index = carrito.findIndex(p => p.key === producto.key);
        if (index >= 0) {
            carrito[index].cantidad += 1;
        } else {
            carrito.push({ ...producto, cantidad: 1 });
        }
        this.setState({ carrito });
    };



    aumentarCantidad = (producto) => {
        const carrito = [...this.state.carrito];
        const index = carrito.findIndex(p => p.key === producto.key);
        if (index >= 0) {
            const success = this.props.onModificarStock?.(producto.key, -1); // ✅ Verifica stock antes de incrementar
            if (success === false) {
                alert("No hay más stock disponible");
                return;
            }
            carrito[index].cantidad += 1;
            this.setState({ carrito });
        }
    };


    disminuirCantidad = (producto) => {
        const carrito = [...this.state.carrito];
        const index = carrito.findIndex(p => p.key === producto.key);
        if (index >= 0) {
            carrito[index].cantidad -= 1;
            this.props.onModificarStock?.(producto.key, +1); // ⬅️ suma en modelo

            if (carrito[index].cantidad <= 0) {
                carrito.splice(index, 1); // elimina del carrito
            }

            this.setState({ carrito });
        }
    };


    renderItemCarrito = (item) => {
        return (
            <SView key={item.key} row style={{ justifyContent: "space-between", alignItems: "center", paddingVertical: 4 }}>
                <SText fontSize={12} color={"#374151"} flex>{item.descripcion}</SText>

                <SView row center>
                    <SText
                        onPress={() => this.disminuirCantidad(item)}
                        style={{ paddingHorizontal: 8, fontSize: 16, color: "#EF4444", fontWeight: "bold" }}>
                        -
                    </SText>
                    <SText fontSize={12} bold color={"#111827"} style={{ paddingHorizontal: 4 }}>
                        x{item.cantidad}
                    </SText>
                    <SText
                        onPress={() => this.aumentarCantidad(item)}
                        style={{ paddingHorizontal: 8, fontSize: 16, color: "#10B981", fontWeight: "bold" }}>
                        +
                    </SText>
                </SView>
            </SView>

        );
    };

    renderCarrito() {
        const { carrito } = this.state;

        return (
            <SView
                backgroundColor={"#FFFFFF"}
                height={"30%"}
                style={{
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 8,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                }}
            >
                <SText fontSize={14} bold color={"#374151"} style={{ marginBottom: 8 }}>
                    Orden Actual
                </SText>

                <FlatList
                    style={{ width: "100%" }}
                    data={carrito}
                    keyExtractor={(item) => item.key.toString()}
                    renderItem={({ item }) => this.renderItemCarrito(item)}
                    ListEmptyComponent={
                        <SView center style={{ paddingVertical: 20 }}>
                            <SText fontSize={12} color={"#9CA3AF"}>
                                No hay productos en el carrito
                            </SText>
                        </SView>
                    }
                />
            </SView>
        );
    }

    render() {
        return this.renderCarrito();
    }
}
