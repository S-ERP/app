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
                    <SPDF.Text style={text}>Fecha: {new SDate(caja?.fecha_on).toString("yyyy MMM dd HH:mm")}</SPDF.Text>
                    <SPDF.Text style={text}>Cajero: {caja?.cajero?.Nombres}</SPDF.Text>
                    <SPDF.Text style={text}>Caja: NRO.45</SPDF.Text>
                </SPDF.View>
            </SPDF.View>
        );
    }
    static Cajero(caja) {
        return (
            <SPDF.View style={{ width: "100%" }}>
                <SPDF.Text style={label}>Sucursal / Cajero</SPDF.Text>
                {PdfCierreCaja.espacio(8)}
                <SPDF.View style={{ width: "100%", flexDirection: "row", }}>
                    <SPDF.View style={{ width: 50, height: 40, }}>
                        <SPDF.Image src={caja?.cajero?.foto || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} style={{ width: 40, height: 40 }} />
                    </SPDF.View>
                    <SPDF.View style={{ flex: 1, }}>
                        <SPDF.Text style={label}>{caja?.sucursal?.descripcion}</SPDF.Text>
                        <SPDF.Text style={text}>{caja?.cajero?.Nombres}</SPDF.Text>
                    </SPDF.View></SPDF.View>
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
                    <SPDF.Text style={label}>{mov.tipo}</SPDF.Text>
                    <SPDF.Text style={label}>tipo: {mov.key_tipo_pago}</SPDF.Text>
                    <SPDF.Text style={label}>transación: {mov.tipo_}</SPDF.Text>
                    <SPDF.Text style={{ ...text, color: mov.monto < 0 ? "#ff0000" : STheme.color.background }}>Monto: {mov.monto} {mov.moneda.observacion}</SPDF.Text>
                </SPDF.View>
            </SPDF.View>
        ));
    }
    static Resumen(resumen) {
        return (
            <SPDF.View style={{ width: "100%", flexDirection: "row" }}>
                <SPDF.View style={{ flex: 1 }} />
                <SPDF.View style={{ flex: 2, padding: 10 }}>

                    {resumen.map((r, i) => {
                        const isTotal = r.label === "Total";
                        return (
                            <SPDF.View key={i} style={{ width: "100%" }}>
                                {isTotal && (<SPDF.View style={{ width: "100%", borderTopWidth: 1, marginBottom: 5, marginTop: 5 }} />)}
                                <SPDF.View style={{ width: "100%", flexDirection: "row" }}>
                                    <SPDF.View style={{ flex: 1 }}> <SPDF.Text style={text}>{r.label}</SPDF.Text> </SPDF.View>
                                    <SPDF.View style={{ flex: 1, alignItems: "end", }}> <SPDF.Text style={{ color: r.value < 0 ? "#ff0000" : STheme.color.background }}>{r.value}</SPDF.Text> </SPDF.View>
                                </SPDF.View>
                            </SPDF.View>
                        );
                    })}</SPDF.View>
                <SPDF.View style={{ flex: 1 }} />
            </SPDF.View>
        );
    }
    static TablaPagos(tabla) {
        return (
            <SPDF.View style={{ width: "100%", marginLeft: 80, marginRight: 80 }}>
                <SPDF.View style={{ width: "100%", height: 44, flexDirection: "row", backgroundColor: "#D0D0D0" }}>
                    <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                        <SPDF.Text style={{ ...text, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center" }}>Cuenta</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: 60, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                        <SPDF.Text style={{ ...text, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center" }}>Moneda</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: 60, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                        <SPDF.Text style={{ ...text, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center" }}>Saldo</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: 60, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                        <SPDF.Text style={{ ...text, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center" }}>Entradas</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: 60, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                        <SPDF.Text style={{ ...text, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center" }}>Salidas</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>{tabla.map((item, i) => (
                    <SPDF.View key={i} style={{ width: "100%", height: 28, flexDirection: "row" }}>
                        <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", paddingLeft: 4 }}>
                            <SPDF.Text style={{ ...text, fontSize: 8 }}> {item.descripcion} {item.tipo_pago.descripcion} {item.moneda.descripcion} </SPDF.Text>
                        </SPDF.View>
                        <SPDF.View style={{ width: 60, borderWidth: 1, height: "100%", justifyContent: "center", paddingLeft: 4 }}>
                            <SPDF.Text style={{ ...text, fontSize: 8 }}> {item.moneda.observacion} </SPDF.Text>
                        </SPDF.View>
                        <SPDF.View style={{ width: 60, borderWidth: 1, height: "100%", justifyContent: "center", paddingLeft: 4 }}>
                            <SPDF.Text style={{ ...text, fontSize: 8 }}> {SMath.formatMoney(item.saldos)} </SPDF.Text>
                        </SPDF.View>
                        <SPDF.View style={{ width: 60, borderWidth: 1, height: "100%", justifyContent: "center", paddingLeft: 4 }}>
                            <SPDF.Text style={{ ...text, fontSize: 8 }}> {item.moneda.observacion}{SMath.formatMoney(item.entradas)} </SPDF.Text>
                        </SPDF.View>
                        <SPDF.View style={{ width: 60, borderWidth: 1, height: "100%", justifyContent: "center", paddingLeft: 4 }}>
                            <SPDF.Text style={{ ...text, fontSize: 8 }}> {item.moneda.observacion}{SMath.formatMoney(item.salidas)} </SPDF.Text>
                        </SPDF.View>
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
                    <SPDF.Text style={text}>Cajero</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, alignItems: "center" }}>
                    <SPDF.View style={{ width: 150, borderTopWidth: 1 }} />
                    <SPDF.Text style={text}>Administrador</SPDF.Text>
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
    static async imprimirPDF(key_caja) {
        const [cajaRaw, usuarios, empresa] = await Promise.all([
            MDL.caja.getByKey(key_caja),
            MDL.usuario.getAll(),
            MDL.empresa.getFull()
        ]);

        const sucursal = empresa?.sucursales.find(s => s.key === cajaRaw.key_sucursal);
        const monedas = empresa?.monedas || [];
        const monedasMap = {};
        monedas.forEach(m => { monedasMap[m.key] = m; });
        const caja = { ...cajaRaw, sucursal, cajero: usuarios[cajaRaw.key_usuario] };
        const [movimientosRaw, empresa_tipo_pago] = await Promise.all([
            MDL.caja.getDetalle(key_caja),
            MDL.caja.empresa_tipo_pago_getAll()
        ]);
        movimientosRaw.sort((a, b) => new SDate(b.fecha_on, "yyyy-MM-ddThh:mm:ss").getTime() - new SDate(a.fecha_on, "yyyy-MM-ddThh:mm:ss").getTime());
        const tipo_pago = await MDL.caja.tipo_pago_getAll();
        const cuentas = await MDL.contabilidad.getCuentasCache();
        const moneda_base = empresa.monedas.find(a => a.tipo === "base");
        let empresa_tipo_pago_pv = Object.values(await MDL.caja.empresa_tipo_pago_getAll({ key_punto_venta: caja.key_punto_venta }));
        empresa_tipo_pago_pv = empresa_tipo_pago_pv.map(item => {
            item.cuenta = cuentas[item.key_cuenta_contable];
            item.moneda = empresa.monedas.find(a => a.key === item?.cuenta?.key_moneda) || moneda_base;
            item.tipo_pago = tipo_pago[item.key_tipo_pago];
            item.saldos = 0;
            item.entradas = 0;
            item.salidas = 0;
            return item;
        });

        const pvtpMap = {};
        empresa_tipo_pago_pv.forEach(p => { pvtpMap[p.key] = p; });
        const movimientos = movimientosRaw.map(m => {
            const etp = empresa_tipo_pago[m.key_empresa_tipo_pago];
            const row = pvtpMap[m.key_empresa_tipo_pago];
            if (row) {
                row.saldos += m.monto;
                if (m.monto > 0) row.entradas += m.monto;
                else row.salidas += m.monto;
            }
            return {
                hora: new SDate(m.fecha_on).toString("HH:mm"),
                descripcion: m.descripcion,
                persona: usuarios[m.key_usuario]?.Nombres || "",
                tipo: etp?.descripcion || "",
                key_tipo_pago: etp?.key_tipo_pago || "",
                tipo_: m.tipo || "",
                monto: m.monto,
                moneda: monedasMap[m.key_moneda] || null,
            };
        });

        empresa_tipo_pago_pv.sort((a, b) => a.tipo_pago?.orden - b.tipo_pago?.orden);
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
        resumen.push({ label: "Total", value: resumen.reduce((sum, i) => sum + (Number(i.value) || 0), 0) });
        SPDF.create(
            <SPDF.Page
                style={{ width: 612, height: 791, padding: 20 }}
                header={
                    <SPDF.View style={{ width: "100%", }}>
                        {PdfCierreCaja.Header(caja)}
                        {PdfCierreCaja.espacio(8)}
                        {PdfCierreCaja.Cajero(caja)}
                        <SPDF.View style={{ width: "100%", alignItems: "center", }}> <SPDF.Text style={text}> DETALLE </SPDF.Text> </SPDF.View>
                        {PdfCierreCaja.espacio(8)}
                        {PdfCierreCaja.linea()}
                    </SPDF.View>
                }
                footer={PdfCierreCaja.Footer()}
            >

                {PdfCierreCaja.espacio(8)}
                {PdfCierreCaja.detalleMovimientos(movimientos)}
                {PdfCierreCaja.espacio(8)}
                {PdfCierreCaja.linea()}
                {PdfCierreCaja.espacio()}
                {PdfCierreCaja.Resumen(resumen)}
                {PdfCierreCaja.espacio()}
                {PdfCierreCaja.TablaPagos(empresa_tipo_pago_pv)}
                {PdfCierreCaja.espacio()}
                {PdfCierreCaja.Firmas()}
            </SPDF.Page>
        );
    }
}