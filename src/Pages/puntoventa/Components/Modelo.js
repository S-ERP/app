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
        this.conStock = false;
    }

    componentDidMount() {
        this.loadApis();
        this.evento = MDL.compra_venta.addEventListener("venta_realizada", () => {
            this.loadApis();
        });
        this.evento2 = MDL.compra_venta.addEventListener("conStock", () => {
            this.conStock = !this.conStock;
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
        const modelos = await MDL.inventario.getAllModeloStockBySucursal(MDL.caja.activa.key_sucursal);
        this.modelos = modelos;
        this.forceUpdate();
    }

    modificarStock = (key, delta) => {
        const index = this.modelos.findIndex(m => m.key === key);
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
        const width = Dimensions.get('window').width;
        if (width >= 1200) return parseFloat((12 / 8).toFixed(2));
        if (width >= 768) return parseFloat((12 / 4).toFixed(2));
        return parseFloat((12 / 3).toFixed(2));
    }

    renderModelos() {
        const modelos = this.modelos || [];
        const tipoKey = this.props.tipoKey;
        const selectedMoneda = this.props.selectedMoneda || null;
        let productosFiltrados = tipoKey === "all" ? modelos : modelos.filter(m => m.key_tipo_producto === tipoKey);
        productosFiltrados = productosFiltrados.filter(m => m.precio_venta > 0);

        if (this.conStock) {
            productosFiltrados = productosFiltrados.filter(m => m.stock > 0);
        }

        // if (this.props.searchText) {
        //     const search = this.props.searchText.toLowerCase();
        //     productosFiltrados = productosFiltrados.filter(p => p.descripcion?.toLowerCase().includes(search));
        // }

        if (this.props.searchText) {
            const search = this.props.searchText.toLowerCase();
            productosFiltrados = productosFiltrados.filter(p =>
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
                                const src = producto.key ? `${SSocket.api.inventario}modelo/.128_${producto.key}?date=${this.time}` : productSinFoto;
                                const precio_venta_moneda = selectedMoneda
                                    ? producto.precio_venta / (selectedMoneda.tipo_cambio || 1)
                                    : producto.precio_venta;
                                const monedaSymbol = selectedMoneda ? selectedMoneda.observacion : 'Bs';

                                return (
                                    <SView
                                        key={index}
                                        col={`xs-6 md-4 lg-3`}
                                        margin={2}
                                        style={{
                                            minWidth: 120,
                                            borderRadius: 8,
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.1,
                                            shadowRadius: 8,
                                            elevation: 3,
                                            borderWidth: 1,
                                            borderColor: STheme.color.card,
                                            overflow: "hidden",
                                        }}
                                        onPress={() => {

                                            console.log("pinnnnn " + JSON.stringify(producto))
                                            if (producto.stock <= 0) {
                                                SNotification.send({
                                                    title: "Sin stock",
                                                    body: `No hay stock disponible para ${producto.descripcion}.`,
                                                    color: STheme.color.danger,
                                                    time: 3000,
                                                });
                                                return;
                                            }
                                            const productoAjustado = {
                                                ...producto,
                                                precio_venta: producto.precio_venta, // Precio base
                                                precio_venta_moneda: parseFloat(precio_venta_moneda.toFixed(2)),
                                                monedaSymbol,
                                            };
                                            this.props.onPressProducto?.(productoAjustado);
                                            this.forceUpdate();
                                        }}
                                    >
                                        <SView center style={{ marginBottom: 12, height: 120, overflow: "hidden", backgroundColor: STheme.color.card }}>
                                            <FotoModelo data={producto} />
                                        </SView>
                                        <SView col={"xs-12"} padding={4}>
                                            <SView col={"xs-12"} height={40}>
                                                <SText fontSize={8} bold color={STheme.color.text}>{producto.descripcion}</SText>
                                                {/* <SText fontSize={14} bold color={STheme.color.text}>{producto.descripcion}</SText> */}
                                                <SText fontSize={8} bold color={"green"}>tipo {producto.tipo_producto.descripcion}</SText>
                                                <SText fontSize={8} bold color={"cyan"}>Marca {producto.marca.descripcion}</SText>
                                                <SText fontSize={8} bold color={"blue"}>obs {producto.observacion}</SText>
                                            </SView>
                                            <SView col={"xs-12"} row>
                                                <SView flex row>
                                                    <SText fontSize={12} bold color={STheme.color.text}>
                                                        {monedaSymbol} {SMath.formatMoney(precio_venta_moneda, 2)}
                                                    </SText>
                                                </SView>
                                                <SText fontSize={10} bold color={producto?.stock > 0 ? "#10B981" : "#EF4444"}>{producto?.stock} Und</SText>
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