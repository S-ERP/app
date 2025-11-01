import React, { Component } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { SImage, SMath, SNotification, SScrollView2, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import SSocket from 'servisofts-socket';
import FotoModelo from './Foto/FotoModelo';

const productSinFoto = 'https://cauder.com/wp-content/uploads/2020/12/producto-sin-imagen-600x600.jpg';

export default class Modelo extends Component {
    constructor(props) {
        super(props);
        this.modelos = [];
        this.time = Date.now();
    }

    componentDidMount() {
        this.loadApis();
        this.evento = MDL.compra_venta.addEventListener("venta_realizada", () => {
            this.loadApis();
        });

        // Eliminar el evento "conStock" ya que usamos props
        this.evento2 = MDL.compra_venta.addEventListener("conStock", () => {
            this.conStock = this.props.conStock;
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        if (this.evento) {
            MDL.compra_venta.removeEventListener(this.evento);
        }

        if (this.evento2) {
            MDL.compra_venta.removeEventListener(this.evento2);
        }
    }

    async loadApis() {
        if (!MDL.caja.activa) {
            SNotification.send({
                title: "MODELO Caja no aperturada",
                message: "Debes abrir la caja antes de continuar con las operaciones.",
                type: "danger",
                body: "⚠️Debe abrir caja⚠️",
                color: STheme.color.danger,
                time: 5000,
            });
            return;
        }
        // const modelos = await MDL.inventario.getAllModeloStockBySucursal(MDL.caja.activa.key_sucursal);
        const modelos = await MDL.inventario.getAllModeloStock();
        this.modelos = modelos;
        this.forceUpdate();
    }

    modificarStock = (key, delta) => {
        const index = this.modelos.findIndex((m) => m.key === key);
        if (index >= 0) {
            const nuevoStock = this.modelos[index].stock + delta;
            if (nuevoStock < 0) return false;
            this.modelos[index].stock = nuevoStock;
            this.forceUpdate();
            return true;
        }
        return false;
    };

    getColSize() {
        const width = Dimensions.get("window").width;
        if (width >= 1200) return parseFloat((12 / 8).toFixed(2));
        if (width >= 768) return parseFloat((12 / 4).toFixed(2));
        return parseFloat((12 / 3).toFixed(2));
    }

    renderModelos() {
        const modelos = this.modelos || [];
        // const modelos = this.props.data || [];
        const tipoKey = this.props.tipoKey;
        const selectedMoneda = this.props.selectedMoneda || null;

        // let productosFiltrados = modelos;
        // console.log("PRODUCTOS: ", productosFiltrados);

        let productosFiltrados = tipoKey === "all" ? modelos : modelos.filter((m) => m.key_tipo_producto === tipoKey);
        // productosFiltrados = productosFiltrados.filter((m) => m.precio_venta > 0);

        // if (this.props.conStock) {
        //     productosFiltrados = productosFiltrados.filter((m) => m.stock > 0);
        // }

        if (this.props.searchText) {
            const search = this.props.searchText.toLowerCase();
            productosFiltrados = productosFiltrados.filter(
                (p) =>
                    p.descripcion?.toLowerCase().includes(search) ||
                    p.tipo_producto?.descripcion?.toLowerCase().includes(search) ||
                    p.marca?.descripcion?.toLowerCase().includes(search) ||
                    p.observacion?.toLowerCase().includes(search)
            );
        }

        const colSize = this.getColSize();
        return (
            <SView col={"xs-12"} flex center>
                <SScrollView2 disableHorizontal>
                    <SView col={"xs-12"} style={{ padding: 2 }}>
                        <SView col={"xs-12"} row padding={5}>
                            {productosFiltrados.map((producto, index) => {
                                const src = producto.key
                                    ? `${SSocket.api.inventario}modelo/.128_${producto.key}?date=${this.time}`
                                    : productSinFoto;

                                // const precio_venta_moneda = selectedMoneda ? producto?.precio_venta / (selectedMoneda?.tipo_cambio || 1) : producto?.precio_venta;
                                // const precioFormateado = Number.isInteger(precio_venta_moneda)
                                //     ? precio_venta_moneda.toString() // mostrar sin decimales
                                //     : precio_venta_moneda.toFixed(2); // mostrar 2 decimales
                                const precio_venta_moneda = 0;
                                const precioFormateado = Number.isInteger(precio_venta_moneda)
                                    ? precio_venta_moneda.toString() // mostrar sin decimales
                                    : precio_venta_moneda.toFixed(2); // mostrar 2 decimales



                                // mira necesito que que si no hay isDecimal, no muestre
                                // ejemplo 12 y si es 12.50 
                                // los entereros que no muestre decimanl, los numeros decimales que muestre elddsds

                                const monedaSymbol = selectedMoneda ? selectedMoneda.observacion : "Bs";
                                let proveedores = !producto.proveedores ? "" : producto.proveedores.map(item => item?.proveedor?.razon_social).join(', ');

                                return (
                                    <SView
                                        key={index}
                                        col={`xs-6 md-4 lg-3 xl-3 xxl-2`}
                                        margin={4}
                                        style={{
                                            minWidth: "100%",
                                            overflow: "hidden",
                                            marginBottom:15
                                        }}
                                        onPress={() => {

                                            // if (this.props.conStock && producto.stock <= 0) {
                                            //     SNotification.send({
                                            //         title: "Sin stock",
                                            //         body: `No hay stock disponible para ${producto?.descripcion}.`,
                                            //         color: STheme.color.danger,
                                            //         time: 3000,
                                            //     });
                                            //     return;
                                            // }

                                            const productoAjustado = {
                                                ...producto,
                                                precio_compra: producto.precio_compra,
                                                precio_compra_moneda: precioFormateado,
                                                monedaSymbol,
                                            };
                                            // this.props.onPressProducto?.(productoAjustado);
                                            MDL.carrito.agregarItemAlCarritoDeCompras({
                                                modelo: productoAjustado,
                                                cantidad: 1,
                                                precio: productoAjustado.precio_compra
                                            })
                                            this.forceUpdate();
                                        }}
                                    >
                                        <SView
                                            center
                                            style={{
                                                marginBottom: 4,
                                                height: 180,
                                                overflow: "hidden",
                                                backgroundColor: STheme.color.card,
                                                borderRadius: 4,
                                            }}
                                        >
                                            <FotoModelo data={producto} prefix={".512_"} />
                                        </SView>
                                        <SView col={"xs-12"} padding={4}>
                                            <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                                                {producto.precio_compra ? <SText fontSize={15}  color={STheme.color.text} numberOfLines={1} >{producto?.precio_compra ? producto?.precio_compra : "---"} {monedaSymbol}</SText> : <SText fontSize={15}  color={STheme.color.text} numberOfLines={1} >GRATIS</SText>}
                                                <SView flex/>
                                                <SText style={{ alignItems: "flex-end", textAlign: "flex-end" }} clean fontSize={14} bold numberOfLines={1}  color={producto?.stock > 0 ? "#10B981" : "#EF4444"} >
                                                    {producto?.stock} Und
                                                </SText>
                                            </SView>
                                            <SView col={"xs-12"}>
                                                
                                                <SText fontSize={14} color={STheme.color.text} numberOfLines={1} >{producto?.descripcion}</SText>
                                                <SText fontSize={11} color={STheme.color.lightGray} numberOfLines={1} >{proveedores}</SText>

                                                {/* <SText fontSize={10} clean color={STheme.color.lightGray} numberOfLines={1} >{producto.marca.descripcion}, {producto.tipo_producto.descripcion}, {producto.observacion}
                                                </SText> */}
                                            </SView>
                                        </SView>
                                    </SView>
                                );
                            })}
                        </SView>
                    </SView>
                </SScrollView2>
            </SView>
        );
    }

    render() {
        return this.renderModelos();
    }
}