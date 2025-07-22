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

    renderItemCarrito = (item) => {
        return (
            <SView
                key={item.key}
                row
                style={{
                    justifyContent: "space-between",
                    paddingVertical: 4,
                    borderBottomWidth: 1,
                    borderColor: "#E5E7EB",
                }}
            >
                <SText fontSize={12} color={"#374151"}>{item.descripcion}</SText>
                <SText fontSize={12} bold color={"#111827"}>x{item.cantidad}</SText>
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
