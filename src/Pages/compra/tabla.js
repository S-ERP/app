import React, { Component } from 'react';
import { SPage, SPopup, SView, SText, STheme, SHr, SImage, SNavigation, SDate, SMath, SIcon, SNotification } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import SSocket from 'servisofts-socket';
import SIconApp from '../../Assets/SIconApp';
import Config from '../../Config';
import Model from '../../Model';
import MDL from '../../MDL';
import FloatMenu from '../../Components/FloatMenu';
import ComprobanteRollo from '../../Components/PDF/compra/ComprobanteRollo';
import ComprobanteCarta from '../../Components/PDF/compra/ComprobanteCarta';
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
                    FloatMenu.open({
                        e: e.evt,
                        label: "Tabla de compras",
                        options: [
                            {
                                label: "Ver compra",
                                icon: <SIconApp name='addTarea' fill="#e4e4e4ff" />,
                                onPress: () => { SNavigation.navigate("/venta/profile2", { pk: e?.row?.key }); }
                            },
                            {
                                label: "Anular compra",
                                icon: <SIconApp name='Delete' fill="#e4e4e4ff" />,
                                onPress: () => {
                                    SPopup.confirm({
                                        title: "¿Anular compra?",
                                        message: "¿Estás seguro de que deseas anular esta compra? Esta acción no se puede deshacer.",
                                        onPress: () => {
                                            SSocket.sendPromise({
                                                service: "caja",
                                                component: "caja_detalle",
                                                type: "anularCompra",
                                                key_empresa: MDL.empresa.select?.key,
                                                key_usuario: MDL.usuario.session?.key,
                                                key_compra_venta: e.row?.key,
                                                key_caja: MDL.caja.activa?.key,
                                            }).then(() => {
                                                this.DinamicTable.loadData();
                                                SNotification.send({ key: "anular_", title: "Compra anulada", body: "La compra se anuló correctamente.", color: STheme.color.success, time: 5000 });
                                            }).catch(e => {
                                                SNotification.send({ key: "anular_error_", title: "Error al anular", body: e.error, color: STheme.color.danger, time: 10000 });
                                            });
                                        }
                                    });
                                }
                            },
                            {
                                label: "Imprimir tamaño rollo",
                                icon: <SIcon name='imprimir' fill={STheme.color.text} />,
                                onPress: () => { ComprobanteRollo.imprimir(e.row?.key); }
                            },
                            {
                                label: "Imprimir tamaño carta",
                                icon: <SIcon name='imprimir' fill={STheme.color.text} />,
                                onPress: () => { ComprobanteCarta.imprimir(e?.row?.key); }
                            },
                        ]
                    });
                }}
                loadInitialState={async () => {
                    return { sorters: [{ key: "fecha_on", order: "desc", type: "date" }] };
                }}
            >
                <DinamicTable.Col key="index" label="N°" headerStyle={{ paddingLeft: 4 }} width={40} height={60} data={(e) => e.index + 1} />
                <DinamicTable.Col key="tipo_producto_" label="Tipos" headerStyle={{ paddingLeft: 4 }} width={90} height={60}
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
                <DinamicTable.Col key="detalles_" label="Detalle" width={210} height={60} headerStyle={{ paddingLeft: 8 }}
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
