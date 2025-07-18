import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SButtom, SDate, SDatePicker, SHr, SImage, SInput, SLoad, SMath, SNavigation, SNotification, SPage, SSPiner, SText, STheme, SThread, SUuid, SView } from 'servisofts-component';
import MDtest1 from '../SMD/MDtest1';
import MenuDragable from '../Components/MenuDragable';
import Model from '../Model';
import SSocket from 'servisofts-socket';
import DataBase from '../DataBase';
import SIconApp from '../Assets/SIconApp';
import MDL from '../MDL';
import { FlatList } from 'react-native';

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

const categorias = [
    { key: "all", label: "Todos" },
    { key: "desks", label: "Escritorios" },
    { key: "chairs", label: "Sillas" },
    { key: "storage", label: "Almacenamiento" },
    { key: "accessories", label: "Accesorios" },
    // Agrega más categorías según tus productos
]

export default class testpuntoventa extends Component {
    constructor(props) {
        super(props)
        this.state = {
            text: MDtest1,
            carrito: [
                { key: 1, name: "Large Cabinet", precio_venta: 368.0, stock: 1 },
                { key: 2, name: "Storage Box", precio_venta: 18.17, stock: 1 },
                { key: 3, name: "Letter Tray", precio_venta: 5.52, stock: 1 },
                { key: 4, name: "Letter Tray", precio_venta: 5.52, stock: 1 },
                { key: 5, name: "Letter Tray", precio_venta: 5.52, stock: 1 },
                { key: 6, name: "Letter Tray", precio_venta: 5.52, stock: 1 },
                { key: 7, name: "Letter Tray", precio_venta: 5.52, stock: 1 },
                { key: 8, name: "Letter Tray", precio_venta: 5.52, stock: 1 },
                { key: 9, name: "Letter Tray", precio_venta: 5.52, stock: 1 },
                { key: 10, name: "Letter Tray", precio_venta: 5.52, stock: 1 },
                { key: 11, name: "Letter Tray", precio_venta: 5.52, stock: 1 },
                { key: 12, name: "Letter Tray", precio_venta: 5.52, stock: 1 },
                { key: 13, name: "Letter Tray", precio_venta: 5.52, stock: 1 },
                { key: 14, name: "Letter Tray", precio_venta: 5.52, stock: 1 },
                { key: 15, name: "Letter Tray", precio_venta: 5.52, stock: 1 },
            ],

            // carrito: [],
            searchText: "",
            selectedCategory: "all",
            calculatorDisplay: "0",
            showPaymentModal: false,
            amountReceived: "",
            loading: false,
        }
    }

    componentDidMount() {
        this.loadApis();
    }

    async loadApis() {
        const modelos = await MDL.inventario.getAllModeloStock();
        this.modelos = modelos;

        const tipos = await MDL.inventario.getAllTipoProducto();
        const json_tipos = [
            { key: "all", label: "Todos" },
            ...tipos.map((tipo) => ({
                key: tipo.key,
                label: tipo.descripcion,
            })),
        ];
        this.tipomodelos = json_tipos;

        console.log("Api Modelo:", modelos);
        console.log("Api Tipos Modelo:", json_tipos);
        this.forceUpdate()
    }


    aumentarCantidad = (productoId) => {
        const { carrito } = this.state
        const nuevoCarrito = carrito.map((item) =>
            item.key === productoId ? { ...item, stock: item.stock + 1 } : item,
        )
        this.setState({ carrito: nuevoCarrito })

        console.log(" aumentarCantidad " + nuevoCarrito)
    }

    // Para editar la cantidad directamente (requiere un SInput en el render)
    editarCantidadDirecta = (productoId, newQuantity) => {


        const stock = Number.parseInt(newQuantity)
        if (isNaN(stock) || stock < 0) return // Validar entrada

        const { carrito } = this.state
        let nuevoCarrito
        if (stock === 0) {
            nuevoCarrito = carrito.filter((item) => item.key !== productoId)
        } else {
            nuevoCarrito = carrito.map((item) => (item.key === productoId ? { ...item, stock: stock } : item))
        }
        console.log(" editarCantidadDirecta " + nuevoCarrito)

        this.setState({ carrito: nuevoCarrito })
    }

