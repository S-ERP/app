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
import FechaFullFilter from '../../Components/FechaFullFilter';
import PopupUploadFactura from './Components/PopupUploadFactura';
import { Linking } from 'react-native'

export default class tabla extends Component {

    constructor(props) {
        super(props);
        this.state = { pdfFiles: {} };
    }

    async loadInitialData() {
        try {
            SNotification.send({
                key: "load_ventas",
                title: "Cargando ventas...",
                type: "loading",
            });

            const registros = await MDL.compra_venta.getTransaccion("venta", "2025-01-01", "2030-09-05");
            if (!registros) console.warn("No se encontraron registros.");
            const empresa = await MDL.empresa.getFull();
            if (!empresa) console.warn("No se pudo obtener la empresa.");
            const sucursales = empresa.sucursales || [];
            const ventas = Object.values(registros).filter(cv => cv.tipo === "venta");
            if (ventas.length === 0) console.warn("No se encontraron ventas.");
            const keysUsuarios = [...new Set(ventas.map(v => v.key_usuario).filter(Boolean))];
            const usuarios = await MDL.usuario.getByKeys(keysUsuarios);
            const usuariosMap = Array.isArray(usuarios) ? Object.fromEntries(usuarios.map(u => [u.key, u])) : usuarios || {};
            const proveedores = await MDL.inventario.proveedor.getAllProveedor();
            const clientes = await MDL.crm.cliente.getAll();
            if (!proveedores) console.warn("No se pudieron obtener proveedores.");
            if (!clientes) console.warn("No se pudieron obtener clientes.");
            // 🔥 MAPA CLIENTES
            const clientesMap = Array.isArray(clientes) ? Object.fromEntries(clientes.map(c => [c.key, c])) : clientes || {};
            const keysCompraDetalles = [...new Set(ventas.flatMap(cv => cv.detalles?.map(d => d.key).filter(Boolean) || []))];
            const suscripcionesArray = await Promise.all(
                keysCompraDetalles.map(async key => {
                    try {
                        const data = await MDL.compra_venta.getsuscripciones(key);
                        return { key, data };
                    } catch (e) {
                        return { key, data: null };
                    }
                })
            );
            const suscripcionesMap = Object.fromEntries(suscripcionesArray.map(s => [s.key, s.data]));
            const totalesMap = {};
            ventas.forEach(cv => {
                try {
                    totalesMap[cv.key] = Model.compra_venta_detalle.Action.getTotales({ key_compra_venta: cv.key }) || {};
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
                return {
                    ...cv,
                    total_disponibles,
                    total_suscriptos,
                    total_cupos,
                    detalles: detallesEnriquecidos,
                    moneda: empresa.monedas?.find(m => m.key === cv.key_moneda) || {},
                    sucursal: sucursales.find(s => s?.key === cv?.key_sucursal) || {},
                    usuario: usuariosMap[cv?.key_usuario] || {},
                    empresa,
                    proveedor: proveedores.find(p => p.key === cv.key_proveedor) || {},
                    cliente: clientesMap[cv.key_cliente] || {},
                    subtotal: totalesMap[cv.key]?.subtotal || "0"
                };
            });
            SNotification.send({
                key: "load_ventas",
                title: "Datos cargados",
                body: `Se cargaron ${ventasEnriquecidas.length} ventas`,
                color: STheme.color.success,
                time: 2000,
            });

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
                                                    }, () => {
                                                        console.log("PDF guardado:", this.state.pdfFiles[venta.key]);
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
                    row?.cliente?.key && { label: "Ver cliente", icon: "profile2", onPress: () => { SNavigation.navigate("/cliente/perfil", { key: row?.cliente?.key }); } },
                ].filter(Boolean)
            },
            {
                title: "GESTIÓN",
                items: [
                    {
                        label: "Anular venta", icon: "cancelado", iconProps: { fill: "#db0606ff", stroke: "#db0606ff", },
                        onPress: () => {
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
                    },

                    row?.factura?.cuf ? {
                        label: "Anular factura", icon: "eliminar", iconProps: { fill: "#8007c5", stroke: STheme.color.text, },
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

        ].filter(Boolean);
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
                // headerStyle={{
                // backgroundColor:STheme.color.danger,
                // paddingLeft:50,
                // marginLeft:20,
                // paddingHorizontal: 8,
                // height: 28,
                // alignContent: "center",
                // alignItems: "center",
                //     textTransform: "uppercase",
                // }}
                selectType="single"
                keyExtractor={(e) => e.key}
                pageLimit={100}
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
                <DinamicTable.Col key="index" label="N°" headerStyle={{ paddingLeft: 4 }} width={40} data={(e) => e.index + 1} />
                <DinamicTable.Col key="detalles__2" label="key_compra_venta_detalle" width={180} headerStyle={{ paddingLeft: 4 }} data={(e) => (e.row?.detalles ?? []).map(d => d.key)} customComponent={(e) => (<SView col> {(e.row?.detalles ?? []).map((d, index) => (<SText key={index} fontSize={11}>• {d.key}</SText>))} </SView>)} />
                <DinamicTable.Col key="tipo_producto_" label="Tipos" headerStyle={{ paddingLeft: 4 }} width={90}
                    data={(e) => {
                        const tipos = (e.row?.detalles ?? []).map(d => d.data?.tipo_producto ?? "").filter(Boolean);
                        return [...new Set(tipos)].join(", ");
                    }}
                    customComponent={e => {
                        const tipoPagoMap = { "servicio": { color: "#2563eb", label: "Servicio" }, "inventario": { color: "#f59e0b", label: "Inventario" }, };
                        const tipos = [...new Set((e.row?.detalles ?? []).map(d => d.data?.tipo_producto ?? "").filter(Boolean))];
                        return (
                            <>
                                {tipos.map((tipo, index) => {
                                    const estilo = tipoPagoMap[tipo.toLowerCase()] || { color: STheme.color.lightGray, label: tipo };
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
                <DinamicTable.Col key="detalles__" label="Concepto" width={180} headerStyle={{ paddingLeft: 4 }} data={(e) => (e.row?.detalles ?? []).map(d => d.descripcion)} customComponent={(e) => (<SView col> {(e.row?.detalles ?? []).map((d, index) => (<SText key={index} fontSize={11}>• {d.descripcion} {d.precio_unitario_base} {e.row.moneda.observacion} x{d.cantidad}</SText>))} </SView>)} />
                < DinamicTable.Col key="total_cupos" label="Cupos" width={60} headerStyle={{ paddingLeft: 8 }} data={(e) => e.row?.total_cupos ?? ""} />
                < DinamicTable.Col key="total_suscriptos" label="Registrados" width={80} headerStyle={{ paddingLeft: 8 }} data={(e) => e.row?.total_suscriptos ?? ""} />
                < DinamicTable.Col key="total_disponibles" label="Pendientes" width={80} headerStyle={{ paddingLeft: 8 }} data={(e) => e.row?.total_disponibles ?? ""}
                    customComponent={e => {
                        const pendientes = parseInt(e.data || 0);
                        return (
                            <SView col={"xs-12"} center row>
                                <SView style={{ borderRadius: 2, backgroundColor: pendientes > 0 ? "#fc500c" : "transparent", padding: 1 }}>
                                    <SText style={{ ...e.textStyle, textTransform: "uppercase", }}> {pendientes > 0 ? pendientes : ""} </SText>
                                </SView>
                            </SView>
                        );
                    }}

                />
                <DinamicTable.Col key="detalles__lista" label="Suscriptores" width={80} headerStyle={{ paddingLeft: 4 }} data={(e) => (e.row?.detalles || []).flatMap(detalle => detalle.suscriptores || []).map(s => s.key_cliente).join(", ")}
                    customComponent={(e) => {
                        const suscriptores = (e.row?.detalles || []).flatMap(detalle => detalle.suscriptores || []);
                        return (<SView col> {suscriptores.map((s, index) => (<SText key={index} flex fontSize={11} style={e.textStyle}> • {s?.cliente?.nombres} </SText>))} </SView>);
                    }}
                />
                <DinamicTable.Col
                    key="ocupacion_"
                    label="Suscriptores"
                    headerStyle={{ paddingLeft: 4 }}
                    width={120}
                    data={(e) => e.row?.total_cupos ?? ""}
                    customComponent={(e) => {
                        const totalCupos = Number(e.row?.total_cupos || 0);
                        const totalSuscriptores = Number(e.row?.total_suscriptos || 0);
                        if (totalCupos <= 0) { return (<SView center row> <SText color={STheme.color.lightGray}> Sin cupos </SText> </SView>); }
                        const porcentaje = Math.min((totalSuscriptores / totalCupos) * 100, 100);
                        let color = "#ea580c";
                        let icono = "🔴";

                        if (porcentaje >= 100) {
                            color = "#16a34a";
                            icono = "🟢";
                        } else if (porcentaje >= 50) {
                            color = "#eab308";
                            icono = "🟡";
                        } else if (porcentaje > 0) {
                            color = "#f97316";
                            icono = "🟠";
                        }
                        return (
                            <SView col={"xs-12"} center>
                                <SText style={{ color, fontWeight: "bold", fontSize: 12, }}> {icono} {totalSuscriptores}/{totalCupos} </SText>
                                <SView width={60} height={6} backgroundColor="#e5e7eb" style={{ borderRadius: 3, overflow: "hidden", marginTop: 3, }}>
                                    <SView width={`${porcentaje}%`} height={6} backgroundColor={color} />
                                </SView>
                            </SView>
                        );
                    }}
                />
                <DinamicTable.Col key={"fecha_on"} label="Fecha" headerStyle={{ paddingLeft: 4 }} width={120} dataType="date" data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date} textStyle={{ fontSize: 12, color: STheme.color.text }} dateFormat="yyyy-MM-dd hh:mm" />
                <DinamicTable.Col key="sucursal" label="Sucursal" headerStyle={{ paddingLeft: 4 }} width={120} data={(e) => e.row?.sucursal?.descripcion}
                    customComponent={e => <>
                        {(e.row?.key_sucursal) ?
                            <SView col={"xs-12"} center row>
                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.text + "33" }} border={STheme.color.card} center>
                                    <SImage src={`${SSocket.api.empresa}sucursal/${e.row?.key_sucursal}`} style={{ resizeMode: "cover" }} />
                                </SView>
                                <SView width={5} />
                                <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{e.row?.sucursal?.descripcion}</SText>
                            </SView> : null}
                    </>}
                />
                <DinamicTable.Col key="admin" label="Vendedor" headerStyle={{ paddingLeft: 4 }} width={120} data={(e) => e.row?.usuario?.Nombres ?? ""}
                    customComponent={e => <>
                        {(e.row?.key_usuario) ?
                            <SView col={"xs-12"} center row>
                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.text + "33" }} border={STheme.color.text} center>
                                    <SImage src={`${SSocket.api.root}usuario/${e.row?.key_usuario}`} style={{ resizeMode: "cover" }} />
                                </SView>
                                <SView width={5} />
                                <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{e.row?.usuario?.Nombres}</SText>
                            </SView> : null}
                    </>}
                />
                <DinamicTable.Col key="cliente" label="Cliente" headerStyle={{ paddingLeft: 4 }} width={100} data={(e) => e.row?.cliente?.nombres ?? ""}
                    customComponent={e => <>
                        {(e.row?.cliente?.key) ?
                            <SView col={"xs-12"} center row>
                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.text + "33", }} border={STheme.color.text} center>
                                    <SImage src={`${SSocket.api.root}usuario/${e.row?.cliente?.key}`} style={{ resizeMode: "cover" }} />
                                </SView>
                                <SView width={5} />
                                <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{e.row?.cliente?.nombres}</SText>
                            </SView> : null}
                    </>}
                />
                <DinamicTable.Col key="tipo_pago" wrap label="Tipo Pago" headerStyle={{ paddingLeft: 8 }} width={80}
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
                                    <SView col={"xs-12"} center row>
                                        <SView backgroundColor={estilo.color} style={{ borderRadius: 4, padding: 5 }}>
                                            <SText color={STheme.color.text} fontSize={12}>{estilo.label}</SText>
                                        </SView>
                                    </SView> : null}
                            </>
                        );
                    }}
                />
                <DinamicTable.Col key="estado_pago" wrap label="Estado Pago" headerStyle={{ paddingLeft: 8 }} width={80}
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
                    label="Factura"
                    width={120}
                    headerStyle={{ paddingLeft: 8 }}
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
                < DinamicTable.Col key="nrofactura" label="Nro. Factura" width={100} headerStyle={{ paddingLeft: 8 }} data={(e) => e.row?.factura?.nro_factura}
                    customComponent={e => <>
                        {(e.row?.factura?.nro_factura) ?
                            <SView col={"xs-12"} center row>
                                <SView width={5} />
                                <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{e.data}</SText>
                            </SView> : null}
                    </>}
                />
                < DinamicTable.Col key="nit" label="NIT / CI" width={100} headerStyle={{ paddingLeft: 8 }} data={(e) => e.row?.factura?.nit ?? ""} />
                < DinamicTable.Col key="razon_social" label="Razón social" width={100} headerStyle={{ paddingLeft: 8 }} data={(e) => e.row?.factura?.razon_social ?? ""} />
                < DinamicTable.Col key="cuf" label="CUF" headerStyle={{ paddingLeft: 8 }} width={100} data={(e) => e.row?.factura?.cuf ?? ""}
                    customComponent={e => <>
                        {(e.row?.facturar) ?
                            <SView col={"xs-12"} center row>
                                <SView width={5} />
                                <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{e.data}</SText>
                            </SView> : null}
                    </>}
                />
                <DinamicTable.Col key="detalles_" label="Detalle" width={220} headerStyle={{ paddingLeft: 8 }} data={(e) => (e.row?.detalles ?? []).map(d => d.descripcion)} customComponent={(e) => (<SView col> {(e.row?.detalles ?? []).map((d, index) => (<SText key={index} fontSize={11}>• {d.descripcion} {d.precio_unitario_base} {e.row.moneda.observacion} x{d.cantidad}</SText>))} </SView>)} />
                <DinamicTable.Col key="cuotas_total" label="Total" headerStyle={{ paddingLeft: 8 }} wrap bold width={80}
                    data={(e) => (e.row?.cuotas.total ? e.row.cuotas.total : "0")}
                    cellStyle={{ alignItems: "flex-end" }}
                    format={(e) => e.row?.moneda?.observacion + " " + SMath.formatMoney(e.data)} />
                <DinamicTable.Col key="cuotas_cantidad" label="# Cuotas" headerStyle={{ paddingLeft: 8 }} width={60} cellStyle={{ alignItems: "center" }} data={(e) => e.row?.cuotas.cantidad ?? ""} /> <DinamicTable.Col wrap key="cuotas_cantidad_mora" label="# Cuotas en Mora" width={60} cellStyle={{ alignItems: "center", backgroundColor: STheme.color.danger + "33" }} data={(e) => e.row?.cuotas_en_mora.cantidad ?? ""} />
                <DinamicTable.Col key="moneda" label="Moneda" wrap width={60} headerStyle={{ paddingLeft: 8 }} data={(e) => e.row?.moneda?.descripcion ?? ""} />
                <DinamicTable.Col key="monto_amortizado" wrap label="Monto Pagado" width={60} data={(e) => e.row?.monto_amortizado ?? ""}
                    cellStyle={{
                        alignItems: "flex-end",
                        backgroundColor: STheme.color.success + "33"
                    }}
                    format={(e) => !e.data ? "" : SMath.formatMoney(e.data)} />
                <DinamicTable.Col key="monto_deuda" wrap label="Deuda total" width={60}
                    data={(e) => (e.row?.cuotas?.total ?? 0) - (e.row?.monto_amortizado ?? 0) ?? ""}
                    cellStyle={{
                        alignItems: "flex-end",
                        backgroundColor: STheme.color.warning + "33"
                    }}
                    format={(e) => !e.data ? "" : SMath.formatMoney(e.data)} /><DinamicTable.Col wrap key="en_mora" label="Monto en Mora" width={60} data={(e) => e.row?.cuotas_en_mora.monto ?? ""}
                        cellStyle={{
                            alignItems: "flex-end",
                            backgroundColor: STheme.color.danger + "33"
                        }}
                        format={(e) => !e.data ? "" : SMath.formatMoney(e.data)}
                />
                <DinamicTable.Col key="cuotas_total_base" wrap label="Monto Base" width={60}
                    data={(e) => (e.row?.cuotas.total_base ? e.row.cuotas.total_base : "0")}
                    cellStyle={{
                        alignItems: "flex-end"
                    }}
                    format={(e) => SMath.formatMoney(e.data)}
                />
                <DinamicTable.Col key="monto_amortizado_base" wrap label="Monto Pagado Base" width={60} data={(e) => e.row?.monto_amortizado_base ?? ""}
                    cellStyle={{
                        alignItems: "flex-end",
                        backgroundColor: STheme.color.success + "33"
                    }}
                    format={(e) => !e.data ? "" : SMath.formatMoney(e.data)} />
                <DinamicTable.Col key="monto_deuda_base" wrap label="Deuda total Base" width={60}
                    data={(e) => (e.row?.cuotas?.total_base ?? 0) - (e.row?.monto_amortizado_base ?? 0) ?? ""}
                    cellStyle={{
                        alignItems: "flex-end",
                        backgroundColor: STheme.color.warning + "33"
                    }}
                    format={(e) => !e.data ? "" : SMath.formatMoney(e.data)} />
                <DinamicTable.Col wrap key="en_mora_base" label="Monto en Mora Base" width={60} data={(e) => e.row?.cuotas_en_mora.monto_base ?? ""}
                    cellStyle={{
                        alignItems: "flex-end",
                        backgroundColor: STheme.color.danger + "33"
                    }}
                    format={(e) => !e.data ? "" : SMath.formatMoney(e.data)}
                />
            </DinamicTable>
        );
    }
    async confirmarBorradoFacturas() {
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
                <SView row col={"xs-12"} style={{ paddingBottom: 8, paddingLeft: 8, borderBottomWidth: 1, borderColor: STheme.color.lightGray + "30", }}>
                    <SView col={"xs-12 sm-8.2 lg-3.3"} row center>
                        <FechaFullFilter
                            onChange={e => this.setState({
                                fecha_inicio: e.fecha_inicio,
                                fecha_fin: e.fecha_fin
                            }, () => {
                            })}
                        />
                    </SView>
                    <SView width={8} height={"100%"} />
                </SView>{this.mostrarTabla()}
            </SPage>
        );
    }
}