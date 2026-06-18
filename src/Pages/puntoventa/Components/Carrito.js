import { Component } from 'react';
import { SNotification, STheme } from 'servisofts-component';
import MDL from '../../../MDL';

const CACHE_TTL = 5 * 60 * 1000;

export default class Carrito extends Component {
    _clientesCache = null;
    _clientesCacheTime = 0;
    _tipoCostosCache = new Map();

    ajustarCarrito = () => {
        if (!this.props.conStock) return;
        const toRemove = MDL.carrito.carrito_venta.items.filter((item) => {
            const stock = item.modelo.stock ?? 0;
            if (stock <= 0) {
                SNotification.send({
                    title: "Producto sin stock",
                    body: `${item.modelo.descripcion} fue eliminado del carrito porque no tiene stock.`,
                    color: STheme.color.danger,
                    time: 3000,
                });
                return true;
            }
            if (item.cantidad > stock) {
                item.cantidad = stock;
                SNotification.send({
                    title: "Stock ajustado",
                    body: `La cantidad de ${item.modelo.descripcion} se ajustó al stock disponible (${stock}).`,
                    color: STheme.color.warning,
                    time: 3000,
                });
            }
            return false;
        });
        toRemove.forEach(item => MDL.carrito.removerItemAlCarritoDeVentas(item));
        if (toRemove.length === 0) MDL.carrito.calcularValoresCarritDeVentas();
    };

    componentDidMount() {
        this.evento = MDL.compra_venta.addEventListener("venta_realizada", () => {
            this.vaciarCarrito();
        });
    }

    componentWillUnmount() {
        if (this.evento) {
            MDL.compra_venta.removeEventListener(this.evento);
        }
    }

    async _getClientes() {
        if (this._clientesCache && Date.now() - this._clientesCacheTime < CACHE_TTL) {
            return this._clientesCache;
        }
        const clientes = await MDL.crm.cliente.getAll();
        this._clientesCache = clientes;
        this._clientesCacheTime = Date.now();
        return clientes;
    }

    async _getTipoCostos(key) {
        const cached = this._tipoCostosCache.get(key);
        if (cached && Date.now() - cached.time < CACHE_TTL) {
            return cached.data;
        }
        const tipoCostosKeys = await MDL.inventario.getTipoCostosByModelo(key);
        this._tipoCostosCache.set(key, { data: tipoCostosKeys, time: Date.now() });
        return tipoCostosKeys;
    }

    addProducto = async (producto) => {
        try {
            const [tipoCostosKeys, clientes] = await Promise.all([
                this._getTipoCostos(producto?.key),
                this._getClientes(),
            ]);

            const tipoCostos = tipoCostosKeys.map(tc => ({
                ...tc,
                clientes: (tc.clientes || []).map(c => ({
                    ...c,
                    cliente: clientes.find(cli => cli.key === c.key_cliente) || null,
                })),
            }));

            producto = { ...producto, tipoCostos, clientes };

            const items = MDL.carrito.carrito_venta.items;
            const existingItem = items.find(item => item.modelo.key === producto.key);

            if (existingItem) {
                if (this.props.conStock && existingItem.cantidad >= existingItem.modelo.stock) {
                    SNotification.send({
                        title: "Stock insuficiente",
                        body: `No hay suficiente stock para ${producto.descripcion}. Máximo: ${existingItem.modelo.stock} unidades.`,
                        color: STheme.color.danger,
                        time: 3000,
                    });
                    return;
                }
                existingItem.cantidad += 1;
                MDL.carrito.calcularValoresCarritDeVentas();
            } else {
                if (this.props.conStock && (!producto.stock || producto.stock <= 0)) {
                    SNotification.send({
                        title: "Sin stock",
                        body: `No hay stock disponible para ${producto.descripcion}.`,
                        color: STheme.color.danger,
                        time: 3000,
                    });
                    return;
                }
                MDL.carrito.agregarItemAlCarritoDeVentas({
                    modelo: producto,
                    cantidad: 1,
                    precio: producto.precio_venta,
                    key_modelo_cliente: "",
                });
            }
            MDL.compra_venta.updateCarritoItems(MDL.carrito.carrito_venta.cantidad_items);
        } catch (err) {
            console.error("Error al agregar producto:", err);
        }
    };

    vaciarCarrito = () => {
        this._clientesCache = null;
        this._tipoCostosCache.clear();
        MDL.carrito.limpiarCarritoVentas();
        MDL.compra_venta.updateCarritoItems(0);
    };

    render() {
        return null;
    }
}
