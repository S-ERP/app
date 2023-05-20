import { SAction } from "servisofts-model";
import Model from "../..";
import SSocket from 'servisofts-socket';
import { SDate } from "servisofts-component";

export default class Action extends SAction {
    // getAll() {
    //     var empresa: any = Model.empresa.Action.getSelect();
    //     if (!empresa) return null;
    //     return super.getAll({
    //         key_empresa: empresa.key,
    //         key_usuario: Model.usuario.Action.getKey()
    //     })
    // }

    getAllConProductos({ key_compra_venta }) {
        var reducer = this._getReducer();
        if (reducer.key_compra_venta != key_compra_venta) {
            reducer.data = null;
            reducer.key_compra_venta = key_compra_venta;
        }
        var productos = Model.compra_venta_detalle_producto.Action.getAll({
            key_compra_venta: key_compra_venta
        });

        var data = super.getAll({
            key_compra_venta: key_compra_venta
        })
        if (!productos) return null;

        var data_res = {};
        let arr_productos = Object.values(productos);
        Object.values(data).map((obj: any) => {
            if (!obj.estado) return;
            obj.productos = arr_productos.filter((o: any) => o.key_compra_venta_detalle == obj.key && o.estado != 0)
            data_res[obj.key] = obj;
        });
        return data_res;
    }
    getAll({ key_compra_venta }) {
        var reducer = this._getReducer();
        if (reducer.key_compra_venta != key_compra_venta) {
            reducer.data = null;
            reducer.key_compra_venta = key_compra_venta;
        }
        return super.getAll({
            key_compra_venta: key_compra_venta
        })
    }
    getTotales({ key_compra_venta }) {
        var compra_venta_detalle = Model.compra_venta_detalle.Action.getAll({
            key_compra_venta: key_compra_venta
        })
        if (!compra_venta_detalle) return null;
        var t = {
            subtotal: 0,
            descuento: 0,
            total: 0,
            gifcard: 0,
            total_a_pagar: 0,
            credito_fiscal: 0,
        }
        Object.values(compra_venta_detalle).map(((obj: any) => {
            if (!obj.estado) return;
            const { precio_unitario, cantidad, descuento } = obj;
            t.subtotal += ((precio_unitario * cantidad) - (descuento ?? 0))
        }))
        t.total = t.subtotal - t.descuento
        t.total_a_pagar = t.total - t.gifcard
        t.credito_fiscal = t.total_a_pagar
        return t;
    }

    recepcionar({ key_compra_venta_detalle,
        key_producto }) {
        return new Promise((resolve, reject) => {
            Model.compra_venta_detalle_producto.Action.registro({
                data: {
                    key_compra_venta_detalle: key_compra_venta_detalle,
                    key_producto: key_producto
                },
                key_usuario: Model.usuario.Action.getKey()
            }).then((resp: any) => {
                this._dispatch({
                    ...this.model.info,
                    type: "editar_cantidad_compras_sr",
                    data: resp.data,
                    estado: "exito"
                })
                resolve(resp);
            }).catch(e => {
                Model.producto.Action.editar({
                    data: {
                        key: key_producto,
                        estado: -1,
                    },
                    key_usuario: Model.usuario.Action.getKey()
                }).then((e) => {
                    reject(e);
                }).catch((e) => {
                    reject(e);
                })
            })
        })

    }

    entregar({ key_compra_venta_detalle_producto }) {
        return new Promise((resolve, reject) => {
            Model.compra_venta_detalle_producto.Action.editar({
                fecha_off: new SDate().toString(),
                data: {
                    key: key_compra_venta_detalle_producto,
                    // estado: 0,
                },
                key_usuario: Model.usuario.Action.getKey()
            }).then((resp: any) => {
                console.log("ENTREGADO", resp)
                // this._dispatch({
                //     ...this.model.info,
                //     type: "editar_cantidad_ventar_sin_entregar",
                //     data: resp.data,
                //     estado: "exito"
                // })
            }).catch(e => {
                console.log("entro al estado error")
                // Model.producto.Action.editar({
                //     data: {
                //         key: key_producto,
                //         estado: -1,
                //     },
                //     key_usuario: Model.usuario.Action.getKey()
                // })
            })
        })

    }
    cambiarPrecios({ key_compra_venta }) {
        return new Promise((resolve, reject) => {
            SSocket.sendPromise({
                ...this.model.info,
                type: "cambiarPrecios",
                key_compra_venta: key_compra_venta,
                key_usuario: Model.usuario.Action.getKey()
            }).then((resp: any) => {
                resolve(resp);
            }).catch(e => {
                reject(e);
            })
        })

    }
    comprasSinRecepcionar({ key_sucursal }) {
        var reducer = this._getReducer();
        // if (reducer.key_sucursal != key_sucursal) {
        // reducer.data_compras_sr = null;
        // }
        // reducer.key_sucursal = key_sucursal
        const data = reducer?.data_compras_sr;
        if (!data) {
            if (reducer.estado == "cargando") return null;
            const petition = {
                ...this.model.info,
                type: "comprasSinRecepcionar",
                estado: "cargando",
                key_sucursal: ""
            }
            SSocket.send(petition);
            return null;
        }
        if (!key_sucursal) return data;
        let other = {};
        Object.values(data).map((obj: any) => {
            if (!obj?.proveedor?.key_sucursal) return null;
            if (obj.proveedor.key_sucursal != key_sucursal) return null;
            other[obj.key] = obj;
        })
        return other;
    }
    ventasSinEntregar(props: { key_sucursal?: any }) {
        var reducer = this._getReducer();
        // if (reducer.key_sucursal != props?.key_sucursal) {
        // reducer.ventar_sin_entregar = null;
        // }
        // reducer.key_sucursal = props?.key_sucursal
        const data = reducer?.ventar_sin_entregar;
        if (!data) {
            if (reducer.estado == "cargando") return null;
            const petition = {
                ...this.model.info,
                type: "ventasSinEntregar",
                estado: "cargando",
                // key_sucursal: props?.key_sucursal
            }
            SSocket.send(petition);
            return null;
        }
        if (!props.key_sucursal) return data;
        let other = {};
        Object.values(data).map((obj: any) => {
            if (!obj?.proveedor?.key_sucursal) return null;
            if (obj.proveedor.key_sucursal != props.key_sucursal) return null;
            other[obj.key] = obj;
        })
        return other;
    }
}   