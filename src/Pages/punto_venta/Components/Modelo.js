import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SImage, SMath, SScrollView2, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import SSocket from 'servisofts-socket';

const productSinFoto = 'https://cauder.com/wp-content/uploads/2020/12/producto-sin-imagen-600x600.jpg';

const productosComputacion = [
    {
        key: 1,
        descripcion: "Corner Desk Left Sit",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
        precio_venta: 97.75,
        currency: "$",
        category: "desks",
        stock: 15,
        otrooo: "Escritorio esquinero izquierdo ergonómico",
    },
    {
        key: 2,
        descripcion: "Corner Desk Right Sit",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
        precio_venta: 169.05,
        currency: "$",
        category: "desks",
        stock: 12,
        otrooo: "Escritorio esquinero derecho ergonómico",
    },
    {
        key: 3,
        descripcion: "Customizable Desk (Custom, White)",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
        precio_venta: 920.46,
        currency: "$",
        category: "desks",
        stock: 8,
        otrooo: "Escritorio personalizable blanco",
    },
    {
        key: 4,
        descripcion: "Customizable Desk (Custom, Black)",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
        precio_venta: 862.5,
        currency: "$",
        category: "desks",
        stock: 10,
        otrooo: "Escritorio personalizable negro",
    },
    {
        key: 5,
        descripcion: "Customizable Desk (Custom, Wood)",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
        precio_venta: 862.5,
        currency: "$",
        category: "desks",
        stock: 6,
        otrooo: "Escritorio personalizable madera",
    },
    {
        key: 6,
        descripcion: "Customizable Desk (Steel, Black)",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
        precio_venta: 862.5,
        currency: "$",
        category: "desks",
        stock: 14,
        otrooo: "Escritorio acero negro",
    },
    {
        key: 7,
        descripcion: "Customizable Desk (Steel, White)",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
        precio_venta: 862.5,
        currency: "$",
        category: "desks",
        stock: 9,
        otrooo: "Escritorio acero blanco",
    },
    {
        key: 8,
        descripcion: "Desk Combination",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
        precio_venta: 517.5,
        currency: "$",
        category: "desks",
        stock: 11,
        otrooo: "Combinación de escritorio modular",
    },
    {
        key: 9,
        descripcion: "Four Person Desk",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
        precio_venta: 2702.5,
        currency: "$",
        category: "desks",
        stock: 3,
        otrooo: "Escritorio para cuatro personas",
    },
    {
        key: 10,
        descripcion: "Large Desk",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
        precio_venta: 2068.85,
        currency: "$",
        category: "desks",
        stock: 5,
        otrooo: "Escritorio grande ejecutivo",
    },
    {
        key: 11,
        descripcion: "Large Desk",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
        precio_venta: 2068.85,
        currency: "$",
        category: "desks",
        stock: 5,
        otrooo: "Escritorio grande ejecutivo",
    },
    {
        key: 12,
        descripcion: "Large Desk",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
        precio_venta: 2068.85,
        currency: "$",
        category: "desks",
        stock: 5,
        otrooo: "Escritorio grande ejecutivo",
    },
    {
        key: 13,
        descripcion: "Large Desk",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
        precio_venta: 2068.85,
        currency: "$",
        category: "desks",
        stock: 5,
        otrooo: "Escritorio grande ejecutivo",
    },
    {
        key: 14,
        descripcion: "Large Desk",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
        precio_venta: 2068.85,
        currency: "$",
        category: "desks",
        stock: 5,
        otrooo: "Escritorio grande ejecutivo",
    },
    {
        key: 15,
        descripcion: "Large Desk",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
        precio_venta: 2068.85,
        currency: "$",
        category: "desks",
        stock: 5,
        otrooo: "Escritorio grande ejecutivo",
    },
    {
        key: 16,
        descripcion: "Large Desk",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
        precio_venta: 2068.85,
        currency: "$",
        category: "desks",
        stock: 5,
        otrooo: "Escritorio grande ejecutivo",
    },
    {
        key: 17,
        descripcion: "Large Desk",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
        precio_venta: 2068.85,
        currency: "$",
        category: "desks",
        stock: 5,
        otrooo: "Escritorio grande ejecutivo",
    },
    {
        key: 18,
        descripcion: "Large Desk",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
        precio_venta: 2068.85,
        currency: "$",
        category: "desks",
        stock: 5,
        otrooo: "Escritorio grande ejecutivo",
    },
]


export default class Modelo extends Component {



    constructor(props) {
        super(props);
        this.modelos = [];
        this.time = Date.now();
    }

    componentDidMount() {
        this.loadApis();
    }

    async loadApis() {
        const modelos = await MDL.inventario.getAllModeloStock();
        this.modelos = modelos;
        this.forceUpdate();
    }

    renderModelos() {
        const modelos = this.modelos || [];
        const tipoKey = this.props.tipoKey;

        const productosFiltrados = tipoKey === "all"
            ? productosComputacion
            : productosComputacion.filter(m => m.category === tipoKey);


        // const productosFiltrados = tipoKey === "all" ? modelos : modelos.filter(m => m.key_tipo_producto === tipoKey);

        const columnas = 5;
        const colSize = parseFloat((12 / (columnas + 1)).toFixed(2));

        return (
            <SView col={"xs-12"} flex center  backgroundColor='red' >

                <SScrollView2 disableHorizontal >
                    <SView col={"xs-12"} style={{ padding: 20 }}>



                        <SView col={"xs-12"} row style={{ flexWrap: "wrap" }}>
                            {productosFiltrados.map((producto, index) => (
                                <SView
                                    key={index}
                                    col={`xs-${colSize}`}
                                    style={{
                                        margin: 4,
                                        borderRadius: 12,
                                        padding: 12,
                                        backgroundColor: "#FFF",
                                        shadowColor: "#000",
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 8,
                                        elevation: 3,
                                        borderWidth: 1,
                                        borderColor: "#F3F4F6",
                                    }}
                                >
                                    <SView center style={{ marginBottom: 12 }}>
                                        <SImage
                                            src={productSinFoto}
                                            // src={producto.key ? SSocket.api.inventario + "modelo/.128_" + producto.key + "?date=" + this.time : productSinFoto}
                                            style={{
                                                width: 120,
                                                height: 120,
                                                borderRadius: 8,
                                                backgroundColor: "#F9FAFB",
                                            }}
                                            resizeMode="cover"
                                        />
                                    </SView>

                                    <SText center fontSize={12} bold color={"#111827"}>{producto.descripcion}</SText>
                                    <SText center fontSize={14} bold color={"#714B67"}>Bs {SMath.formatMoney(producto.precio_venta, 2)}</SText>
                                    <SText center fontSize={10} color={producto?.stock > 0 ? "#10B981" : "#EF4444"}>
                                        Disponible: {producto?.stock} und
                                    </SText>
                                </SView>
                            ))}
                        </SView>
                    </SView>
                    {/* </ScrollView> */}
                </SScrollView2>
            </SView>

        );
    }

    render() {
        return this.renderModelos();
    }
}
