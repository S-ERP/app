import { Component } from 'react';
import { SNotification, STheme } from 'servisofts-component';
import MDL from '../../../MDL';

const CACHE_TTL = 5 * 60 * 1000;

export default class Carrito extends Component {
    carrito = [];
    _clientesCache = null;
    _clientesCacheTime = 0;
    _tipoCostosCache = new Map();

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
        this.evento = MDL.compra_venta.addEventListener("venta_realizada", () => {
            this.vaciarCarrito();
            this.forceUpdate();
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.selectedMoneda !== this.props.selectedMoneda) {
            this.carrito = this.carrito.map((item) => ({
                ...item,
                precio_venta_moneda: this.props.selectedMoneda
                    ? item.precio_venta / (this.props.selectedMoneda.tipo_cambio || 1)
                    : item.precio_venta,
                monedaSymbol: this.props.selectedMoneda ? this.props.selectedMoneda.observacion : "Bs",
            }));
            this.forceUpdate();
        }
        if (prevProps.conStock !== this.props.conStock) {
            this.ajustarCarrito();
            this.forceUpdate();
        }
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
        if (this._tipoCostosCache.has(key)) {
            return this._tipoCostosCache.get(key);
        }
        const tipoCostosKeys = await MDL.inventario.getTipoCostosByModelo(key);
        this._tipoCostosCache.set(key, tipoCostosKeys);
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

            producto = { ...producto, tipoCostos };

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
                    precio_venta: producto.precio_venta,
                    precio_venta_moneda: producto.precio_venta_moneda || (this.props.selectedMoneda
                        ? producto.precio_venta / (this.props.selectedMoneda.tipo_cambio || 1)
                        : producto.precio_venta),
                    monedaSymbol: this.props.selectedMoneda ? this.props.selectedMoneda.observacion : "Bs",
                });
            }
            this.getCarritoItemCount();
            MDL.carrito.agregarItemAlCarritoDeVentas({
                modelo: producto,
                cantidad: 1,
                precio: producto.precio_venta,
            });
        } catch (err) {
            console.error("Error al agregar producto:", err);
        }
    };

    vaciarCarrito = () => {
        this.carrito = [];
        this._clientesCache = null;
        this._tipoCostosCache.clear();
        this.props.onModificarStock?.(null, 0);
        MDL.compra_venta.updateCarritoItems(0);
        this.forceUpdate();
    };

    getCarritoItemCount() {
        const cant = this.carrito.reduce((total, item) => total + item.cantidad, 0);
        MDL.compra_venta.updateCarritoItems(cant);
        return cant;
    }

    render() {
        return null;
    }
}
