import React from 'react';
import { SMath, SDate } from "servisofts-component";
import * as SPDF from 'servisofts-rn-spdf';
import MDL from '../../../MDL';

const fontSize = 9;
const labelSize = 11;
const text = { fontSize, font: "Roboto" };
const label = { fontSize: labelSize, fontWeight: "bold", font: "Roboto" };

export default class PdfCierreCaja {

    /**
     * Imprime el PDF de la caja
     * @param {string} key_caja 
     */
    static async imprimirPDF(key_caja) {
        if (!key_caja) return console.warn("No se proporcionó key_caja");

        // Cargar datos de caja, usuarios y empresa
        const [cajaRaw, usuarios, empresa] = await Promise.all([
            MDL.caja.getByKey(key_caja),
            MDL.usuario.getAll(),
            MDL.empresa.getFull()
        ]);

        if (!cajaRaw) return console.error("Caja no encontrada");

        const sucursal = empresa?.sucursales.find(s => s.key === cajaRaw.key_sucursal);
        const monedasMap = {};
        (empresa?.monedas || []).forEach(m => { monedasMap[m.key] = m; });
        const moneda_base = empresa.monedas.find(a => a.tipo === "base");

        const caja = {
            ...cajaRaw,
            sucursal,
            cajero: usuarios[cajaRaw.key_usuario],
        };

        // Cargar movimientos y tipos de pago
        const [movimientos, empresa_tipo_pago] = await Promise.all([
            MDL.caja.getDetalle(key_caja),
            MDL.caja.empresa_tipo_pago_getAll()
        ]);

        movimientos.sort(
            (a, b) => new SDate(b.fecha_on, "yyyy-MM-ddThh:mm:ss").getTime() -
                      new SDate(a.fecha_on, "yyyy-MM-ddThh:mm:ss").getTime()
        );

        const tipo_pago = await MDL.caja.tipo_pago_getAll();
        const empresa_tipo_pago_pv = await MDL.caja.empresa_tipo_pago_getAll({ key_punto_venta: caja.key_punto_venta });
        const cuentas = await MDL.contabilidad.getCuentasCache();

        // Preparar tabla de tipo de pago
        let pvtp = Object.values(empresa_tipo_pago_pv).map(item => {
            item.cuenta = cuentas[item.key_cuenta_contable];
            item.moneda = empresa.monedas.find(a => a.key === item?.cuenta?.key_moneda) || moneda_base;
            item.tipo_pago = tipo_pago[item.key_tipo_pago];
            item.saldos = 0;
            item.entradas = 0;
            item.salidas = 0;
            return item;
        });
        const pvtpMap = {};
        pvtp.forEach(p => { pvtpMap[p.key] = p; });

        // Filtrar movimientos y acumular
        const movimientosFiltrados = movimientos.map(m => {
            const etp = empresa_tipo_pago[m.key_empresa_tipo_pago];
            const row = pvtpMap[m.key_empresa_tipo_pago];
            if (row) {
                row.saldos += m.monto;
                if (m.monto > 0) row.entradas += m.monto;
                else row.salidas += m.monto;
            }
            return {
                hora: new SDate(m.fecha_on).toString("hh:mm"),
                descripcion: m.descripcion,
                persona: usuarios[m.key_usuario]?.Nombres || "",
                tipo: etp?.descripcion || "",
                key_tipo_pago: etp?.key_tipo_pago || "",
                tipo_: m.tipo || "",
                monto: m.monto,
                moneda: monedasMap[m.key_moneda] || null,
                key: m.key,
            };
        });

        // Preparar resumen
        const apertura = Number(cajaRaw.monto_apertura) || 0;
        let ventas = {};
        let egresos = 0;
        movimientosFiltrados.forEach(m => {
            if (m.monto > 0) ventas[m.tipo] = (ventas[m.tipo] || 0) + m.monto;
            else egresos += m.monto;
        });
        const resumen = [{ label: "Apertura", value: apertura }];
        Object.keys(ventas).forEach(k => resumen.push({ label: `Ventas ${k}`, value: ventas[k] }));
        if (egresos !== 0) resumen.push({ label: "Traspaso a banca", value: egresos });
        const total = resumen.reduce((sum, i) => sum + (Number(i.value) || 0), 0);
        resumen.push({ label: "Total", value: total });

        // Crear PDF
        SPDF.create(
            <SPDF.Page
                style={{ width: 612, height: 791, padding: 20 }}
                header={() => (
                    <SPDF.View style={{ width: "100%", alignItems: "center", marginBottom: 10 }}>
                        <SPDF.Text style={label}>Cierre de Caja</SPDF.Text>
                        <SPDF.Text style={text}>Caja: {caja.key}</SPDF.Text>
                        <SPDF.Text style={text}>Sucursal: {caja.sucursal?.descripcion || ""}</SPDF.Text>
                        <SPDF.Text style={text}>Cajero: {caja.cajero?.Nombres || ""}</SPDF.Text>
                    </SPDF.View>
                )}
                footer={({ current_page, cant_page }) => (
                    <SPDF.View style={{ width: "100%", alignItems: "center", marginTop: 10 }}>
                        <SPDF.Text style={text}>Página {current_page}/{cant_page}</SPDF.Text>
                    </SPDF.View>
                )}
            >
                {/* Resumen */}
                <SPDF.View style={{ marginBottom: 10 }}>
                    <SPDF.Text style={label}>Resumen</SPDF.Text>
                    {resumen.map(r => (
                        <SPDF.View style={{ flexDirection: "row", justifyContent: "space-between" }} key={r.label}>
                            <SPDF.Text style={text}>{r.label}</SPDF.Text>
                            <SPDF.Text style={text}>{SMath.formatMoney(r.value)}</SPDF.Text>
                        </SPDF.View>
                    ))}
                </SPDF.View>

                {/* Movimientos */}
                <SPDF.View>
                    <SPDF.Text style={label}>Movimientos</SPDF.Text>
                    {movimientosFiltrados.map(m => (
                        <SPDF.View style={{ flexDirection: "row", justifyContent: "space-between" }} key={m.key}>
                            <SPDF.Text style={text}>{m.hora}</SPDF.Text>
                            <SPDF.Text style={text}>{m.descripcion}</SPDF.Text>
                            <SPDF.Text style={text}>{m.tipo_}</SPDF.Text>
                            <SPDF.Text style={text}>{SMath.formatMoney(m.monto)}</SPDF.Text>
                            <SPDF.Text style={text}>{m.key}</SPDF.Text>
                        </SPDF.View>
                    ))}
                </SPDF.View>
            </SPDF.Page>
        );
    }
}