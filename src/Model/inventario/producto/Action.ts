import { STheme } from "servisofts-component";
import { SAction } from "servisofts-model";
import SSocket from 'servisofts-socket'
import Model from "../..";
export default class Action extends SAction {
    // getAll() {
    //     var empresa: any = Model.empresa.Action.getSelect();
    //     if (!empresa) return null;
    //     return super.getAll({
    //         key_empresa: empresa.key,
    //         key_usuario: Model.usuario.Action.getKey()
    //     })
    // }

    getAllByKeyAlmacen(key_almacen) {
        let data = this.getAll();
        return Object.values(data).filter((obj: any) => obj.key_almacen == key_almacen);
    }
    getAllRecursive() {
        let modelos = Model.modelo.Action.getAllRecursive();
        let data = this.getAll();
        let ventas_sin_entregar = Model.compra_venta_detalle.Action.ventasSinEntregar({});
        let producto_inventario_dato = Model.producto_inventario_dato.Action.getAll();
        if (!modelos || !data || !ventas_sin_entregar || !producto_inventario_dato) return null;
        const arr_vse = Object.values(ventas_sin_entregar);
        const arr_pid = Object.values(producto_inventario_dato);
        Object.values(data).map((obj: any) => {
            obj.modelo = modelos[obj.key_modelo];
            obj.venta_sin_entregar = arr_vse.filter((o: any) => o.key_producto == obj.key && o.estado > 0)
            obj.datos = arr_pid.filter((o: any) => o.key_producto == obj.key)
            obj.state = this.getState(obj);
        })
        return data;
    }

    getState(obj) {
        if (obj.key_cliente) {
            return { key: "entregado", label: "Entregado", color: STheme.color.danger };
        }
        if (obj.venta_sin_entregar) {
            if (obj.venta_sin_entregar.length > 0) {
                return { key: "pendiente_entrega", label: "Pendiente de entrega", color: STheme.color.warning };
            }
        }
        return { key: "disponible", label: "Disponible", color: STheme.color.success };
    }

    registroExcel({ data }) {
        return SSocket.sendPromise({
            ...this.model.info,
            type: "registroExcel",
            data: data,
            key_usuario: Model.usuario.Action.getKey()
        })
    }
    getQR({ key }) {

        var content = `https://darmotos.servisofts.com/productos/producto/profile?pk=${key}`;
        return SSocket.sendPromise({
            "service": "sqr",
            "component": "qr",
            "type": "registro",
            "estado": "cargando",
            "data": {
                "content": content,
                "colorBackground": "",
                "type_color": "linear",
                "colorBody": "#0302F9",
                "colorBody2": "#F90203",
                "image_src": "https://darmotos.servisofts.com/logo512.png",
                "body": "Dot",
                "framework": "Rounded",
                "header": "Rounded"
            }
        })
    }
}   