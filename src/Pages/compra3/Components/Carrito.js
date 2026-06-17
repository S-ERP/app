import React, { Component } from 'react';
import { FlatList } from 'react-native';
import { SHr, SImage, SText, STheme, SView, SInput, SScrollView2, SNotification, } from 'servisofts-component';
import SIconApp from '../../../Assets/SIconApp';
import CarritoItem from './Carrito/CarritoItem';
import ResumenTotales from './Carrito/ResumenTotales';
import MDL from '../../../MDL';
import FotoCliente from './Foto/FotoCliente';
import PButtom from '../../../Components/PButtom';
import Root from '../root';
import SelectTipoPagoVenta from '../../caja2/components/SelectTipoPagoVenta';
// import SelectTipoPago from '../../caja2/components/SelectTipoPagoVenta';

export default class Carrito extends Component {
    carrito = [];
    descuentoManual = "";
    conFactura = false;
    cliente = {};

    ajustarCarrito = () => {
        if (!this.props.conStock) return;

        this.carrito = this.carrito.filter((item) => {
            if (!item.stock || item.stock <= 0) {
                SNotification.send({
                    title: "CARRITO Producto sin stock",
                    body: `${item.descripcion} fue eliminado del carrito porque no tiene stock.`,
                    color: STheme.color.danger,
                    time: 3000,
                });
                return false;
            }

            if (item.cantidad > item.stock) {
                item.cantidad = item.stock;
                SNotification.send({
                    title: "CARRITO Stock ajustado",
                    body: `La cantidad de ${item.descripcion} se ajustó al stock disponible (${item.stock}).`,
                    color: STheme.color.warning,
                    time: 3000,
                });
            }
            return true;
        });

        this.forceUpdate();
    };

