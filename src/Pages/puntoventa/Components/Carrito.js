import React, { Component } from 'react';
import { FlatList } from 'react-native';
import { SHr, SImage, SText, STheme, SView, SInput, SScrollView2, } from 'servisofts-component';
import SIconApp from '../../../Assets/SIconApp';
import CarritoItem from './Carrito/CarritoItem';
import ResumenTotales from './Carrito/ResumenTotales';
import TecladoNumerico from './Carrito/TecladoNumerico';
import MDL from '../../../MDL';
import FotoCliente from './Foto/FotoCliente';
export default class Carrito extends Component {
    carrito = [];
    descuentoManual = "";
    conFactura = false;
    cliente = {};
    componentDidMount() {
        this.loadData()
    }
    async loadData() {
        const enviroments = await MDL.contabilidad.getEnviroment();
        this._enviromentsIva = parseFloat(enviroments?.IVA?.observacion) / 100;
        this._numeroIva = parseInt(enviroments?.IVA?.observacion);
        
        this.forceUpdate();
    }
    setCarrito(nuevoCarrito) {
        this.carrito = Array.isArray(nuevoCarrito) ? [...nuevoCarrito] : [];
        this.forceUpdate();
    }
    addProducto = (producto) => {
        const index = this.carrito.findIndex(p => p.key === producto.key);
        if (index >= 0) {
            this.carrito[index].cantidad += 1;
        }
        else this.carrito.push({ ...producto, cantidad: 1 });
        this.forceUpdate();
    };
    aumentarCantidad = (producto) => {
        const index = this.carrito.findIndex(p => p.key === producto.key);
        if (index >= 0) {
            this.carrito[index].cantidad += 1;
            this.forceUpdate();
        }
    };
    disminuirCantidad = (producto) => {
        const index = this.carrito.findIndex(p => p.key === producto.key);
        if (index >= 0) {
            this.carrito[index].cantidad -= 1;
            if (this.carrito[index].cantidad <= 0) this.carrito.splice(index, 1);
            this.forceUpdate();
        }
    };
    eliminarItem = (producto) => {
        const index = this.carrito.findIndex(p => p.key === producto.key);
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
        this.forceUpdate();
    };

 
    calcularSubtotal = () => this.carrito.reduce((t, i) => t + i.precio_venta * i.cantidad, 0);
    calcularTotalConIVA = (subtotal) => {
        if (!this._enviromentsIva) return subtotal;
        if (this.conFactura) {
            return subtotal * (1 + this._enviromentsIva);
        } else {
            return subtotal;
        }
        this.forceUpdate()
    };
    calcularIVA = (subtotal) => {
        if (!this._enviromentsIva) return 0;
        return subtotal * this._enviromentsIva;
    };
    calcularTotalConDescuento = (total) => total - parseFloat(this.descuentoManual || "0");
    renderItemCarrito = ({ item }) => (
        <CarritoItem
            item={item}
            onAumentar={() => this.aumentarCantidad(item)}
            onDisminuir={() => this.disminuirCantidad(item)}
            onEliminar={() => this.eliminarItem(item)}
        />
    );
    renderCarrito = () => {
        const subtotal = this.calcularSubtotal();
        const totalConIVA = this.calcularTotalConIVA(subtotal);
        const totalImpuesto = this.calcularIVA(subtotal);
        const totalDescuento = this.descuentoManual || 0;
        const totalFinal = this.calcularTotalConDescuento(totalConIVA);
        return (
            <>
                {subtotal <= 0 ?
                    <SView backgroundColor={STheme.color.background} flex center style={{
                        borderRadius: 8, shadowColor: STheme.color.card, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
                        minHeight: 250
                    }}
                    >
                        <SView row center >
                            <SIconApp name='carritoproducto' height={50} fill={STheme.color.text} />
                            <SHr height={10} />
                            <SText fontSize={12} color={STheme.color.text}>Su carrito de compras está vacío</SText>
                        </SView>
                    </SView>
                    :
                    <SView backgroundColor={STheme.color.background} flex style={{ borderRadius: 8, shadowColor: "#000", shadowOffset: { width: 0, }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }} >
                        <SView col={"xs-12"} row   >
                            <SView col={"xs-10 md-10"} row  >
                                <SText fontSize={15} bold color={STheme.color.text}>Detalle venta</SText>
                            </SView>
                            <SView col={"xs-2 md-2"} center onPress={() => this.vaciarCarrito()} style={{ alignItems: "flex-end" }} >
                                <SView backgroundColor={STheme.color.card} border={STheme.color.text} style={{ borderRadius: 20, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, height: 24, opacity: 0.6, alignItems: "flex-end" }}>
                                    <SText fontSize={12} center color={STheme.color.text}>Vaciar</SText>
                                </SView>
                            </SView>
                        </SView>
                        <SHr height={4} />
                        { }
                        <SView col={"xs-12"} flex center
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
                                <FlatList data={this.carrito} keyExtractor={(item) => item.key.toString()} renderItem={this.renderItemCarrito} />
                            </SScrollView2>
                        </SView>
                        <SHr height={5} />
                        <ResumenTotales subtotal={subtotal} totalImpuesto={totalImpuesto} numeroIva={this._numeroIva} totalDescuento={totalDescuento} totalFinal={totalFinal}  ></ResumenTotales>
                        <SView col={"xs-12"} row >
                            <SView col={"xs-6"} height={60} center >
                                <SInput label={"Descuento VIP (Bs):"} placeholder={"0"} defaultValue={this.descuentoManual ?? null} type='number' border={STheme.color.card} style={{ backgroundColor: "transparent", borderRadius: 8 }}
                                    onChangeText={(text) => {
                                        this.descuentoManual = text;
                                        this.forceUpdate();
                                    }}
                                />
                            </SView>
                            <SView col={"xs-6"} row center  >
                                <SView width={70} style={{ alignItems: "flex-end" }}  >
                                    <SInput label={"Con factura"} type='checkBox' defaultValue={this.conFactura}
                                        onChangeText={(text) => {
                                            this.conFactura = text;
                                            this.forceUpdate();
                                        }}
                                    />
                                </SView>
                            </SView>
                        </SView>
                        <SHr height={3} />
                        { }
                        <SView col={"xs-12 md-0"} center backgroundColor={STheme.color.danger} border={STheme.color.card} style={{ height: 44, borderRadius: 2, margin: 2 }}>
                            <SView col={"xs-12"} center>
                                <FotoCliente onReloadCliente={(cliente) => {
                                    console.log("cheking 111111111 movil" + JSON.stringify(cliente))
                                    this.cliente = cliente;
                                    this.forceUpdate();
                                }}  ></FotoCliente>
                            </SView>
                        </SView>
                    </SView>
                }
                <TecladoNumerico
                    cliente={this.cliente}
                    carrito={this.carrito}
                    carritonuevo={this.carritonuevo}
                    numeroIva={this._numeroIva}
                    totalImpuesto={totalImpuesto}
                    descuento={this.descuentoManual}
                    totalFinal={totalFinal}
                    conFactura={this.conFactura}
                    subtotal={subtotal}
                    onReload={() => { this.vaciarCarrito(); }}
                    onReloadCliente={(cliente) => {
                        this.cliente = cliente || {};
                        this.forceUpdate();
                    }}
                />
            </>
        );
    };
    render() {
        return <>
            {this.renderCarrito()}
        </>
    }
}
