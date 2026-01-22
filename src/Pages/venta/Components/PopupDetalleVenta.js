import React, { Component } from 'react';
import { SText, STheme, SPopup, SView } from 'servisofts-component';

export default class PopupDetalleVenta extends Component {

    static open({ detalles, venta }) {
        SPopup.open({
            key: "popup_detalle_venta",
            content: (
                <SView col={"xs-11"} backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 700 }} padding={16} withoutFeedback >
                    <SView col={"xs-12"} height={470} center>
                        <PopupDetalleVenta detalles={detalles} venta={venta} />
                    </SView>
                </SView>
            )
        });
    }

    render() {
        const { detalles = [], venta = {} } = this.props;

        return (
            <SView col>
                <SView col={"xs-12"} padding={8}>
                    {venta.descripcion && <SText fontSize={14} bold>Venta: {venta.descripcion}</SText>}
                    {venta.cliente?.nombres && <SText fontSize={12}>Cliente: {venta.cliente.nombres}</SText>}
                    {venta.fecha_on && <SText fontSize={12}>Fecha: {new Date(venta.fecha_on).toLocaleString()}</SText>}
                </SView>

                <SView col padding={8} style={{ maxHeight: 350 }}>
                    {detalles.map((d, index) => (
                        <SText key={index} fontSize={12}>
                            • {d.descripcion} | {d.precio_unitario_base} {venta?.moneda?.observacion ?? ""} x {d.cantidad}
                        </SText>
                    ))}
                </SView>

                {venta.cuotas?.total && (
                    <SView row right padding={8}>
                        <SText fontSize={14} bold>Total: {venta.cuotas.total} {venta?.moneda?.observacion ?? ""}</SText>
                    </SView>
                )}
            </SView>
        );
    }
}
