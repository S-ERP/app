import React, { Component } from 'react';
import { SPage, SPopup, SView, SText, STheme, SHr, SImage, SNavigation, SDate, SInput, SMath, SNotification } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import { Dimensions } from 'react-native';
import SSocket from 'servisofts-socket';
import SIconApp from '../../Assets/SIconApp';
import Config from '../../Config';
import Model from '../../Model';
import ReciboCarta from '../../Components/PDF/venta/ReciboCarta';
import MDL from '../../MDL';
import ReciboRollo from '../../Components/PDF/venta/ReciboRollo';
import PopupUploadFactura from './Components/PopupUploadFactura';
import { Linking } from 'react-native'
import FechaFullFilter from '../../Components/FechaFullFilter';

const TIPO_PRODUCTO_MAP = {
    servicio: { color: "#2563eb", label: "Servicio" },
    inventario: { color: "#f59e0b", label: "Inventario" },
};
const getTiposProducto = (detalles = []) =>
    [...new Set(detalles.map(d => d.data?.tipo_producto ?? "").filter(Boolean))];

export default class tabla extends Component {

    constructor(props) {
        super(props);
        const hoy = new Date();
        const pad = n => String(n).padStart(2, '0');
        const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        this.state = {
            pdfFiles: {},
            fecha_inicio: fmt(new Date(hoy.getFullYear(), hoy.getMonth(), 1)),
            fecha_fin: fmt(new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)),
        };
    }

    async loadInitialData() {
        try {
            SNotification.send({
                key: "load_ventas",
                title: "Cargando ventas...",
                type: "loading",
            });
            const registros = await MDL.compra_venta.getTransaccion("venta", "2025-01-01", "2030-09-05");
            const empresa = await MDL.empresa.getFull();
            if (!registros || !empresa) {
                console.warn("No se encontraron registros o no se pudo obtener la empresa.");
                SNotification.send({
                    key: "load_ventas",
                    title: "Sin datos",
                    body: "No se encontraron ventas en el rango de fechas seleccionado.",
                    color: STheme.color.warning,
                    time: 3000,
                });
                return [];
            }
            const sucursales = empresa?.sucursales || [];
            const ventas = Object.values(registros).filter(cv => cv.tipo === "venta");
            if (ventas.length === 0) console.warn("No se encontraron ventas.");
            const keysUsuarios = [...new Set(ventas.map(v => v.key_usuario).filter(Boolean))];
            const usuarios = await MDL.usuario.getByKeys(keysUsuarios);
            const usuariosMap = Array.isArray(usuarios) ? Object.fromEntries(usuarios.map(u => [u.key, u])) : usuarios || {};
            const [proveedores, clientes, habilidadResp, resumenCuotasResp] = await Promise.all([
                MDL.inventario.proveedor.getAllProveedor(),
                MDL.crm.cliente.getAll(),
                MDL.habilidad.getAllWithUsuarios(),
                MDL.compra_venta.getCuotasResumenTotal_ventas(),
            ]);
            if (!proveedores) console.warn("No se pudieron obtener proveedores.");
            if (!clientes) console.warn("No se pudieron obtener clientes.");
            const clientesMap = Array.isArray(clientes) ? Object.fromEntries(clientes.map(c => [c.key, c])) : clientes || {};
            const habilidadArr = Array.isArray(habilidadResp) ? habilidadResp : Object.values(habilidadResp || {});
            const resumenCuotasArr = Array.isArray(resumenCuotasResp) ? resumenCuotasResp : Object.values(resumenCuotasResp || {});
            // Deuda agregada por cliente sumando TODAS sus ventas (no solo la venta de esta fila).
            const clienteAgregadoMap = {};
            ventas.forEach(v => {
                const keyCliente = v.key_cliente;
                if (!keyCliente) return;
                if (!clienteAgregadoMap[keyCliente]) {
                    clienteAgregadoMap[keyCliente] = { total_map: {}, pagado_map: {}, mora_map: {}, total_base: 0, pagado_base: 0, mora_base: 0 };
                }
                const acc = clienteAgregadoMap[keyCliente];
                const key = v.key_moneda || 'desconocida';
                const tot = Number(v.cuotas?.total || 0);
                const pag = Number(v.monto_amortizado || 0);
                const mora = Number(v.cuotas_en_mora?.monto || 0);
                if (tot > 0) acc.total_map[key] = (acc.total_map[key] || 0) + tot;
                if (pag > 0) acc.pagado_map[key] = (acc.pagado_map[key] || 0) + pag;
                if (mora > 0) acc.mora_map[key] = (acc.mora_map[key] || 0) + mora;
                acc.total_base += Number(v.cuotas?.total_base || 0);
                acc.pagado_base += Number(v.monto_amortizado_base || 0);
                acc.mora_base += Number(v.cuotas_en_mora?.monto_base || 0);
            });
            const getDeudaClienteAgregada = keyCliente => {
                const acc = clienteAgregadoMap[keyCliente];
                if (!acc) return { deuda_por_moneda: {}, mora_por_moneda: {}, totales_base: { deuda: 0, mora: 0 } };
                const deuda_por_moneda = {};
                Object.keys(acc.total_map).forEach(k => {
                    const d = (acc.total_map[k] || 0) - (acc.pagado_map[k] || 0);
                    if (d > 0) deuda_por_moneda[k] = d;
                });
                return {
                    deuda_por_moneda,
                    mora_por_moneda: acc.mora_map,
                    totales_base: { deuda: acc.total_base - acc.pagado_base, mora: acc.mora_base },
                };
            };
            // Antes: una llamada por key_compra_venta_detalle (97+ sockets en paralelo, tumbaba el sistema).
            // Ahora: una sola llamada que trae todas las suscripciones de la empresa, agrupadas acá.
            const suscripcionesFull = await MDL.compra_venta.getsuscripciones_full();
            const suscripcionesMap = {};
            (suscripcionesFull || []).forEach(row => {
                const key = row.key_compra_venta_detalle;
                if (!key) return;
                if (!suscripcionesMap[key]) {
                    const cupos = Number(row.modelo?.cantidad_suscriptores) || 0;
                    suscripcionesMap[key] = [{ cupos, suscriptos: 0, disponibles: cupos, suscriptores: [] }];
                }
                const entry = suscripcionesMap[key][0];
                entry.suscriptores.push(row);
                entry.suscriptos += 1;
                entry.disponibles = Math.max(0, entry.cupos - entry.suscriptos);
            });
            const totalesMap = {};
            ventas.forEach(cv => {
                try {
                    // Cálculo local: Model.compra_venta_detalle.Action.getTotales() usa un cache de un
                    // solo slot por key_compra_venta, así que llamarlo en este loop (una key distinta
                    // por venta) invalidaba el cache en cada iteración y disparaba un socket nuevo por
                    // venta. cv.detalles ya trae todo lo necesario, así que se calcula sin red.
                    totalesMap[cv.key] = MDL.compra_venta.getTotales({ ...cv, detalle: cv.detalles }) || {};
                } catch (e) {
                    totalesMap[cv.key] = {};
                }
            });
            const ventasEnriquecidas = ventas.map(cv => {
                const detallesEnriquecidos = (cv.detalles || []).map(d => {
                    const suscripcion = suscripcionesMap[d.key]?.[0] || {};

                    return {
                        ...d,
                        ...suscripcion,
                        suscriptores: (suscripcion.suscriptores || []).map(s => ({ ...s, cliente: clientesMap[s.key_cliente] || {} }))
                    };
                });
                const total_disponibles = detallesEnriquecidos.reduce((sum, d) => sum + (Number(d.disponibles) || 0), 0);
                const total_suscriptos = detallesEnriquecidos.reduce((sum, d) => sum + (Number(d.suscriptos) || 0), 0);
                const total_cupos = detallesEnriquecidos.reduce((sum, d) => sum + (Number(d.cupos) || 0), 0);
                const cuotas = cv.cuotas || {};
                const cuotaUnitaria = cuotas.total && cuotas.cantidad ? cuotas.total / cuotas.cantidad : 0;
                const cantidad_pagada = cuotaUnitaria > 0 ? Math.round((cv.monto_amortizado || 0) / cuotaUnitaria) : 0;
                const cantidad_pendiente = Math.max(0, (cuotas.cantidad || 0) - (cv.cuotas_en_mora?.cantidad || 0) - cantidad_pagada);
                return {
                    ...cv,
                    total_disponibles,
                    total_suscriptos,
                    total_cupos,
                    detalles: detallesEnriquecidos,
                    moneda: empresa?.monedas?.find(m => m.key === cv.key_moneda) || {},
                    sucursal: sucursales.find(s => s?.key === cv?.key_sucursal) || {},
                    usuario: usuariosMap[cv?.key_usuario] || {},
                    empresa,
                    proveedor: (proveedores || []).find(p => p.key === cv.key_proveedor) || {},
                    cliente: (() => {
                        const clienteBase = clientesMap[cv.key_cliente] || {};
                        const { deuda_por_moneda, mora_por_moneda, totales_base } = getDeudaClienteAgregada(clienteBase.key);
                        return {
                            ...clienteBase,
                            habilidades: habilidadArr.filter(h => Array.isArray(h.key_usuarios) && h.key_usuarios.includes(clienteBase.key)),
                            resumen_cuota: resumenCuotasArr.find(r => r.key_cliente === clienteBase.key) || null,
                            deuda_por_moneda,
                            mora_por_moneda,
                            totales_base,
                        };
                    })(),
                    subtotal: totalesMap[cv.key]?.subtotal || "0",
                    cuotas: { ...cuotas, cantidad_pagada, cantidad_pendiente },
                };
            });
            SNotification.send({
                key: "load_ventas",
                title: "Datos cargados",
                body: `Se cargaron ${ventasEnriquecidas.length} ventas`,
                color: STheme.color.success,
                time: 2000,
            });

            console.clear();
            console.log(JSON.stringify(ventasEnriquecidas));
            return ventasEnriquecidas;
        } catch (error) {
            console.error("❌ Error en loadInitialData:", error?.message || error, error);
            SNotification.send({
                key: "load_ventas",
                title: "Error al cargar ventas",
                body: error?.message || "Error desconocido",
                color: STheme.color.danger,
                time: 4000,
            });
            SPopup.alert("Error al cargar los datos. Intenta nuevamente.");
            return [];
        }
    }

    generateRandomCode() { return `F-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`; }

    formatMap(map, monedas) {
        return Object.entries(map || {}).map(([k, monto]) => {
            const mon = (monedas || []).find(m => m.key === k);
            const sim = mon?.observacion || 'Bs';
            const fmt = SMath.formatMoney(monto);
            return fmt.startsWith(sim) ? fmt : `${sim} ${fmt}`;
        }).join('\n') || '';
    }

    formatBase(monto, monedas) {
        if (!monto) return '';
        const sim = (monedas || []).find(m => m.tipo === 'base')?.observacion || 'Bs';
        const fmt = SMath.formatMoney(monto);
        return fmt.startsWith(sim) ? fmt : `${sim} ${fmt}`;
    }

    renderMontoCell(map, baseMonto, monedas) {
        const entries = Object.entries(map || {});
        if (!entries.length && !baseMonto) return null;
        const color = STheme.color.text;
        const baseText = this.formatBase(baseMonto, monedas);
        return (
            <SView col style={{ padding: 4, alignItems: 'flex-end' }}>
                {baseText ? <SText style={{ fontSize: 13, fontWeight: 'bold', color }}>{baseText}</SText> : null}
                {entries.length > 0 && (
                    <SView row style={{ flexWrap: 'wrap', justifyContent: 'flex-end', marginTop: baseText ? 2 : 0 }}>
                        {entries.map(([key_moneda, monto], i) => {
                            const mon = (monedas || []).find(m => m.key === key_moneda);
                            const sim = mon?.observacion || 'Bs';
                            const fmt = SMath.formatMoney(monto);
                            const text = fmt.startsWith(sim) ? fmt : `${sim} ${fmt}`;
                            return (
                                <SText key={key_moneda} style={{ fontSize: 9, opacity: 0.7, color, marginLeft: i > 0 ? 6 : 0 }}>
                                    {text}
                                </SText>
                            );
                        })}
                    </SView>
                )}
            </SView>
        );
    }

    footerCuotasClienteYMonto(cuotaSelector, montoBaseSelector) {
        return ({ dinamicTable }) => {
            const rows = (dinamicTable?.dataFiltrada || []).map(d => d.__original);
            const totalCuotas = rows.reduce((s, row) => s + (Number(cuotaSelector(row)) || 0), 0);
            const totalMonto = rows.reduce((s, row) => s + (Number(montoBaseSelector(row)) || 0), 0);
            const monedas = rows[0]?.empresa?.monedas || [];
            return (
                <SView style={{ padding: 4, alignItems: 'flex-end', width: '100%', borderTopWidth: 1, borderColor: STheme.color.lightGray + '50' }}>
                    <SText style={{ fontSize: 10, opacity: 0.8 }}>{totalCuotas} {totalCuotas === 1 ? 'cuota' : 'cuotas'}</SText>
                    <SText style={{ fontSize: 12, fontWeight: 'bold' }}>{this.formatBase(totalMonto, monedas)}</SText>
                </SView>
            );
        };
    }

    footerCuotasYMonto(cuotaSelector, montoBaseSelector) {
        return ({ dinamicTable }) => {
            const rows = (dinamicTable?.dataFiltrada || []).map(d => d.__original);
            const totalCuotas = rows.reduce((s, row) => s + (Number(cuotaSelector(row)) || 0), 0);
            const totalMonto = rows.reduce((s, row) => s + (Number(montoBaseSelector(row)) || 0), 0);
            const baseSim = rows[0]?.empresa?.monedas?.find(m => m.tipo === 'base')?.observacion || 'Bs';
            return (
                <SView style={{ padding: 4, alignItems: 'flex-end', width: '100%', borderTopWidth: 1, borderColor: STheme.color.lightGray + '50' }}>
                    <SText numberOfLines={1} style={{ fontSize: 10, opacity: 0.8 }}>{totalCuotas} {totalCuotas === 1 ? 'cuota' : 'cuotas'}</SText>
                    <SText numberOfLines={1} style={{ fontSize: 12, fontWeight: 'bold', textAlign: 'right', flexShrink: 1, minWidth: 0 }}>{baseSim} {SMath.formatMoney(totalMonto)}</SText>
                </SView>
            );
        };
    }

    renderMenuVentas(row) {
        const openRegistrarFacturaTypePopup = (venta, tipoFactura) => {
            const tipoLabels = {
                manual: "Factura Manual",
                siat: "Factura SIAT",
                paraguay: "Factura Paraguay (Quatiy)",
                colombia: "Factura Colombia (Sasuki)",
            };
            const tipoLabel = tipoLabels[tipoFactura] || tipoFactura;
            if (tipoFactura === "paraguay" || tipoFactura === "colombia") {
                return SPopup.open({
                    key: "registrar_factura_" + tipoFactura + "_" + venta.key, content: (<SView backgroundColor={STheme.color.background} style={{ borderRadius: 8, width: 400, maxWidth: "100%" }} padding={16} withoutFeedback>
                        <SText fontSize={18} bold>{tipoLabel}</SText>
                        <SHr height={12} />
                        <SText fontSize={14} color={STheme.color.text + "99"}>Estamos trabajando en esta funcionalidad.</SText>
                        <SHr height={16} />
                        <SView row col={"xs-12"} style={{ justifyContent: "flex-end" }}>
                            <SView onPress={() => SPopup.close("registrar_factura_" + tipoFactura + "_" + venta.key)}>
                                <SText color={STheme.color.text}>Cerrar</SText>
                            </SView>
                        </SView>
                    </SView>
                    ),
                });
            }
            let nit = "";
            let razon_social = "";
            let nroFactura = "";
            let correo_electronico = "";
            let telefono = "";
            const isManual = tipoFactura === "manual";
            const _pdf = this.state.pdfFiles?.[venta.key];
            return SPopup.open({
                key: "registrar_factura_" + tipoFactura + "_" + venta.key,
                content: (
                    <SView backgroundColor={STheme.color.background} style={{ borderRadius: 8, width: 400, maxWidth: "100%" }} padding={16} withoutFeedback>
                        <SText fontSize={18} bold>{tipoLabel}</SText>
                        <SHr height={12} />
                        <SText fontSize={13} color={STheme.color.text + "99"}> {isManual ? "Ingrese el número de factura y adjunte el PDF de la factura." : "Ingrese el NIT y la razón social para generar la factura SIAT."} </SText>
                        <SHr height={16} />
                        {tipoLabel === "Factura Manual" && (
                            <>
                                <SInput label="Nro. factura" placeholder="Ingrese el número de factura"
                                    onChangeText={val => nroFactura = val}
                                    style={{ height: 40, borderRadius: 6, backgroundColor: STheme.color.lightGray + "22", color: STheme.color.text, }} />
                                <SHr height={10} />
                                <SView row center
                                    style={{ borderWidth: 1, borderColor: STheme.color.card, borderRadius: 8, padding: 10, backgroundColor: STheme.color.card + "22", }}>
                                    <SView flex>
                                        <SText fontSize={13} bold> PDF de factura </SText>
                                        <SHr h={4} />
                                        <SText fontSize={11}> {_pdf?.name ? "se ha seleccionado: " + _pdf.name : "Ningún archivo seleccionado"} </SText>
                                    </SView>
                                    <SView style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, backgroundColor: STheme.color.primary, }}
                                        onPress={() => {
                                            PopupUploadFactura.open({
                                                key_empresa: venta?.empresa?.key,
                                                key_compra_venta: venta?.key,
                                                onSuccess: (fileData) => {
                                                    this.setState({
                                                        pdfFiles: {
                                                            ...this.state.pdfFiles,
                                                            [venta.key]: fileData
                                                        }
                                                    });
                                                }
                                            });
                                        }}
                                    >
                                        <SText color={STheme.color.text} bold> Seleccionar PDF </SText>
                                    </SView>
                                </SView>
                            </>
                        )}
                        {tipoLabel === "Factura SIAT" && (
                            <>
                                <SInput
                                    label="NIT / CI"
                                    placeholder="Ingrese NIT o CI"
                                    onChangeText={val => nit = val}
                                    style={{ height: 40, borderRadius: 6, backgroundColor: STheme.color.lightGray + "22", color: STheme.color.text, }} />
                                <SHr height={10} />
                                <SInput
                                    label="Razón social"
                                    placeholder="Ingrese razón social"
                                    onChangeText={val => razon_social = val}
                                    style={{ height: 40, borderRadius: 6, backgroundColor: STheme.color.lightGray + "22", color: STheme.color.text, }} />
                                <SHr height={10} />
                                <SInput
                                    label="Correo electrónico"
                                    placeholder="Ingrese correo electrónico"
                                    onChangeText={val => correo_electronico = val}
                                    style={{ height: 40, borderRadius: 6, backgroundColor: STheme.color.lightGray + "22", color: STheme.color.text, }} />
                                <SHr height={10} />
                                <SInput
                                    label="Telefono"
                                    placeholder="Ingrese número de teléfono"
                                    onChangeText={val => telefono = val}
                                    style={{ height: 40, borderRadius: 6, backgroundColor: STheme.color.lightGray + "22", color: STheme.color.text, }} />
                            </>
                        )}
                        <SHr height={16} />
                        <SView row col={"xs-12"} style={{ justifyContent: "flex-end" }}>
                            <SView style={{ marginRight: 8 }} onPress={() => SPopup.close("registrar_factura_" + tipoFactura + "_" + venta.key)}>
                                <SText color={STheme.color.text}>Cancelar</SText>
                            </SView>
                            <SView
                                onPress={async () => {
                                    const notificationKey = `factura_registrar_${tipoFactura}_${venta.key}`;
                                    if (isManual) {
                                        if (!nroFactura.trim()) {
                                            SNotification.send({ key: notificationKey, title: "Complete los datos", body: "Debe ingresar el número de factura.", color: STheme.color.danger, time: 4000, });
                                            return;
                                        }
                                    } else {
                                        if (!nit.trim() || !razon_social.trim()) {
                                            SNotification.send({ key: notificationKey, title: "Complete los datos", body: "Debe ingresar NIT y razón social.", color: STheme.color.danger, time: 4000, });
                                            return;
                                        }
                                    }
                                    try {
                                        SNotification.send({ key: notificationKey, title: "Registrando factura...", type: "loading", });
                                        const facturaData = {
                                            tipo: tipoFactura,
                                            nro_factura: isManual ? nroFactura : this.generateRandomCode(), cuf: "212E5B3D5BBF8FB31CCF8BE464EE98640C7F9CB6615194573A17DAF74",
                                            nit: isManual ? "" : nit,
                                            razon_social: isManual ? "" : razon_social,
                                            correo_electronico: isManual ? "" : correo_electronico,
                                            telefono: isManual ? "" : telefono,
                                            leyenda: "alvaro es probando la leyenda",
                                            detalles: (venta.detalles ?? []).map((d) => d.descripcion).join(", "),
                                            archivo_pdf: isManual ? { name: this.state.pdfFiles?.[venta.key]?.name, type: this.state.pdfFiles?.[venta.key]?.type, } : {},
                                            link_factura: isManual ? this.state.pdfFiles?.[venta.key]?.link || null : "",
                                            factura_seleccionada: tipoLabel,
                                        };
                                        const updatedVenta = {
                                            ...venta,
                                            facturar: true,
                                            factura: facturaData,
                                            nit: isManual ? venta.nit : nit,
                                            razon_social: isManual ? venta.razon_social : razon_social,
                                            correo_electronico: isManual ? venta.correo_electronico : correo_electronico,
                                            telefono: isManual ? venta.telefono : telefono,
                                        };

                                        await Model.compra_venta.Action.editar({
                                            data: updatedVenta,
                                            key_usuario: Model.usuario.Action.getKey(),
                                        });

                                        this.DinamicTable?.loadData();
                                        SNotification.send({ key: notificationKey, title: `${tipoLabel} registrada`, body: isManual ? "Factura manual agregada correctamente." : `NIT: ${nit}, Razón social: ${razon_social}`, color: STheme.color.success, time: 5000, });
                                        SPopup.close(`registrar_factura_${tipoFactura}_${venta.key}`);
                                    } catch (error) {
                                        console.error("Error al editar la venta:", error);
                                        SNotification.send({ key: notificationKey, title: "Error al registrar factura", body: error?.message || "Intente nuevamente.", color: STheme.color.danger, time: 5000, });
                                    }
                                }}
                            >
                                <SText color={STheme.color.success}> Registrar </SText>
                            </SView>
                        </SView>
                    </SView>
                )
            });
        };

        const openRegistrarFacturaPopup = (venta) => {
            const opcionesFactura = [
                { label: "Factura manual", tipo: "manual" },
                { label: "Factura SIAT", tipo: "siat" },
                { label: "Factura Paraguay (Quatiy)", tipo: "paraguay" },
                { label: "Factura Colombia (Sasuki)", tipo: "colombia" },
            ];
            return SPopup.open({
                key: "registrar_factura_tipo_" + venta.key,
                content: (
                    <SView backgroundColor={STheme.color.background} style={{ borderRadius: 8, width: 400, maxWidth: "100%" }} padding={16} withoutFeedback>
                        <SText fontSize={18} bold>Registrar factura</SText>
                        <SHr height={12} />
                        <SText fontSize={13} color={STheme.color.text + "99"}>Seleccione el tipo de factura a generar.</SText>
                        <SHr height={16} />
                        {opcionesFactura.map((item) => (
                            <SView key={item.tipo} col={"xs-12"} style={{ marginBottom: 10 }}>
                                <SView onPress={() => {
                                    SPopup.close("registrar_factura_tipo_" + venta.key);
                                    openRegistrarFacturaTypePopup(venta, item.tipo);
                                }} style={{ borderRadius: 8, padding: 14, backgroundColor: STheme.color.card, borderWidth: 1, borderColor: STheme.color.border, }}>
                                    <SText fontSize={15} bold>{item.label}</SText>
                                </SView>
                            </SView>
                        ))}
                        <SView row col={"xs-12"} style={{ justifyContent: "flex-end" }}>
                            <SView onPress={() => SPopup.close("registrar_factura_tipo_" + venta.key)}>
                                <SText color={STheme.color.text}>Cerrar</SText>
                            </SView>
                        </SView>
                    </SView>
                )
            });
        };
        const RenderOption = ({ label, icon, iconProps, onPress }) => {
            return (
                <>
                    <SView col={"xs-11"} row center onPress={() => { if (onPress) onPress(); SPopup.close("popup_menu_ventas"); }}>
                        <SView col={"xs-2"} center height={32}>{typeof icon === "string" ? <SIconApp name={icon} height={18} fill={iconProps?.fill || STheme.color.text} stroke={iconProps?.stroke} /> : icon}</SView>
                        <SView width={8} />
                        <SView flex> <SText fontSize={14}>{label}</SText> </SView>
                    </SView>
                    <SHr height={1} color={STheme.color.card} />
                </>
            );
        };
        const groups = [
            {
                title: "FACTURACIÓN",
                items: row?.factura?.cuf
                    ? [
                        ...(row?.factura?.factura_seleccionada === "Factura Manual"
                            ? [
                                {
                                    label: "Descargar Archivo (PDF)",
                                    icon: "iconPdf",
                                    iconProps: {
                                        fill: STheme.color.text,
                                    },
                                    onPress: async () => {
                                        const notificationKey = `pdf_${row.key}`;
                                        try {
                                            if (!row?.factura?.link_factura) { SNotification.send({ key: notificationKey, title: "Archivo no disponible", body: "No existe un enlace para la factura.", color: STheme.color.danger, time: 4000, }); return; }
                                            SNotification.send({ key: notificationKey, title: "Abriendo archivo...", type: "loading", });
                                            await Linking.openURL(row.factura.link_factura);
                                            SNotification.send({ key: notificationKey, title: "Archivo abierto", body: "La factura se abrió correctamente.", color: STheme.color.success, time: 3000, });
                                        } catch (error) {
                                            console.error("Error al abrir PDF:", error);
                                            SNotification.send({
                                                key: notificationKey,
                                                title: "Error al abrir archivo",
                                                body: error?.message || "No se pudo abrir la factura.",
                                                color: STheme.color.danger,
                                                time: 5000,
                                            });
                                        }
                                    },
                                },
                            ]
                            : [{ label: "Imprimir Factura (Carta)", icon: "imprimir", onPress: () => { MDL.factura.imprimir({ cuf: row?.factura?.cuf, tipo: "carta", }); }, },
                            { label: "Imprimir Factura (Rollo)", icon: "iconLista", onPress: () => { MDL.factura.imprimir({ cuf: row?.factura?.cuf, tipo: "rollo", }); }, },
                            ]),
                    ]
                    : [
                        { label: "Registrar factura", iconProps: { fill: "#2563eb" }, icon: "imprimir", onPress: () => openRegistrarFacturaPopup(row), },
                    ],
            },
            {
                title: "RECIBOS",
                items: [
                    { label: "Imprimir Recibo (Rollo)", icon: "imprimir", onPress: () => { ReciboRollo.imprimir(row?.key); } },
                    { label: "Imprimir Recibo (Carta)", icon: "iconLista", onPress: () => { ReciboCarta.imprimir(row?.key); } },
                ]
            },
            {
                title: "CONSULTA",
                items: [
                    { label: "Ver Detalle de venta", icon: "ventaCarro", onPress: () => { SNavigation.navigate("/venta/profile2", { pk: row?.key }); } },
                    row?.sucursal?.key && { label: "Ver sucursal", icon: "iconEdifcio", iconProps: { fill: STheme.color.text, stroke: 'rgb(97, 97, 97)' }, onPress: () => { SNavigation.navigate("/sucursal", { key: row?.sucursal?.key }); } },
                    row?.usuario?.key && { label: "Ver vendedor", icon: "cajero", iconProps: { fill: STheme.color.text, }, onPress: () => { SNavigation.navigate("/usuario", { key: row?.usuario?.key }); } },
                    row?.cliente?.key && { label: "Ver cliente", icon: "profile2", onPress: () => { SNavigation.navigate("/cliente/perfil", { key: row?.cliente?.key, tipo: "cliente" }); } },
                ].filter(Boolean)
            },
            {
                title: "GESTIÓN",
                items: [
                    MDL.rolesPermisos.getPermiso({ url: "/empresa/punto_venta", permiso: "anular_venta" }) ? {
                        label: "Anular venta", icon: "cancelado", iconProps: { fill: "#db0606ff", stroke: "#db0606ff", },
                        onPress: () => {
                            if (Number(row?.estado) === 0) {
                                SNotification.send({
                                    key: "anular_venta_ya",
                                    title: "Venta ya anulada",
                                    body: "Esta venta ya se encuentra anulada.",
                                    color: STheme.color.warning,
                                    time: 4000,
                                });
                                return;
                            }
                            SPopup.confirm({
                                icon: "cancelado",
                                title: "Anular venta",
                                message: "¿Está seguro de que desea anular esta venta? Esta acción no se puede deshacer.",
                                cancel: { label: "Cancelar", color: STheme.color.lightGray, },
                                onPress: () => {
                                    const notificationKey = `anular_v_${row.key}`;
                                    // cuando se anule una venta, verificar si existe una facrtura
                                    SNotification.send({ key: notificationKey, title: "Anulando venta...", type: "loading", });
                                    MDL.caja.anular_venta({ key_compra_venta: row.key, })
                                        .then(() => {
                                            this.DinamicTable?.loadData();
                                            SNotification.send({ key: notificationKey, title: "Venta anulada", body: "La venta se anuló correctamente.", color: STheme.color.success, });
                                        })
                                        .catch((error) => {
                                            console.error("Error al anular venta:", error);
                                            SNotification.send({ key: notificationKey, title: "Error Anular Venta", body: error?.message || String(error), color: STheme.color.danger, });
                                        });
                                },
                            });
                        },
                    } : null,
                    row?.factura?.cuf ? {
                        label: "Anular factura", icon: "removeNotes", iconProps: { fill: "#db0606ff", stroke: "#db0606ff", },
                        onPress: () => {
                            SPopup.confirm({
                                icon: (<SIconApp name="eliminar" height={24} fill="#db0606ff" />),
                                style: { padding: 10, paddingBottom: 5, paddingTop: 5, },
                                title: `Anular factura ${row?.factura?.nro_factura}`,
                                message: "¿Está seguro de que desea anular la factura? Esta acción no se puede deshacer.",
                                cancel: { label: "Cancelar", color: STheme.color.lightGray, },
                                onPress: async () => {
                                    const notificationKey = `anular_factura_${row.key}`;
                                    try {
                                        SNotification.send({ key: notificationKey, title: "Anulando factura...", type: "loading", });
                                        const updatedVenta = { ...row, facturar: false, factura: {}, };
                                        await Model.compra_venta.Action.editar({
                                            data: updatedVenta,
                                            key_usuario:
                                                Model.usuario.Action.getKey(),
                                        });
                                        this.DinamicTable?.loadData();
                                        SNotification.send({ key: notificationKey, title: "Factura anulada", body: "La factura se anuló correctamente.", color: STheme.color.warning, time: 5000, });
                                    } catch (error) {
                                        console.error("Error al anular factura:", error);
                                        SNotification.send({ key: notificationKey, title: "Error al anular factura", body: error?.message || "Intente nuevamente.", color: STheme.color.danger, time: 5000, });
                                    }
                                },
                            });
                        },
                    }
                        : null,
                ].filter(Boolean),
            }
        ].filter(group => group && group.items.length > 0);
        return (
            <SView col={"xs-12"} backgroundColor={STheme.color.background} style={{ borderRadius: 8, overflow: "hidden", borderWidth: 1, borderColor: "#66666699", }}>
                {groups.map((group, gi) => (
                    <SView key={gi} col={"xs-12"}>
                        <SView col={"xs-12"} style={{ paddingHorizontal: 8, paddingTop: 8, paddingBottom: 1 }}>
                            <SText color={STheme.color.text + "99"}>{group.title}</SText>
                        </SView>
                        {group.items.map((opt, i) => (<RenderOption key={i} {...opt} />))}
                        {gi !== groups.length - 1 && <SHr height={1} color={STheme.color.card} />}
                    </SView>
                ))}
            </SView>
        );
    }
    mostrarTabla() {
        return (
            <DinamicTable
                ref={ref => (this.DinamicTable = ref)}
                loadData={async () => {
                    return this.loadInitialData();
                }}
                key="id"
                language="es"
                center
                {...Config.table.applyTheme()}
                selectType="single"
                keyExtractor={(e) => e.key}
                pageLimit={100}
                // headerGroups={[
                //     {
                //         label: "Cuotas Pagadas", cols: ["cuotas_cantidad_pagadas", "monto_amortizado"],
                //         style: { backgroundColor: STheme.color.success + '55', borderWidth: 1, borderColor: STheme.color.success },
                //     },
                //     {
                //         label: "Cuotas Pendientes", cols: ["cuotas_cantidad_pendiente_", "monto_deuda"],
                //         style: { backgroundColor: STheme.color.warning + '55', borderWidth: 1, borderColor: STheme.color.warning },
                //     },
                //     {
                //         label: "Cuotas en Mora", cols: ["cuotas_cantidad_mora", "en_mora"],
                //         style: { backgroundColor: STheme.color.danger + '55', borderWidth: 1, borderColor: STheme.color.danger },
                //     },
                // ]}
                onSelect={(e) => {
                    let top = e.evt.nativeEvent.pageY;
                    const h = Dimensions.get("window").height;
                    if (h < top + 300) {
                        top = h - 300;
                    }
                    SPopup.open({
                        key: "popup_menu_ventas",
                        type: "2",
                        content: <SView withoutFeedback style={[{ position: "absolute", top: top, left: e.evt.nativeEvent.pageX, width: 250, }]} center>
                            {this.renderMenuVentas(e.row)}
                        </SView>
                    })
                }}
                loadInitialState={async () => { return { sorters: [{ key: "fecha_on", order: "desc", type: "date" }] } }}
            >
                <DinamicTable.Col key="index" label="N°" width={40} height={60} data={(e) => e.index + 1} />
                <DinamicTable.Col key="tipo_producto_" label="Tipos" width={90} height={60}
                    data={e => (e.row?.detalles ?? []).map(h => h.data.tipo_producto)} wrap
                    customComponent={e => (e.row?.detalles ?? []).map(h => {
                        const estilo = TIPO_PRODUCTO_MAP[h.data.tipo_producto?.toLowerCase()] || { color: STheme.color.lightGray, label: h.data.tipo_producto };
                        return (
                            <SView key={h.key} style={{ backgroundColor: estilo.color, borderRadius: 4, paddingVertical: 2, paddingHorizontal: 6, marginBottom: 4 }}>
                                <SText style={{ fontSize: 10, color: STheme.color.text }}>{estilo.label}</SText>
                            </SView>
                        );
                    })}
                />





                <DinamicTable.Col key="descripcion" label="Descripción" width={140} height={60} data={(e) => e.row?.observacion ?? ""} />

                <DinamicTable.Col key="detalles_" label="Detalle" width={210} height={60} data={(e) => (e.row?.detalles ?? []).map(d => d.descripcion)}
                    customComponent={(e) => {
                        const MAX_LINEAS = 3;
                        const detalles = e.row?.detalles ?? [];
                        const visibles = detalles.slice(0, MAX_LINEAS);
                        const restantes = detalles.length - visibles.length;
                        return (
                            <SView col>
                                {visibles.map((d, index) => (<SText key={index} fontSize={11}>• {d.descripcion} </SText>))}

                                {restantes > 0 && <SText fontSize={11} color={STheme.color.lightGray}>+{restantes} más</SText>}
                            </SView>
                        );
                    }}


                />

                <DinamicTable.Col key={"fecha_on"} label="Fecha" width={120} height={60} dataType="datetime" data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date} textStyle={{ fontSize: 12, color: STheme.color.text }} dateFormat="yyyy-MM-dd hh:mm" />

                <DinamicTable.Col key="sucursal" label="Sucursal" width={100} height={60} data={(e) => e.row?.sucursal?.descripcion ?? ""}
                    customComponent={e => {
                        const nombre = e.row?.sucursal?.descripcion || "";
                        const avatarSize = e.filterList ? 16 : 21;
                        return (
                            <SView col={"xs-12"} center row>
                                {nombre ? (
                                    <SView style={{ width: avatarSize, height: avatarSize, borderRadius: 100, backgroundColor: STheme.color.text + "20", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
                                        <SText style={{ fontSize: avatarSize / 2, color: STheme.color.text, opacity: 0.7 }}>{nombre[0].toUpperCase()}</SText>
                                        {e.row?.key_sucursal ? <SImage src={`${SSocket.api.empresa}sucursal/${e.row?.key_sucursal}`} style={{ width: avatarSize, height: avatarSize, resizeMode: "cover", position: "absolute", top: 0, left: 0 }} /> : null}
                                    </SView>
                                ) : null}
                                {nombre ? <SView width={5} /> : null}
                                <SText flex capitalize numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{nombre}</SText>
                            </SView>
                        );
                    }}
                />




                <DinamicTable.Col key="vendedor" label="Vendedor" width={100} height={60} data={(e) => e.row?.usuario?.Nombres ?? ""}
                    customComponent={e => {
                        const nombre = e.row?.usuario?.Nombres || "";
                        const avatarSize = e.filterList ? 16 : 21;
                        return (
                            <SView col={"xs-12"} center row>
                                {nombre ? (
                                    <SView style={{ width: avatarSize, height: avatarSize, borderRadius: 100, backgroundColor: STheme.color.text + "20", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
                                        <SText style={{ fontSize: avatarSize / 2, color: STheme.color.text, opacity: 0.7 }}>{nombre[0].toUpperCase()}</SText>
                                        {e.row?.usuario?.key ? <SImage src={`${SSocket.api.root}usuario/${e.row?.usuario?.key}`} style={{ width: avatarSize, height: avatarSize, resizeMode: "cover", position: "absolute", top: 0, left: 0 }} /> : null}
                                    </SView>
                                ) : null}
                                {nombre ? <SView width={5} /> : null}
                                <SText flex capitalize numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{nombre}</SText>
                            </SView>
                        );
                    }}
                />

                <DinamicTable.Col key="cliente" label="Cliente" width={100} height={60} data={(e) => e.row?.cliente?.nombres ?? ""}
                    customComponent={e => {
                        const nombre = e.row?.cliente?.nombres || "";
                        const avatarSize = e.filterList ? 16 : 21;
                        return (
                            <SView col={"xs-12"} center row>
                                {nombre ? (
                                    <SView style={{ width: avatarSize, height: avatarSize, borderRadius: 100, backgroundColor: STheme.color.text + "20", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
                                        <SText style={{ fontSize: avatarSize / 2, color: STheme.color.text, opacity: 0.7 }}>{nombre[0].toUpperCase()}</SText>
                                        {e.row?.cliente?.key ? <SImage src={`${SSocket.api.root}usuario/${e.row?.cliente?.key}`} style={{ width: avatarSize, height: avatarSize, resizeMode: "cover", position: "absolute", top: 0, left: 0 }} /> : null}
                                    </SView>
                                ) : null}
                                {nombre ? <SView width={5} /> : null}
                                <SText flex capitalize numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{nombre}</SText>
                            </SView>
                        );
                    }}
                />



            </DinamicTable>
        );
    }

    async confirmarBorradoFacturas() {
        console.count()
        const notificationKey = "borrar_facturas";
        SPopup.confirm({
            icon: "eliminar",
            title: "Borrar todas las facturas",
            message: "Esta acción eliminará las facturas de TODAS las ventas cargadas. ¿Desea continuar?",
            onPress: async () => {
                try {
                    SNotification.send({ key: notificationKey, title: "Eliminando facturas...", type: "loading", });
                    const data = (await this.DinamicTable?.getData?.()) || [];
                    if (!Array.isArray(data)) { console.error("La tabla no devolvió un array:", data); }
                    const updates = data.map((v) => Model.compra_venta.Action.editar({ data: { ...v, facturar: false, factura: {}, }, key_usuario: Model.usuario.Action.getKey(), })
                    );
                    await Promise.all(updates);
                    this.DinamicTable?.loadData?.();
                    SNotification.send({ key: notificationKey, title: "Facturas eliminadas", body: "Se eliminaron todas las facturas correctamente.", color: STheme.color.success, });
                } catch (error) {
                    console.error("Error al borrar facturas:", error);
                    SNotification.send({ key: notificationKey, title: "Error al eliminar facturas", body: error?.message || "No se pudieron borrar todas las facturas.", color: STheme.color.danger, time: 5000, });
                }
            },
        });
    }

    render() {
        return (
            <SPage title="Tabla de Ventas" disableScroll>
                <SView row col={"xs-12"} style={{ borderBottomWidth: 1, borderColor: STheme.color.lightGray + "30", paddingVertical: 8, paddingHorizontal: 12, }} >
                    <SView col={"xs-12 sm-8.2 lg-3.3"} row center>
                        <FechaFullFilter
                            onChange={e => this.setState({
                                fecha_inicio: e.fecha_inicio,
                                fecha_fin: e.fecha_fin
                            }, () => {
                                this.DinamicTable?.loadData();
                            })}
                        />
                    </SView>
                    <SView width={8} height={"100%"} />
                </SView>{this.mostrarTabla()}
            </SPage>
        );
    }
}