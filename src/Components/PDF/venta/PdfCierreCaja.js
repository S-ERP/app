import React from 'react';
import { SDate, SMath, STheme } from "servisofts-component";
import * as SPDF from 'servisofts-rn-spdf';
import MDL from '../../../MDL';
// import MDL from '../MDL';

// Tipos de letra y tamaños
const fontSize = 9;
const labelSize = 11;

const text = { fontSize: fontSize, font: "Roboto" };
const label = { fontSize: labelSize, fontWeight: "bold", font: "Roboto" };
const line = { width: "100%", height: 1.5, backgroundColor: "#DDDDDD" };

export default class PdfCierreCaja {

    static async imprimirPDF(key_caja) {
        // Cargar datos
        const [cajaRaw, usuarios, empresa] = await Promise.all([
            MDL.caja.getByKey(key_caja),
            MDL.usuario.getAll(),
            MDL.empresa.getFull()
        ]);

        const sucursal = empresa?.sucursales.find(s => s.key === cajaRaw.key_sucursal);
        const monedas = empresa?.monedas || [];
        const monedasMap = {};
        monedas.forEach(m => monedasMap[m.key] = m);

        const caja = {
            ...cajaRaw,
            sucursal,
            cajero: usuarios[cajaRaw.key_usuario],
        };

        // Movimientos y tipos de pago
        const [movimientosRaw, empresa_tipo_pago] = await Promise.all([
            MDL.caja.getDetalle(key_caja),
            MDL.caja.empresa_tipo_pago_getAll()
        ]);

        const tipo_pago = await MDL.caja.tipo_pago_getAll();
        const cuentas = await MDL.contabilidad.getCuentasCache();
        const moneda_base = empresa.monedas.find(a => a.tipo === "base");

        // Preparar tabla por tipo de pago
        let tabla = Object.values(empresa_tipo_pago).map(item => {
            const cuenta = cuentas[item.key_cuenta_contable];
            const moneda = empresa.monedas.find(m => m.key === cuenta?.key_moneda) ?? moneda_base;
            return {
                ...item,
                cuenta,
                moneda,
                tipo_pago: tipo_pago[item.key_tipo_pago],
                saldos: 0,
                entradas: 0,
                salidas: 0,
            };
        });
        const tablaMap = {};
        tabla.forEach(t => tablaMap[t.key] = t);

        // Filtrar movimientos
        const movimientos = movimientosRaw.map(m => {
            const etp = empresa_tipo_pago[m.key_empresa_tipo_pago];
            const row = tablaMap[m.key_empresa_tipo_pago];
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
                key: m.key
            };
        });

        movimientos.sort((a, b) => new SDate(b.fecha_on, "yyyy-MM-ddThh:mm:ss").getTime() - new SDate(a.fecha_on, "yyyy-MM-ddThh:mm:ss").getTime());

        // Calcular resumen
        const apertura = Number(cajaRaw.monto_apertura) || 0;
        let ventas = {};
        let egresos = 0;
        movimientos.forEach(m => {
            if (m.monto > 0) ventas[m.tipo] = (ventas[m.tipo] || 0) + m.monto;
            else egresos += m.monto;
        });
        const resumen = [{ label: "Apertura", value: apertura }];
        Object.keys(ventas).forEach(k => resumen.push({ label: `Ventas ${k}`, value: ventas[k] }));
        if (egresos !== 0) resumen.push({ label: "Traspaso a banca", value: egresos });
        const total = resumen.reduce((sum, i) => sum + (Number(i.value) || 0), 0);
        resumen.push({ label: "Total", value: total });

        // Funciones auxiliares
        const espacio = h => <SPDF.View style={{ width: "100%", height: h || 15 }} />;
        const espacioPequeño = () => espacio(8);

