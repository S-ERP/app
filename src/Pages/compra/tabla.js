import React, { Component } from 'react';
import { SPage, SPopup, SView, SText, STheme, SHr, SImage, SInput, SNavigation, SDate, SMath, SNotification } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import { Dimensions, Linking } from 'react-native';
import SSocket from 'servisofts-socket';
import SIconApp from '../../Assets/SIconApp';
import Config from '../../Config';
import Model from '../../Model';
import MDL from '../../MDL';
import ComprobanteRollo from '../../Components/PDF/compra/ComprobanteRollo';
import ComprobanteCarta from '../../Components/PDF/compra/ComprobanteCarta';
import PopupUploadFactura from '../venta/Components/PopupUploadFactura';
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
    componentDidMount() {
        MDL.rolesPermisos.getPermisoAsync({ url: "/compra/tabla", permiso: "ver" }).then((permit) => {
            if (!permit) {
                SNavigation.goBack();
                return;
            }
        }).catch(e => {
            console.error(e);
        });
    }
    async loadInitialData() {
        try {
            SNotification.send({ key: "load_compras", title: "Cargando compras...", type: "loading" });
            const registros = await MDL.compra_venta.getTransaccion("compra", this.state.fecha_inicio, this.state.fecha_fin);
            if (!registros) return [];
            const empresa = await MDL.empresa.getFull();
            const sucursales = empresa.sucursales || [];
            const compras = Object.values(registros).filter(cv => cv.tipo === "compra");
            const keysUsuarios = [...new Set(compras.map(v => v.key_usuario).filter(Boolean))];
            const proveedores = await MDL.crm.cliente.getAll();
            const usuarios = await MDL.usuario.getByKeys(keysUsuarios) || {};
            const usuariosMap = Array.isArray(usuarios)
                ? Object.fromEntries(usuarios.map(u => [u.key, u]))
                : usuarios;
            const comprasEnriquecidas = compras.map((cv) => {
                const totales = Model.compra_venta_detalle.Action.getTotales({ key_compra_venta: cv.key }) || {};
                const cuotas = cv.cuotas || {};
                const cuotaUnitaria = cuotas.total && cuotas.cantidad ? cuotas.total / cuotas.cantidad : 0;
                const cantidad_pagada = cuotaUnitaria > 0 ? Math.round((cv.monto_amortizado || 0) / cuotaUnitaria) : 0;
                const cantidad_pendiente = Math.max(0, (cuotas.cantidad || 0) - (cv.cuotas_en_mora?.cantidad || 0) - cantidad_pagada);
                return {
                    ...cv,
                    moneda: empresa.monedas?.find(m => m.key === cv.key_moneda) || {},
                    sucursal: sucursales.find(a => a?.key === cv?.key_sucursal) || {},
                    usuario: usuariosMap[cv.key_usuario] || {},
                    empresa,
                    proveedor: proveedores?.find(a => a.key == cv.key_proveedor) || {},
                    subtotal: totales?.subtotal || "0",
                    descuento: totales?.descuento || "0",
                    cuotas: { ...cuotas, cantidad_pagada, cantidad_pendiente },
                };
            });
            SNotification.send({ key: "load_compras", title: "Datos cargados", body: `Se cargaron ${comprasEnriquecidas.length} compras`, color: STheme.color.success, time: 2000 });
            return comprasEnriquecidas;
        } catch (error) {
            SNotification.send({ key: "load_compras", title: "Error al cargar compras", body: error?.message || "Error desconocido", color: STheme.color.danger, time: 4000 });
            return [];
        }
    }
    renderState(state) {
        var statesInfo = Model.compra_venta.Action.getStateInfo()[state];
        return <SView row center>
            <SView backgroundColor={statesInfo.color} style={{ borderRadius: 4, padding: 5 }}>
                <SText color={STheme.color.text} fontSize={10}>{statesInfo.label}</SText>
            </SView>
        </SView>;
    }
    renderTipoPago(values) {
        const statesTipo = MDL.compra_venta.getTipoPago()[values];
        return <SView row center>
            <SView backgroundColor={statesTipo?.color} style={{ borderRadius: 4, padding: 5 }}>
                <SText color={STheme.color.text} fontSize={10}>{statesTipo?.label}</SText>
            </SView>
        </SView>;
    }
    renderCodigo(codigo) {
        return <SView row center>
            <SView border={STheme.color.card} style={{ borderRadius: 16, padding: 6, borderWidth: 1 }}>
                <SText color={STheme.color.text} fontSize={10} bold>{codigo}</SText>
            </SView>
        </SView>;
    }
    generateRandomCode() { return `F-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`; }
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
                                                    }, () => {
                                                        console.log("PDF guardado:", this.state.pdfFiles[compra.key]);
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
                        <SView col={"xs-2"} center height={32}> {typeof icon === "string" ? <SIconApp name={icon} height={18} fill={iconProps?.fill || STheme.color.text} stroke={iconProps?.stroke} /> : icon} </SView>
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
                                    iconProps: { fill: STheme.color.text },
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
                                    SSocket.sendPromise({
                                        service: "caja",
                                        component: "caja_detalle",
                                        type: "anularCompra",
                                        key_empresa: MDL.empresa.select?.key,
                                        key_usuario: MDL.usuario.session?.key,
                                        key_compra_venta: row.key,
                                        key_caja: MDL.caja.activa?.key,
                                    }).then(() => {
                                        this.DinamicTable?.loadData();
                                        SNotification.send({ key: notificationKey, title: "Compra anulada", body: "La compra se anuló correctamente.", color: STheme.color.success, time: 5000, });
                                    }).catch((error) => {
                                        SNotification.send({ key: notificationKey, title: "Error al anular", body: error?.error || error?.message || String(error), color: STheme.color.danger, time: 10000, });
                                    });
                                }
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
                ref={ref => (this.DinamicTable = ref)}
                loadData={() => this.loadInitialData()}
                key="id"
                language="es"
                center
                {...Config.table.applyTheme()}
                selectType="single"
                keyExtractor={(e) => e.key}
                pageLimit={100}
                listFooterComponent={() => <SHr height={100} />}
                onSelect={(e) => {
                    let top = e.evt.nativeEvent.pageY;
                    const h = Dimensions.get("window").height;
                    if (h < top + 300) {
                        top = h - 300;
                    }
                    SPopup.open({
                        key: "popup_menu_compras",
                        type: "2",
                        content: <SView withoutFeedback style={[{ position: "absolute", top: top, left: e.evt.nativeEvent.pageX, width: 300, }]} center>
                            {this.renderMenuCompras(e.row)}
                        </SView>
                    });
                }}
                loadInitialState={async () => {
                    return { sorters: [{ key: "fecha_on", order: "desc", type: "date" }] };
                }}
            >
                <DinamicTable.Col key="index" label="N°" headerStyle={{ paddingLeft: 4 }} width={40} height={60} data={(e) => e.index + 1} />
                <DinamicTable.Col key="tipo_producto_" label="Tipos" headerStyle={{ paddingLeft: 4 }} width={90} height={80}
                    data={(e) => getTiposProducto(e.row?.detalles).join(", ")}
                    customComponent={e => {
                        const tipos = getTiposProducto(e.row?.detalles);
                        return (
                            <>
                                {tipos.map((tipo, index) => {
                                    const estilo = TIPO_PRODUCTO_MAP[tipo.toLowerCase()] || { color: STheme.color.lightGray, label: tipo };
                                    return (
                                        <SView key={index} col={"xs-12"} center row>
                                            <SView backgroundColor={estilo.color} style={{ borderRadius: 4, padding: 5, marginBottom: 4 }}>
                                                <SText color={STheme.color.text} fontSize={12}>{estilo.label}</SText>
                                            </SView>
                                        </SView>
                                    );
                                })}
                            </>
                        );
                    }}
                />
                <DinamicTable.Col key="descripcion" label="Descripción" headerStyle={{ paddingLeft: 8 }} width={140} height={60} data={(e) => e.row?.observacion ?? ""} />
                <DinamicTable.Col key="detalles_" label="Detalle" width={210} height={100} headerStyle={{ paddingLeft: 8 }}
                    data={(e) => (e.row?.detalles ?? []).map(d => d.descripcion)}
                    customComponent={(e) => (
                        <SView col>
                            {(e.row?.detalles ?? []).map((d, index) => (
                                <SText key={index} fontSize={11}>• {d.descripcion} {d.precio_unitario_base} {e.row.moneda.observacion} x{d.cantidad}</SText>
                            ))}
                        </SView>
                    )}
                />
                <DinamicTable.Col key={"fecha_on"} label="Fecha" headerStyle={{ paddingLeft: 4 }} width={120} height={60} dataType="date"
                    data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date}
                    textStyle={{ fontSize: 12, color: STheme.color.text }}
                    dateFormat="yyyy-MM-dd hh:mm"
                />
                <DinamicTable.Col key="sucursal" label="Sucursal" headerStyle={{ paddingLeft: 4 }} width={120} height={60} data={(e) => e.row?.sucursal?.descripcion}
                    customComponent={e => {
                        const nombre = e.row?.sucursal?.descripcion || "";
                        return (
                            <SView col={"xs-12"} center row>
                                {nombre ? (
                                    <SView style={{ width: 24, height: 24, borderRadius: 100, backgroundColor: STheme.color.text + "20", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
                                        <SText style={{ fontSize: 11, color: STheme.color.text, opacity: 0.7 }}>{nombre[0].toUpperCase()}</SText>
                                        {e.row?.key_sucursal ? <SImage src={`${SSocket.api.empresa}sucursal/${e.row?.key_sucursal}`} style={{ width: 24, height: 24, resizeMode: "cover", position: "absolute", top: 0, left: 0 }} /> : null}
                                    </SView>
                                ) : null}
                                {nombre ? <SView width={5} /> : null}
                                <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{nombre}</SText>
                            </SView>
                        );
                    }}
                />
                <DinamicTable.Col key="admin" label="Vendedor" headerStyle={{ paddingLeft: 4 }} width={120} height={60} data={(e) => e.row?.usuario?.Nombres ?? ""}
                    customComponent={e => {
                        const nombre = e.row?.usuario?.Nombres || "";
                        return (
                            <SView col={"xs-12"} center row>
                                {nombre ? (
                                    <SView style={{ width: 24, height: 24, borderRadius: 100, backgroundColor: STheme.color.text + "20", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
                                        <SText style={{ fontSize: 11, color: STheme.color.text, opacity: 0.7 }}>{nombre[0].toUpperCase()}</SText>
                                        {e.row?.key_usuario ? <SImage src={`${SSocket.api.root}usuario/${e.row?.key_usuario}`} style={{ width: 24, height: 24, resizeMode: "cover", position: "absolute", top: 0, left: 0 }} /> : null}
                                    </SView>
                                ) : null}
                                {nombre ? <SView width={5} /> : null}
                                <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{nombre}</SText>
                            </SView>
                        );
                    }}
                />
                <DinamicTable.Col key="proveedor" label="Proveedor" headerStyle={{ paddingLeft: 4 }} width={120} height={60}
                    data={(e) => e.row?.proveedor?.razon_social ?? e.row?.proveedor?.nombres ?? ""}
                    customComponent={e => {
                        const nombre = e.row?.proveedor?.razon_social || e.row?.proveedor?.nombres || "";
                        return (
                            <SView col={"xs-12"} center row>
                                {nombre ? (
                                    <SView style={{ width: 24, height: 24, borderRadius: 100, backgroundColor: STheme.color.text + "20", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
                                        <SText style={{ fontSize: 11, color: STheme.color.text, opacity: 0.7 }}>{nombre[0].toUpperCase()}</SText>
                                        {e.row?.proveedor?.key ? <SImage src={`${SSocket.api.root}usuario/${e.row?.proveedor?.key}`} style={{ width: 24, height: 24, resizeMode: "cover", position: "absolute", top: 0, left: 0 }} /> : null}
                                    </SView>
                                ) : null}
                                {nombre ? <SView width={5} /> : null}
                                <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{nombre}</SText>
                            </SView>
                        );
                    }}
                />
                <DinamicTable.Col key="tipo_pago" wrap label="Tipo Pago" headerStyle={{ paddingLeft: 8 }} width={80} height={60}
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
                                {e.row?.tipo_pago ? (
                                    <SView col={"xs-12"} center row>
                                        <SView backgroundColor={estilo.color} style={{ borderRadius: 4, padding: 5 }}>
                                            <SText color={STheme.color.text} fontSize={12}>{estilo.label}</SText>
                                        </SView>
                                    </SView>
                                ) : null}
                            </>
                        );
                    }}
                />
                <DinamicTable.Col key="estado_pago" wrap label="Estado Pago" headerStyle={{ paddingLeft: 8 }} width={80} height={60}
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
                        return (
                            <SView row center>
                                <SView backgroundColor={statesTipo?.color} style={{ borderRadius: 4, padding: 4 }} center>
                                    <SText color={STheme.color.text} fontSize={12}>{statesTipo?.label}</SText>
                                </SView>
                            </SView>
                        );
                    }}
                />
                <DinamicTable.Col key="facturar" wrap label="Con Factura" width={65} height={60} data={(e) => e.row?.facturar}
                    customComponent={e => (
                        <>
                            {e.row?.facturar ? (
                                <SView col={"xs-12"} center row>
                                    <SText flex style={e.textStyle}>si✅</SText>
                                </SView>
                            ) : null}
                        </>
                    )}
                />
                <DinamicTable.Col key="nit" label="NIT / CI" width={100} height={60} headerStyle={{ paddingLeft: 8 }} data={(e) => e.row?.factura?.nit ?? ""} />
                <DinamicTable.Col key="razon_social" label="Razón social" width={100} height={60} headerStyle={{ paddingLeft: 8 }} data={(e) => e.row?.factura?.razon_social ?? ""} />
                <DinamicTable.Col key="cuotas_total" label="Total" headerStyle={{ paddingLeft: 8 }} wrap bold width={95} height={60}
                    data={(e) => { const sim = e.row?.moneda?.observacion || 'Bs'; const monto = e.row?.cuotas?.total || 0; const base = e.row?.cuotas?.total_base || 0; const baseSim = e.row?.empresa?.monedas?.find(m => m.tipo === 'base')?.observacion || 'Bs'; return sim !== baseSim ? `${sim} ${SMath.formatMoney(monto)} => ${baseSim} ${SMath.formatMoney(base)}` : `${sim} ${SMath.formatMoney(monto)}`; }}
                    cellStyle={{ alignItems: "flex-end" }}
                    customComponent={e => {
                        const monedas = e.row?.empresa?.monedas || [];
                        const sim = e.row?.moneda?.observacion || 'Bs';
                        const monto = e.row?.cuotas?.total || 0;
                        const fmt = SMath.formatMoney(monto);
                        const num = fmt.startsWith(sim) ? fmt.replace(sim, '').trim() : fmt;
                        const baseMonto = e.row?.cuotas?.total_base || 0;
                        const baseSim = monedas.find(m => m.tipo === 'base')?.observacion || 'Bs';
                        const baseFmt = SMath.formatMoney(baseMonto);
                        const baseNum = baseFmt.startsWith(baseSim) ? baseFmt.replace(baseSim, '').trim() : baseFmt;
                        const showBase = baseMonto > 0 && sim !== baseSim;
                        if (!monto) return null;
                        return (
                            <SView col style={{ padding: 4, alignItems: 'flex-end' }}>
                                <SText style={{ fontSize: 12, color: STheme.color.text }}>{sim} {num}</SText>
                                {showBase && <SText style={{ fontSize: 9, color: STheme.color.text, opacity: 0.8 }}>({baseSim} {baseNum})</SText>}
                            </SView>
                        );
                    }}
                />
                <DinamicTable.Col key="cuotas_cantidad" label="# Cuotas" headerStyle={{ paddingLeft: 8 }} width={60} height={60} cellStyle={{ alignItems: "center" }} data={(e) => e.row?.cuotas?.cantidad ?? ""} />
                <DinamicTable.Col key="moneda" label="Moneda" wrap width={60} height={60} headerStyle={{ paddingLeft: 8 }} data={(e) => e.row?.moneda?.descripcion ?? ""} />
                <DinamicTable.Col key="cuotas_cantidad_pagadas" label="# Pago" headerStyle={{ paddingLeft: 8 }} width={60} height={60} cellStyle={{ alignItems: "center", backgroundColor: STheme.color.success + "33" }} data={(e) => e.row?.cuotas?.cantidad_pagada ?? ""} format={e => (e.data ? SMath.formatMoney(e.data) : '')} />
                <DinamicTable.Col key="monto_amortizado" wrap label="Monto Pagado" width={95} height={60}
                    data={(e) => { const sim = e.row?.moneda?.observacion || 'Bs'; const monto = e.row?.monto_amortizado || 0; const base = e.row?.monto_amortizado_base || 0; const baseSim = e.row?.empresa?.monedas?.find(m => m.tipo === 'base')?.observacion || 'Bs'; return !monto ? '' : sim !== baseSim ? `${sim} ${SMath.formatMoney(monto)} => ${baseSim} ${SMath.formatMoney(base)}` : `${sim} ${SMath.formatMoney(monto)}`; }}
                    cellStyle={{ alignItems: "flex-end", backgroundColor: STheme.color.success + "33" }}
                    customComponent={e => {
                        const monedas = e.row?.empresa?.monedas || [];
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
                            <SView col style={{ padding: 4, alignItems: 'flex-end' }}>
                                <SText style={{ fontSize: 12, color: STheme.color.text }}>{sim} {num}</SText>
                                {showBase && <SText style={{ fontSize: 9, color: STheme.color.text, opacity: 0.8 }}>({baseSim} {baseNum})</SText>}
                            </SView>
                        );
                    }}
                />
                <DinamicTable.Col key="cuotas_cantidad_pendiente_" label="# Pend." headerStyle={{ paddingLeft: 8 }} width={60} height={60} cellStyle={{ alignItems: "center", backgroundColor: STheme.color.warning + "33" }} data={(e) => e.row?.cuotas_en_mora?.cantidad ?? ""} format={e => (e.data ? SMath.formatMoney(e.data) : '')} />
                <DinamicTable.Col key="monto_deuda" wrap label="Monto pendiente" width={95} height={60}
                    data={(e) => { const sim = e.row?.moneda?.observacion || 'Bs'; const monto = (e.row?.cuotas?.total ?? 0) - (e.row?.monto_amortizado ?? 0); const base = (e.row?.cuotas?.total_base ?? 0) - (e.row?.monto_amortizado_base ?? 0); const baseSim = e.row?.empresa?.monedas?.find(m => m.tipo === 'base')?.observacion || 'Bs'; return !monto ? '' : sim !== baseSim ? `${sim} ${SMath.formatMoney(monto)} => ${baseSim} ${SMath.formatMoney(base)}` : `${sim} ${SMath.formatMoney(monto)}`; }}
                    cellStyle={{ alignItems: "flex-end", backgroundColor: STheme.color.warning + "33" }}
                    customComponent={e => {
                        const monedas = e.row?.empresa?.monedas || [];
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
                            <SView col style={{ padding: 4, alignItems: 'flex-end' }}>
                                <SText style={{ fontSize: 12, color: STheme.color.text }}>{sim} {num}</SText>
                                {showBase && <SText style={{ fontSize: 9, color: STheme.color.text, opacity: 0.8 }}>({baseSim} {baseNum})</SText>}
                            </SView>
                        );
                    }}
                />
                <DinamicTable.Col wrap key="cuotas_cantidad_mora" label="# Mora" headerStyle={{ paddingLeft: 8 }} width={60} height={60} cellStyle={{ alignItems: "center", backgroundColor: STheme.color.danger + "33" }} data={(e) => e.row?.cuotas_en_mora?.cantidad ?? ""} format={e => (e.data ? SMath.formatMoney(e.data) : '')} />
                <DinamicTable.Col wrap key="en_mora" label="Monto Mora" width={95} height={60}
                    data={(e) => { const sim = e.row?.moneda?.observacion || 'Bs'; const monto = e.row?.cuotas_en_mora?.monto || 0; const base = e.row?.cuotas_en_mora?.monto_base || 0; const baseSim = e.row?.empresa?.monedas?.find(m => m.tipo === 'base')?.observacion || 'Bs'; return !monto ? '' : sim !== baseSim ? `${sim} ${SMath.formatMoney(monto)} => ${baseSim} ${SMath.formatMoney(base)}` : `${sim} ${SMath.formatMoney(monto)}`; }}
                    cellStyle={{ alignItems: "flex-end", backgroundColor: STheme.color.danger + "33" }}
                    customComponent={e => {
                        const monedas = e.row?.empresa?.monedas || [];
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
                            <SView col style={{ padding: 4, alignItems: 'flex-end' }}>
                                <SText style={{ fontSize: 12, color: STheme.color.text }}>{sim} {num}</SText>
                                {showBase && <SText style={{ fontSize: 9, color: STheme.color.text, opacity: 0.8 }}>({baseSim} {baseNum})</SText>}
                            </SView>
                        );
                    }}
                />
            </DinamicTable>
        );
    }
    render() {
        return (
            <SPage title="Tabla Gestión de Compras" disableScroll>
                <SView col={"xs-12"} style={{ paddingHorizontal: 8 }}>
                    <FechaFullFilter
                        onChange={e => this.setState({ fecha_inicio: e.fecha_inicio, fecha_fin: e.fecha_fin }, () => {
                            this.DinamicTable?.loadData();
                        })}
                    />
                </SView>
                {this.mostrarTabla()}
            </SPage>
        );
    }
}