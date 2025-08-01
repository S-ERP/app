import React, { Component } from 'react';
import { SView, SText, STheme, SNavigation, SMath, SInput, SButtom, SPopup, SNotification, SForm, SHr, SThread } from 'servisofts-component';
import FotoCliente from '../Foto/FotoCliente';
import Model from '../../../../Model';
import MDL from '../../../../MDL';
import SIconApp from '../../../../Assets/SIconApp';
import PButtom from '../../../../Components/PButtom';
import PButtom3 from '../../../../Components/PButtom3';
import ResumenTotales from './ResumenTotales';
import ConfirmarPago from './ConfirmarPago';

// import React, { Component } from 'react';
// import { SMath } from 'servisofts-component';
// import Model from '../../../../Model';

export default class Formateo extends Component {
    constructor(props) {
        super(props);
    }

    /**
     * Formatea los datos del carrito, cliente, caja y vendedor para enviar al backend.
     */
    formatearVenta = () => {
        const { carrito = [], cliente, subtotal, totalImpuesto, totalDescuento, totalFinal, montoRecibido, conFactura } = this.props;
        const vendedor = Model.usuario.Action.getUsuarioLog();

        const carritoFormateado = carrito.map(item => ({
            key: item.key,
            descripcion: item.descripcion,
            precio_compra: item.precio_compra ?? 0,
            precio_venta: item.precio_venta ?? 0,
            stock: item.stock ?? 0,
            cantidad: item.cantidad ?? 0,
            key_marca: item.key_marca ?? null,
            marca_descripcion: item.marca?.descripcion ?? null,
            key_tipo_producto: item.key_tipo_producto ?? null,
            tipo_producto: item.tipo_producto?.descripcion ?? null,
        }));

        const cajaFormateada = {
            subtotal: SMath.formatMoney(subtotal, 2),
            IVA: SMath.formatMoney(totalImpuesto, 2),
            Descuento: SMath.formatMoney(totalDescuento, 2),
            totalFinal: SMath.formatMoney(totalFinal, 2),
            montoRecibido: SMath.formatMoney(montoRecibido, 2),
            cambio: SMath.formatMoney(montoRecibido - totalFinal, 2),
            conFactura: conFactura ? "si" : "no",
        };

        const ventaFormateada = {
            carrito: carritoFormateado,
            key_cliente: cliente?.key ?? null,
            key_vendedor: vendedor?.key ?? null,
            caja: cajaFormateada,
        };

        const asdsa = JSON.stringify(ventaFormateada, null, 2);

        console.log("🧾 Venta Formateada:");
        return asdsa;
    };

    render() {
        return this.formatearVenta();
    }
}
