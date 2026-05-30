import React, { Component } from 'react';
import { SPage, SPopup, SView, SText, STheme, SHr, SImage, SNavigation, SDate, SIcon, SInput, SMath, SNotification } from 'servisofts-component';
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

    async loadInitialData() {
        try {
            const registros = await MDL.compra_venta.getTransaccion("venta", "2025-01-01", "2030-09-05");
            if (!registros) throw new Error("No se encontraron registros.");
            const empresa = await MDL.empresa.getFull();
            if (!empresa) throw new Error("No se pudo obtener la empresa.");
            const sucursales = empresa.sucursales || [];
            const ventas = Object.values(registros).filter(cv => cv.tipo === "venta");
            if (ventas.length === 0) throw new Error("No se encontraron ventas.");
            const keysUsuarios = [];
            ventas.forEach(cv => {
                if (cv.key_usuario && !keysUsuarios.includes(cv.key_usuario)) {
                    keysUsuarios.push(cv.key_usuario);
                }
            });
            const proveedores = await MDL.inventario.proveedor.getAllProveedor();
            if (!proveedores) throw new Error("No se pudieron obtener proveedores.");
            const clientes = await MDL.crm.cliente.getAll();
            if (!clientes) throw new Error("No se pudieron obtener clientes.");
            const usuarios = await MDL.usuario.getByKeys(keysUsuarios);
            const usuariosMap = Array.isArray(usuarios)
                ? Object.fromEntries(usuarios.map(u => [u.key, u]))
                : usuarios || {};
            let totales = {};
            try {
                totales = Model.compra_venta_detalle.Action.getTotales({ key_compra_venta: ventas[0]?.key }) || {};
            } catch (e) {
                console.error("No se pudieron obtener los totales de la primera venta:", e);
            }
            const ventasEnriquecidas = await Promise.all(
                ventas.map(async (cv) => {
                    return {
                        ...cv,
                        moneda: empresa.monedas?.find(m => m.key === cv.key_moneda) || {},
                        sucursal: sucursales.find(s => s?.key === cv?.key_sucursal) || {},
                        usuario: usuariosMap[cv?.key_usuario] || {},
                        empresa,
                        proveedor: proveedores.find(p => p.key === cv.key_proveedor) || {},
                        cliente: clientes.find(c => c?.key === cv.key_cliente) || {},
                        subtotal: totales?.subtotal || "0",
                    };
                })
            );
            console.clear();
            console.log("%c" + JSON.stringify(ventasEnriquecidas, null, 2), "color: #2ECC40; font-weight: bold;");
            return ventasEnriquecidas;
        } catch (error) {
            console.error("❌ Error en loadInitialData:", error?.message || error, error);
            SPopup.alert("Error al cargar los datos. Intenta nuevamente.");
            return [];
        }
    }

    generateRandomCode() {
        return `F-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
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
                // if (tipoFactura === "manual" || tipoFactura === "paraguay" || tipoFactura === "colombia") {
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
            let pdfFile = null;
            const onFileChange = (files) => {
                pdfFile = files?.[0]?.file || null;
            };
            const isManual = tipoFactura === "manual";

            console.log("venta seleccionada para facturar:", venta);
            console.log(venta);
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
                                    style={{ borderWidth: 1, borderColor: STheme.color.card, borderRadius: 8, padding: 10, backgroundColor: STheme.color.card + "22", }} >
                                    <SView flex>
                                        <SText fontSize={13} bold>
                                            PDF de factura
                                        </SText>
                                        <SHr h={4} />
                                        <SText fontSize={11} color={STheme.color.lightGray}>
                                            {pdfFile?.name ?? "Ningún archivo seleccionado"}
                                        </SText>
                                    </SView>
                                    <SView style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, backgroundColor: STheme.color.primary, }}
                                        onPress={() => {
                                            PopupUploadFactura.open({
                                                key_empresa: venta?.empresa?.key,
                                                key_compra_venta: venta?.key,
                                                onSuccess: (fileData) => {
                                                    pdfFile = fileData;

                                                    SNotification.send({
                                                        title: "PDF seleccionado",
                                                        body: fileData?.name,
                                                        color: STheme.color.success,
                                                        time: 2000,
                                                    });

                                                    this.forceUpdate();
                                                }
                                            });
                                        }}
                                    >
                                        <SText color={STheme.color.text} bold>
                                            Seleccionar PDF
                                        </SText>
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
                                    style={{
                                        height: 40,
                                        borderRadius: 6,
                                        backgroundColor: STheme.color.lightGray + "22",
                                        color: STheme.color.text,
                                    }}
                                />
                                <SHr height={10} />
                                <SInput
                                    label="Razón social"
                                    placeholder="Ingrese razón social"
                                    onChangeText={val => razon_social = val}
                                    style={{
                                        height: 40,
                                        borderRadius: 6,
                                        backgroundColor: STheme.color.lightGray + "22",
                                        color: STheme.color.text,
                                    }}
                                />
                            </>
                        )}
                        <SHr height={16} />
                        <SView row col={"xs-12"} style={{ justifyContent: "flex-end" }}>
                            <SView style={{ marginRight: 8 }} onPress={() => SPopup.close("registrar_factura_" + tipoFactura + "_" + venta.key)}>
                                <SText color={STheme.color.text}>Cancelar</SText>
                            </SView>
                            <SView onPress={async () => {
                                if (isManual) {
                                    // if (!nroFactura.trim() || !pdfFile) {
                                    //     SNotification.send({ key: "factura_registrar_error", title: "Complete los datos", body: "Debe ingresar el número de factura y subir el PDF.", color: STheme.color.danger, time: 4000, });
                                    //     return;
                                    // }
                                } else {
                                    if (!nit.trim() || !razon_social.trim()) {
                                        SNotification.send({ key: "factura_registrar_error", title: "Complete los datos", body: "Debe ingresar NIT y razón social.", color: STheme.color.danger, time: 4000, });
                                        return;
                                    }
                                }
                                const facturaData = {
                                    tipo: tipoFactura,
                                    nro_factura: isManual ? nroFactura : this.generateRandomCode(),
                                    cuf: "212E5B3D5BBF8FB31CCF8BE464EE98640C7F9CB6615194573A17DAF74",
                                    nit: isManual ? "" : nit,
                                    razon_social: isManual ? "" : razon_social,
                                    leyenda: "alvaro es probando la leyenda",
                                    detalles: (venta.detalles ?? []).map(d => d.descripcion).join(", "),
                                    archivo_pdf: isManual ? { name: pdfFile?.name, type: pdfFile?.type } : undefined,
                                    // 🔥 ESTA ES LA LÍNEA QUE TE FALTA
                                    link_factura: isManual ? pdfFile?.url || pdfFile?.link || null : undefined,
                                    factura_seleccionada: tipoLabel,
                                };
                                const updatedVenta = {
                                    ...venta,
                                    facturar: true,
                                    factura: facturaData,
                                    nit: isManual ? venta.nit : nit,
                                    razon_social: isManual ? venta.razon_social : razon_social,
                                };
                                try {
                                    await Model.compra_venta.Action.editar({
                                        data: updatedVenta,
                                        key_usuario: Model.usuario.Action.getKey(),
                                    });
                                    if (this.DinamicTable) this.DinamicTable.loadData();
                                    SNotification.send({ key: "factura_registrar_ok_" + tipoFactura, title: tipoLabel + " registrada", body: isManual ? "Factura manual agregada." : "NIT: " + nit + ", Razón social: " + razon_social, color: STheme.color.success, time: 5000, });
                                } catch (error) {
                                    console.error("Error al editar la venta:", error);
                                    SNotification.send({ key: "factura_registrar_error_" + tipoFactura, title: "Error al registrar factura", body: "Intente de nuevo.", color: STheme.color.danger, time: 5000, });
                                } finally {
                                    SPopup.close("registrar_factura_" + tipoFactura + "_" + venta.key);
                                }
                            }}>
                                <SText color={STheme.color.success}>Registrar</SText>
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
                    <SView col={"xs-11"} row center onPress={() => {
                        if (onPress) onPress();
                        SPopup.close("popup_menu_ventas");
                    }}>
                        <SView col={"xs-2"} center height={32}>
                            {typeof icon === "string" ? <SIconApp name={icon} height={18} fill={iconProps?.fill || STheme.color.text} stroke={iconProps?.stroke} /> : icon}
                        </SView>
                        <SView width={8} />
                        <SView flex>
                            <SText fontSize={14}>{label}</SText>
                        </SView>
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
                        ...(row?.factura?.factura_seleccionada === "Factura Manual" && row?.factura?.link_factura
                            ? [
                                { label: "Descargar Archivo (PDF)", icon: "iconPdf", iconProps: { fill: STheme.color.text }, onPress: () => { Linking.openURL(row?.factura?.link_factura); }, },]
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
                        label: "Anular venta", icon: "cancelado", iconProps: { fill: '#db0606ff', stroke: '#db0606ff' }, onPress: () => {
                            SPopup.confirm({
                                icon: "cancelado",
                                title: "Anular venta",
                                message: "¿Está seguro de que desea anular esta venta? Esta acción no se puede deshacer.",
                                cancel: { label: "Cancelar", color: STheme.color.lightGray },
                                onPress: () => {
                                    SNotification.send({ key: "anular_" + row.key, title: "Venta anulada", body: "Se anuló correctamente.", color: STheme.color.success, time: 5000, });

                                    MDL.caja.anular_venta({ key_compra_venta: row.key }).then(resp => {
                                        if (this.DinamicTable) this.DinamicTable.loadData();
                                        SNotification.send({ key: "anular_" + row.key, title: "Venta anulada", body: "Se anuló correctamente.", color: STheme.color.success, time: 5000, });
                                    }).catch(error => {
                                        console.error("Error:", error); SNotification.send({ key: "anular_error_" + row.key, title: "Error al anular", body: "Intente nuevamente.", color: STheme.color.danger, time: 5000, });
                                    });
                                }
                            });
                        }
                    },
                    row?.factura?.cuf ? {
                        label: "Anular factura", icon: "eliminar", iconProps: { fill: "#8007c5", stroke: STheme.color.text }, onPress: () => {
                            SPopup.confirm({
                                icon: <SIconApp name="eliminar" height={24} fill="#db0606ff" />,
                                style: { padding: 10, paddingBottom: 5, paddingTop: 5 },
                                title: "Anular factura " + row?.factura?.nro_factura,
                                message: "¿Está seguro de que desea anular la factura? Esta acción no se puede deshacer.",
                                onPress: async () => {
                                    const updatedVenta = {
                                        ...row,
                                        facturar: false,
                                        factura: {},
                                    };
                                    try {
                                        await Model.compra_venta.Action.editar({
                                            data: updatedVenta,
                                            key_usuario: Model.usuario.Action.getKey(),
                                        });
                                        SNotification.send({ key: "anular_factura_" + row.key, title: "Factura anulada", body: "La factura se anuló correctamente.", color: STheme.color.warning, time: 5000, });
                                        if (this.DinamicTable) this.DinamicTable.loadData();
                                    } catch (error) {
                                        console.error("Error al anular factura:", error);
                                        SNotification.send({ key: "anular_factura_error_" + row.key, title: "Error al anular factura", body: "Intente nuevamente.", color: STheme.color.danger, time: 5000, });
                                    }
                                }
                            });
                        }
                    } : null,
                ].filter(Boolean)
            }
        ].filter(Boolean);
        return (
            <SView col={"xs-12"} backgroundColor={STheme.color.background} style={{ borderRadius: 8, overflow: "hidden", borderWidth: 1, borderColor: "#66666699", }}>
                {groups.map((group, gi) => (
                    <SView key={gi} col={"xs-12"}>
                        <SView col={"xs-12"} style={{ paddingHorizontal: 8, paddingTop: 8, paddingBottom: 1 }} >
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
                loadInitialState={async () => {
                    return { sorters: [{ key: "fecha_on", order: "desc", type: "date" }] }
                }}
            >
                <DinamicTable.Col key="index" label="N°" headerStyle={{ paddingLeft: 8 }} width={30} data={(e) => e.index + 1} />
                <DinamicTable.Col key={"fecha_on"} label="Fecha" headerStyle={{ paddingLeft: 8 }} width={120} dataType="date" data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date} textStyle={{ fontSize: 12, color: STheme.color.text }} dateFormat="yyyy-MM-dd hh:mm" />
                <DinamicTable.Col key="sucursal" label="Sucursal" headerStyle={{ paddingLeft: 8 }} width={180} data={(e) => e.row?.sucursal?.descripcion}
                    customComponent={e => <>
                        {(e.row?.key_sucursal) ?
                            <SView col={"xs-12"} center row>
                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.text + "33" }} border={STheme.color.card} center     >
                                    <SImage src={`${SSocket.api.empresa}sucursal/${e.row?.key_sucursal}`} style={{ resizeMode: "cover" }} />
                                </SView>
                                <SView width={5} />
                                <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{e.row?.sucursal?.descripcion}</SText>
                            </SView> : null}
                    </>}
                />
                <DinamicTable.Col key="admin" label="Vendedor" headerStyle={{ paddingLeft: 8 }} width={120} data={(e) => e.row?.usuario?.Nombres ?? ""}
                    customComponent={e => <>
                        {(e.row?.key_usuario) ?
                            <SView col={"xs-12"} center row>
                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.text + "33" }} border={STheme.color.text} center     >
                                    <SImage src={`${SSocket.api.root}usuario/${e.row?.key_usuario}`} style={{ resizeMode: "cover" }} />
                                </SView>
                                <SView width={5} />
                                <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{e.row?.usuario?.Nombres}</SText>
                            </SView> : null}
                    </>}
                />
                <DinamicTable.Col key="cliente" label="Cliente" headerStyle={{ paddingLeft: 8 }} width={100} data={(e) => e.row?.cliente?.nombres ?? ""}
                    customComponent={e => <>
                        {(e.row?.cliente?.key) ?
                            <SView col={"xs-12"} center row >
                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.text + "33", }} border={STheme.color.text} center     >
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
                            "credito": { color: "#8007c5", label: "Crédito" },
                            "transferencia": { color: "#6b7280", label: "Transferencia" },
                        };
                        const estilo = tipoPagoMap[e.data?.toLowerCase()] || { color: STheme.color.lightGray, label: e.data };
                        return (
                            <>
                                {(e.row?.tipo_pago) ?
                                    <SView col={"xs-12"} center row>
                                        <SView backgroundColor={estilo.color} style={{ borderRadius: 4, padding: 5 }}>
                                            <SText color={STheme.color.text} fontSize={10}>{estilo.label}</SText>
                                        </SView>
                                    </SView> : null}
                            </>
                        );
                    }}
                />
                <DinamicTable.Col key="estado_pago" wrap label="Estado Pago" headerStyle={{ paddingLeft: 8 }} width={80}
                    data={(e) => {
                        if (e.row?.cuotas_en_mora?.monto > 0) {
                            return "En Mora";
                        }
                        if (e.row?.cuotas?.total <= e.row?.monto_amortizado) {
                            return "Pagado";
                        }
                        return "Al Día";
                    }}
                    customComponent={(e) => {
                        const statesTipo = {
                            "Al Día": { color: "#f59e0b", label: "Al Día" },
                            "En Mora": { color: "#dc2626", label: "En Mora" },
                            "Pagado": { color: "#16a34a", label: "Pagado" },
                        }[e.data] || {};
                        return <SView row center>
                            <SView backgroundColor={statesTipo?.color} style={{ borderRadius: 4, padding: 5 }}>
                                <SText color={STheme.color.text} fontSize={10}>{statesTipo?.label}</SText>
                            </SView>
                        </SView>
                    }}
                />
                <DinamicTable.Col key="estado_venta" label="Estado Venta" headerStyle={{ paddingLeft: 8 }} width={120} center data={(e) => e.row?.facturar ? "Facturado" : "No facturada"}
                    customComponent={e => {
                        const facturado = Boolean(e.row?.facturar);
                        return <SView col={"xs-12"} center row>
                            <SView style={{ borderRadius: 4, backgroundColor: facturado ? "#16a34a" : "#6b7280", padding: 5, }}>
                                <SText center style={{ color: STheme.color.text, fontSize: 11, fontWeight: "bold" }}>
                                    {facturado ? "Facturado" : "No facturada"}
                                </SText>
                            </SView>
                        </SView>
                    }}
                />
                <DinamicTable.Col key="factura_seleccionada" label="Tipo Factura" width={100} headerStyle={{ paddingLeft: 8 }} data={(e) => e.row?.factura?.factura_seleccionada ?? ""}
                    customComponent={e => <>
                        {(e.row?.factura?.nro_factura) ?
                            <SView col={"xs-12"} center row>
                                <SView width={5} />
                                <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{e.data}</SText>
                            </SView> : null}
                    </>}
                />
                <DinamicTable.Col key="nrofactura" label="Nro. Factura" width={100} headerStyle={{ paddingLeft: 8 }} data={(e) => e.row?.factura?.nro_factura}
                    customComponent={e => <>
                        {(e.row?.factura?.nro_factura) ?
                            <SView col={"xs-12"} center row>
                                <SView width={5} />
                                <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{e.data}</SText>
                            </SView> : null}
                    </>}
                />
                <DinamicTable.Col key="nit" label="NIT / CI" width={100} headerStyle={{ paddingLeft: 8 }} data={(e) => e.row?.factura?.nit ?? ""} />
                <DinamicTable.Col key="razon_social" label="Razón social" width={100} headerStyle={{ paddingLeft: 8 }} data={(e) => e.row?.factura?.razon_social ?? ""} />
                <DinamicTable.Col key="cuf" label="CUF" headerStyle={{ paddingLeft: 8 }} width={100} data={(e) => e.row?.factura?.cuf ?? ""}
                    customComponent={e => <>
                        {(e.row?.facturar) ?
                            <SView col={"xs-12"} center row>
                                <SView width={5} />
                                <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{e.data}</SText>
                            </SView> : null}
                    </>}
                />
                <DinamicTable.Col key="leyenda" label="Leyenda" width={100} headerStyle={{ paddingLeft: 8 }} data={(e) => e.row?.factura?.leyenda ?? ""} />
                <DinamicTable.Col key="detalles_" label="Detalle" width={220} headerStyle={{ paddingLeft: 8 }} data={(e) => (e.row?.detalles ?? []).map(d => d.descripcion)} customComponent={(e) => (<SView col> {(e.row?.detalles ?? []).map((d, index) => (<SText key={index} fontSize={11}>• {d.descripcion} {d.precio_unitario_base} {e.row.moneda.observacion} x{d.cantidad}</SText>))} </SView>)} />
                {/* <DinamicTable.Col key="descripcion" label="Descripción" width={210} data={(e) => e.row?.descripcion ?? ""} /> */}
                <DinamicTable.Col key="cuotas_total" label="Total" headerStyle={{ paddingLeft: 8 }} wrap bold width={80}
                    data={(e) => (e.row?.cuotas.total ? e.row.cuotas.total : "0")}
                    cellStyle={{ alignItems: "flex-end" }}
                    format={(e) => e.row?.moneda?.observacion + " " + SMath.formatMoney(e.data)}
                />
                {/* <DinamicTable.Col key="facturar" wrap label="Venta contabilizar aaaaaaaaaaalavaro" width={90} center data={(e) => e.row?.facturar}
                    customComponent={e => <>
                        {(e.row?.facturar) ?
                            <SView col={"xs-12"} center row>
                                <SView width={50} center row backgroundColor={"#295ff5ff"} style={{ borderRadius: 4, padding: 5 }}
                                    onPress={async function () {
                                        if (this.__pressed === undefined) {
                                            this.__pressed = false;
                                        }
                                        if (e.row?.factura?.numero) {
                                            SNotification.send({
                                                key: "fact",
                                                title: "Acción no permitida",
                                                body: "Existe una factura asociada. Anule primero.",
                                                color: STheme.color.warning,
                                                time: 5000,
                                            });
                                            return;
                                        }
                                        if (!this.__pressed) {
                                            const resp = await MDL.compra_venta._contabilizar(e.row?.key);
                                            SNotification.send({ key: "fact", title: "Acción " + resp, body: "Existe una factura asociada. Anule primero.", color: STheme.color.success, time: 5000, });
                                            this.__pressed = true;
                                        } else {
                                            const resp = await MDL.compra_venta._desContabilizar(e.row?.key);
                                            SNotification.send({ key: "fact", title: "Acción " + resp, body: "Existe una factura asociada. Anule primero.", color: STheme.color.success, time: 5000, });
                                            this.__pressed = false;
                                        }
                                    }}
                                >
                                    <SText flex style={e.textStyle}>switch</SText>
                                </SView>
                            </SView> : null}
                    </>}
                /> */}

                <DinamicTable.Col key="cuotas_cantidad" label="# Cuotas" headerStyle={{ paddingLeft: 8 }} width={60} cellStyle={{
                    alignItems: "center"
                }} data={(e) => e.row?.cuotas.cantidad ?? ""} />
                <DinamicTable.Col wrap key="cuotas_cantidad_mora" label="# Cuotas en Mora" width={60} cellStyle={{
                    alignItems: "center",
                    backgroundColor: STheme.color.danger + "33"
                }}
                    data={(e) => e.row?.cuotas_en_mora.cantidad ?? ""}
                />
                <DinamicTable.Col key="moneda" label="Moneda" wrap width={60} headerStyle={{ paddingLeft: 8 }}
                    data={(e) => e.row?.moneda?.descripcion ?? ""}
                />
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

    render() {
        return (
            <SPage title="Tabla Gestión de Ventas" disableScroll>
                <SView row col={"xs-12"} style={{ paddingBottom: 8, paddingLeft: 8, borderBottomWidth: 1, borderColor: STheme.color.lightGray + "30", }}><SView col={"xs-12 sm-8.2 lg-3.3"} row center>
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