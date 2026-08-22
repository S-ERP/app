import React from 'react';
import { SDate, SMath, STheme } from "servisofts-component";
import * as SPDF from 'servisofts-rn-spdf';
import MDL from '../../../MDL';
import SSocket from 'servisofts-socket';
//verlo

const fontSize = 9;
const labelSize = 11;
const text = { fontSize: fontSize, font: "Roboto" };
const label = { fontSize: labelSize, fontWeight: "bold", font: "Roboto" };
const line = { width: "100%", height: 1.5, backgroundColor: "#DDDDDD" };

const toNumber = (val) => (isNaN(Number(val)) ? 0 : Number(val));
const formatCurrency = (val = 0, simbolo = '') => {
    const [integer, decimal] = toNumber(val).toFixed(5).split('.');
    const intStr = parseInt(integer, 10).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return simbolo ? `${intStr},${decimal} ${simbolo}` : `${intStr},${decimal}`;
};

export default class PdfCierreCaja {
    static espacio(h = 15) {
        return <SPDF.View style={{ width: "100%", height: h }} />;
    }

    static linea() {
        return <SPDF.View style={line} />;
    }

    static Header(caja) {
        const empresaLogo = caja?.key_empresa ? `${SSocket.api.empresa}empresa/${caja.key_empresa}` : null;

        return (
            <SPDF.View style={{ width: "100%", flexDirection: "row" }}>
                <SPDF.View style={{ flex: 3 }}>
                    {empresaLogo
                        ? <SPDF.Image src={empresaLogo} style={{ width: 75, height: 50, resizeMode: "cover" }} />
                        : <SPDF.View style={{ width: 75, height: 50 }} />}
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

    static limitarTexto(texto, max = 40) {
        if (!texto) return "";
        return texto.length > max ? texto.substring(0, max) + "..." : texto;
    }

    static Cajero(caja) {
        if (!caja) {
            return (
                <SPDF.View style={{ width: "100%", flexDirection: "row" }}>
                    <SPDF.Text style={text}>Sin datos de caja</SPDF.Text>
                </SPDF.View>
            );
        }

        const sucursalFoto = "https://raw.githubusercontent.com/S-ERP/app/refs/heads/three/src/Assets/img/sucursal.png";
        const usuarioFoto = "https://raw.githubusercontent.com/S-ERP/app/refs/heads/three/src/Assets/img/cajero.png";

        return (
            <SPDF.View style={{ width: "100%", flexDirection: "row", }}>
                <SPDF.View style={{ width: "50%" }}>
                    <SPDF.Text style={label}>Sucursal</SPDF.Text>
                    {PdfCierreCaja.espacio(8)}
                    <SPDF.View style={{ width: "100%", flexDirection: "row", }}>
                        <SPDF.View style={{ width: 29, height: 30, }}>
                            <SPDF.Image src={sucursalFoto} style={{ width: 25, height: 30, resizeMode: "cover" }} />
                        </SPDF.View>
                        <SPDF.View style={{ flex: 1, marginTop: -4, }}>
                            <SPDF.Text style={text}>{caja?.sucursal?.descripcion || "-"}</SPDF.Text>
                            <SPDF.Text style={text}>Municipio: {caja?.sucursal?.municipio}</SPDF.Text>
                            {caja?.sucursal?.direccion && (<SPDF.Text style={text}> {PdfCierreCaja.limitarTexto(caja?.sucursal?.direccion, 40)} </SPDF.Text>)}
                            {caja?.sucursal?.Telefono && (<SPDF.Text style={text}> Teléfono: {caja?.sucursal?.Telefono} </SPDF.Text>)}
                        </SPDF.View>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ width: "50%" }}>
                    <SPDF.Text style={label}>Cajero</SPDF.Text>
                    {PdfCierreCaja.espacio(8)}
                    <SPDF.View style={{ width: "100%", flexDirection: "row", }}>
                        <SPDF.View style={{ width: 29, height: 30, }}>
                            <SPDF.Image src={usuarioFoto} style={{ width: 25, height: 30, resizeMode: "cover" }} />
                        </SPDF.View>
                        <SPDF.View style={{ flex: 1, marginTop: -4, height: 60, }}>
                            {(caja?.cajero?.Nombres) && (<SPDF.Text style={text}> {caja?.cajero?.Nombres} {caja?.cajero?.Apellidos} </SPDF.Text>)}
                            {caja?.cajero?.Correo && (<SPDF.Text style={text}> {caja?.cajero?.Correo} </SPDF.Text>)}
                            {caja?.cajero?.Telefono && (<SPDF.Text style={text}> Teléfono: {caja?.cajero?.Telefono} </SPDF.Text>)}
                        </SPDF.View>
                    </SPDF.View>
                </SPDF.View>
            </SPDF.View>
        );
    }