    // Header mejorado estilo Odoo
    renderHeader() {
        return (
            <SView
                col={"xs-12"}
                row
                center
                height={60}
                backgroundColor={"#FFFFFF"}
                style={{
                    borderBottomWidth: 1,
                    borderBottomColor: "#E5E7EB",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                }}
            >
                {/* Logo */}
                <SView col={"xs-2"} center>
                    <SText fontSize={24} bold color={"#1a1719ff"} style={{ letterSpacing: -0.5 }}>
                        servisofts
                    </SText>
                </SView>

                <SView flex />

                {/* Search */}
                <SView col={"xs-4"} center>
                    <SView
                        row
                        center
                        backgroundColor={"#F9FAFB"}
                        style={{
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: "#D1D5DB",
                            paddingHorizontal: 12,
                            height: 36,
                        }}
                    >
                        <SInput
                            placeholder="Search product"
                            style={{
                                flex: 1,
                                fontSize: 14,
                                color: "#374151",
                            }}
                            value={this.state.searchText}
                            onChangeText={(text) => this.setState({ searchText: text })}
                        />
                        <SIconApp name="search" width={16} height={16} fill={"#6B7280"} />
                    </SView>
                </SView>

                {/* User Info */}
                <SView col={"xs-3"} row center style={{ justifyContent: "flex-end" }}>
                    <SView
                        center
                        backgroundColor={"blue"}
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            marginRight: 8,
                        }}
                    >
                        <SText fontSize={12} bold color={"white"}>
                            AS
                        </SText>
                    </SView>
                    <SText fontSize={14} color={"#374151"}>
                        Alvaro Siles
                    </SText>
                    <SView style={{ marginLeft: 16 }}>
                        <SIconApp name="wifi" width={20} height={20} fill={"#6B7280"} />
                    </SView>
                </SView>
            </SView>
        )
    }


    // Detalle del carrito mejorado

    renderItemCarrito = (item) => {
        const carrito = this.state.carrito;
        const index = carrito.findIndex(i => i.key === item.key);
        const total = carrito.length;

        return (
            <SView
                key={item.key || index}
                col={"xs-12"}
                row
                style={{
                    paddingVertical: 4,
                    borderBottomWidth: index < total - 1 ? 1 : 0,
                    borderBottomColor: "#F3F4F6",
                    alignItems: "center",
                }}
            >
                {/* Nombre y precio */}
                <SView col={"xs-5"}>
                    <SText fontSize={13} bold color={"#111827"}>
                        {item.descripcion}
                    </SText>
                    <SText fontSize={11} color={"#6B7280"}>
                        Bs {SMath.formatMoney(item.precio_venta, 2)} / Und
                    </SText>
                </SView>

                {/* Controles de cantidad */}
                <SView col={"xs-3"} row center>
                    <SInput
                        value={String(item.stock)}
                        onChangeText={(text) => this.editarCantidadDirecta(item.key, text)}
                        keyboardType="numeric"
                        style={{
                            width: 40,
                            height: 24,
                            padding: 0,
                            textAlign: "center",
                            fontSize: 12,
                            borderWidth: 1,
                            borderColor: "#D1D5DB",
                            borderRadius: 4,
                            color: "black",
                        }}
                    />
                    <SView
                        center
                        backgroundColor={"#E0F2F7"}
                        style={{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            position: "absolute",
                            left: -32,
                        }}
                        onPress={() => this.reducirCantidad(item.key)}
                    >
                        <SText fontSize={14} bold color={"#0284C7"}>-</SText>
                    </SView>
                    <SView
                        center
                        backgroundColor={"#D1FAE5"}
                        style={{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            position: "absolute",
                            right: -32,
                        }}
                        onPress={() => this.aumentarCantidad(item.key)}
                    >
                        <SText fontSize={14} bold color={"#059669"}>+</SText>
                    </SView>
                </SView>

                {/* Subtotal */}
                <SView col={"xs-3"} center style={{ alignItems: "flex-end" }}>
                    <SText fontSize={13} bold color={"#111827"}>
                        Bs {SMath.formatMoney(item.precio_venta * item.stock, 2)}
                    </SText>
                </SView>

                {/* Eliminar */}
                <SView col={"xs-1"} center>
                    <SView
                        center
                        style={{ width: 24, height: 24 }}
                        onPress={() => this.quitarDelCarrito(item.key)}
                    >
                        <SIconApp name="eliminarI" width={10} height={10} fill={"#DC2626"} />
                    </SView>
                </SView>
            </SView>
        );
    };



    renderDetalleCarrito() {
        const { carrito } = this.state

        return (
            <SView
                backgroundColor={"#FFFFFF"}
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
                    style={{
                        width: "100%",
                        height: 400
                    }}
                    scrollEnabled={true}
                    data={this.state.carrito}
                    renderItem={({ item, index }) => this.renderItemCarrito(item)
                    }
                />

                {/* {carrito.map((item, index) => (
                    this.renderItemCarrito(item)
                ))} */}

                {/* Mensaje cuando el carrito está vacío */}
                {carrito.length === 0 && (
                    <SView center style={{ paddingVertical: 20 }}>
                        <SText fontSize={12} color={"#9CA3AF"}>
                            No hay productos en el carrito
                        </SText>
                    </SView>
                )}
            </SView>
        )
    }

    // Subtotal mejorado
    renderSubtotal() {
        const { carrito } = this.state
        const subtotal = carrito.reduce((sum, item) => sum + item.precio_venta * item.stock, 0)
        const taxes = subtotal * 0.13 // 13% de impuestos
        const total = subtotal + taxes

        return (
            <SView
                col={"xs-12"}
                backgroundColor={"#F8F9FA"}
                style={{
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 8,
                }}
            >
                <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 4 }}>
                    <SText fontSize={13} color={"#6B7280"}>
                        Total:
                    </SText>
                    <SText fontSize={16} bold color={"#111827"}>
                        Bs {SMath.formatMoney(total, 2)}
                    </SText>
                </SView>

                <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                    <SText fontSize={11} color={"#6B7280"}>
                        Impuesto:
                    </SText>
                    <SText fontSize={11} color={"#6B7280"}>
                        Sumar Iva13%  Bs {SMath.formatMoney(taxes, 2)}
                    </SText>
                </SView>
            </SView>
        )
    }

    // Puntos de lealtad mejorados
    renderPuntosLealtad() {
        return (
            <SView
                col={"xs-12"}
                backgroundColor={"#EBF8FF"}
                style={{
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: "#BFDBFE",
                }}
            >
                <SText fontSize={12} bold color={"#1E40AF"} center style={{ marginBottom: 8 }}>
                    Loyalty Points
                </SText>

                <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 4 }}>
                    <SText fontSize={11} color={"#374151"}>
                        Points Won
                    </SText>
                    <SText fontSize={11} bold color={"#059669"}>
                        +113
                    </SText>
                </SView>

                <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                    <SText fontSize={11} color={"#374151"}>
                        New Total
                    </SText>
                    <SText fontSize={11} bold color={"#111827"}>
                        3203
                    </SText>
                </SView>
            </SView>
        )
    }

    getStockDisponible(producto) {
        const itemEnCarrito = this.state.carrito.find(i => i.key === producto.key);
        const cantidadEnCarrito = itemEnCarrito?.stock || 0;
        return producto.stock - cantidadEnCarrito;
    }

    // Botones de configuración mejorados
    renderBotonesConfiguracion() {
        const botones = [
            { icon: "Reload", text: "Refund", color: "#EF4444" },
            { icon: "menuAll", text: "Customer Note", color: "#3B82F6" },
            { icon: "barcode", text: "Enter Code", color: "#8B5CF6" },
            { icon: "campana", text: "Reset Programs", color: "#F59E0B" },
            { icon: "tarealabel", text: "Reward", color: "#10B981" },
            { icon: "Engranaje", text: "Quotation/Order", color: "#6B7280" },
        ]

        return (
            <SView
                col={"xs-12"}
                backgroundColor={"#FFFFFF"}
                style={{
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 8,
                }}
            >
                <SView col={"xs-12"} row style={{ flexWrap: "wrap" }}>
                    {botones.map((boton, index) => (
                        <SView
                            key={index}
                            col={"xs-6"}
                            style={{
                                padding: 4,
                                marginBottom: 8,
                            }}
                            onPress={() => {
                                SNotification.send({
                                    title: "Acción",
                                    body: `${boton.text} seleccionado`,
                                    type: "success",
                                })
                            }}
                        >
                            <SView
                                center
                                row
                                backgroundColor={"#F9FAFB"}
                                style={{
                                    borderRadius: 6,
                                    padding: 8,
                                    borderWidth: 1,
                                    borderColor: "#E5E7EB",
                                }}
                            >
                                <SIconApp name={boton.icon} width={14} height={14} fill={boton.color} />
                                <SText fontSize={10} color={"#374151"} style={{ marginLeft: 4 }}>
                                    {boton.text}
                                </SText>
                            </SView>
                        </SView>
                    ))}
                </SView>
            </SView>
        )
    }



    // Teclado numérico mejorado
    renderTecladoNumerico() {
        const teclas = [
            ["1", "2", "3", "Qty"],
            ["4", "5", "6", "% Disc"],
            ["7", "8", "9", "Price"],
            ["+/-", "0", ".", "Payment"], // Cambiado "👁" a "Payment" para abrir el modal
        ]

        return (
            <SView
                col={"xs-12"}
                backgroundColor={"black"}
                style={{
                    borderRadius: 8,
                    padding: 16,
                }}
                row
            >
                {/* <SText fontSize={14} bold color={"white"} center style={{ marginBottom: 12 }}>
                    {this.state.calculatorDisplay}
                </SText> */}
                <SView col={"xs-12"} row>
                    {/* Columna izquierda */}
                    <SView col={"xs-4"}>
                        {/* Botón usuario */}
                        <SView
                            center
                            backgroundColor={"rgba(255,255,255,0.1)"}
                            style={{
                                height: 44,
                                borderRadius: 6,
                                margin: 4,
                                borderWidth: 1,
                                borderColor: "rgba(255,255,255,0.2)",
                            }}
                            onPress={() => console.log("usuario")}
                        >


                            {/* <SView
                                col={"xs-12"}
                                // backgroundColor={"#FFFFFF"}
                                style={{
                                    borderRadius: 8,
                                    padding: 16,
                                    marginBottom: 8,
                                    borderTopWidth: 1,
                                    // borderTopColor: "#E5E7EB",
                                }}
                            > */}
                            <SView row center>
                                <SView
                                    center
                                    backgroundColor={"#ab05ddff"}
                                    style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: 18,
                                        marginRight: 12,
                                    }}
                                >
                                    <SText fontSize={14} bold color={"white"}>AO</SText>
                                </SView>
                                <SView center>
                                    <SText center fontSize={14} bold color={"#111827"}>
                                        Anita Oliver
                                    </SText>
                                    <SText fontSize={11} color={"#6B7280"}>
                                        Cliente Vip
                                    </SText>
                                </SView>
                            </SView>
                        </SView>

                        {/* </SView> */}

                        {/* Botón pagar */}
                        <SView
                            center
                            flex
                            backgroundColor={"rgba(255,255,255,0.1)"}
                            style={{
                                // height: 44,
                                borderRadius: 6,
                                margin: 4,
                                borderWidth: 1,
                                borderColor: "rgba(255,255,255,0.2)",
                            }}
                            onPress={() =>
                                this.setState({ showPaymentModal: true })


                            }
                        >
                            <SText fontSize={12} bold color={"white"}>pagar</SText>
                        </SView>
                    </SView>

                    {/* Columna derecha con el teclado */}
                    <SView col={"xs-8"}>
                        {teclas.map((fila, filaIndex) => (
                            <SView key={filaIndex} row style={{ marginBottom: 8 }}>
                                {fila.map((tecla, teclaIndex) => (
                                    <SView
                                        key={teclaIndex}
                                        flex
                                        center
                                        backgroundColor={"rgba(255,255,255,0.1)"}
                                        style={{
                                            height: 44,
                                            borderRadius: 6,
                                            marginHorizontal: 2,
                                            borderWidth: 1,
                                            borderColor: "rgba(255,255,255,0.2)",
                                        }}
                                        onPress={() => {
                                            if (tecla === "Payment") {
                                                this.setState({ showPaymentModal: true });
                                            } else {
                                                this.handleCalculatorPress(tecla);
                                            }
                                        }}
                                    >
                                        <SText fontSize={12} bold color={"white"}>{tecla}</SText>
                                    </SView>
                                ))}
                            </SView>
                        ))}
                    </SView>
                </SView>

            </SView>
        )
    }

    // Productos mejorados
    renderProductos() {

        const categorias = this.tipomodelos || [];
        const modelos = this.modelos || [];

        const { searchText, selectedCategory } = this.state

        const productosFiltrados = productosComputacion.filter((item) => {
            // const productosFiltrados = modelos.filter((item) => {
            const matchesSearch = item.descripcion.toLowerCase().includes(searchText.toLowerCase())
            const matchesCategory = selectedCategory === "all" || item.key_tipo_producto === selectedCategory
            return matchesSearch && matchesCategory
        })
        const columnas = 5;
        const colSize = parseFloat((12 / (columnas + 1)).toFixed(2)); // por ejemplo: 12 / 6 = 2.0

        return (
            <SView col={"xs-12"} style={{ padding: 20 }}>

                {/* Selector de Categorías */}
                <SView col={"xs-12"} row style={{ marginBottom: 20, justifyContent: "center" }}>
                    {categorias.map((cat) => (
                        <SView
                            key={cat.key}
                            center
                            style={{
                                paddingVertical: 8,
                                paddingHorizontal: 16,
                                borderRadius: 20,
                                marginHorizontal: 4,
                                backgroundColor: selectedCategory === cat.key ? STheme.color.primary : STheme.color.card,
                                borderWidth: 1,
                                borderColor: selectedCategory === cat.key ? STheme.color.primary : STheme.color.gray,
                            }}
                            onPress={() => this.setState({ selectedCategory: cat.key })}
                        >
                            <SText fontSize={12} color={selectedCategory === cat.key ? STheme.color.white : "black"}>
                                {cat.label}
                            </SText>
                        </SView>
                    ))}
                </SView>

                <SText fontSize={20} bold color={"#111827"} style={{ marginBottom: 20 }}>
                    {categorias.find((c) => c.key === selectedCategory)?.label || "Productos"}
                </SText>

                <SView col={"xs-12"} row style={{ flexWrap: "wrap" }}>
                    {productosFiltrados.length > 0 ? (
                        productosFiltrados.map((producto, index) => (
                            <SView
                                key={index}
                                col={`xs-${colSize}`} // 👈 dinámico
                                backgroundColor={"#FFFFFF"}
                                style={{
                                    margin: 4,
                                    borderRadius: 12,
                                    padding: 12,
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 8,
                                    elevation: 3,
                                    borderWidth: 1,
                                    borderColor: "#F3F4F6",
                                }}
                                onPress={() => {
                                    this.agregarAlCarrito(producto)
                                }}
                            >
                                <SView center style={{ marginBottom: 12 }}>
                                    <SImage
                                        src={producto.image}
                                        // src={SSocket.api.inventario + "modelo/.128_" + producto.key + "?date=" + this.state.time}
                                        style={{
                                            width: 120,
                                            height: 120,
                                            borderRadius: 8,
                                            backgroundColor: "#F9FAFB",
                                            // overflow: "hidden",
                                        }}
                                        resizeMode="cover"
                                    />
                                </SView>

                                <SView>
                                    <SText
                                        fontSize={12}
                                        bold
                                        color={"#111827"}
                                        style={{
                                            marginBottom: 6,
                                            lineHeight: 16,
                                            textAlign: "center",
                                        }}
                                    >
                                        {producto.descripcion}
                                    </SText>

                                    <SText fontSize={14} bold color={"#714B67"} center> Bs {SMath.formatMoney(producto.precio_venta, 2)} </SText>


                                    <SText
                                        fontSize={10}
                                        color={this.getStockDisponible(producto) > 0 ? "#10B981" : "#EF4444"}
                                        center
                                        style={{ marginTop: 4 }}
                                    >
                                        Disponible: {this.getStockDisponible(producto)} und
                                    </SText>
                                    {/* <SText fontSize={10} color={this.state.carrito.stock > 0 ? "#10B981" : "red"} center style={{ marginTop: 4 }}>
                                        Stock: {producto.stock - (this.state.carrito.find(i => i.key === producto.key)?.stock || 0)}
                                    </SText> */}


                                    {/* <SText fontSize={10} color={"#10B981"} center style={{ marginTop: 4 }}>
                                        Stock: {producto.stock}
                                    </SText> */}
                                </SView>
                            </SView>
                        ))
                    ) : (
                        <SView col={"xs-12"} center style={{ paddingVertical: 50 }}>
                            <SText fontSize={16} color={STheme.color.gray}>
                                No se encontraron productos en esta categoría o búsqueda.
                            </SText>
                        </SView>
                    )}
                </SView>
            </SView>
        )
    }

    // Funciones auxiliares

    agregarAlCarrito = (producto) => {
        this.setState({ loading: true });

        setTimeout(() => {
            const stockDisponible = this.getStockDisponible(producto);

            if (stockDisponible <= 0) {
                SNotification.send({
                    title: "Sin stock disponible",
                    body: "No puedes agregar más unidades de este producto.",
                    type: "warning",
                });
                this.setState({ loading: false });
                return;
            }

            const { carrito } = this.state;
            const productoExistente = carrito.find((item) => item.key === producto.key);

            if (productoExistente) {
                const nuevoCarrito = carrito.map((item) =>
                    item.key === producto.key ? { ...item, stock: item.stock + 1 } : item
                );
                this.setState({ carrito: nuevoCarrito });
            } else {
                const nuevoCarrito = [
                    ...carrito,
                    {
                        key: producto.key,
                        descripcion: producto.descripcion,
                        precio_venta: producto.precio_venta,
                        stock: 1,
                    },
                ];
                this.setState({ carrito: nuevoCarrito });
            }

            SNotification.send({
                title: "Producto agregado",
                body: `${producto.descripcion} agregado al carrito`,
                type: "success",
            });

            this.setState({ loading: false });
        }, 300);
    };


    handleCalculatorPress = (tecla) => {
        const { calculatorDisplay } = this.state

        if (tecla === "Qty" || tecla === "% Disc" || tecla === "Price") {
            SNotification.send({
                title: "Función no implementada",
                body: `La función '${tecla}' aún no está disponible.`,
                type: "info",
            })
            return
        }

        if (tecla === "Payment") {
            this.setState({ showPaymentModal: true })
            return
        }

        if (tecla === "+/-") {
            const nuevoDisplay = calculatorDisplay.startsWith("-") ? calculatorDisplay.substring(1) : "-" + calculatorDisplay
            this.setState({ calculatorDisplay: nuevoDisplay })
            return
        }

        if (tecla === ".") {
            if (calculatorDisplay.includes(".")) return // Evitar múltiples puntos
        }

        const nuevoDisplay = calculatorDisplay === "0" || calculatorDisplay === "" ? tecla : calculatorDisplay + tecla
        this.setState({ calculatorDisplay: nuevoDisplay })
    }



    renderPaymentModal() {
        const { carrito, amountReceived, showPaymentModal } = this.state;

        if (!showPaymentModal) return null;

        const subtotal = carrito.reduce((sum, item) => sum + item.precio_venta * item.stock, 0);
        const taxRate = 0.13;
        const taxes = subtotal * taxRate;
        const total = subtotal + taxes;

        const montoRecibido = parseFloat(amountReceived);
        const change = isNaN(montoRecibido) ? 0 : montoRecibido - total;

        const handleConfirmarPago = () => {
            if (change >= 0) {
                SNotification.send({
                    title: "Pago Exitoso",
                    body: `Cambio: Bs ${SMath.formatMoney(change, 2)}`,
                    type: "success",
                });

                console.log("🧾 Pago confirmado. Total:", total);
                console.log("🛒 Carrito guardado:", JSON.stringify(carrito, null, 2));

                this.setState({
                    carrito: [],
                    showPaymentModal: false,
                    amountReceived: "",
                });
            } else {
                SNotification.send({
                    title: "Monto insuficiente",
                    body: "El monto recibido es menor al total a pagar.",
                    type: "danger",
                });
            }
        };

        return (
            <SView
                col={"xs-12"}
                height={"100%"}
                center
                style={{
                    position: "absolute",
                    backgroundColor: "rgba(0,0,0,0.6)",
                    zIndex: 1000,
                }}
            >
                <SView
                    width={400}
                    height={460}
                    backgroundColor={STheme.color.background}
                    style={{
                        borderRadius: 12,
                        padding: 24,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                        elevation: 6,
                    }}
                >
                    <SText fontSize={20} bold center style={{ marginBottom: 24 }}>
                        💰 Confirmar Pago
                    </SText>

                    {/* Total a pagar */}
                    <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 12 }}>
                        <SText fontSize={16} color={STheme.color.text}>Total a Pagar:</SText>
                        <SText fontSize={18} bold color={STheme.color.warning}>Bs {SMath.formatMoney(total, 2)}</SText>
                    </SView>

                    {/* Monto recibido */}
                    <SView col={"xs-12"} style={{ marginBottom: 20 }}>
                        <SText fontSize={14} color={STheme.color.text}>Monto Recibido:</SText>
                        <SInput
                            value={amountReceived}
                            onChangeText={(text) => this.setState({ amountReceived: text })}
                            keyboardType="numeric"
                            placeholder="Ej. 100.00"
                            style={{
                                height: 48,
                                fontSize: 20,
                                textAlign: "center",
                                borderWidth: 1,
                                borderColor: STheme.color.card,
                                borderRadius: 8,
                                marginTop: 8,
                                color: STheme.color.text,
                            }}
                        />
                    </SView>

                    {/* Cambio */}
                    <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 20 }}>
                        <SText fontSize={16} color={STheme.color.text}>Cambio:</SText>
                        <SText fontSize={18} bold color={change >= 0 ? STheme.color.success : STheme.color.danger}>
                            Bs {SMath.formatMoney(change, 2)}
                        </SText>
                    </SView>

                    {/* Botones */}
                    <SView col={"xs-12"} row style={{ justifyContent: "space-around" }}>
                        <SButtom
                            onPress={() => this.setState({ showPaymentModal: false, amountReceived: "" })}
                            style={{
                                backgroundColor: STheme.color.gray,
                                paddingVertical: 12,
                                paddingHorizontal: 24,
                                borderRadius: 8,
                            }}
                        >
                            <SText color={STheme.color.text}>Cancelar</SText>
                        </SButtom>

                        <SButtom
                            onPress={handleConfirmarPago}
                            style={{
                                backgroundColor: STheme.color.primary,
                                paddingVertical: 12,
                                paddingHorizontal: 24,
                                borderRadius: 8,
                            }}
                        >
                            <SText color={STheme.color.white}>Confirmar Pago</SText>
                        </SButtom>
                    </SView>
                </SView>
            </SView>
        );
    }


    render() {
        return (
            <SPage disableScroll>
                {this.renderHeader()}
                <SView flex row backgroundColor={"#F8F9FA"}>
                    {/* Sidebar */}
                    <SView col={"xs-4"} flex backgroundColor={"#F8F9FA"}
                        style={{
                            padding: 16,
                            borderRightWidth: 1,
                            borderRightColor: "#E5E7EB",
                        }}
                    >
                        {this.renderDetalleCarrito()}
                        {this.renderSubtotal()}
                        {this.renderTecladoNumerico()}
                    </SView>

                    {/* Área de productos */}
                    <SView col={"xs-8"} backgroundColor={"#F8F9FA"}>
                        {this.renderProductos()}
                        {/* <SView style={{ flex: 1, overflow: "scroll" }}>{this.renderProductos()}</SView> */}
                    </SView>
                </SView>

                {this.renderPaymentModal()}
                {this.state.loading && <SLoad />}
            </SPage>
        )
    }

    quitarDelCarrito = (productoId) => {
        const { carrito } = this.state
        const nuevoCarrito = carrito.filter((item) => item.key !== productoId)
        this.setState({ carrito: nuevoCarrito })
    }

    reducirCantidad = (productoId) => {
        const { carrito } = this.state
        const nuevoCarrito = carrito.map((item) =>
            item.key === productoId ? { ...item, stock: Math.max(1, item.stock - 1) } : item,
        ) // Evita cantidades negativas

        console.log(" reducirCantidad " + JSON.stringify(nuevoCarrito))

        this.setState({ carrito: nuevoCarrito })
    }
}