    componentDidMount() {
        this.loadData();
        this.evento = MDL.compra_venta.addEventListener("venta_realizada", () => {
            this.vaciarCarrito();
            this.forceUpdate();
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.selectedMoneda !== this.props.selectedMoneda) {
            this.carrito = this.carrito.map((item) => ({
                ...item,
                precio_compra_moneda: this.props.selectedMoneda
                    ? item.precio_compra / (this.props.selectedMoneda.tipo_cambio || 1)
                    : item.precio_compra,
                monedaSymbol: this.props.selectedMoneda ? this.props.selectedMoneda.observacion : "Bs",
            }));
            this.forceUpdate();
        }
        if (prevProps.conStock !== this.props.conStock) {
            this.ajustarCarrito(); // Ajustar carrito si conStock cambia
            this.forceUpdate();
        }
    }

    componentWillUnmount() {
        if (this.evento) {
            MDL.compra_venta.removeEventListener(this.evento);
        }
    }

    async loadData() {
        const enviroments = await MDL.contabilidad.getEnviroment();
        this._enviromentsIva = parseFloat(enviroments?.IVA?.observacion) / 100;
        this._numeroIva = parseInt(enviroments?.IVA?.observacion);
        const activa = await MDL.caja.getActiva();
        this._key_sucursal = activa?.key_sucursal;
        this._key_cajero = activa?.key_usuario;
        this.forceUpdate();
    }

    setCarrito(nuevoCarrito) {
        console.log("🎨🎨🎨🎨🎨🎨setCarrito", nuevoCarrito);
        this.carrito = Array.isArray(nuevoCarrito)
            ? nuevoCarrito.map(item => ({
                ...item,
                precio_compra_original: item.precio_compra, // Store original price
                precio_compra: this.props.selectedMoneda
                    ? item.precio_compra / (this.props.selectedMoneda.tipo_cambio || 1)
                    : item.precio_compra,
                monedaSymbol: this.props.selectedMoneda ? this.props.selectedMoneda.observacion : 'Bs',
            }))
            : [];
        this.forceUpdate();
    }

    addProducto2 = (producto) => {
        MDL.carrito.agregarItemAlCarritoDeCompras({
            modelo: producto,
            cantidad: 1,
            precio: producto.precio_compra
        })
    }

    addProducto = (producto) => {
        console.log("🎪🎪🎪 addProducto", producto);
        const index = this.carrito.findIndex((p) => p.key === producto.key);
        if (index >= 0) {
            const item = this.carrito[index];
            if (this.props.conStock) {
                if (item.cantidad < item.stock) {
                    item.cantidad += 1;
                } else {
                    SNotification.send({
                        title: "CARRITO Stock insuficiente",
                        body: `No hay suficiente stock para ${producto.descripcion}. Stock máximo permitido: ${item.stock} unidades.`,
                        color: STheme.color.danger,
                        time: 3000,
                    });
                    return;
                }
            } else {
                item.cantidad += 1;
            }
            console.log("SIII")
        } else {
            if (this.props.conStock && (!producto.stock || producto.stock <= 0)) {
                SNotification.send({
                    title: "CARRITO Sin stock",
                    body: `No hay stock disponible para ${producto.descripcion}.`,
                    color: STheme.color.danger,
                    time: 3000,
                });
                return;
            }
            this.carrito.push({
                ...producto,
                cantidad: 1,
                precio_compra: producto.precio_compra,
                precio_compra_moneda: producto.precio_compra_moneda || (this.props.selectedMoneda
                    ? producto.precio_compra / (this.props.selectedMoneda.tipo_cambio || 1)
                    : producto.precio_compra),
                monedaSymbol: this.props.selectedMoneda ? this.props.selectedMoneda.observacion : "Bs",
            });
            this.forceUpdate();
            console.log("NOOO")
        }
        this.getCarritoItemCount();
        this.forceUpdate();
    };

    aumentarCantidad = (producto) => {
        const index = this.carrito.findIndex((p) => p.key === producto.key);
        if (index < 0) return;
        const item = this.carrito[index];
        if (this.props.conStock) {
            if (item.cantidad < item.stock) {
                item.cantidad += 1;
                this.forceUpdate();
            } else {
                SNotification.send({
                    title: "CARRITO Stock insuficiente",
                    body: `No hay suficiente stock para ${producto.descripcion}. Stock máximo permitido: ${item.stock} unidades.`,
                    color: STheme.color.danger,
                    time: 3000,
                });
            }
        } else {
            item.cantidad += 1;
            this.forceUpdate();
        }
    };

    disminuirCantidad = (producto) => {
        const index = this.carrito.findIndex((p) => p.key === producto.key);
        if (index < 0) return;
        const item = this.carrito[index];
        item.cantidad -= 1;
        if (item.cantidad <= 0) {
            this.carrito.splice(index, 1);
            SNotification.send({
                title: "Producto eliminado",
                body: `${item.descripcion} fue eliminado del carrito porque su cantidad llegó a 0.`,
                color: STheme.color.warning,
                time: 2000,
            });
        }
        this.forceUpdate();
    };

    eliminarItem = (producto) => {
        const index = this.carrito.findIndex((p) => p.key === producto.key);
        if (index >= 0) {
            this.carrito.splice(index, 1);
            this.forceUpdate();
        }
    };

    vaciarCarrito = () => {
        this.carrito = [];
        this.descuentoManual = "";
        this.conFactura = false;
        this.cliente = {};
        this.props.onModificarStock?.(null, 0);
        this.carritoRefModal?.setCarrito?.([]);
        MDL.compra_venta.updateCarritoItems(0)
        this.forceUpdate();
    };

    calcularSubtotal = () => this.carrito.reduce((t, i) => t + i.precio_compra * i.cantidad, 0);
    calcularSubtotalMoneda = () => this.carrito.reduce((t, i) => t + i.precio_compra_moneda * i.cantidad, 0);

    calcularTotalConIVA = (subtotal) => {
        if (!this._enviromentsIva) return subtotal;
        if (this.conFactura) {
            return subtotal * (1 + this._enviromentsIva);
        }
        return subtotal;
    };

    calcularIVA = (subtotal) => {
        if (!this._enviromentsIva) return 0;
        return subtotal * this._enviromentsIva;
    };

    calcularTotalConDescuento = (total) => total - parseFloat(this.descuentoManual || "0");

    renderItemCarrito = ({ item }) => (
        console.log("item", item),
        <CarritoItem
            item={item}
            onAumentar={() => this.aumentarCantidad(item)}
            onDisminuir={() => this.disminuirCantidad(item)}
            onEliminar={() => this.eliminarItem(item)}
            selectedMoneda={this.props.selectedMoneda}
        />
    );

    getCarritoItems() {
        return this.carrito;
    }

    getCarritoItemCount() {
        const cant = this.carrito.reduce((total, item) => total + item.cantidad, 0);
        MDL.compra_venta.updateCarritoItems(cant)
        return cant;
    }

    renderCarrito = () => {
        const subtotal = this.calcularSubtotal();
        const subtotalMoneda = this.calcularSubtotalMoneda();
        const totalConIVA = this.calcularTotalConIVA(subtotalMoneda);
        const totalImpuesto = this.calcularIVA(subtotalMoneda);
        const totalDescuento = this.descuentoManual || 0;
        const totalFinal = this.calcularTotalConDescuento(totalConIVA);
        const monedaSymbol = this.carrito.length > 0 ? this.carrito[0].monedaSymbol || "Bs" : "Bs";
        console.log("CARRITO: ", this.carrito)
        return (
            <>
                {subtotal <= 0 ? (
                    <SView
                        flex
                        center
                        style={{
                            shadowColor: STheme.color.card,
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 2,
                            elevation: 1,
                            minHeight: 250,
                        }}
                    >
                        <SView row center>
                            <SIconApp name="carritoproducto" height={50} fill={STheme.color.text} />
                            <SHr height={10} />
                            <SText fontSize={12} color={STheme.color.text}>
                                Su carrito de compras está vacío
                            </SText>
                        </SView>
                    </SView>
                ) : (
                    <SView
                        flex
                        style={{
                            borderRadius: 8,
                            shadowColor: "#000",
                            shadowOffset: { width: 0 },
                            shadowOpacity: 0.05,
                            shadowRadius: 2,
                            elevation: 1,
                        }}
                    >
                        <SView col={"xs-12"} row>
                            <SView col={"xs-10 md-10"} row>
                                <SText fontSize={15} bold color={STheme.color.text}>
                                    Detalle venta
                                </SText>
                            </SView>
                            <SView
                                col={"xs-2 md-2"}
                                center
                                onPress={() => {
                                    MDL.compra_venta.vaciarAll();
                                }}
                                style={{ alignItems: "flex-end" }}
                            >
                                <SView
                                    backgroundColor={STheme.color.card}
                                    border={STheme.color.text}
                                    style={{
                                        borderRadius: 20,
                                        borderWidth: 1,
                                        paddingHorizontal: 8,
                                        paddingVertical: 4,
                                        height: 24,
                                        opacity: 0.6,
                                        alignItems: "flex-end",
                                    }}
                                >
                                    <SText fontSize={12} center color={STheme.color.text}>
                                        Vaciar
                                    </SText>
                                </SView>
                            </SView>
                        </SView>
                        <SHr height={4} />
                        <SView
                            col={"xs-12"}
                            flex
                            center
                            style={{
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 8,
                                borderWidth: 1,
                                borderColor: STheme.color.gray,
                                backgroundColor: STheme.color.card,
                                borderRadius: 8,
                            }}
                        >
                            <SScrollView2 disableHorizontal>
                                <SHr height={4} />
                                <SView flex >
                                    <FlatList
                                        style={{ flex: 1 }}
                                        data={this.carrito}
                                        keyExtractor={(item) => item.key.toString()}
                                        renderItem={this.renderItemCarrito}
                                    />
                                </SView>
                            </SScrollView2>
                        </SView>
                        <SHr height={5} />
                        <ResumenTotales
                            subtotal={subtotal}
                            subtotalMoneda={subtotalMoneda}
                            totalImpuesto={totalImpuesto}
                            numeroIva={this._numeroIva}
                            totalDescuento={totalDescuento}
                            totalFinal={totalFinal}
                            monedaSymbol={monedaSymbol}
                        />
                        <SHr height={4} />
                        <SView
                            col={"xs-12 md-0"}
                            center
                            backgroundColor={STheme.color.darkGray}
                            border={STheme.color.card}
                            style={{ height: 44, borderRadius: 2, margin: 2 }}
                        >
                            <SView col={"xs-12"} center>
                                <FotoCliente
                                    onReloadCliente={(cliente) => {
                                        this.cliente = cliente;
                                        this.forceUpdate();
                                    }}
                                />
                            </SView>
                        </SView>
                        <SHr height={3} />
                        <SView col={"xs-12"} center>
                            <PButtom
                                type="primary"
                                small
                                onPress={() => {
                                    Root.prototype.inputs = this.inputs; // Asegura que cada Detalle tenga acceso a los inputs

                                    SelectTipoPagoVenta.openPopup({
                                        key_punto_venta: MDL.caja.activa.key_punto_venta,
                                        montoMaximo: subtotal,
                                        key_moneda: this.props.selectedMoneda?.key || this.state.monedas[0]?.key,
                                        onSelect: (tipos_pago) => this.handleSubmit(tipos_pago),
                                    });
                                }}
                            >
                                GUARDAR
                            </PButtom>
                        </SView>
                    </SView>
                )}
            </>
        );
    };
    render() {
        return <>{this.renderCarrito()}</>;
    }
}