    static detalleMovimientos(movimientos) {
        const movimientosFiltered = movimientos.filter(mov => mov.tipo_ !== "apertura");
        return movimientosFiltered.map((mov, i) => (
            <SPDF.View key={i} style={{ width: "100%", flexDirection: "row", marginBottom: 6 }}>
                <SPDF.View style={{ flex: 1 }}>
                    <SPDF.Text style={text}>{mov.hora}</SPDF.Text>
                    <SPDF.Text style={text}>{mov.persona}</SPDF.Text>
                    <SPDF.Text style={label}>{mov.tipo_}</SPDF.Text>
                    <SPDF.Text style={text}>{mov.tipo}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, alignItems: "end" }}>
                    <SPDF.Text style={label}>{mov.tipo}</SPDF.Text>
                    <SPDF.Text style={text}>tipo: {mov.key_tipo_pago}</SPDF.Text>
                    <SPDF.Text style={text}>transación: {mov.tipo_}</SPDF.Text>
                    <SPDF.Text style={{ ...text, color: mov.monto < 0 ? "#ff0000" : STheme.color.background }}>{formatCurrency(mov.monto, mov.moneda?.observacion)}</SPDF.Text>
                </SPDF.View>
            </SPDF.View>
        ));
    }

    static Resumen(resumen) {
        return (
            <SPDF.View style={{ width: "100%", flexDirection: "row" }}>
                <SPDF.View style={{ flex: 1 }} />
                <SPDF.View style={{ flex: 2, padding: 10 }}>
                    <SPDF.View style={{ width: "100%", alignItems: "center", }}> <SPDF.Text style={text}> Resumen del Cierre </SPDF.Text> </SPDF.View>
                    <SPDF.View style={{ width: "100%", borderTopWidth: 1, marginBottom: 5, marginTop: 5, borderColor: "#cec9c9" }} />

                    {resumen.map((r, i) => {
                        const isTotal = r.label === "Total";
                        return (
                            <SPDF.View key={i} style={{ width: "100%" }}>
                                {isTotal && (<SPDF.View style={{ width: "100%", borderTopWidth: 1, marginBottom: 5, marginTop: 5 }} />)}
                                <SPDF.View style={{ width: "100%", flexDirection: "row" }}>
                                    <SPDF.View style={{ flex: 1 }}> <SPDF.Text style={text}>{r.label}</SPDF.Text> </SPDF.View>
                                    <SPDF.View style={{ flex: 1, alignItems: "end", }}> <SPDF.Text style={{ ...text, color: r.value < 0 ? "#ff0000" : STheme.color.background }}>{formatCurrency(r.value, r.moneda?.observacion)}</SPDF.Text> </SPDF.View>
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
            <SPDF.View style={{ width: "100%", marginLeft: 20, marginRight: 20 }}>
                <SPDF.View style={{ width: "100%", }}> <SPDF.Text style={label}> Estado de Cuentas </SPDF.Text> </SPDF.View>
                {PdfCierreCaja.espacio(8)}
                <SPDF.View style={{ width: "100%", height: 32, flexDirection: "row", backgroundColor: "#D0D0D0" }}>
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
                            <SPDF.Text style={{ ...text, fontSize: 8, }}> {item.moneda.observacion} </SPDF.Text>
                        </SPDF.View>
                        <SPDF.View style={{ width: 60, borderWidth: 1, height: "100%", justifyContent: "center", paddingLeft: 4 }}>
                            <SPDF.Text style={{
                                ...text, fontSize: 8,
                                color: item.saldos < 0 ? "#ff0000" : item.saldos > 0 ? "#00bb00" : STheme.color.background
                            }}> {formatCurrency(item.saldos)} </SPDF.Text>
                        </SPDF.View>
                        <SPDF.View style={{ width: 60, borderWidth: 1, height: "100%", justifyContent: "center", paddingLeft: 4 }}>
                            <SPDF.Text style={{
                                ...text, fontSize: 8,
                                color: item.entradas < 0 ? "#ff0000" : item.entradas > 0 ? "#00bb00" : STheme.color.background
                            }}> {formatCurrency(item.entradas, item.moneda?.observacion)} </SPDF.Text>
                        </SPDF.View>
                        <SPDF.View style={{ width: 60, borderWidth: 1, height: "100%", justifyContent: "center", paddingLeft: 4 }}>
                            <SPDF.Text style={{
                                ...text, fontSize: 8,
                                color: item.salidas < 0 ? "#ff0000" : item.salidas > 0 ? "#00bb00" : STheme.color.background
                            }}>{formatCurrency(item.salidas, item.moneda?.observacion)} </SPDF.Text>
                        </SPDF.View>
                    </SPDF.View>
                ))}
            </SPDF.View>
        );
    }

    static VentasCaja(lista) {
        return lista.map((item, i) => (
            < SPDF.View
                key={i}
                style={{
                    width: "100%",
                    // minHeight: 22,
                    flexDirection: "row",
                    paddingBottom: 15
                }}>
                <SPDF.View style={{ flex: 1, justifyContent: "center" }}>
                    <SPDF.Text style={{ ...text, fontSize: 8, textTransform: "uppercase" }}>
                        {new SDate(item.fecha_on).toString("HH:mm")} | {item.detalle?.tipo_pago ?? "-"}
                    </SPDF.Text>
                    <SPDF.Text style={{ ...text, fontSize: 8 }}>
                        {item.detalle?.cliente?.razon_social ?? "-"}
                    </SPDF.Text>
                    <SPDF.Text style={{ ...text, fontSize: 8 }}>
                        {item.detalle?.observacion ?? "-"}
                    </SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, justifyContent: "center", paddingRight: 3 }}>
                    {(item?.detalle?.detalles ?? []).map((d, index) => (
                        <SPDF.Text style={{ ...text, fontSize: 8 }}>
                            • {d.descripcion} {d.precio_unitario_base} {item?.moneda_base?.observacion} x{d.cantidad}
                        </SPDF.Text>))}
                </SPDF.View>
                <SPDF.View style={{ flex: 1, alignItems: "flex-end", paddingRight: 3 }}>
                    {(item?.items ?? []).map((d, index) => (
                        <SPDF.View key={index} style={{ alignItems: "flex-end", width: "100%" }} >
                            <SPDF.Text style={{ ...text, fontSize: 8, width: "100%" }} >
                                {d?.tipo}
                            </SPDF.Text>
                            <SPDF.View style={{ width: 8 }} />
                            <SPDF.Text style={{ ...text, fontSize: 9, width: "100%", fontWeight: "bold", textAlign: "right" }} >
                                {formatCurrency(d?.monto, d.moneda?.observacion)}
                            </SPDF.Text>
                        </SPDF.View>
                    ))}
                    <SPDF.View style={{ width: "100%", borderTopWidth: 1, marginBottom: 5, marginTop: 5, borderColor: "#cec9c9" }} />
                    <SPDF.View style={{ width: "100%", alignItems: "end" }}>
                        <SPDF.Text style={{ ...text, fontSize: 11, width: "100%", fontWeight: "bold", textAlign: "right" }}>
                            {formatCurrency(item?.detalle?.cuotas?.total_base, item?.moneda_base?.observacion)}
                        </SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
            </SPDF.View>
        ));
    }

    static VentasCaja_(lista = []) {
        console.log("LISTA PDF", lista);
        // if (!lista?.detalle) return null;
        // if (!Array.isArray(lista) || lista.length === 0) return null;
        return (
            <SPDF.View style={{ width: "100%" }}>
                <SPDF.View style={{ height: 20 }} />
                <SPDF.Text style={{ ...label, fontSize: 12 }}>Ventas en Caja</SPDF.Text>
                {PdfCierreCaja.espacio(10)}
                {lista
                    // .filter(item => item.detalle != null)
                    .map((item, i) => (
                        < SPDF.View
                            key={i}
                            style={{
                                width: "100%",
                                // minHeight: 22,
                                flexDirection: "row",
                                paddingBottom: 15
                            }}>
                            <SPDF.View style={{ flex: 1, justifyContent: "center" }}>
                                <SPDF.Text style={{ ...text, fontSize: 8, textTransform: "uppercase" }}>
                                    {new SDate(item.fecha_on).toString("HH:mm")} | {item.detalle?.tipo_pago ?? "-"}
                                </SPDF.Text>
                                <SPDF.Text style={{ ...text, fontSize: 8 }}>
                                    {item.detalle?.cliente?.razon_social ?? "-"}
                                </SPDF.Text>
                                <SPDF.Text style={{ ...text, fontSize: 8 }}>
                                    {item.detalle?.observacion ?? "-"}
                                </SPDF.Text>
                            </SPDF.View>
                            <SPDF.View style={{ flex: 1, justifyContent: "center", paddingRight: 3 }}>
                                {(item?.detalle?.detalles ?? []).map((d, index) => (
                                    <SPDF.Text style={{ ...text, fontSize: 8 }}>
                                        • {d.descripcion} {d.precio_unitario_base} {item?.moneda_base?.observacion} x{d.cantidad}
                                    </SPDF.Text>))}
                            </SPDF.View>
                            <SPDF.View style={{ flex: 1, alignItems: "flex-end", paddingRight: 3 }}>
                                {(item?.items ?? []).map((d, index) => (
                                    <SPDF.View key={index} style={{ alignItems: "flex-end", width: "100%" }} >
                                        <SPDF.Text style={{ ...text, fontSize: 8, width: "100%" }} >
                                            {d?.tipo}
                                        </SPDF.Text>
                                        <SPDF.View style={{ width: 8 }} />
                                        <SPDF.Text style={{ ...text, fontSize: 9, width: "100%", fontWeight: "bold", textAlign: "right" }} >
                                            {formatCurrency(d?.monto, d.moneda?.observacion)}
                                        </SPDF.Text>
                                    </SPDF.View>
                                ))}
                                <SPDF.View style={{ width: "100%", borderTopWidth: 1, marginBottom: 5, marginTop: 5, borderColor: "#cec9c9" }} />
                                <SPDF.View style={{ width: "100%", alignItems: "end" }}>
                                    <SPDF.Text style={{ ...text, fontSize: 11, width: "100%", fontWeight: "bold", textAlign: "right" }}>
                                        {formatCurrency(item?.detalle?.cuotas?.total_base, item?.moneda_base?.observacion)}
                                    </SPDF.Text>
                                </SPDF.View>
                            </SPDF.View>
                        </SPDF.View>
                    ))
                }
            </SPDF.View>
        );
    }

    static Firmas() {
        return (
            <SPDF.View style={{ width: "100%", marginTop: 40, flexDirection: "row" }}>
                <SPDF.View style={{ flex: 1, alignItems: "center" }}>
                    <SPDF.View style={{ width: "90%", borderTopWidth: 1 }} />
                    <SPDF.Text style={text}>Cajero</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, alignItems: "center" }}>
                    <SPDF.View style={{ width: "90%", borderTopWidth: 1 }} />
                    <SPDF.Text style={text}>Administrador</SPDF.Text>
                </SPDF.View>
            </SPDF.View>
        );
    }

    static Footer() {
        return (
            <SPDF.View style={{ width: "100%", height: 20, flexDirection: "row" }}>
                <SPDF.View style={{ flex: 1, height: 10 }} />
                <SPDF.Text style={{ ...text, fontWeight: "bold", width: 40 }}>{"${current_page}/${cant_page}"}</SPDF.Text>
            </SPDF.View>
        );
    }

    static async imprimirPDF(key_caja) {
        console.log("📥 Iniciando carga de datos para caja:", key_caja);
        const [cajaRaw, usuarios, empresa] = await Promise.all([
            MDL.caja.getByKey(key_caja),
            MDL.usuario.getAll(),
            MDL.empresa.getFull()
        ]);
        console.log("✅ Datos cargados - cajaRaw:", cajaRaw);

        const sucursal = empresa?.sucursales.find(s => s.key === cajaRaw.key_sucursal);
        const monedas = empresa?.monedas || [];
        const monedasMap = {};
        monedas.forEach(m => { monedasMap[m.key] = m; });
        const caja = {
            ...cajaRaw,
            sucursal,
            cajero: usuarios[cajaRaw.key_usuario]
        };

        console.log("📥 Cargando movimientos, tipo_pago y detalle...");
        const [movimientosRaw, empresa_tipo_pago, rawDetalle] = await Promise.all([
            MDL.caja.getDetalle(key_caja),
            MDL.caja.empresa_tipo_pago_getAll(),
            MDL.compra_venta.getCompraVentaDetalleCaja(
                "venta",
                "2025-01-01",
                "2030-09-05",
                key_caja
            )
        ]);
        console.log("✅ Movimientos cargados:", movimientosRaw.length, "items");



        movimientosRaw.sort((a, b) =>
            new SDate(b.fecha_on, "yyyy-MM-ddThh:mm:ss").getTime() -
            new SDate(a.fecha_on, "yyyy-MM-ddThh:mm:ss").getTime()
        );

        const tipo_pago = await MDL.caja.tipo_pago_getAll();
        const cuentas = await MDL.contabilidad.getCuentasCache();
        const moneda_base = empresa.monedas.find(a => a.tipo === "base");
        let empresa_tipo_pago_pv = Object.values(
            await MDL.caja.empresa_tipo_pago_getAll({ key_punto_venta: caja.key_punto_venta })
        );

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
                key_compra_venta: m.key_compra_venta,
                hora: new SDate(m.fecha_on).toString("HH:mm"),
                descripcion: m.descripcion,
                persona: usuarios[m.key_usuario]?.Nombres || "",
                tipo: etp?.descripcion || "",
                key_tipo_pago: etp?.key_tipo_pago || "",
                tipo_: m.tipo || "",
                monto: m.monto,
                moneda: monedasMap[m.key_moneda] || moneda_base,
            };
        });

        empresa_tipo_pago_pv.sort((a, b) =>
            (a.tipo_pago?.orden || 0) - (b.tipo_pago?.orden || 0)
        );
        console.log("🔍 Buscando movimiento de apertura en:", movimientosRaw.map(m => ({ tipo: m.tipo, monto: m.monto })));
        const movimientoApertura = movimientosRaw.find(m => m.tipo === "apertura");
        console.log("✅ Movimiento apertura encontrado:", movimientoApertura);
        const apertura = movimientoApertura ? Number(movimientoApertura.monto) : (Number(cajaRaw.monto_apertura) || 0);
        console.log("💰 Monto apertura final:", apertura);

        let ventas = {};
        let egresos = 0;

        movimientos.forEach(m => {
            if (m.tipo === "apertura") {
                console.log("⏭️ Saltando movimiento de apertura");
                return;
            }
            if (m.monto > 0) {
                ventas[m.tipo] = (ventas[m.tipo] || 0) + m.monto;
            } else {
                egresos += m.monto;
            }
        });

        //detalle venta
        const detalle = Array.isArray(rawDetalle)
            ? rawDetalle
            : Object.values(rawDetalle ?? {});

        const ventasCaja = movimientos.reduce((acc, item) => {

            const key = item.key_compra_venta;

            console.log("🔎 Procesando item para ventasCaja:", { tipo: item.tipo_, key, monto: item.monto });

            if (!key) {
                console.log("⏭️ Sin key_compra_venta, saltando");
                return acc;
            }

            if (item.tipo_ === "apertura") {
                console.log("⏭️ Es apertura, saltando de ventasCaja");
                return acc;
            }

            if (!acc[key]) {
                acc[key] = {
                    key_compra_venta: key,
                    fecha_on: item.fecha_on,
                    items: [],
                    detalle: detalle.find(d => d.key === key),
                    moneda_base: moneda_base
                };
            }

            acc[key].items.push(item);

            // const campo = tiposMap[item.tipo_];

            // if (campo) {
            //     acc[key][campo] = true;
            // }

            return acc;

        }, {});

        const listaVentas = Object.values(ventasCaja);
        console.log("LISTA VENTAS pdf", listaVentas);
        //fin detalle venta

        const resumen = [];

        console.log("📋 Construyendo resumen...");
        console.log("1️⃣ Agregando Apertura:", { label: "Apertura", value: apertura, moneda: moneda_base?.observacion });
        resumen.push({
            label: "Apertura",
            value: apertura,
            moneda: moneda_base
        });

        console.log("2️⃣ Ventas por tipo:", ventas);
        Object.keys(ventas).forEach(k => {
            console.log(`  - Ventas ${k}: ${ventas[k]}`);
            resumen.push({
                label: `Ventas ${k}`,
                value: ventas[k],
                moneda: moneda_base
            });
        });

        console.log("3️⃣ Egresos:", egresos);
        if (egresos !== 0) {
            resumen.push({
                label: "Traspaso a banca",
                value: egresos,
                moneda: moneda_base
            });
        }

        const total = resumen.reduce((sum, i) => sum + (Number(i.value) || 0), 0);

        console.log("4️⃣ Total calculado:", total);
        console.log("📊 Resumen completo:", resumen.map(r => ({ label: r.label, value: r.value, formatted: formatCurrency(r.value, r.moneda?.observacion) })));

        resumen.push({
            label: "Total",
            value: total,
            moneda: moneda_base
        });
        SPDF.create(
            <SPDF.Page
                style={{ width: 612, height: 791, padding: 20 }}
                header={
                    <SPDF.View style={{ width: "100%" }}>
                        {PdfCierreCaja.Header(caja)}
                        {PdfCierreCaja.espacio(8)}
                    </SPDF.View>
                }
                footer={PdfCierreCaja.Footer()}
            >
                {PdfCierreCaja.Cajero(caja)}
                {PdfCierreCaja.espacio(8)}
                <SPDF.View style={{ width: "100%", alignItems: "center" }}> <SPDF.Text style={{ ...label, fontSize: 12 }}> Detalle ded Transacciones </SPDF.Text> </SPDF.View>
                {PdfCierreCaja.espacio(8)}
                {PdfCierreCaja.linea()}
                {PdfCierreCaja.espacio(8)}
                {PdfCierreCaja.detalleMovimientos(movimientos)}
                {PdfCierreCaja.espacio(8)}
                {PdfCierreCaja.linea()}
                {PdfCierreCaja.espacio(20)}
                <SPDF.View style={{ width: "100%", alignItems: "center" }}><SPDF.Text style={{ ...label, fontSize: 12 }}>
                    Ventas en Caja
                </SPDF.Text></SPDF.View>
                {PdfCierreCaja.espacio(10)}
                {PdfCierreCaja.linea()}
                {PdfCierreCaja.espacio(10)}
                {PdfCierreCaja.VentasCaja(listaVentas)}
                {PdfCierreCaja.espacio(20)}
                {PdfCierreCaja.espacio()}
                {PdfCierreCaja.Resumen(resumen)}
                {PdfCierreCaja.espacio()}
                {PdfCierreCaja.TablaPagos(empresa_tipo_pago_pv)}
                {PdfCierreCaja.espacio(20)}
                {/* {PdfCierreCaja.linea()} */}
                {/* {PdfCierreCaja.VentasCaja(listaVentas)}
                {PdfCierreCaja.espacio(20)} */}
                {PdfCierreCaja.linea()}
                {PdfCierreCaja.espacio(100)}
                {/* {PdfCierreCaja.linea()} */}
                {/* {PdfCierreCaja.espacio()} */}
                {PdfCierreCaja.Firmas()}
            </SPDF.Page>
        );
    }
}