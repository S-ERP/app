import React, { Component } from 'react';
import { SView, SPage, SHr, STheme, SDate, SText, SImage, SPopup, SMath, SNotification } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import SSocket from 'servisofts-socket';
import MDL from '../../MDL';
import Config from '../../Config';
import DateTimeBetween from '../../Components/DateTimeBetween';
import SIconApp from '../../Assets/SIconApp';
import FloatMenu from '../../Components/FloatMenu';
import PopupSeeVoucher from '../caja2/components/PopupSeeVoucher';
import PopupUploadVoucher from '../caja2/components/PopupUploadVoucher';
import { Linking, ScrollView } from 'react-native';

export default class misReporteMoviminetos extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fecha_inicio: new SDate('2024-01-01', 'yyyy-MM-dd hh:mm').toString("yyyy-MM-dd"),
            fecha_fin: new SDate().toString("yyyy-MM-dd"),
            data: [], // Estado para almacenar los datos de la tabla
        };
    }

    componentDidMount() {
        this.loadInitialData().then(data => {
            this.setState({ data });
        });
    }

    colorTipoOperacion(estado) {
        switch (estado?.toUpperCase()) {
            case "APERTURA":
                return "#4dbe52ff";
            case "VENTA":
                return "#3683dbff";
            case "COMPRA":
                return "#e0883fff";
            default:
                return "#979797ff";
        }
    }

    estaAnulado(row, dataset) {
        const key_compra_venta = row?.key_compra_venta;
        if (!key_compra_venta) return false;
        return (dataset || []).some(d =>
            d.key_compra_venta === key_compra_venta &&
            ["anulacion_venta", "anulacion_compra"].includes((d.tipo || "").toLowerCase())
        );
    }

    getTurno(caja_fecha_on, caja_fecha_cierre) {
        const parseMinutes = (value) => {
            if (!value) return null;
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return null;
            return date.getHours() * 60 + date.getMinutes();
        };

        const getPeriodo = (minutes) => {
            if (minutes === null) return null;
            if (minutes >= 360 && minutes <= 720) return "Mañana";
            if (minutes >= 721 && minutes <= 1080) return "Tarde";
            if (minutes >= 1081 && minutes <= 1320) return "Noche";
            return null;
        };

        const inicio = getPeriodo(parseMinutes(caja_fecha_on));
        const cierre = getPeriodo(parseMinutes(caja_fecha_cierre));
        if (!inicio && !cierre) return "";
        if (inicio && cierre) {
            return inicio === cierre ? inicio : `${inicio} - ${cierre}`;
        }
        return inicio || cierre || "";
    }

    iconotipoArchivo(documento_name = "", documento_type = "") {
        if (!documento_type) return null;

        const tipo = documento_type.toLowerCase().trim();

        const extension = (() => {
            const parts = tipo.split(/[/\.]/);
            return parts[parts.length - 1] || "";
        })();

        let bgColor = "#B0B0B0";
        let borderColor = "#3c3d3dff";
        let icon = "crmpdarchivo";
        let iconColor = "#3c3d3dff";

        const tipoMapeo = {
            pdf: { bg: "#fdc4c4ff", border: "#D32F2F", icon: "crmpdf", color: "#D32F2F" },
            document: { bg: "#b2dfffff", border: "#1976D2", icon: "crmword", color: "#1976D2" },
            sheet: { bg: "#affab5ff", border: "#388E3C", icon: "crmexcel", color: "#388E3C" },
            presentation: { bg: "#FFF3E0", border: "#F57C00", icon: "crmpresentacion", color: "#F57C00" },
            png: { bg: "#e895f5ff", border: "#8E24AA", icon: "Galeria", color: "#8E24AA" },
            jpg: { bg: "#F3E5F5", border: "#8E24AA", icon: "Galeria", color: "#8E24AA" },
            jpeg: { bg: "#F3E5F5", border: "#8E24AA", icon: "Galeria", color: "#8E24AA" },
            "x-icon": { bg: "#ECEFF1", border: "#607D8B", icon: "crmpdarchivo", color: "#607D8B" },
            txt: { bg: "#F1F8E9", border: "#689F38", icon: "crmtxt", color: "#689F38" },
            csv: { bg: "#FFFDE7", border: "#FBC02D", icon: "crmexcel", color: "#FBC02D" },
            zip: { bg: "#E0F7FA", border: "#0097A7", icon: "crmzip", color: "#0097A7" },
            rar: { bg: "#E0F7FA", border: "#0097A7", icon: "crmzip", color: "#0097A7" },
            mp4: { bg: "#FBE9E7", border: "#D84315", icon: "crmpvideo", color: "#D84315" },
            mp3: { bg: "#E8EAF6", border: "#3F51B5", icon: "crmpaudio", color: "#3F51B5" }
        };

        const config = tipoMapeo[extension];
        if (config) {
            bgColor = config.bg;
            borderColor = config.border;
            icon = config.icon;
            iconColor = config.color;
        }

        const extensionAlias = {
            "document": "docx",
            "sheet": "xlsx",
            "presentation": "pptx"
        };
        const displayExt = extensionAlias[extension] || extension;

        return (
            <SView row center style={{ padding: 4, backgroundColor: bgColor, borderRadius: 6, marginRight: 4, marginBottom: 4, borderWidth: 1, borderColor: borderColor }} >
                <SIconApp name={icon} fill={iconColor} width={12} height={12} style={{ marginRight: 3 }} />
                <SText fontSize={10} color={iconColor} bold>Voucher.{displayExt}</SText>
                <SIconApp name={"downImgNube"} fill={iconColor} width={12} height={12} style={{ marginLeft: 3 }} />
            </SView>
        );
    }
    async loadInitialData() {
        try {

            const empresaKey = MDL.empresa.select?.key;
            if (!empresaKey) throw new Error("Empresa no seleccionada.");
            const { fecha_inicio, fecha_fin } = this.state;
            const movimientos = await MDL.caja.getAllMovimientosCajasByEmpresa(empresaKey, fecha_inicio, fecha_fin);
            if (!Array.isArray(movimientos)) {
                console.error("getAllMovimientosCajasByEmpresa no devolvió un array:", movimientos);
                return [];
            }
            const empresa = await MDL.empresa.getFull();
            const base = empresa.monedas.find(a => a.tipo == "base");
            const sucursales = empresa?.sucursales ?? [];
            const puntos_ventas = sucursales.flatMap(s => s.puntos_venta || []);
            const key_usuario_session = MDL.usuario.session?.key;
            const movimientosPropios = movimientos.filter(mov => mov.key_usuario === key_usuario_session);
            const usuarioKeys = [...new Set(movimientosPropios.flatMap(m => [m.key_usuario, m.key_cajero]).filter(Boolean))];
            const usuarios = (await MDL.usuario.getByKeys(usuarioKeys)) ?? [];
            const usuarioMap = Object.fromEntries(usuarios.map(u => [u.key, u]));
            const processedData = movimientosPropios.map(mov => ({
                ...mov,
                usuario: usuarioMap[mov.key_usuario] ?? null,
                cajero: usuarioMap[mov.key_cajero] ?? null,
                puntos_venta: puntos_ventas.find(pv => pv.key === mov.key_punto_venta) ?? null,
                sucursal: sucursales.find(s => s.key === mov.key_sucursal) ?? null,
                moneda: empresa.monedas.find(m => m.key === mov.key_moneda) ?? null,
                moneda_base: base,
                turno: this.getTurno(mov.caja_fecha_on, mov.caja_fecha_cierre),
            }));
            return processedData;
        } catch (error) {
            console.error("Error al cargar movimientos de caja:", error);
            return [];
        }
    }

    renderTabla() {
        return (
            <DinamicTable
                ref={ref => (this.DinamicTable = ref)}
                loadData={() => this.loadInitialData()}
                data={this.state.data}
                key="id"
                keyExtractor={e => e.key}
                language="es"

                center
                selectType="single"
                {...Config.table.applyTheme({ cellStyle: { minHeight: 22 } })}

                onSelect={(e) => {
                    if (!e.row) {

                        return;
                    }

                    const tipoLower = (e.row?.tipo || "").toLowerCase();
                    const esVenta = tipoLower === "venta";
                    const esCompra = tipoLower === "compra";
                    const esAnulacion = tipoLower === "anulacion_venta" || tipoLower === "anulacion_compra";
                    const dataset = this.DinamicTable?.data || this.state.data || [];
                    const yaAnulada = this.estaAnulado(e.row, dataset);
                    const puedeAnular = !esAnulacion && !yaAnulada && (
                        esVenta ? MDL.rolesPermisos.getPermiso({ url: "/empresa/punto_venta", permiso: "anular_venta" })
                            : esCompra ? MDL.rolesPermisos.getPermiso({ url: "/compra", permiso: "anular_compra" })
                                : false
                    );

                    const vouchersDelRow = Array.isArray(e.row?.vouchers) ? e.row.vouchers : [];

                    const menuOptions = [

                        ...(vouchersDelRow.length > 0 ? [{
                            label: 'Ver Vouchers',
                            icon: <SIconApp name="Arrow" fill="#e4e4e4ff" width={16} />,
                            onPress: () => {
                                PopupSeeVoucher.open(e.row?.key_empresa, e.row?.key, vouchersDelRow);
                            },
                        }] : []),
                        {
                            label: 'Subir Voucher',
                            icon: <SIconApp name="upImgNube" fill="#e4e4e4ff" width={16} />,
                            onPress: () => {
                                PopupUploadVoucher.open(e.row?.key_empresa, e.row?.key, e.row?.vouchers ?? [], () => {
                                    this.loadInitialData().then(data => {
                                        this.setState({ data });
                                        if (this.DinamicTable) this.DinamicTable.loadData();
                                    });
                                });
                            },
                        },
                        ...(puedeAnular ? [{
                            label: esVenta ? 'Anular venta' : 'Anular compra',
                            icon: <SIconApp name="cancelado" fill="#db0606ff" width={16} />,
                            onPress: () => {
                                SPopup.confirm({
                                    title: esVenta ? "Anular venta" : "Anular compra",
                                    message: `¿Está seguro de que desea anular esta ${esVenta ? "venta" : "compra"}? Esta acción no se puede deshacer.`,
                                    onPress: () => {
                                        const notificationKey = `anular_${e.row?.key_compra_venta}`;
                                        SNotification.send({ key: notificationKey, title: esVenta ? "Anulando venta..." : "Anulando compra...", type: "loading" });
                                        const promesa = esVenta
                                            ? MDL.caja.anular_venta({ key_compra_venta: e.row?.key_compra_venta })
                                            : MDL.caja.anular_compra({ key_compra_venta: e.row?.key_compra_venta });
                                        promesa
                                            .then(() => {
                                                SNotification.send({ key: notificationKey, title: esVenta ? "Venta anulada" : "Compra anulada", body: `La ${esVenta ? "venta" : "compra"} se anuló correctamente.`, color: STheme.color.success });
                                                this.loadInitialData().then(data => {
                                                    this.setState({ data });
                                                    if (this.DinamicTable) this.DinamicTable.loadData();
                                                });
                                            })
                                            .catch((error) => {
                                                console.error("Error al anular venta/compra:", error);
                                                SNotification.send({ key: notificationKey, title: "Error al anular", body: error?.error || error?.message || String(error), color: STheme.color.danger });
                                            });
                                    }
                                });
                            },
                        }] : []),
                    ];
                    FloatMenu.open({
                        e: e.evt,
                        label: 'Opciones',
                        options: menuOptions,
                    });
                }}

                buildRowStyle={({ item, dinamicTable }) => {
                    const anulado = this.estaAnulado(item, dinamicTable?.data);
                    return anulado ? { opacity: 0.45 } : {};
                }}

                loadInitialState={async () => ({
                    sorters: [{ key: "fecha_movimiento", order: "desc", type: "date" }],
                })}

                listFooterComponent={() => {
                    return <SHr height={100} />

                }}

            >
                <DinamicTable.Col key="index" label="N°" width={30} data={e => e.index + 1} />

                <DinamicTable.Col
                    key="sucursal_"
                    label="SUCURSAL"
                    width={100}
                    data={e => e.row?.sucursal?.descripcion ?? "Sin sucursal"}
                    customComponent={e => {
                        const key = e.row?.key_sucursal;
                        const descripcion = e.row?.sucursal?.descripcion ?? "Sin sucursal";
                        return key ? (
                            <SView col="xs-12" row center  >
                                <SView width={28}   >
                                    <SView style={{ width: 20, height: 20, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                        <SImage src={SSocket.api.empresa + "empresa/" + e.row?.key_empresa} />
                                    </SView>
                                    <SView style={{ width: 20, position: "absolute", left: 5 }}>
                                        <SView style={{ width: 20, height: 20, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                            <SImage src={`${SSocket.api.empresa}sucursal/${key}`} style={{ resizeMode: "cover" }} />
                                        </SView>
                                    </SView>
                                </SView>
                                <SText flex numberOfLines={1} style={e.textStyle}> {descripcion} </SText>
                            </SView>
                        ) : (
                            <SText>Sin sucursal</SText>
                        );
                    }}
                />

                <DinamicTable.Col
                    key="punto"
                    label="P.VENTA"
                    width={60}
                    color={STheme}
                    data={e => e.row?.puntos_venta?.descripcion ? "PV-" + e.row?.puntos_venta?.descripcion : "Sin punto de venta"}
                />

                <DinamicTable.Col
                    key="admin"
                    label="CAJERO"
                    width={120}
                    data={e => e.row?.cajero?.Nombres ?? "Sin cajero"}
                    customComponent={e => {
                        const key = e.row?.key_cajero;
                        const nombre = e.row?.cajero?.Nombres ?? "Sin cajero";

                        return key ? (
                            <SView col="xs-12" row center>
                                <SView
                                    width={20}
                                    height={20}
                                    style={{
                                        borderRadius: 100,
                                        overflow: "hidden",
                                        backgroundColor: STheme.color.card + "66",
                                        marginRight: 6,
                                    }}
                                >
                                    <SImage
                                        src={`${SSocket.api.root}usuario/${key}`}
                                        style={{ resizeMode: "cover", width: "100%", height: "100%" }}
                                    />
                                </SView>
                                <SText flex numberOfLines={1} style={e.textStyle}>
                                    {nombre}
                                </SText>
                            </SView>
                        ) : (
                            <SText>Sin cajero</SText>
                        );
                    }}
                />

                <DinamicTable.Col
                    key="turno"
                    wrap
                    label="TURNO"
                    width={110}
                    data={e => e.row?.turno ?? ""}
                    customComponent={e => (
                        <SView col="xs-12" center>
                            <SView style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: STheme.color.card }}>
                                <SText fontSize={11} color={STheme.color.text}>{e.data}</SText>
                            </SView>
                        </SView>
                    )}
                />

                <DinamicTable.Col
                    key="tipo"
                    wrap
                    label="TIPO DE OPERACIÓN"
                    width={90}
                    data={e => e.row?.tipo ?? 0}
                    customComponent={e => {
                        return (
                            <SView col={"xs-12"} center height={20}   >
                                <SView col={"xs-12"} row center height={20}   >
                                    <SView center style={{
                                        ...e.textStyle,
                                        backgroundColor: this.colorTipoOperacion(e.data) || STheme.color.card,
                                        borderWidth: 1, borderColor: this.colorTipoOperacion(e.data) || STheme.color.card,
                                        borderRadius: 4,
                                        paddingHorizontal: 8
                                    }}> <SText fontSize={10} style={{ textTransform: "capitalize" }} >{e.data}</SText>
                                    </SView>
                                </SView>
                            </SView>
                        );
                    }}
                />

                <DinamicTable.Col
                    key="key_tipo_pagov2"
                    wrap label="TIPO DE PAGO"
                    width={110} data={e => e.row?.tag_tipo_pago ?? ""}
                    customComponent={e => {
                        return (
                            <SView col={"xs-12"} row center>
                                <SView width={4} />
                                <SIconApp name={e.row?.icon || "Ajustes"} width={14} />
                                <SView width={4} />
                                <SView flex style={{ ...e.textStyle, paddingHorizontal: 2, paddingVertical: 3, borderRadius: 4 }} >
                                    <SText fontSize={12}>{e.data}</SText>
                                </SView>
                            </SView>
                        );
                    }}
                />
                <DinamicTable.Col
                    key="monto_total"
                    wrap label="MONTO"
                    width={90}
                    color={STheme.color.danger}
                    data={e => {
                        const monto = e.row?.monto ?? 0;
                        return SMath.formatMoney(monto, 2);
                    }}
                    cellStyle={{ alignItems: "flex-end", backgroundColor: "#a8b1bb73", color: "blue" }}
                    customComponent={e => {
                        return (
                            <SView col={"xs-12"} style={{ alignItems: "flex-end" }} >
                                <SText fontSize={12} color={e.row?.monto > 0 ? STheme.color.text : STheme.color.danger} >{e.row?.moneda?.observacion} {e.data}</SText>
                            </SView>
                        );
                    }}
                />

                <DinamicTable.Col
                    key="descripcion"
                    wrap
                    label="DESCRIPCIÓN"
                    width={180}
                    data={e => e.row?.descripcion ?? 0}
                />

                <DinamicTable.Col
                    key="fecha_movimiento"
                    label="FECHA TRANSACCIÓN"
                    width={140}
                    center
                    dataType="date"
                    data={e => (e.row?.fecha_on ? new SDate(e.row.fecha_on, "yyyy-MM-ddThh:mm:ss").date : null)}
                    textStyle={{ fontSize: 12, color: STheme.color.text }}
                    dateFormat="yyyy-MM-dd hh:mm:ss"
                />

                <DinamicTable.Col
                    key="codigo_comprobante"
                    wrap
                    label="CÓDIGO COMPROBANTE"
                    width={100}
                    data={e => e.row?.codigo_comprobante ?? 0}
                    customComponent={e => {
                        if (!e.row?.codigo_comprobante) return null;
                        return (
                            <SView col={"xs-12"} center height={20}   >
                                <SView col={"xs-12"} row center height={20}   >
                                    <SView center style={{
                                        ...e.textStyle,
                                        borderWidth: 1, borderColor: STheme.color.link,
                                        borderRadius: 4,
                                        padding: 4,
                                    }}

                                    > <SText color={STheme.color.link} fontSize={10}> {e.row?.codigo_comprobante} </SText>
                                    </SView>
                                </SView>
                            </SView>
                        );
                    }}
                />

                <DinamicTable.Col
                    key="empresa_tipo_pago"
                    wrap
                    label="DETALLE"
                    width={220}
                    data={e => e.row?.empresa_tipo_pago ?? 0}
                />

                <DinamicTable.Col
                    key="tag_transaccion_"
                    label="TAG"
                    width={90}
                    wrap
                    center
                    data={e => e.row?.tag_movimiento ?? 0}
                    customComponent={e => {
                        return (
                            <SView col="xs-12" row  >
                                <SIconApp name={e.data} width={12} height={12} />
                                <SView width={4} />
                                <SText fontSize={12} color={STheme.color.text}> {e.data} </SText>
                            </SView>
                        );
                    }}
                />

                <DinamicTable.Col
                    key="moneda_info"
                    wrap label="MONEDA"
                    width={90}
                    color={STheme.color.danger}
                    data={e => e.row?.moneda?.descripcion ?? 0}
                />

                {/* <DinamicTable.Col
                    key="tipo_cambio"
                    wrap
                    center
                    label="TIPO CAMBIO"
                    width={50}
                    cellStyle={{ alignItems: "flex-end", backgroundColor: "#a8b1bb73" }}
                    data={e => e.row?.moneda.tipo_cambio ?? 0}
                /> */}

                <DinamicTable.Col
                    key="monto_base"
                    wrap label="MONTO BASE"
                    width={90}
                    data={e => {
                        const monto = e.row?.monto ?? 0;
                        const tipoCambio = e.row?.moneda?.tipo_cambio ?? 1;
                        return SMath.formatMoney((monto * tipoCambio), 2);
                    }}
                    cellStyle={{ alignItems: "flex-end", backgroundColor: "#a8b1bb73" }}
                    customComponent={e => {
                        return (
                            <SView col={"xs-12"} style={{ alignItems: "flex-end" }} >
                                <SText fontSize={12} color={e.row?.monto > 0 ? STheme.color.text : STheme.color.danger} >{e.row?.moneda_base?.observacion} {e.data}</SText>
                            </SView>
                        );
                    }}
                />
                <DinamicTable.Col key="vouchers" wrap center label="VOUCHERS TOTALES" width={80} data={e => e.row?.vouchers?.length ?? 0} customComponent={e => {
                    if (!e.data) return null; return (<SView col={"xs-12"} row center onPress={() =>
                        PopupSeeVoucher.open(e.row?.key_empresa, e.row?.key, e.row?.vouchers)} > <SText fontSize={12} color={STheme.color.text} >({e.data}) </SText> <SIconApp name='iconLista' width={8} /> </SView>);
                }} />

                <DinamicTable.Col key="voucherdsds" center label="DOCUMENTOS" width={160}
                    data={(e) => (e.row.vouchers ?? []).map(p => p)}
                    customComponent={(e) => {
                        const vouchers = e.row.vouchers ?? [];
                        if (vouchers.length === 0) return null;
                        return (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: "row", alignItems: "center" }}>
                                {vouchers.map((p, index) => (
                                    <SView key={index} row center style={{ marginRight: 8 }}>
                                        <SView
                                            onPress={() => {
                                                const url = `${SSocket.api.root}empresa/${e.row.key_empresa}/voucher/${e.row.key}/${p.name}?time=${new SDate().toString("yyyy-MM-ddThh:mm")}`;
                                                Linking.openURL(url);
                                            }}
                                        >
                                            {this.iconotipoArchivo(p.name, p.type)}
                                        </SView>
                                        <SView
                                            center
                                            style={{
                                                position: "absolute", top: 0, right: -1,
                                                width: 12, height: 12, borderRadius: 6,
                                                backgroundColor: "#dc3545", 
                                    
                                            }}
                                            onPress={() => {
                                                SPopup.confirm({
                                                    title: "Eliminar comprobante",
                                                    message: `¿Está seguro de que desea eliminar "${p.name}"? Esta acción no se puede deshacer.`,
                                                    onPress: () => {
                                                        const vouchersRestantes = vouchers.filter((_, i) => i !== index);
                                                        const notificationKey = `eliminar_voucher_${e.row.key}_${index}`;
                                                        SNotification.send({ key: notificationKey, title: "Eliminando comprobante...", type: "loading" });
                                                        MDL.caja.editar_detalle({
                                                            key_empresa: e.row.key_empresa,
                                                            key: e.row.key,
                                                            vouchers: vouchersRestantes,
                                                        }).then(() => {
                                                            SNotification.send({ key: notificationKey, title: "Comprobante eliminado", color: STheme.color.success, time: 2000 });
                                                            this.loadInitialData().then(data => {
                                                                this.setState({ data });
                                                                if (this.DinamicTable) this.DinamicTable.loadData();
                                                            });
                                                        }).catch((error) => {
                                                            console.error("Error al eliminar comprobante:", error);
                                                            SNotification.send({ key: notificationKey, title: "Error al eliminar", body: error?.error || error?.message || String(error), color: STheme.color.danger });
                                                        });
                                                    }
                                                });
                                            }}
                                        >
                                            <SText color="#fff" fontSize={9} bold>✕</SText>
                                        </SView>
                                    </SView>
                                ))}
                            </ScrollView>
                        );
                    }}
                />

                <DinamicTable.Col
                    key="estado_caja"
                    label="ESTADO CAJA"
                    width={100}
                    data={e => e.row?.estado_caja ?? "Desconocido"}
                    customComponent={e => {
                        const estado = e.row?.estado_caja ?? "Desconocido";
                        const isCerrada = estado === "Cerrada";
                        const color = isCerrada ? "#ef4444" : "#22c55e";
                        const bgColor = isCerrada ? "#503131ff" : "#2a533cff";

                        return (
                            <SView col={"xs-12"} center>
                                <SView padding={4} row center style={{ backgroundColor: bgColor, borderColor: color, borderWidth: 1, borderRadius: 20, }} >
                                    <SView center width={6} height={6} style={{ backgroundColor: color, borderRadius: 8, marginRight: 2, }} />
                                    <SText style={{ textTransform: "uppercase", fontSize: 11, color: color, }} > {estado} </SText>
                                </SView>
                            </SView>
                        );
                    }}
                />

            </DinamicTable >
        );
    }

    render() {
        return (
            <SPage title="Mi Historial de Transacciones" disableScroll>
                <SHr height={8} />
                <SView width={260} center>
                    <DateTimeBetween
                        fecha_inicio={this.state.fecha_inicio}
                        fecha_fin={this.state.fecha_fin}
                        onChange={({ fecha_inicio, fecha_fin }) => {
                            this.setState({ fecha_inicio, fecha_fin }, () => {
                                this.loadInitialData().then(data => {
                                    this.setState({ data });
                                    if (this.DinamicTable) {
                                        this.DinamicTable.loadData();
                                    }
                                });
                            });
                        }}
                    />
                </SView>
                <SHr height={8} />

                {this.state.data.length === 0 ? (
                    <SView col="xs-12" center>
                        <SText>No hay datos disponibles</SText>
                    </SView>
                ) : (
                    this.renderTabla()
                )}
                <SHr h={16} />
            </SPage>
        );
    }
}
