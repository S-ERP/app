import { SAction } from "servisofts-model";
import Model from "../..";
import SSocket from 'servisofts-socket'

export default class Action extends SAction {

    getActiva() {
        var key_usuario = Model.usuario.Action.getKey();
        var data = this.getAll({
            key_usuario: key_usuario,
        });
        if (!data) return null;
        var obj = Object.values(data).find((o: any) => o.key_usuario == key_usuario && o.estado != 0 && o.fecha_cierre == null);
        if (!obj) return {}
        return obj;
    }



    getByPuntoVenta(key_punto_venta) {
        // var key_usuario = Model.usuario.Action.getKey();
        var data = this.getAll();
        if (!data) return null;
        var obj = Object.values(data).find((o: any) => o.key_punto_venta == key_punto_venta && o.estado != 0 && o.fecha_cierre == null);
        if (!obj) return {}
        return obj;
    }
    getMontoEnCajaActiva() {
        var caja: any = this.getActiva()
        if (!caja) return null;
        if (!caja.key) return 0;
        var caja_detales = Model.caja_detalle.Action.getAll({ key_caja: caja.key });
        if (!caja_detales) return null;
        var monto_actual = 0;
        Object.values(caja_detales).map((obj: any) => {
            monto_actual += parseFloat(obj.monto);
        })
        return monto_actual;
    }
    getLast({ key_punto_venta }) {

        return SSocket.sendPromise({
            ...this.model.info,
            type: "getLast",
            key_punto_venta: key_punto_venta,
            estado: "cargando"
        })
    }
    reporte_cuentas({ fecha_inicio, fecha_fin }) {

        return SSocket.sendPromise({
            ...this.model.info,
            type: "reporteCuentas",
            estado: "cargando",
            fecha_inicio: fecha_inicio,
            fecha_fin: fecha_fin,

        })
    }
    historico_cajas({ fecha_inicio, fecha_fin }) {

        return SSocket.sendPromise({
            ...this.model.info,
            type: "getHistorico",
            estado: "cargando",
            fecha_inicio: fecha_inicio,
            fecha_fin: fecha_fin,

        })
    }
    get_caja_by_key({ key_caja }) {
        return SSocket.sendPromise({
            ...this.model.info,
            type: "getByKey",
            estado: "cargando",
            key: key_caja

        })
    }
}   