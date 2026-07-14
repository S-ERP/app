import React, { Component } from 'react';
import { SPage, SPopup, SView, SText, STheme, SHr, SImage, SNavigation, SDate, SInput, SMath, SNotification } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import { Dimensions, Linking } from 'react-native';
import SSocket from 'servisofts-socket';
import SIconApp from '../../Assets/SIconApp';
import Config from '../../Config';
import Model from '../../Model';
import MDL from '../../MDL';
import ComprobanteCarta from '../../Components/PDF/compra/ComprobanteCarta';
import ComprobanteRollo from '../../Components/PDF/compra/ComprobanteRollo';
import PopupUploadFactura from '../venta/Components/PopupUploadFactura';
import FechaFullFilter from '../../Components/FechaFullFilter';

const TIPO_PRODUCTO_MAP = {
    servicio: { color: "#2563eb", label: "Servicio" },
    inventario: { color: "#f59e0b", label: "Inventario" },
};

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

    componentDidMount() {
        MDL.rolesPermisos.getPermisoAsync({ url: "/compra/tabla", permiso: "ver" }).then((permit) => {
            if (!permit) {
                SNavigation.goBack();
            }
        }).catch(e => {
            console.error(e);
        });
    }

    async loadInitialData() {
        try {
            SNotification.send({
                key: "load_compras",
                title: "Cargando compras...",
                type: "loading",
            });
            const registros = await MDL.compra_venta.getTransaccion("compra", this.state.fecha_inicio, this.state.fecha_fin);
            const empresa = await MDL.empresa.getFull();
            if (!registros || !empresa) {
                console.warn("No se encontraron registros o no se pudo obtener la empresa.");
                SNotification.send({
                    key: "load_compras",
                    title: "Sin datos",
                    body: "No se encontraron compras en el rango de fechas seleccionado.",
                    color: STheme.color.warning,
                    time: 3000,
                });
                return [];
            }
            const sucursales = empresa?.sucursales || [];
            const compras = Object.values(registros).filter(cv => cv.tipo === "compra");
            if (compras.length === 0) console.warn("No se encontraron compras.");
            const keysUsuarios = [...new Set(compras.map(v => v.key_usuario).filter(Boolean))];
            const usuarios = await MDL.usuario.getByKeys(keysUsuarios);
            const usuariosMap = Array.isArray(usuarios) ? Object.fromEntries(usuarios.map(u => [u.key, u])) : usuarios || {};
            const [proveedores, resumenCuotasResp] = await Promise.all([
                MDL.inventario.proveedor.getAllProveedor(),
                MDL.compra_venta.getCuotasResumenTotal_compras(),
            ]);
            if (!proveedores) console.warn("No se pudieron obtener proveedores.");
            const proveedoresMap = Array.isArray(proveedores) ? Object.fromEntries(proveedores.map(p => [p.key, p])) : proveedores || {};
            const resumenCuotasArr = Array.isArray(resumenCuotasResp) ? resumenCuotasResp : Object.values(resumenCuotasResp || {});
            // Deuda agregada por proveedor sumando TODAS sus compras (no solo la compra de esta fila).
            const proveedorAgregadoMap = {};
            compras.forEach(v => {
                const keyProveedor = v.key_proveedor;
                if (!keyProveedor) return;
                if (!proveedorAgregadoMap[keyProveedor]) {
                    proveedorAgregadoMap[keyProveedor] = { total_map: {}, pagado_map: {}, mora_map: {}, total_base: 0, pagado_base: 0, mora_base: 0 };
                }
                const acc = proveedorAgregadoMap[keyProveedor];
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
            const getDeudaProveedorAgregada = keyProveedor => {
                const acc = proveedorAgregadoMap[keyProveedor];
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
            const totalesMap = {};
            compras.forEach(cv => {
                try {
                    totalesMap[cv.key] = MDL.compra_venta.getTotales({ ...cv, detalle: cv.detalles }) || {};
                } catch (e) {
                    totalesMap[cv.key] = {};
                }
            });
            const comprasEnriquecidas = compras.map(cv => {
                const cuotas = cv.cuotas || {};
                const cuotaUnitaria = cuotas.total && cuotas.cantidad ? cuotas.total / cuotas.cantidad : 0;
                const cantidad_pagada = cuotaUnitaria > 0 ? Math.round((cv.monto_amortizado || 0) / cuotaUnitaria) : 0;
                const cantidad_pendiente = Math.max(0, (cuotas.cantidad || 0) - (cv.cuotas_en_mora?.cantidad || 0) - cantidad_pagada);
                return {
                    ...cv,
                    moneda: empresa?.monedas?.find(m => m.key === cv.key_moneda) || {},
                    sucursal: sucursales.find(s => s?.key === cv?.key_sucursal) || {},
                    usuario: usuariosMap[cv?.key_usuario] || {},
                    empresa,
                    subtotal: totalesMap[cv.key]?.subtotal || "0",
                    proveedor: (() => {
                        const proveedorBase = proveedoresMap[cv.key_proveedor] || {};
                        const { deuda_por_moneda, mora_por_moneda, totales_base } = getDeudaProveedorAgregada(proveedorBase.key);
                        return {
                            ...proveedorBase,
                            resumen_cuota: resumenCuotasArr.find(r => r.key_proveedor === proveedorBase.key) || null,
                            deuda_por_moneda,
                            mora_por_moneda,
                            totales_base,
                        };
                    })(),
                    cuotas: { ...cuotas, cantidad_pagada, cantidad_pendiente },
                };
            });
            SNotification.send({
                key: "load_compras",
                title: "Datos cargados",
                body: `Se cargaron ${comprasEnriquecidas.length} compras`,
                color: STheme.color.success,
                time: 2000,
            });
            return comprasEnriquecidas;
        } catch (error) {
            console.error("Error en loadInitialData:", error?.message || error, error);
            SNotification.send({
                key: "load_compras",
                title: "Error al cargar compras",
                body: error?.message || "Error desconocido",
                color: STheme.color.danger,
                time: 4000,
            });
            SPopup.alert("Error al cargar los datos. Intenta nuevamente.");
            return [];
        }
    }

    generateRandomCode() { return `F-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`; }

    footerCuotasYMonto(cuotaSelector, montoBaseSelector) {
        return ({ dinamicTable }) => {
            const rows = (dinamicTable?.dataFiltrada || []).map(d => d.__original);
            const totalCuotas = rows.reduce((s, row) => s + (Number(cuotaSelector(row)) || 0), 0);
            const totalMonto = rows.reduce((s, row) => s + (Number(montoBaseSelector(row)) || 0), 0);
            const baseSim = rows[0]?.empresa?.monedas?.find(m => m.tipo === 'base')?.observacion || 'Bs';
            return (
                <SView height={40} style={{ padding: 4, alignItems: 'flex-end', width: '100%', borderTopWidth: 1, borderColor: STheme.color.lightGray + '50' }}>
                    <SText numberOfLines={1} style={{ fontSize: 10, opacity: 0.8 }}>{totalCuotas} {totalCuotas === 1 ? 'cuota' : 'cuotas'}</SText>
                    <SText numberOfLines={1} style={{ fontSize: 12, fontWeight: 'bold', textAlign: 'right', flexShrink: 1, minWidth: 0 }}>{baseSim} {SMath.formatMoney(totalMonto)}</SText>
                </SView>
            );
        };
    }

    renderMenuCompras(row) {
        const openRegistrarFacturaTypePopup = (compra, tipoFactura) => {
            const tipoLabels = {
                manual: "Factura Manual",
                siat: "Factura SIAT",
                paraguay: "Factura Paraguay (Quatiy)",
                colombia: "Factura Colombia (Sasuki)",
            };
            const tipoLabel = tipoLabels[tipoFactura] || tipoFactura;
            if (tipoFactura === "paraguay" || tipoFactura === "colombia") {
                return SPopup.open({
                    key: "registrar_factura_" + tipoFactura + "_" + compra.key, content: (<SView backgroundColor={STheme.color.background} style={{ borderRadius: 8, width: 400, maxWidth: "100%" }} padding={16} withoutFeedback>
                        <SText fontSize={18} bold>{tipoLabel}</SText>
                        <SHr height={12} />
                        <SText fontSize={14} color={STheme.color.text + "99"}>Estamos trabajando en esta funcionalidad.</SText>
                        <SHr height={16} />
                        <SView row col={"xs-12"} style={{ justifyContent: "flex-end" }}>
                            <SView onPress={() => SPopup.close("registrar_factura_" + tipoFactura + "_" + compra.key)}>
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
            const _pdf = this.state.pdfFiles?.[compra.key];
            return SPopup.open({
                key: "registrar_factura_" + tipoFactura + "_" + compra.key,
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
                                                key_empresa: compra?.empresa?.key,
                                                key_compra_venta: compra?.key,
                                                onSuccess: (fileData) => {
                                                    this.setState({
                                                        pdfFiles: {
                                                            ...this.state.pdfFiles,
                                                            [compra.key]: fileData
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
                            <SView style={{ marginRight: 8 }} onPress={() => SPopup.close("registrar_factura_" + tipoFactura + "_" + compra.key)}>
                                <SText color={STheme.color.text}>Cancelar</SText>
                            </SView>
                            <SView
                                onPress={async () => {
                                    const notificationKey = `factura_registrar_${tipoFactura}_${compra.key}`;
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
                                            detalles: (compra.detalles ?? []).map((d) => d.descripcion).join(", "),
                                            archivo_pdf: isManual ? { name: this.state.pdfFiles?.[compra.key]?.name, type: this.state.pdfFiles?.[compra.key]?.type, } : {},
                                            link_factura: isManual ? this.state.pdfFiles?.[compra.key]?.link || null : "",
                                            factura_seleccionada: tipoLabel,
                                        };
                                        const updatedCompra = {
                                            ...compra,
                                            facturar: true,
                                            factura: facturaData,
                                            nit: isManual ? compra.nit : nit,
                                            razon_social: isManual ? compra.razon_social : razon_social,
                                            correo_electronico: isManual ? compra.correo_electronico : correo_electronico,
                                            telefono: isManual ? compra.telefono : telefono,
                                        };
                                        await Model.compra_venta.Action.editar({
                                            data: updatedCompra,
                                            key_usuario: Model.usuario.Action.getKey(),
                                        });
                                        this.DinamicTable?.loadData();
                                        SNotification.send({ key: notificationKey, title: `${tipoLabel} registrada`, body: isManual ? "Factura manual agregada correctamente." : `NIT: ${nit}, Razón social: ${razon_social}`, color: STheme.color.success, time: 5000, });
                                        SPopup.close(`registrar_factura_${tipoFactura}_${compra.key}`);
                                    } catch (error) {
                                        console.error("Error al editar la compra:", error);
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

        const openRegistrarFacturaPopup = (compra) => {
            const opcionesFactura = [
                { label: "Factura manual", tipo: "manual" },
                { label: "Factura SIAT", tipo: "siat" },
                { label: "Factura Paraguay (Quatiy)", tipo: "paraguay" },
                { label: "Factura Colombia (Sasuki)", tipo: "colombia" },
            ];
            return SPopup.open({
                key: "registrar_factura_tipo_" + compra.key,
                content: (
                    <SView backgroundColor={STheme.color.background} style={{ borderRadius: 8, width: 400, maxWidth: "100%" }} padding={16} withoutFeedback>
                        <SText fontSize={18} bold>Registrar factura</SText>
                        <SHr height={12} />
                        <SText fontSize={13} color={STheme.color.text + "99"}>Seleccione el tipo de factura a generar.</SText>
                        <SHr height={16} />
                        {opcionesFactura.map((item) => (
                            <SView key={item.tipo} col={"xs-12"} style={{ marginBottom: 10 }}>
                                <SView onPress={() => {
                                    SPopup.close("registrar_factura_tipo_" + compra.key);
                                    openRegistrarFacturaTypePopup(compra, item.tipo);
                                }} style={{ borderRadius: 8, padding: 14, backgroundColor: STheme.color.card, borderWidth: 1, borderColor: STheme.color.border, }}>
                                    <SText fontSize={15} bold>{item.label}</SText>
                                </SView>
                            </SView>
                        ))}
                        <SView row col={"xs-12"} style={{ justifyContent: "flex-end" }}>
                            <SView onPress={() => SPopup.close("registrar_factura_tipo_" + compra.key)}>
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
                    <SView col={"xs-11"} row center onPress={() => { if (onPress) onPress(); SPopup.close("popup_menu_compras"); }}>
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
                title: "COMPROBANTES",
                items: [
                    { label: "Imprimir Comprobante (Rollo)", icon: "imprimir", onPress: () => { ComprobanteRollo.imprimir(row?.key); } },
                    { label: "Imprimir Comprobante (Carta)", icon: "iconLista", onPress: () => { ComprobanteCarta.imprimir(row?.key); } },
                ]
            },
            {
                title: "CONSULTA",
                items: [
                    { label: "Ver Detalle de compra", icon: "compraCarro", onPress: () => { SNavigation.navigate("/venta/profile2", { pk: row?.key }); } },
                    row?.sucursal?.key && { label: "Ver sucursal", icon: "iconEdifcio", iconProps: { fill: STheme.color.text, stroke: 'rgb(97, 97, 97)' }, onPress: () => { SNavigation.navigate("/sucursal", { key: row?.sucursal?.key }); } },
                    row?.usuario?.key && { label: "Ver usuario", icon: "cajero", iconProps: { fill: STheme.color.text, }, onPress: () => { SNavigation.navigate("/usuario", { key: row?.usuario?.key }); } },
                    row?.proveedor?.key && { label: "Ver proveedor", icon: "profile2", onPress: () => { SNavigation.navigate("/cliente/perfil", { key: row?.proveedor?.key, tipo: "proveedor" }); } },
                ].filter(Boolean)
            },
            {
                title: "GESTIÓN",
                items: [
                    MDL.rolesPermisos.getPermiso({ url: "/compra", permiso: "anular_compra" }) ? {
                        label: "Anular compra", icon: "cancelado", iconProps: { fill: "#db0606ff", stroke: "#db0606ff", },
                        onPress: () => {
                            if (Number(row?.estado) === 0) {
                                SNotification.send({
                                    key: "anular_compra_ya",
                                    title: "Compra ya anulada",
                                    body: "Esta compra ya se encuentra anulada.",
                                    color: STheme.color.warning,
                                    time: 4000,
                                });
                                return;
                            }
                            SPopup.confirm({
                                icon: "cancelado",
                                title: "Anular compra",
                                message: "¿Está seguro de que desea anular esta compra? Esta acción no se puede deshacer.",
                                cancel: { label: "Cancelar", color: STheme.color.lightGray, },
                                onPress: () => {
                                    const notificationKey = `anular_c_${row.key}`;
                                    SNotification.send({ key: notificationKey, title: "Anulando compra...", type: "loading", });
                                    MDL.caja.anular_compra({ key_compra_venta: row.key, })
                                        .then(() => {
                                            this.DinamicTable?.loadData();
                                            SNotification.send({ key: notificationKey, title: "Compra anulada", body: "La compra se anuló correctamente.", color: STheme.color.success, });
                                        })
                                        .catch((error) => {
                                            console.error("Error al anular compra:", error);
                                            SNotification.send({ key: notificationKey, title: "Error Anular Compra", body: error?.error || error?.message || String(error), color: STheme.color.danger, });
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
                                        const updatedCompra = { ...row, facturar: false, factura: {}, };
                                        await Model.compra_venta.Action.editar({
                                            data: updatedCompra,
                                            key_usuario: Model.usuario.Action.getKey(),
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
                    } : null,
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
                indexar
                ref={ref => (this.DinamicTable = ref)}
                loadData={async () => {
                    return this.loadInitialData();
                }}
                key="id"
                language="es"
                // center // no existe en DinamicTablePropsType; React la ignora, no hace nada
                {...Config.table.applyTheme()}
                selectType="single"
                keyExtractor={(e) => e.key}
                // pageLimit={100} // límite de filas por página; la librería ya arma solita el paginador (‹ Anterior / Página X de Y / Siguiente ›)
                renderHeaderActions={() => null}
                headerGroups={[
                    {
                        label: "Cuotas Pagadas", cols: ["cuotas_cantidad_pagadas", "monto_amortizado"],
                        style: { backgroundColor: STheme.color.success + '55', borderWidth: 1, borderColor: STheme.color.success },
                    },
                    {
                        label: "Cuotas Pendientes", cols: ["cuotas_cantidad_pendiente_", "monto_deuda"],
                        style: { backgroundColor: STheme.color.warning + '55', borderWidth: 1, borderColor: STheme.color.warning },
                    },
                    {
                        label: "Cuotas en Mora", cols: ["cuotas_cantidad_mora", "en_mora"],
                        style: { backgroundColor: STheme.color.danger + '55', borderWidth: 1, borderColor: STheme.color.danger },
                    },
                ]}
                onSelect={(e) => {
                    let top = e.evt.nativeEvent.pageY;
                    const h = Dimensions.get("window").height;
                    if (h < top + 300) {
                        top = h - 300;
                    }
                    SPopup.open({
                        key: "popup_menu_compras",
                        type: "2",
                        content: <SView withoutFeedback style={[{ position: "absolute", top: top, left: e.evt.nativeEvent.pageX, width: 250, }]} center>
                            {this.renderMenuCompras(e.row)}
                        </SView>
                    })
                }}
                loadInitialState={async () => { return { sorters: [{ key: "fecha_on", order: "desc", type: "date" }] } }}
            >
                {/* <DinamicTable.Col key="index" label="N°" width={40} height={60} data={(e) => e.index + 1} /> */}
                <DinamicTable.Col key="tipo_producto_" label="Tipos" width={100} height={60}
                    data={e => [...new Set((e.row?.detalles ?? []).map(h => h?.data?.tipo_producto))]} wrap
                    cellStyle={{ padding: 4, gap: 4 }}
                    customComponent={e => [...new Set((e.row?.detalles ?? []).map(h => h?.data?.tipo_producto))].map(tipo => {
                        const estilo = TIPO_PRODUCTO_MAP[tipo?.toLowerCase()] || { color: STheme.color.lightGray, label: tipo };
                        return (
                            <SView key={tipo} style={{ backgroundColor: estilo.color, borderRadius: 4, padding: 5 }}>
                                <SText style={{ fontSize: 12, color: STheme.color.text }}>{estilo.label}</SText>
                            </SView>
                        );
                    })}
                />

                <DinamicTable.Col key="descripcion" label="Concepto" width={140} height={60} data={(e) => e.row?.observacion ?? ""} />

                <DinamicTable.Col key="detalles_" label="Detalle" width={230} height={60} data={(e) => (e.row?.detalles ?? []).map(d => d.descripcion)}
                    customComponent={(e) => {
                        const MAX_LINEAS = 3;
                        const detalles = e.row?.detalles ?? [];
                        const visibles = detalles.slice(0, MAX_LINEAS);
                        const restantes = detalles.length - visibles.length;
                        return (
                            <SView col>
                                {visibles.map((d, index) => (
                                    <SText key={index} fontSize={11}>• {d.descripcion} {d.precio_unitario_base} {e.row?.moneda?.observacion} x{d.cantidad}</SText>
                                ))}
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

                <DinamicTable.Col key="vendedor" label="Comprador" width={100} height={60} data={(e) => e.row?.usuario?.Nombres ?? ""}
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

                <DinamicTable.Col key="proveedor" label="Proveedor" width={100} height={60} data={(e) => e.row?.proveedor?.razon_social ?? e.row?.proveedor?.nombres ?? ""}
                    customComponent={e => {
                        const nombre = e.row?.proveedor?.razon_social || e.row?.proveedor?.nombres || "";
                        const avatarSize = e.filterList ? 16 : 21;
                        return (
                            <SView col={"xs-12"} center row>
                                {nombre ? (
                                    <SView style={{ width: avatarSize, height: avatarSize, borderRadius: 100, backgroundColor: STheme.color.text + "20", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
                                        <SText style={{ fontSize: avatarSize / 2, color: STheme.color.text, opacity: 0.7 }}>{nombre[0].toUpperCase()}</SText>
                                        {e.row?.proveedor?.key ? <SImage src={`${SSocket.api.root}usuario/${e.row?.proveedor?.key}`} style={{ width: avatarSize, height: avatarSize, resizeMode: "cover", position: "absolute", top: 0, left: 0 }} /> : null}
                                    </SView>
                                ) : null}
                                {nombre ? <SView width={5} /> : null}
                                <SText flex capitalize numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{nombre}</SText>
                            </SView>
                        );
                    }}
                />

                <DinamicTable.Col key="tipo_pago" wrap label="Pago" width={80} height={60}
                    data={(e) => e.row?.tipo_pago ?? ""}
                    customComponent={e => {
                        const tipoPagoMap = {
                            "contado": { color: "#2563eb", label: "Contado" },
                            "credito": { color: "#f59e0b", label: "Crédito" },
                            "transferencia": { color: "#6b7280", label: "Transferencia" },
                        };
                        const estilo = tipoPagoMap[e.data?.toLowerCase()] || { color: STheme.color.lightGray, label: e.data };
                        return (
                            <>
                                {(e.row?.tipo_pago) ?
                                    <SView col={"xs-12"}   row>
                                        <SView backgroundColor={estilo.color} style={{ borderRadius: 4, padding: 5 }}>
                                            <SText color={STheme.color.text} fontSize={12}>{estilo.label}</SText>
                                        </SView>
                                    </SView> : null}
                            </>
                        );
                    }}
                />

                <DinamicTable.Col key="estado_pago" wrap label="Estado" width={80} height={60}
                    data={(e) => {
                        if ((e.row?.cuotas_en_mora?.monto || 0) > 0) return "En Mora";
                        if ((e.row?.cuotas?.total || 0) <= (e.row?.monto_amortizado || 0)) return "Pagado";
                        return "Al Día";
                    }}
                    customComponent={(e) => {
                        const statesTipo = {
                            "Al Día": { color: "#f59e0b", label: "Al Día" },
                            "En Mora": { color: "#dc2626", label: "En Mora" },
                            "Pagado": { color: "#16a34a", label: "Pagado" },
                        }[e.data] || {};
                        return <SView row center>
                            <SView backgroundColor={statesTipo?.color} style={{ borderRadius: 4, padding: 4 }} center>
                                <SText color={STheme.color.text} fontSize={12}>{statesTipo?.label}</SText>
                            </SView>
                        </SView>
                    }}
                />

                <DinamicTable.Col
                    key="factura_seleccionada"
                    label="Tipo Factura"
                    width={120}
                    height={60}
                    data={(e) => e.row?.factura?.factura_seleccionada ?? ""}
                    customComponent={(e) => {
                        const tipo = e.row?.factura?.factura_seleccionada;
                        const statesTipo = {
                            "Factura Manual": { color: "white", label: "Factura Manual" },
                            "Factura SIAT": { color: "orange", label: "Factura SIAT" },
                            "Factura Paraguay (Quatiy)": { color: "#16a34a", label: "F. Paraguay" },
                            "Factura Colombia (Sasuki)": { color: "#3b82f6", label: "F. Colombia" },
                        };
                        const config = statesTipo[tipo];
                        if (!config) return null;
                        return (
                            <SView col={"xs-12"} center row>
                                <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={{ ...e.textStyle, textTransform: "uppercase", color: config.color }}>{config.label}</SText>
                            </SView>
                        );
                    }} />

                <DinamicTable.Col key="nrofactura" label="Nro. Factura" width={100} height={60} data={(e) => e.row?.factura?.nro_factura}
                    customComponent={e => <>
                        {(e.row?.factura?.nro_factura) ?
                            <SView col={"xs-12"} center row>
                                <SView width={5} />
                                <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{e.data}</SText>
                            </SView> : null}
                    </>}
                />
                <DinamicTable.Col key="nit" label="NIT / CI" width={100} height={60} data={(e) => e.row?.factura?.nit ?? ""} />
                <DinamicTable.Col key="razon_social" label="Razón social" width={100} height={60} data={(e) => e.row?.factura?.razon_social ?? ""} />

                <DinamicTable.Col key="cuf" label="Código CUF" width={100} height={60} data={(e) => e.row?.factura?.cuf ?? ""}
                    customComponent={e => <>
                        {(e.row?.facturar) ?
                            <SView col={"xs-12"} center row>
                                <SView width={5} />
                                <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{e.data}</SText>
                            </SView> : null}
                    </>}
                />

                <DinamicTable.Col key="moneda" label="Moneda" wrap width={60} height={60} data={(e) => e.row?.moneda?.descripcion ?? ""} />

                <DinamicTable.Col key="cuotas_cantidad_pagadas" label="# Pago" sumTotal={['', 0]} 
                
                width={60} height={60} cellStyle={{  backgroundColor: STheme.color.success + "33" }} data={(e) => e.row?.cuotas?.cantidad_pagada ?? ""} 
                 customComponent={e => {
                                        return (
                                            <>
                                                {(e.data) ?
                                                    <SView center row style={{ justifyContent: "flex-end", paddingHorizontal: 2 }}>
                                                        <SText color={STheme.color.text} fontSize={12}>{e.data}</SText>
                                                    </SView> : null}
                                            </>
                                        );
                                    }}
                
                format={e => (e.data ? SMath.formatMoney(e.data) : '')} />
                <DinamicTable.Col key="monto_amortizado" wrap label="Monto" width={130} height={60}
                    sumTotal={rows => {
                        const total = rows.reduce((s, row) => s + (Number(row.monto_amortizado_base) || 0), 0);
                        const baseSim = rows[0]?.empresa?.monedas?.find(m => m.tipo === 'base')?.observacion || 'Bs';
                        return total ? `${baseSim} ${SMath.formatMoney(total)}` : '';
                    }}
                    footerComponent={this.footerCuotasYMonto(row => row.cuotas?.cantidad_pagada, row => row.monto_amortizado_base)}
                    data={(e) => { const sim = e.row?.moneda?.observacion || 'Bs'; const monto = e.row?.monto_amortizado || 0; const base = e.row?.monto_amortizado_base || 0; const baseSim = e.row?.empresa?.monedas?.find(m => m.tipo === 'base')?.observacion || 'Bs'; return !monto ? '' : sim !== baseSim ? `${sim} ${SMath.formatMoney(monto)} => ${baseSim} ${SMath.formatMoney(base)}` : `${sim} ${SMath.formatMoney(monto)}`; }}
                    cellStyle={{  backgroundColor: STheme.color.success + "33" }}
                    customComponent={e => {
                        const monedas = e.row?.empresa?.monedas || [];
                        const color = STheme.color.text;
                        const sim = e.row?.moneda?.observacion || 'Bs';
                        const monto = e.row?.monto_amortizado || 0;
                        const fmt = SMath.formatMoney(monto);
                        const num = fmt.startsWith(sim) ? fmt.replace(sim, '').trim() : fmt;
                        const baseMonto = e.row?.monto_amortizado_base || 0;
                        const baseSim = monedas.find(m => m.tipo === 'base')?.observacion || 'Bs';
                        const baseFmt = SMath.formatMoney(baseMonto);
                        const baseNum = baseFmt.startsWith(baseSim) ? baseFmt.replace(baseSim, '').trim() : baseFmt;
                        const showBase = baseMonto > 0 && sim !== baseSim;
                        if (!monto) return null;
                        return (
                                  <SView row style={{ justifyContent: "flex-end", paddingHorizontal: 4 }}>
                                                      <SView  >
                                                          <SText style={{ fontSize: 12, color }}>{sim} {num}</SText>
                                                      </SView>
                                                      {showBase && (
                                                          <SView style={{ marginTop: 2, }}>
                                                              <SText style={{ fontSize: 9, color, opacity: 0.8 }}>({baseSim} {baseNum})</SText>
                                                          </SView>
                                                      )}
                                                  </SView>
                        );
                    }} />

                <DinamicTable.Col key="cuotas_cantidad_pendiente_" label="# Pend." sumTotal={['', 0]} width={60} height={60} 
                
                
                cellStyle={{   backgroundColor: STheme.color.warning + "33" }} 
                data={(e) => e.row?.cuotas_en_mora?.cantidad ?? ""} format={e => (e.data ? SMath.formatMoney(e.data) : '')} 
                 customComponent={e => {
                                        return (
                                            <>
                                                {(e.data) ?
                                                    <SView center row style={{ justifyContent: "flex-end", paddingHorizontal: 2 }}>
                                                        <SText color={STheme.color.text} fontSize={12}>{e.data}</SText>
                                                    </SView> : null}
                                            </>
                                        );
                                    }}
                
                
                />

                <DinamicTable.Col key="monto_deuda" wrap label="Deuda" width={130} height={60}
                    sumTotal={rows => {
                        const total = rows.reduce((s, row) => s + ((Number(row.cuotas?.total_base) || 0) - (Number(row.monto_amortizado_base) || 0)), 0);
                        const baseSim = rows[0]?.empresa?.monedas?.find(m => m.tipo === 'base')?.observacion || 'Bs';
                        return total ? `${baseSim} ${SMath.formatMoney(total)}` : '';
                    }}
                    footerComponent={this.footerCuotasYMonto(row => row.cuotas?.cantidad_pendiente, row => (row.cuotas?.total_base ?? 0) - (row.monto_amortizado_base ?? 0))}
                    data={(e) => { const sim = e.row?.moneda?.observacion || 'Bs'; const monto = (e.row?.cuotas?.total ?? 0) - (e.row?.monto_amortizado ?? 0); const base = (e.row?.cuotas?.total_base ?? 0) - (e.row?.monto_amortizado_base ?? 0); const baseSim = e.row?.empresa?.monedas?.find(m => m.tipo === 'base')?.observacion || 'Bs'; return !monto ? '' : sim !== baseSim ? `${sim} ${SMath.formatMoney(monto)} => ${baseSim} ${SMath.formatMoney(base)}` : `${sim} ${SMath.formatMoney(monto)}`; }}
                    cellStyle={{   backgroundColor: STheme.color.warning + "33" }}
                    customComponent={e => {
                        const monedas = e.row?.empresa?.monedas || [];
                        const color = STheme.color.text;
                        const sim = e.row?.moneda?.observacion || 'Bs';
                        const monto = (e.row?.cuotas?.total ?? 0) - (e.row?.monto_amortizado ?? 0);
                        const fmt = SMath.formatMoney(monto);
                        const num = fmt.startsWith(sim) ? fmt.replace(sim, '').trim() : fmt;
                        const baseMonto = (e.row?.cuotas?.total_base ?? 0) - (e.row?.monto_amortizado_base ?? 0);
                        const baseSim = monedas.find(m => m.tipo === 'base')?.observacion || 'Bs';
                        const baseFmt = SMath.formatMoney(baseMonto);
                        const baseNum = baseFmt.startsWith(baseSim) ? baseFmt.replace(baseSim, '').trim() : baseFmt;
                        const showBase = baseMonto > 0 && sim !== baseSim;
                        if (!monto) return null;

                        return (
                         <SView row style={{ justifyContent: "flex-end", paddingHorizontal: 4 }}>
                                             <SView  >
                                                 <SText style={{ fontSize: 12, color }}>{sim} {num}</SText>
                                             </SView>
                                             {showBase && (
                                                 <SView style={{ marginTop: 2, }}>
                                                     <SText style={{ fontSize: 9, color, opacity: 0.8 }}>({baseSim} {baseNum})</SText>
                                                 </SView>
                                             )}
                                         </SView>
                        );
                    }} />

                <DinamicTable.Col wrap key="cuotas_cantidad_mora" label="# Mora" sumTotal={['', 0]} width={60} height={60} 
                cellStyle={{    backgroundColor: STheme.color.danger + "33" }} 
                data={(e) => e.row?.cuotas_en_mora?.cantidad ?? ""} format={e => (e.data ? SMath.formatMoney(e.data) : '')}
                
                 customComponent={e => {
                                        return (
                                            <>
                                                {(e.data) ?
                                                    <SView center row style={{ justifyContent: "flex-end", paddingHorizontal: 2 }}>
                                                        <SText color={STheme.color.text} fontSize={12}>{e.data}</SText>
                                                    </SView> : null}
                                            </>
                                        );
                                    }}
                
                
                
                
                
                />

                <DinamicTable.Col wrap key="en_mora" label="Mora" width={130} height={60}
                    sumTotal={rows => {
                        const totalBase = rows.reduce((s, row) => s + (Number(row.cuotas_en_mora?.monto_base) || 0), 0);
                        const baseSim = rows[0]?.empresa?.monedas?.find(m => m.tipo === 'base')?.observacion || 'Bs';
                        return totalBase ? `${baseSim} ${SMath.formatMoney(totalBase)}` : '';
                    }}
                    footerComponent={this.footerCuotasYMonto(row => row.cuotas_en_mora?.cantidad, row => row.cuotas_en_mora?.monto_base)}
                    data={(e) => { const sim = e.row?.moneda?.observacion || 'Bs'; const monto = e.row?.cuotas_en_mora?.monto || 0; const base = e.row?.cuotas_en_mora?.monto_base || 0; const baseSim = e.row?.empresa?.monedas?.find(m => m.tipo === 'base')?.observacion || 'Bs'; return !monto ? '' : sim !== baseSim ? `${sim} ${SMath.formatMoney(monto)} => ${baseSim} ${SMath.formatMoney(base)}` : `${sim} ${SMath.formatMoney(monto)}`; }}
                    cellStyle={{   backgroundColor: STheme.color.danger + "33" }}
                    customComponent={e => {
                        const monedas = e.row?.empresa?.monedas || [];
                        const color = STheme.color.text;
                        const sim = e.row?.moneda?.observacion || 'Bs';
                        const monto = e.row?.cuotas_en_mora?.monto || 0;
                        const fmt = SMath.formatMoney(monto);
                        const num = fmt.startsWith(sim) ? fmt.replace(sim, '').trim() : fmt;
                        const baseMonto = e.row?.cuotas_en_mora?.monto_base || 0;
                        const baseSim = monedas.find(m => m.tipo === 'base')?.observacion || 'Bs';
                        const baseFmt = SMath.formatMoney(baseMonto);
                        const baseNum = baseFmt.startsWith(baseSim) ? baseFmt.replace(baseSim, '').trim() : baseFmt;
                        const showBase = baseMonto > 0 && sim !== baseSim;
                        if (!monto) return null;
                        return (
                                      <SView row style={{ justifyContent: "flex-end", paddingHorizontal: 4 }}>
                                                          <SView  >
                                                              <SText style={{ fontSize: 12, color }}>{sim} {num}</SText>
                                                          </SView>
                                                          {showBase && (
                                                              <SView style={{ marginTop: 2, }}>
                                                                  <SText style={{ fontSize: 9, color, opacity: 0.8 }}>({baseSim} {baseNum})</SText>
                                                              </SView>
                                                          )}
                                                      </SView>
                        );
                    }} />

            </DinamicTable>
        );
    }

    render() {
        return (
            <SPage title="Tabla Gestión de Compras" disableScroll>
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
