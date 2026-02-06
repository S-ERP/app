import React, { Component } from 'react';
import { Dimensions } from 'react-native';
import { SNotification, SScrollView2, SText, STheme, SView } from 'servisofts-component';
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
        const tipoKey = this.props.tipoKey;
        const selectedMoneda = this.props.selectedMoneda || null;
        let productosFiltrados = tipoKey === "all" ? modelos : modelos.filter((m) => m.key_tipo_producto === tipoKey);
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
                                // const src = producto.key ? `${SSocket.api.inventario}modelo/.128_${producto.key}?date=${this.time}` : productSinFoto;
                                const precio_venta_moneda = 0;
                                const precioFormateado = Number.isInteger(precio_venta_moneda)
                                    ? precio_venta_moneda.toString() // mostrar sin decimales
                                    : precio_venta_moneda.toFixed(2); // mostrar 2 decimales
                                const monedaSymbol = selectedMoneda ? selectedMoneda.observacion : "Bs";
                                // let proveedores = !producto.proveedores ? "" : producto.proveedores.map(item => item?.proveedor?.razon_social).join(', ');
                                return (
                                    <SView
                                        key={index}
                                        col={`xs-6 md-4 lg-3 xl-3 xxl-2`}
                                        margin={4}
                                        style={{
                                            minWidth: "100%",
                                            overflow: "hidden",
                                            marginBottom: 15
                                        }}
                                        onPress={() => {
                                            const productoAjustado = {
                                                ...producto,
                                                precio_compra: producto.precio_compra,
                                                precio_compra_moneda: precioFormateado,
                                                monedaSymbol,
                                            };
                                            MDL.carrito.agregarItemAlCarritoDeCompras({
                                                modelo: productoAjustado,
                                                cantidad: 1,
                                                precio: productoAjustado.precio_compra
                                            })
                                            this.forceUpdate();
                                        }}
                                    >
                                        <SView center style={{ marginBottom: 4, height: 180, overflow: "hidden", backgroundColor: STheme.color.card, borderRadius: 4, }} >
                                            <FotoModelo data={producto} prefix={".512_"} />
                                        </SView>
                                        <SView col={"xs-12"} padding={4}>
                                            <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                                                <SView row>
                                                    <SView style={{ paddingRight: 10 }}>
                                                        {producto?.precio_compra ? <SText fontSize={14} bold color={STheme.color.text} numberOfLines={1} >{monedaSymbol} {producto?.precio_compra} </SText> :
                                                            // <SView style={{ paddingHorizontal: 4, paddingVertical: 2, backgroundColor: "#ff2222" }}>
                                                                <SText fontSize={14} bold color={STheme.color.text} numberOfLines={1} >GRATIS</SText>
                                                            // </SView>
                                                        }
                                                    </SView>
                                                </SView>
                                                <SView>
                                                    {producto?.tipo_producto?.tipo !== "servicio" && (<SText style={{ alignItems: "flex-end", textAlign: "flex-end" }} fontSize={14} bold numberOfLines={1} color={producto?.stock > 0 ? "#fc840b" : "#EF4444"} > {producto?.stock} Und </SText>)}
                                                </SView>
                                            </SView>
                                            <SView col={"xs-12"} row style={{ justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                                                <SView style={{ flex: 1, paddingRight: 8 }}>
                                                    <SText fontSize={14} color={STheme.color.text} numberOfLines={1} >{producto?.descripcion} </SText>
                                                    <SText fontSize={10} clean color={STheme.color.lightGray} numberOfLines={1} >{producto.marca?.descripcion}, {producto.tipo_producto?.descripcion}, {producto.observacion} </SText>
                                                </SView>
                                                {producto?.tipo_producto && (<SView style={{ padding: 2, borderRadius: 4, backgroundColor: STheme.colorFromText(producto?.tipo_producto?.tipo) + "44", borderWidth: 1, borderColor: STheme.colorFromText(producto?.tipo_producto?.tipo) }}>
                                                    <SText fontSize={10} style={{ textTransform: "uppercase" }} >{producto?.tipo_producto?.tipo}</SText>
                                                </SView>)}
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