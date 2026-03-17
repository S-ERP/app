import React from 'react';
import { SDate, SMath, STheme } from "servisofts-component";
import * as SPDF from 'servisofts-rn-spdf';
import MDL from '../../../MDL';

const fontSize = 9;
const labelSize = 11;
const text = { fontSize: fontSize, font: "Roboto" };
const label = { fontSize: labelSize, fontWeight: "bold", font: "Roboto" };
const line = { width: "100%", height: 1.5, backgroundColor: "#DDDDDD" };

export default class PdfCierreCaja {

    static espacio(h = 15) { 
        return <SPDF.View style={{ width: "100%", height: h }} />; 
    }
    
    static linea() { 
        return <SPDF.View style={line} />; 
    }

    // ===================== Funciones Auxiliares =====================
    static Header(caja) {
        return (
            <SPDF.View style={{ width: "100%", flexDirection: "row" }}>
                <SPDF.View style={{ flex: 3 }}>
                    <SPDF.Image src={caja?.sucursal?.logo || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfiwNZOWWU_5snwjBWULhLyjSjuVLyJw1SQg&s"} style={{ width: 100, height: 50 }} />
                    <SPDF.Text style={{ ...label, fontSize: 16 }}>{caja?.sucursal?.descripcion}</SPDF.Text>
                    <SPDF.Text style={text}>{caja?.sucursal?.direccion}</SPDF.Text>
                    <SPDF.Text style={text}>Tel: {caja?.sucursal?.telefono}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 2, alignItems: "end" }}>
                    <SPDF.Text style={{ ...label, fontSize: 16 }}>CIERRE DE CAJA</SPDF.Text>
                    <SPDF.Text style={text}>Fecha: {new SDate(caja?.fecha_on).toString("yyyy MMM dd hh:mm")}</SPDF.Text>
                    <SPDF.Text style={text}>Cajero: {caja?.cajero?.Nombres}</SPDF.Text>
                    <SPDF.Text style={text}>Caja: NRO.45</SPDF.Text>
                </SPDF.View>
            </SPDF.View>
        );
    }

    static Cajero(caja) {
        return (
            <SPDF.View style={{ width: "100%", marginTop: 16 }}>
                <SPDF.Text style={label}>Sucursal / Cajero</SPDF.Text>
                {PdfCierreCaja.espacio(8)}
                <SPDF.View style={{ width: "100%", flexDirection: "row", alignItems: "center" }}>
                    <SPDF.Image src={caja?.cajero?.foto || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} style={{ width: 40, height: 40 }} />
                    <SPDF.View style={{ marginLeft: 8 }}>
                        <SPDF.Text style={label}>{caja?.sucursal?.descripcion}</SPDF.Text>
                        <SPDF.Text style={text}>{caja?.cajero?.Nombres}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
            </SPDF.View>
        );
    }

    static detalleMovimientos(movimientos, usuarios, empresa_tipo_pago, monedasMap) {
        return movimientos.map((mov, i) => (
            <SPDF.View key={i} style={{ width: "100%", flexDirection: "row", marginBottom: 6 }}>
                <SPDF.View style={{ flex: 1 }}>
                    <SPDF.Text style={text}>{mov.hora}</SPDF.Text>
                    <SPDF.Text style={text}>{mov.persona}</SPDF.Text>
                    <SPDF.Text style={label}>{mov.tipo_}</SPDF.Text>
                    <SPDF.Text style={label}>{mov.tipo}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, alignItems: "end" }}>
                    <SPDF.Text style={{ ...text, color: mov.monto < 0 ? "#ff0000" : STheme.color.text }}>
                        {SMath.formatMoney(mov.monto)} {mov.moneda?.observacion}
                    </SPDF.Text>
                    <SPDF.Text style={text}>Tipo pago: {mov.key_tipo_pago}</SPDF.Text>
                </SPDF.View>
            </SPDF.View>
        ));
    }

    static Resumen(resumen) {
        return (
            <SPDF.View style={{ width: "100%", marginTop: 10 }}>
                {resumen.map((r, i) => (
                    <SPDF.View key={i} style={{ width: "100%", flexDirection: "row", marginBottom: 2 }}>
                        <SPDF.View style={{ flex: 1 }}><SPDF.Text style={text}>{r.label}</SPDF.Text></SPDF.View>
                        <SPDF.View style={{ flex: 1, alignItems: "end" }}>
                            <SPDF.Text style={{ color: r.value < 0 ? "#ff0000" : STheme.color.text }}>
                                {SMath.formatMoney(r.value)}
                            </SPDF.Text>
                        </SPDF.View>
                    </SPDF.View>
                ))}
            </SPDF.View>
        );
    }

    static TablaPagos(tabla) {
        return (
            <SPDF.View style={{ width: "100%", marginTop: 10 }}>
                <SPDF.View style={{ width: "100%", flexDirection: "row", backgroundColor: "#D0D0D0" }}>
                    {["Cuenta", "Moneda", "Saldo", "Entradas", "Salidas"].map((h, i) => (
                        <SPDF.View key={i} style={{ flex: 1, borderWidth: 1, justifyContent: "center", padding: 4 }}>
                            <SPDF.Text style={label}>{h}</SPDF.Text>
                        </SPDF.View>
                    ))}
                </SPDF.View>
                {tabla.map((t, i) => (
                    <SPDF.View key={i} style={{ width: "100%", flexDirection: "row" }}>
                        <SPDF.View style={{ flex: 1, borderWidth: 1, padding: 4 }}><SPDF.Text style={text}>{t.tipo_pago?.descripcion} {t.descripcion}</SPDF.Text></SPDF.View>
                        <SPDF.View style={{ flex: 1, borderWidth: 1, padding: 4 }}><SPDF.Text style={text}>{t.moneda?.observacion}</SPDF.Text></SPDF.View>
                        <SPDF.View style={{ flex: 1, borderWidth: 1, padding: 4 }}><SPDF.Text style={text}>{SMath.formatMoney(t.saldos)}</SPDF.Text></SPDF.View>
                        <SPDF.View style={{ flex: 1, borderWidth: 1, padding: 4 }}><SPDF.Text style={text}>{SMath.formatMoney(t.entradas)}</SPDF.Text></SPDF.View>
                        <SPDF.View style={{ flex: 1, borderWidth: 1, padding: 4 }}><SPDF.Text style={text}>{SMath.formatMoney(t.salidas)}</SPDF.Text></SPDF.View>
                    </SPDF.View>
                ))}
            </SPDF.View>
        );
    }

    static Firmas() {
        return (
            <SPDF.View style={{ width: "100%", marginTop: 40, flexDirection: "row" }}>
                <SPDF.View style={{ flex: 1, alignItems: "center" }}>
                    <SPDF.View style={{ width: 150, borderTopWidth: 1 }} />
                    <SPDF.Text style={{ ...text }}>Cajero</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, alignItems: "center" }}>
                    <SPDF.View style={{ width: 150, borderTopWidth: 1 }} />
                    <SPDF.Text style={{ ...text }}>Administrador</SPDF.Text>
                </SPDF.View>
            </SPDF.View>
        );
    }

    static Footer() {
        return (
            <SPDF.View style={{ width: "100%", alignItems: "center", marginTop: 20 }}>
                <SPDF.Text style={text}>Página {"${current_page}/${cant_page}"}</SPDF.Text>
            </SPDF.View>
        );
    }

    // ===================== Función principal =====================
    static async imprimirPDF(key_caja) {
        // ===================== Cargar datos =====================
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

        const [movimientosRaw, empresa_tipo_pago] = await Promise.all([
            MDL.caja.getDetalle(key_caja),
            MDL.caja.empresa_tipo_pago_getAll()
        ]);

        const tipo_pago = await MDL.caja.tipo_pago_getAll();
        const cuentas = await MDL.contabilidad.getCuentasCache();
        const moneda_base = empresa.monedas.find(a => a.tipo === "base");

        // ===================== Preparar tabla por tipo de pago =====================
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

        // ===================== Filtrar movimientos =====================
        const movimientos = movimientosRaw.map(m => {
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
                tipo: empresa_tipo_pago[m.key_empresa_tipo_pago]?.descripcion || "",
                key_tipo_pago: m.key_empresa_tipo_pago,
                tipo_: m.tipo,
                monto: m.monto,
                moneda: monedasMap[m.key_moneda] || moneda_base,
            };
        });

        // ===================== Resumen =====================
        const apertura = Number(cajaRaw.monto_apertura) || 0;
        let ventas = {}, egresos = 0;
        movimientos.forEach(m => {
            if (m.monto > 0) ventas[m.tipo_] = (ventas[m.tipo_] || 0) + m.monto;
            else egresos += m.monto;
        });
        const resumen = [{ label: "Apertura", value: apertura }];
        Object.keys(ventas).forEach(k => resumen.push({ label: `Ventas ${k}`, value: ventas[k] }));
        if (egresos !== 0) resumen.push({ label: "Traspaso a banca", value: egresos });
        resumen.push({ label: "Total", value: resumen.reduce((sum, i) => sum + i.value, 0) });

        // ===================== Crear PDF =====================
        SPDF.create(
            <SPDF.Page
                style={{ width: 612, height: 791, padding: 20 }}
                header={<>{PdfCierreCaja.Header(caja)}{PdfCierreCaja.Cajero(caja)}{PdfCierreCaja.linea()}</>}
                footer={PdfCierreCaja.Footer()}
            >
                {PdfCierreCaja.detalleMovimientos(movimientos, usuarios, empresa_tipo_pago, monedasMap)}
                {PdfCierreCaja.Resumen(resumen)}
                {PdfCierreCaja.TablaPagos(tabla)}
                {PdfCierreCaja.Firmas()}
            </SPDF.Page>
        );
    }
}