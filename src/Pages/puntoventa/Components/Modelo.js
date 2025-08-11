import React, { Component } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { SImage, SMath, SScrollView2, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import SSocket from 'servisofts-socket';
import FotoModelo from './Foto/FotoModelo';
const productSinFoto = 'https://cauder.com/wp-content/uploads/2020/12/producto-sin-imagen-600x600.jpg';
const listaProductoTest =
    [
        { "key": "p1", "descripcion": "Camisa Blanca Blanca Blanca", "precio_venta": 70.5, "stock": 15, "key_tipo_producto": "ropa" },
        { "key": "p2", "descripcion": "Pantalón Jeans", "precio_venta": 120, "stock": 10, "key_tipo_producto": "ropa" },
        { "key": "p3", "descripcion": "Zapatillas Urbanas", "precio_venta": 250, "stock": 8, "key_tipo_producto": "calzado" },
        { "key": "p4", "descripcion": "Gorra Negra", "precio_venta": 35, "stock": 20, "key_tipo_producto": "accesorio" },
        { "key": "p5", "descripcion": "Reloj Digital", "precio_venta": 150, "stock": 5, "key_tipo_producto": "accesorio" },
        { "key": "p6", "descripcion": "Remera Deportiva", "precio_venta": 60, "stock": 12, "key_tipo_producto": "ropa" },
        { "key": "p7", "descripcion": "Short Verano", "precio_venta": 55, "stock": 7, "key_tipo_producto": "ropa" },
        { "key": "p8", "descripcion": "Zapatos Cuero", "precio_venta": 300, "stock": 3, "key_tipo_producto": "calzado" },
        { "key": "p9", "descripcion": "Campera Invierno", "precio_venta": 500, "stock": 2, "key_tipo_producto": "ropa" },
        { "key": "p10", "descripcion": "Bufanda Lana", "precio_venta": 45, "stock": 10, "key_tipo_producto": "accesorio" },
        { "key": "p11", "descripcion": "Polera Manga Larga", "precio_venta": 80, "stock": 9, "key_tipo_producto": "ropa" },
        { "key": "p12", "descripcion": "Medias Deportivas", "precio_venta": 20, "stock": 30, "key_tipo_producto": "ropa" },
        { "key": "p13", "descripcion": "Lentes de Sol", "precio_venta": 100, "stock": 14, "key_tipo_producto": "accesorio" },
        { "key": "p14", "descripcion": "Mochila Negra", "precio_venta": 180, "stock": 4, "key_tipo_producto": "accesorio" },
        { "key": "p15", "descripcion": "Sandalias Playeras", "precio_venta": 90, "stock": 6, "key_tipo_producto": "calzado" },
        { "key": "p16", "descripcion": "Cinturón Cuero", "precio_venta": 60, "stock": 11, "key_tipo_producto": "accesorio" },
        { "key": "p17", "descripcion": "Camisa Cuadros", "precio_venta": 75, "stock": 5, "key_tipo_producto": "ropa" },
        { "key": "p18", "descripcion": "Botines Fútbol", "precio_venta": 280, "stock": 6, "key_tipo_producto": "calzado" },
        { "key": "p19", "descripcion": "Bolso Deportivo", "precio_venta": 160, "stock": 7, "key_tipo_producto": "accesorio" },
        { "key": "p20", "descripcion": "Guantes Invierno", "precio_venta": 40, "stock": 10, "key_tipo_producto": "accesorio" }
    ];
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
        if (width >= 1200) return parseFloat((12 / 8).toFixed(2)); // laptop grande
        if (width >= 768) return parseFloat((12 / 4).toFixed(2)); // tablet
        return parseFloat((12 / 3).toFixed(2)); // móvil
    }
    renderModelos() {
        const modelos = this.modelos || [];
        const tipoKey = this.props.tipoKey;
        let productosFiltrados = tipoKey === "all" ? modelos : modelos.filter(m => m.key_tipo_producto === tipoKey);
        if (this.props.searchText) { const search = this.props.searchText.toLowerCase(); productosFiltrados = productosFiltrados.filter(p => p.descripcion?.toLowerCase().includes(search)); }
        const colSize = this.getColSize();
        return (
            <SView col={"xs-12"} flex center backgroundColor='transparent'>
                <SScrollView2 disableHorizontal>
                    <SView col={"xs-12"} style={{ padding: 2 }}>
                        <SView col={"xs-12"} row  padding={5}>
                            {productosFiltrados.map((producto, index) => {
                                const src = producto.key ? `${SSocket.api.inventario}modelo/.128_${producto.key}?date=${this.time}` : productSinFoto;
                                return (
                                    <SView
                                        key={index}
                                        col={`xs-6 md-4 lg-3 xl-1.5`}
                                        margin={2}
                                        style={{
                                            borderRadius: 8,
                                            shadowColor: "#000",
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.1,
                                            shadowRadius: 8,
                                            elevation: 3,
                                            borderWidth: 1,
                                            borderColor: STheme.color.lightGray,
                                        }}
                                        onPress={() => {
                                            // if (producto.stock <= 0) return alert("No hay más stock disponible");
                                            // producto.stock -= 1; // ⬅️ Resta stock localmente
                                            this.props.onPressProducto?.({ ...producto }); // enviar copia actualizada
                                            this.forceUpdate();  // ⬅️ Fuerza render para reflejar el cambio
                                        }}
                                    >
                                        <SView center style={{ marginBottom: 12, height: 120 }}>
                                            <FotoModelo data={producto} ></FotoModelo>
                                        </SView>
                                        <SView col={"xs-12"} padding={4}>
                                            <SView col={"xs-12"} height={40}><SText fontSize={14} bold color={STheme.color.text}>{producto.descripcion} </SText></SView>
                                            <SView col={"xs-12"} row>
                                                <SView flex row > <SText fontSize={12} bold color={STheme.color.text}  > Bs {SMath.formatMoney(producto.precio_venta, 2)} </SText> </SView>
                                                <SView width={60} row   > <SText fontSize={10} color={producto?.stock > 0 ? "#10B981" : "#EF4444"}> Disp: {producto?.stock} und</SText> </SView>
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
