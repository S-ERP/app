import React from 'react';
import { SPage, SText, STheme, SDate } from "servisofts-component";
import MDL from '../MDL';

export default class Index extends React.Component {

    state = {
        caja: null,
        movimientos: [],
        resumen: [],
        ready: false,
    };

    key_caja = "42351594-5d23-4700-b845-32b089360665";

    componentDidMount() {
        this.loadData();
    }

    async loadData() {
        try {

            const [cajaRaw, usuarios, empresa] = await Promise.all([
                MDL.caja.getByKey(this.key_caja),
                MDL.usuario.getAll(),
                MDL.empresa.getFull()
            ]);

            const sucursal = empresa?.sucursales.find(
                s => s.key === cajaRaw.key_sucursal
            );

            const caja = {
                key_usuario: cajaRaw.key_usuario,
                fecha_on: cajaRaw.fecha_on,
                monto_cierre: cajaRaw.monto_cierre,
                key_sucursal: cajaRaw.key_sucursal,
                key_empresa: cajaRaw.key_empresa,
                fecha_cierre: cajaRaw.fecha_cierre,
                caja_cerrado: !!cajaRaw.fecha_cierre,

                sucursal: sucursal
                    ? {
                        key: sucursal.key,
                        descripcion: sucursal.descripcion,
                        municipio: sucursal.municipio,
                        direccion: sucursal.direccion,
                        correo: sucursal.correo,
                        telefono: sucursal.telefono,
                    }
                    : null,

                cajero: usuarios[cajaRaw.key_usuario] ?? null,
            };

            const [movimientos, empresa_tipo_pago] = await Promise.all([
                MDL.caja.getDetalle(this.key_caja),
                MDL.caja.empresa_tipo_pago_getAll()
            ]);

            movimientos.sort(
                (a, b) =>
                    new SDate(b.fecha_on, "yyyy-MM-ddThh:mm:ss").getTime() -
                    new SDate(a.fecha_on, "yyyy-MM-ddThh:mm:ss").getTime()
            );

            const movimientosFiltrados = movimientos.map((m) => {
                const etp = empresa_tipo_pago[m.key_empresa_tipo_pago];

                return {
                    descripcion: m.descripcion,
                    key_tipo_pago: m.key_tipo_pago,
                    tipo: m.tipo,
                    key_usuario: m.key_usuario,
                    fecha_on: m.fecha_on,
                    fecha: m.fecha,
                    monto: m.monto,
                    empresa_tipo_pago: etp
                        ? {
                            descripcion: etp.descripcion,
                            key_tipo_pago: etp.key_tipo_pago,
                        }
                        : null
                };
            });

            // ==========================
            // CALCULO DEL RESUMEN
            // ==========================

            const apertura = cajaRaw.monto_apertura ?? 0;

            let ventas = {};
            let egresos = 0;

            movimientosFiltrados.forEach((m) => {

                const tipoPago = m.empresa_tipo_pago?.descripcion || "Otros";

                if (m.monto > 0) {

                    if (!ventas[tipoPago]) ventas[tipoPago] = 0;
                    ventas[tipoPago] += m.monto;

                } else {

                    egresos += m.monto;

                }

            });

            const resumen = [];

            // Apertura
            resumen.push({
                label: "Apertura",
                value: apertura
            });

            // Ventas por tipo de pago
            Object.keys(ventas).forEach((k) => {
                resumen.push({
                    label: `Ventas ${k}`,
                    value: ventas[k]
                });
            });

            // Egresos
            if (egresos !== 0) {
                resumen.push({
                    label: "Traspaso a banca",
                    value: egresos
                });
            }

            // Total final
            const total = resumen.reduce((sum, i) => sum + i.value, 0);

            resumen.push({
                label: "Total",
                value: total
            });

            this.setState({
                caja,
                movimientos: movimientosFiltrados,
                resumen,
                ready: true
            });

        } catch (error) {
            console.error("Error cargando datos:", error);
        }
    }

    render() {

        const { caja, movimientos, resumen, ready } = this.state;

        return (
            <SPage title="Cierre de Caja PDF" center>

                {ready ? (
                    <>

                        <SText style={{ color: STheme.color.text, fontFamily: 'monospace' }}>
                            <strong>Caja:</strong>{"\n"}
                            {JSON.stringify(caja, null, 2)}
                        </SText>

                        <SText style={{ color: STheme.color.text, fontFamily: 'monospace' }}>
                            <strong>Detalle:</strong>{"\n"}
                            {JSON.stringify(movimientos, null, 2)}
                        </SText>

                        <SText style={{ color: STheme.color.text, fontFamily: 'monospace' }}>
                            <strong>Resumen:</strong>{"\n"}
                            {JSON.stringify(resumen, null, 2)}
                        </SText>

                    </>
                ) : (
                    <SText style={{ color: STheme.color.text }}>
                        Cargando...
                    </SText>
                )}

            </SPage>
        );
    }
}