        const header = () => (
            <SPDF.View style={{ width: "100%" }}>
                <SPDF.View style={{ width: "100%", flexDirection: "row" }}>
                    <SPDF.View style={{ flex: 3 }}>
                        <SPDF.Image src={`https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfiwNZOWWU_5snwjBWULhLyjSjuVLyJw1SQg&s`} style={{ width: 100, height: 50 }} />
                        <SPDF.Text style={{ ...label, fontSize: 16 }}> {caja?.sucursal?.descripcion} </SPDF.Text>
                        <SPDF.Text style={text}> {caja?.sucursal?.direccion} </SPDF.Text>
                        <SPDF.Text style={text}> Tel: {caja?.sucursal?.telefono} </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ flex: 2, alignItems: "end" }}>
                        <SPDF.Text style={{ ...label, fontSize: 16 }}> CIERRE DE CAJA </SPDF.Text>
                        <SPDF.Text style={text}> Fecha: {new SDate(caja?.fecha_on).toString("yyyy MMM dd hh:mm")} </SPDF.Text>
                        <SPDF.Text style={text}> Cajero: {caja?.cajero?.Nombres} </SPDF.Text>
                        <SPDF.Text style={text}> Caja: NRO.45 </SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
            </SPDF.View>
        );

        const detalleMovimientos = () => movimientos.map((mov, i) => (
            <SPDF.View key={i} style={{ width: "100%", flexDirection: "row", marginBottom: 6 }}>
                <SPDF.View style={{ flex: 1 }}>
                    <SPDF.Text style={text}>{mov.hora}</SPDF.Text>
                    <SPDF.Text style={text}>{mov.persona}</SPDF.Text>
                    <SPDF.Text style={label}>{mov.tipo_}</SPDF.Text>
                    <SPDF.Text style={label}>{mov.tipo}</SPDF.Text>
                    <SPDF.Text style={text}>Key: {mov.key}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, alignItems: "end" }}>
                    <SPDF.Text style={{ ...text, color: mov.monto < 0 ? "#ff0000" : STheme.color.text }}>Monto: {SMath.formatMoney(mov.monto)} {mov.moneda?.observacion}</SPDF.Text>
                </SPDF.View>
            </SPDF.View>
        ));

        const tablaTiposPago = () => (
            <SPDF.View style={{ width: "100%", marginTop: 10 }}>
                <SPDF.View style={{ width: "100%", flexDirection: "row", backgroundColor: "#D0D0D0" }}>
                    <SPDF.View style={{ flex: 2, borderWidth: 1, padding: 4 }}><SPDF.Text style={text}>Cuenta</SPDF.Text></SPDF.View>
                    <SPDF.View style={{ flex: 1, borderWidth: 1, padding: 4 }}><SPDF.Text style={text}>Moneda</SPDF.Text></SPDF.View>
                    <SPDF.View style={{ flex: 1, borderWidth: 1, padding: 4 }}><SPDF.Text style={text}>Saldo</SPDF.Text></SPDF.View>
                    <SPDF.View style={{ flex: 1, borderWidth: 1, padding: 4 }}><SPDF.Text style={text}>Entradas</SPDF.Text></SPDF.View>
                    <SPDF.View style={{ flex: 1, borderWidth: 1, padding: 4 }}><SPDF.Text style={text}>Salidas</SPDF.Text></SPDF.View>
                </SPDF.View>
                {tabla.map((t, i) => (
                    <SPDF.View key={i} style={{ width: "100%", flexDirection: "row" }}>
                        <SPDF.View style={{ flex: 2, borderWidth: 1, padding: 4 }}><SPDF.Text style={text}>{t.tipo_pago?.descripcion} {t.descripcion}</SPDF.Text></SPDF.View>
                        <SPDF.View style={{ flex: 1, borderWidth: 1, padding: 4 }}><SPDF.Text style={text}>{t.moneda?.observacion}</SPDF.Text></SPDF.View>
                        <SPDF.View style={{ flex: 1, borderWidth: 1, padding: 4 }}><SPDF.Text style={text}>{SMath.formatMoney(t.saldos)}</SPDF.Text></SPDF.View>
                        <SPDF.View style={{ flex: 1, borderWidth: 1, padding: 4 }}><SPDF.Text style={text}>{SMath.formatMoney(t.entradas)}</SPDF.Text></SPDF.View>
                        <SPDF.View style={{ flex: 1, borderWidth: 1, padding: 4 }}><SPDF.Text style={text}>{SMath.formatMoney(t.salidas)}</SPDF.Text></SPDF.View>
                    </SPDF.View>
                ))}
            </SPDF.View>
        );

        const resumenPDF = () => (
            <SPDF.View style={{ width: "100%", marginTop: 10 }}>
                {resumen.map((r, i) => (
                    <SPDF.View key={i} style={{ width: "100%", flexDirection: "row" }}>
                        <SPDF.View style={{ flex: 1 }}><SPDF.Text style={text}>{r.label}</SPDF.Text></SPDF.View>
                        <SPDF.View style={{ flex: 1, alignItems: "end" }}>
                            <SPDF.Text style={{ ...text, color: r.value < 0 ? "#ff0000" : STheme.color.text }}>{SMath.formatMoney(r.value)}</SPDF.Text>
                        </SPDF.View>
                    </SPDF.View>
                ))}
            </SPDF.View>
        );

        const firmas = () => (
            <SPDF.View style={{ width: "100%", marginTop: 40, flexDirection: "row" }}>
                <SPDF.View style={{ flex: 1, alignItems: "center" }}>
                    <SPDF.View style={{ width: 150, borderTopWidth: 1 }} />
                    <SPDF.Text style={text}>Cajero</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, alignItems: "center" }}>
                    <SPDF.View style={{ width: 150, borderTopWidth: 1 }} />
                    <SPDF.Text style={text}>Administrador</SPDF.Text>
                </SPDF.View>
            </SPDF.View>
        );

        const footer = () => (
            <SPDF.View style={{ width: "100%", alignItems: "center", marginTop: 20 }}>
                <SPDF.Text style={text}>Página {"${current_page}/${cant_page}"}</SPDF.Text>
            </SPDF.View>
        );

        // Generar PDF
        SPDF.create(
            <SPDF.Page style={{ width: 612, height: 791, padding: 20 }} header={header()} footer={footer()}>
                {detalleMovimientos()}
                {espacio()}
                {resumenPDF()}
                {espacio()}
                {tablaTiposPago()}
                {espacio()}
                {firmas()}
            </SPDF.Page>
        );
    }
}