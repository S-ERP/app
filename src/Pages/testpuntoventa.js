import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SButtom, SDate, SDatePicker, SHr, SImage, SInput, SLoad, SMath, SNavigation, SNotification, SPage, SSPiner, SText, STheme, SThread, SUuid, SView } from 'servisofts-component';
// import STextPlay from '../Components/STextPlay';
// import Container from '../Components/Container';
// import SMD from '../SMD';
import MDtest1 from '../SMD/MDtest1';
// import MDtest2 from '../SMD/MDtest2';
// import SwipeableView from '../Components/SwipeableView';
// import Loby from "./loby/root"
// import Publicaciones from "./publicacion/root"
// import Menu from './menu';
import MenuDragable from '../Components/MenuDragable';
import Model from '../Model';
// import MultipageMenu from '../Components/MultipageMenu';
import SSocket from 'servisofts-socket';
import DataBase from '../DataBase';
import SIconApp from '../Assets/SIconApp';
// import { Trigger } from 'servisofts-db';
// import { Image } from 'react-native';



const productosComputacion = [
    {
        id: 1,
        name: "Corner Desk Left Sit",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
        price: 97.75,
        currency: "$",
        category: "desks",
        stock: 15,
        description: "Escritorio esquinero izquierdo ergonómico",
    },
    {
        id: 2,
        name: "Corner Desk Right Sit",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
        price: 169.05,
        currency: "$",
        category: "desks",
        stock: 12,
        description: "Escritorio esquinero derecho ergonómico",
    },
    {
        id: 3,
        name: "Customizable Desk (Custom, White)",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
        price: 920.46,
        currency: "$",
        category: "desks",
        stock: 8,
        description: "Escritorio personalizable blanco",
    },
    {
        id: 4,
        name: "Customizable Desk (Custom, Black)",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
        price: 862.5,
        currency: "$",
        category: "desks",
        stock: 10,
        description: "Escritorio personalizable negro",
    },
    {
        id: 5,
        name: "Customizable Desk (Custom, Wood)",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
        price: 862.5,
        currency: "$",
        category: "desks",
        stock: 6,
        description: "Escritorio personalizable madera",
    },
    {
        id: 6,
        name: "Customizable Desk (Steel, Black)",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
        price: 862.5,
        currency: "$",
        category: "desks",
        stock: 14,
        description: "Escritorio acero negro",
    },
    {
        id: 7,
        name: "Customizable Desk (Steel, White)",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
        price: 862.5,
        currency: "$",
        category: "desks",
        stock: 9,
        description: "Escritorio acero blanco",
    },
    {
        id: 8,
        name: "Desk Combination",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
        price: 517.5,
        currency: "$",
        category: "desks",
        stock: 11,
        description: "Combinación de escritorio modular",
    },
    {
        id: 9,
        name: "Four Person Desk",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
        price: 2702.5,
        currency: "$",
        category: "desks",
        stock: 3,
        description: "Escritorio para cuatro personas",
    },
    {
        id: 10,
        name: "Large Desk",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
        price: 2068.85,
        currency: "$",
        category: "desks",
        stock: 5,
        description: "Escritorio grande ejecutivo",
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
                { id: 1, name: "Large Cabinet", price: 368.0, quantity: 1 },
                { id: 2, name: "Storage Box", price: 18.17, quantity: 1 },
                { id: 3, name: "Letter Tray", price: 5.52, quantity: 1 },
            ],
            searchText: "",
            selectedCategory: "all",
            calculatorDisplay: "0",
            showPaymentModal: false,
            amountReceived: "",
            loading: false,
        }
    }

    aumentarCantidad = (productoId) => {
        const { carrito } = this.state
        const nuevoCarrito = carrito.map((item) =>
            item.id === productoId ? { ...item, quantity: item.quantity + 1 } : item,
        )
        this.setState({ carrito: nuevoCarrito })
    }

    // Para editar la cantidad directamente (requiere un SInput en el render)
    editarCantidadDirecta = (productoId, newQuantity) => {
        const quantity = Number.parseInt(newQuantity)
        if (isNaN(quantity) || quantity < 0) return // Validar entrada

        const { carrito } = this.state
        let nuevoCarrito
        if (quantity === 0) {
            nuevoCarrito = carrito.filter((item) => item.id !== productoId)
        } else {
            nuevoCarrito = carrito.map((item) => (item.id === productoId ? { ...item, quantity: quantity } : item))
        }
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
                    <SText fontSize={24} bold color={"#714B67"} style={{ letterSpacing: -0.5 }}>
                        odoo
                    </SText>
                </SView>

                {/* Breadcrumb */}
                <SView col={"xs-3"} row center>
                    <SIconApp name="home" width={16} height={16} fill={"#6B7280"} />
                    <SText fontSize={12} color={"#6B7280"} style={{ marginHorizontal: 8 }}>
                        {">"} Desks
                    </SText>
                </SView>

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
                        backgroundColor={"#714B67"}
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            marginRight: 8,
                        }}
                    >
                        <SText fontSize={12} bold color={"white"}>
                            MA
                        </SText>
                    </SView>
                    <SText fontSize={14} color={"#374151"}>
                        Mitchell Admin
                    </SText>
                    <SView style={{ marginLeft: 16 }}>
                        <SIconApp name="wifi" width={20} height={20} fill={"#6B7280"} />
                    </SView>
                </SView>
            </SView>
        )
    }

    // Detalle del carrito mejorado
    renderDetalleCarrito() {
        const { carrito } = this.state

        return (
            <SView
                col={"xs-12"}
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
                <SText fontSize={14} bold color={"#374151"} style={{ marginBottom: 12 }}>
                    Orden Actual
                </SText>

                {carrito.map((item, index) => (
                    <SView
                        key={index}
                        col={"xs-12"}
                        row
                        style={{
                            paddingVertical: 8,
                            borderBottomWidth: index < carrito.length - 1 ? 1 : 0,
                            borderBottomColor: "#F3F4F6",
                            alignItems: "center", // Centrar verticalmente los items
                        }}
                    >
                        <SView col={"xs-5"}>
                            {/* Reducir ancho para hacer espacio a los controles */}
                            <SText fontSize={13} bold color={"#111827"}>
                                {item.name}
                            </SText>
                            <SText fontSize={11} color={"#6B7280"}>
                                ${SMath.formatMoney(item.price, 2)} / Und
                            </SText>
                        </SView>

                        {/* Controles de Cantidad */}
                        <SView col={"xs-3"} row center>
                            <SView
                                center
                                backgroundColor={"#E0F2F7"} // Color más suave
                                style={{ width: 24, height: 24, borderRadius: 12, marginRight: 4 }}
                                onPress={() => this.reducirCantidad(item.id)}
                            >
                                <SText fontSize={14} bold color={"#0284C7"}>
                                    -
                                </SText>
                            </SView>
                            <SInput
                                value={String(item.quantity)}
                                onChangeText={(text) => this.editarCantidadDirecta(item.id, text)}
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
                                    color: STheme.color.text,
                                }}
                            />
                            <SView
                                center
                                backgroundColor={"#D1FAE5"} // Color más suave
                                style={{ width: 24, height: 24, borderRadius: 12, marginLeft: 4 }}
                                onPress={() => this.aumentarCantidad(item.id)}
                            >
                                <SText fontSize={14} bold color={"#059669"}>
                                    +
                                </SText>
                            </SView>
                        </SView>

                        <SView col={"xs-3"} center style={{ alignItems: "flex-end" }}>
                            <SText fontSize={13} bold color={"#111827"}>
                                $ {SMath.formatMoney(item.price * item.quantity, 2)}
                            </SText>
                        </SView>

                        {/* Botón Eliminar */}
                        <SView col={"xs-1"} center>
                            <SView
                                center
                                backgroundColor={"#FEE2E2"}
                                style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 12,
                                }}
                                onPress={() => this.quitarDelCarrito(item.id)}
                            >
                                <SIconApp name="close" width={10} height={10} fill={"#DC2626"} />
                            </SView>
                        </SView>
                    </SView>
                ))}

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
        const subtotal = carrito.reduce((sum, item) => sum + item.price * item.quantity, 0)
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
                        $ {SMath.formatMoney(total, 2)}
                    </SText>
                </SView>

                <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                    <SText fontSize={11} color={"#6B7280"}>
                        Taxes:
                    </SText>
                    <SText fontSize={11} color={"#6B7280"}>
                        $ {SMath.formatMoney(taxes, 2)}
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

    // Usuario actual mejorado
    renderUsuarioActual() {
        return (
            <SView
                col={"xs-12"}
                backgroundColor={"#FFFFFF"}
                style={{
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 8,
                    borderTopWidth: 1,
                    borderTopColor: "#E5E7EB",
                }}
            >
                <SView row center>
                    <SView
                        center
                        backgroundColor={"#10B981"}
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            marginRight: 12,
                        }}
                    >
                        <SText fontSize={14} bold color={"white"}>
                            AO
                        </SText>
                    </SView>
                    <SView>
                        <SText fontSize={14} bold color={"#111827"}>
                            Anita Oliver
                        </SText>
                        <SText fontSize={11} color={"#6B7280"}>
                            Cliente Premium
                        </SText>
                    </SView>
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
                backgroundColor={"#714B67"}
                style={{
                    borderRadius: 8,
                    padding: 16,
                }}
            >
                <SText fontSize={14} bold color={"white"} center style={{ marginBottom: 12 }}>
                    {this.state.calculatorDisplay} {/* Muestra el valor del teclado */}
                </SText>

                {teclas.map((fila, filaIndex) => (
                    <SView key={filaIndex} col={"xs-12"} row style={{ marginBottom: 8 }}>
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
                                        this.setState({ showPaymentModal: true })
                                    } else {
                                        this.handleCalculatorPress(tecla)
                                    }
                                }}
                            >
                                <SText fontSize={12} bold color={"white"}>
                                    {tecla}
                                </SText>
                            </SView>
                        ))}
                    </SView>
                ))}
            </SView>
        )
    }

    // Productos mejorados
    renderProductos() {
        const { searchText, selectedCategory } = this.state

        const productosFiltrados = productosComputacion.filter((producto) => {
            const matchesSearch = producto.name.toLowerCase().includes(searchText.toLowerCase())
            const matchesCategory = selectedCategory === "all" || producto.category === selectedCategory
            return matchesSearch && matchesCategory
        })

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
                            <SText fontSize={12} color={selectedCategory === cat.key ? STheme.color.white : STheme.color.text}>
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
                                col={"xs-2.4"}
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
                                        style={{
                                            width: 120,
                                            height: 120,
                                            borderRadius: 8,
                                            backgroundColor: "#F9FAFB",
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
                                        {producto.name}
                                    </SText>

                                    <SText fontSize={14} bold color={"#714B67"} center>
                                        $ {SMath.formatMoney(producto.price, 2)}
                                    </SText>

                                    <SText fontSize={10} color={"#10B981"} center style={{ marginTop: 4 }}>
                                        Stock: {producto.stock}
                                    </SText>
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
        this.setState({ loading: true })

        // Simular una operación asíncrona
        setTimeout(() => {
            const { carrito } = this.state
            const productoExistente = carrito.find((item) => item.id === producto.id)

            if (productoExistente) {
                const nuevoCarrito = carrito.map((item) =>
                    item.id === producto.id ? { ...item, quantity: item.quantity + 1 } : item,
                )
                this.setState({ carrito: nuevoCarrito })
            } else {
                const nuevoCarrito = [
                    ...carrito,
                    {
                        id: producto.id,
                        name: producto.name,
                        price: producto.price,
                        quantity: 1,
                    },
                ]
                this.setState({ carrito: nuevoCarrito })
            }

            SNotification.send({
                title: "Producto agregado",
                body: `${producto.name} agregado al carrito`,
                type: "success",
            })
            this.setState({ loading: false })
        }, 300)
    }

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
        const { carrito, amountReceived } = this.state
        const subtotal = carrito.reduce((sum, item) => sum + item.price * item.quantity, 0)
        const taxes = subtotal * 0.13
        const total = subtotal + taxes
        const change = Number.parseFloat(amountReceived) - total

        if (!this.state.showPaymentModal) return null

        return (
            <SView
                col={"xs-12"}
                height={"100%"}
                style={{
                    position: "absolute",
                    backgroundColor: "rgba(0,0,0,0.6)",
                    zIndex: 1000,
                }}
                center
            >
                <SView
                    width={400}
                    height={450}
                    backgroundColor={STheme.color.background}
                    style={{ borderRadius: 12, padding: 24 }}
                >
                    <SText fontSize={20} bold center style={{ marginBottom: 20 }}>
                        Realizar Pago
                    </SText>

                    <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 12 }}>
                        <SText fontSize={16} color={STheme.color.text}>
                            Total a Pagar:
                        </SText>
                        <SText fontSize={18} bold color={STheme.color.primary}>
                            $ {SMath.formatMoney(total, 2)}
                        </SText>
                    </SView>

                    <SView col={"xs-12"} style={{ marginBottom: 20 }}>
                        <SText fontSize={14} color={STheme.color.text}>
                            Monto Recibido:
                        </SText>
                        <SInput
                            value={amountReceived}
                            onChangeText={(text) => this.setState({ amountReceived: text })}
                            keyboardType="numeric"
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

                    <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 20 }}>
                        <SText fontSize={16} color={STheme.color.text}>
                            Cambio:
                        </SText>
                        <SText fontSize={18} bold color={change >= 0 ? STheme.color.success : STheme.color.danger}>
                            $ {SMath.formatMoney(change, 2)}
                        </SText>
                    </SView>

                    <SView col={"xs-12"} row style={{ justifyContent: "space-around", marginTop: "auto" }}>
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
                            onPress={() => {
                                if (change >= 0) {
                                    SNotification.send({
                                        title: "Pago Exitoso",
                                        body: `Cambio: $${SMath.formatMoney(change, 2)}`,
                                        type: "success",
                                    })
                                    this.setState({ carrito: [], showPaymentModal: false, amountReceived: "" })
                                } else {
                                    SNotification.send({
                                        title: "Monto Insuficiente",
                                        body: "El monto recibido es menor al total.",
                                        type: "danger",
                                    })
                                }
                            }}
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
        )
    }

    render() {
        return (
            <SPage disableScroll>
                {/* Header */}
                {this.renderHeader()}

                {/* Main Content */}
                <SView flex row backgroundColor={"#F8F9FA"}>
                    {/* Sidebar */}
                    <SView
                        col={"xs-4"}
                        backgroundColor={"#F8F9FA"}
                        style={{
                            padding: 16,
                            borderRightWidth: 1,
                            borderRightColor: "#E5E7EB",
                        }}
                    >
                        {/* Carrito */}
                        <SView style={{ flex: 1 }}>
                            {this.renderDetalleCarrito()}
                            {this.renderSubtotal()}
                            {this.renderPuntosLealtad()}
                            {this.renderBotonesConfiguracion()}
                            {this.renderUsuarioActual()}
                        </SView>

                        {/* Teclado */}
                        {this.renderTecladoNumerico()}
                    </SView>

                    {/* Área de productos */}
                    <SView col={"xs-8"} backgroundColor={"#F8F9FA"}>
                        <SView style={{ flex: 1, overflow: "scroll" }}>{this.renderProductos()}</SView>
                    </SView>
                </SView>

                {/* Modal de Pago */}
                {this.renderPaymentModal()}

                {/* Indicador de Carga */}
                {this.state.loading && <SLoad />}
            </SPage>
        )
    }

    quitarDelCarrito = (productoId) => {
        const { carrito } = this.state
        const nuevoCarrito = carrito.filter((item) => item.id !== productoId)
        this.setState({ carrito: nuevoCarrito })
    }

    reducirCantidad = (productoId) => {
        const { carrito } = this.state
        const nuevoCarrito = carrito.map((item) =>
            item.id === productoId ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item,
        ) // Evita cantidades negativas
        this.setState({ carrito: nuevoCarrito })
    }
}
