import React, { Component } from 'react';
import { Dimensions } from 'react-native';
import { SNotification, SScrollView2, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import FotoModelo from './Foto/FotoModelo';
import Recargar from '../../../Components/Recargar';
const productSinFoto = 'https://cauder.com/wp-content/uploads/2020/12/producto-sin-imagen-600x600.jpg';

const sorters = [
    { key: "tipo_producto_tipo", order: "asc", type: "string" },
    { key: "descripcion", order: "asc", type: "string" } // asumí que "nombre" es "descripcion"
];

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
    }
    componentWillUnmount() {
        if (this.evento) {
            MDL.compra_venta.removeEventListener(this.evento);
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
        let monedas = await MDL.empresa.getMonedas();
        this.modelos = modelos
            .map(e => ({
                ...e,
                compra_moneda: monedas.find(m => m.key === e.precio_compra_moneda) || {},
                venta_moneda: monedas.find(m => m.key === e.precio_venta_moneda) || monedas.find(m => m.tipo === "base") || {}
            }))
            .sort((a, b) => {
                const tipoA = a.tipo_producto?.tipo || "";
                const tipoB = b.tipo_producto?.tipo || "";
                if (tipoA < tipoB) return -1;
                if (tipoA > tipoB) return 1;
                const nombreA = a.descripcion || "";
                const nombreB = b.descripcion || "";
                if (nombreA < nombreB) return -1;
                if (nombreA > nombreB) return 1;
                return 0;
            });
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

        // aqui valida que muestre todo o sin precio
        if (this.props.conPrecio) {
            productosFiltrados = productosFiltrados.filter((m) => m.precio_venta > 0);
        }

        // aqui valido que funcion con stock
        if (this.props.conStock) {
            productosFiltrados = productosFiltrados.filter((m) => m.stock > 0);
        }

        if (this.props.conServicio) {
            productosFiltrados = productosFiltrados.filter((m) => m.tipo_producto?.tipo === "servicio");
        }

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
        return (<>
            <SView col={"xs-12"} flex center>
                <SScrollView2 disableHorizontal>
                    <SView col={"xs-12"} style={{ padding: 2 }}>
                        <SView col={"xs-12"} row padding={5}>
                            {productosFiltrados.map((producto, index) => {
                                const precio_venta_moneda = 0;
                                const tipoCambioProducto = producto.venta_moneda?.tipo_cambio || 1;
                                const tipoCambioSeleccionada = selectedMoneda?.tipo_cambio || 1;
                                const precioConvertido = producto.precio_compra * (tipoCambioProducto / tipoCambioSeleccionada);
                                const precioFormateado = Number.isInteger(precioConvertido) ? precioConvertido.toString() : precioConvertido.toFixed(2);
                                const monedaSymbol = selectedMoneda ? selectedMoneda.observacion : "Bs";
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
                                                        {producto?.precio_compra ? <SText fontSize={14} bold color={STheme.color.text} numberOfLines={1} >{monedaSymbol} {precioFormateado} </SText> :
                                                            <SText fontSize={14} bold color={STheme.color.text} numberOfLines={1} >GRATIS</SText>
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
            <SView style={{ position: "absolute", bottom: 20, right: 10 }}>
                {
                    <Recargar ref={ref => this.recargar = ref} initialTime={20} fill={STheme.color.lightGray}
                        onFinish={() => {
                            this.loadApis(); // ✅ correcto
                        }} />
                }
            </SView>
        </>
        );
    }
    render() {
        return this.renderModelos();
    }
}