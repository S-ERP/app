import React, { Component } from 'react';
import { SView, SPage, SHr, SScrollView2, STheme, SDate, SText, SImage, SPopup, SMath } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import SSocket from 'servisofts-socket';
import MDL from '../../MDL';
import Config from '../../Config';
import DateTimeBetween from '../../Components/DateTimeBetween';

export default class historyTabla extends Component {
    constructor(props) {
        super(props);
        // Debe coincidir con el default de DateTimeBetween (modo "mes"), ya que ese componente
        // dispara su propio onChange al montarse con ese rango. Si no coinciden, la carga inicial
        // de DinamicTable (con este estado) queda desincronizada del período que termina mostrando la UI.
        const hoy = new Date();
        const pad = n => String(n).padStart(2, '0');
        const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        this.state = {
            fecha_inicio: fmt(new Date(hoy.getFullYear(), hoy.getMonth(), 1)),
            fecha_fin: fmt(new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)),
            data: [], // Estado para almacenar los datos de la tabla
        };
        // DateTimeBetween llama a onChange también en su propio montaje (con su rango por
        // defecto), justo cuando DinamicTable ya está cargando sola. Esta bandera evita que
        // ese primer llamado dispare una segunda carga redundante.
        this._periodoListo = false;
    }

    async loadInitialData() {
        try {
            console.log("📦 Cargando movimientos de caja...");
            const empresaKey = MDL.empresa.select?.key;
            if (!empresaKey) throw new Error("Empresa no seleccionada.");
            const { fecha_inicio, fecha_fin } = this.state;
            const fechaInicioRef = fecha_inicio ?? new SDate().addMonth(-1).setDay(1).toString('yyyy-MM-dd');
            const fechaFinRef = fecha_fin ?? new SDate().toString('yyyy-MM-dd');
            const movimientos = await MDL.caja.getAllCajasByEmpresa(empresaKey, fechaInicioRef, fechaFinRef);
            if (!Array.isArray(movimientos)) {
                console.warn("No se recibieron movimientos válidos.");
                return [];
            }
            console.log("Movimientos recibidos:", JSON.stringify(movimientos));
            const empresa = await MDL.empresa.getFull();
            const sucursales = empresa?.sucursales ?? [];
            const puntos_ventas = sucursales.flatMap(s => s.puntos_venta || []);
            const usuarioKeys = [...new Set(movimientos.map(m => m.key_usuario).filter(Boolean))];
            const usuarios = (await MDL.usuario.getByKeys(usuarioKeys)) ?? [];
            const usuarioMap = Object.fromEntries(usuarios.map(u => [u.key, u]));
            const processedData = movimientos.map(mov => ({
                ...mov,
                usuario: usuarioMap[mov.key_usuario] ?? null,
                puntos_venta: puntos_ventas.find(pv => pv.key === mov.key_punto_venta) ?? null,
                sucursal: sucursales.find(s => s.key === mov.key_sucursal) ?? null,
            }));
            console.log("Datos procesados para la tabla:", JSON.stringify(processedData));
            return processedData;
        } catch (error) {
            console.error("❌ Error al cargar movimientos:", error);
            SPopup.alert("Error al cargar los movimientos. Intenta nuevamente.");
            return [];
        }
    }

    renderTabla() {
        return (
            <DinamicTable
                ref={ref => (this.DinamicTable = ref)}
                loadData={() => this.loadInitialData().then(data => {
                    this.setState({ data }); // mantiene state.data en sync como efecto del único fetch
                    return data;
                })}
                key="id"
                keyExtractor={e => e.key}
                language="es"
                center
                selectType="single"
                loadInitialState={async () => ({
                    sorters: [{ key: "fecha_on", order: "asc", type: "date" }],
                })}
                {...Config.table.applyTheme()}
                renderLoading={() => (
                    <SView col={"xs-12"} center padding={24}>
                        <SText fontSize={13} color={STheme.color.text + "99"}>Cargando cajas...</SText>
                    </SView>
                )}
                renderNoResults={() => (
                    <SView col={"xs-12"} center padding={24}>
                        <SText fontSize={13} color={STheme.color.text + "99"}>No se encontraron cajas en el rango seleccionado.</SText>
                    </SView>
                )}
                renderError={({ error }) => (
                    <SView col={"xs-12"} padding={16}>
                        <SText fontSize={13} color={STheme.color.danger}>Error: {error?.message || String(error)}</SText>
                    </SView>
                )}
            >
                <DinamicTable.Col key="index" label="N°" width={30} data={e => e.index + 1} />

                <DinamicTable.Col
                    key="sucursal"
                    label="SUCURSAL"
                    width={120}
                    data={e => e.row?.sucursal?.descripcion ?? "Sin sucursal"}
                    customComponent={e => {
                        const key = e.row?.key_sucursal;
                        const descripcion = e.row?.sucursal?.descripcion ?? "Sin sucursal";
                        return key ? (
                            <SView col="xs-12" row center>
                                <SView
                                    style={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: 100,
                                        overflow: "hidden",
                                        backgroundColor: STheme.color.card + "66",
                                    }}
                                >
                                    <SImage
                                        src={`${SSocket.api.empresa}sucursal/${key}`}
                                        style={{ resizeMode: "cover" }}
                                    />
                                </SView>
                                <SView width={5} />
                                <SText flex numberOfLines={1} style={e.textStyle}>
                                    {descripcion}
                                </SText>
                            </SView>
                        ) : (
                            <SText>Sin sucursal</SText>
                        );
                    }}
                />

                <DinamicTable.Col
                    key="punto"
                    label="P.VENTA"
                    width={50}
                    data={e => e.row?.puntos_venta?.descripcion ?? "Sin punto de venta"}
                />

                <DinamicTable.Col
                    key="fecha"
                    label="FECHA"
                    width={80}
                    dataType="date"
                    data={e => (e.row?.fecha ? new SDate(e.row.fecha, "yyyy-MM-dd").date : null)}
                    textStyle={{ fontSize: 12, color: STheme.color.text }}
                    dateFormat="yyyy-MM-dd"
                />

                <DinamicTable.Col
                    key="estado_caja"
                    label="ESTADO"
                    width={80}
                    data={e => e.row?.estado_caja ?? "Desconocido"}
                    customComponent={e => {
                        const estado = e.row?.estado_caja ?? "Desconocido";
                        return (
                            <SView col={"xs-12"} row center padding={8}>
                                <SView
                                    padding={4}
                                    center
                                    row
                                    style={{
                                        backgroundColor: estado === "cerrada" ? "#503131ff" : "#2a533cff",
                                        borderColor: estado === "cerrada" ? "#ef4444" : "#22c45e",
                                        borderWidth: 1,
                                        borderRadius: 20,
                                    }}
                                >
                                    <SView
                                        width={6}
                                        height={6}
                                        style={{
                                            backgroundColor: estado === "cerrada" ? "#ef4545" : "#22c45e",
                                            borderRadius: 8,
                                        }}
                                    />
                                    <SText
                                        style={{
                                            textTransform: "uppercase",
                                            fontSize: 10,
                                            color: estado === "cerrada" ? "#ef4444" : "#22c45e",
                                        }}
                                    >
                                        {estado}
                                    </SText>
                                </SView>
                            </SView>
                        );
                    }}
                />

                <DinamicTable.Col
                    key="fecha_on"
                    label="F.APERTURA"
                    width={110}
                    dataType="date"
                    data={e => (e.row?.fecha_on ? new SDate(e.row.fecha_on, "yyyy-MM-ddThh:mm:ss").date : null)}
                    textStyle={{ fontSize: 12, color: STheme.color.text }}
                    dateFormat="yyyy-MM-dd hh:mm"
                />

                <DinamicTable.Col
                    key="fecha_cierre"
                    label="F.CIERRE"
                    width={110}
                    dataType="date"
                    data={e =>
                        e.row?.fecha_cierre ? new SDate(e.row.fecha_cierre, "yyyy-MM-ddThh:mm:ss").date : null
                    }
                    dateFormat="yyyy-MM-dd hh:mm"
                    textStyle={{ fontSize: 12, color: STheme.color.text }}
                />

                <DinamicTable.Col
                    key="tiempos"
                    label="DURACIÓN"
                    width={90}
                    data={e => {
                        const { fecha_on, fecha_cierre } = e.row;
                        if (!fecha_on || !fecha_cierre) return null;
                        return new Date(fecha_cierre).getTime() - new Date(fecha_on).getTime();
                    }}
                    format={e => {
                        const { fecha_on, fecha_cierre } = e.row;
                        if (!fecha_on || !fecha_cierre) {
                            return (
                                <SView col={"xs-12"} row center>
                                    <SView
                                        padding={4}
                                        center
                                        row
                                        style={{
                                            backgroundColor: "#e8eef0ff",
                                            borderColor: "#2596be",
                                            borderWidth: 1,
                                            borderRadius: 20,
                                        }}
                                    >
                                        <SText style={{ textTransform: "uppercase", fontSize: 10, color: "#159ecfff" }}>
                                            En curso
                                        </SText>
                                    </SView>
                                </SView>
                            );
                        }
                        return new SDate(fecha_on).timeSince(new SDate(fecha_cierre));
                    }}
                    textStyle={{ fontSize: 12, color: STheme.color.text }}
                />

                <DinamicTable.Col
                    key="total_monto_apertura"
                    wrap
                    label="MONTO APERTURA"
                    width={60}
                    data={e => e.row?.total_monto_apertura ?? 0}
                    cellStyle={{ alignItems: "flex-end", backgroundColor: "#007bff33" }}
                    format={e => (!e.data ? "" : SMath.formatMoney(e.data))}
                />

                <DinamicTable.Col
                    key="total_monto_venta"
                    wrap
                    label="VENTAS TOTALES"
                    width={60}
                    data={e => e.row?.total_monto_venta ?? 0}
                    cellStyle={{ alignItems: "flex-end", backgroundColor: "#28a74566" }}
                    format={e => (!e.data ? "" : SMath.formatMoney(e.data))}
                />

                <DinamicTable.Col
                    key="total_monto_ingresos"
                    wrap
                    label="INGRESOS TOTALES"
                    width={60}
                    data={e => e.row?.total_monto_ingresos ?? 0}
                    cellStyle={{ alignItems: "flex-end", backgroundColor: "#28a74533" }}
                    format={e => (!e.data ? "" : SMath.formatMoney(e.data))}
                />

                <DinamicTable.Col
                    key="total_cantidad_ingresos"
                    wrap
                    label="CANT. DE INGRESOS"
                    width={60}
                    data={e => e.row?.total_cantidad_ingresos ?? 0}
                    cellStyle={{ alignItems: "flex-end", backgroundColor: "#28a74533" }}
                    format={e => (!e.data ? "" : SMath.formatMoney(e.data))}
                />

                <DinamicTable.Col
                    key="total_monto_compra"
                    wrap
                    label="MONTO COMPRAS"
                    width={60}
                    data={e => e.row?.total_monto_compra ?? 0}
                    cellStyle={{ alignItems: "flex-end", backgroundColor: "#ffc10766" }}
                    format={e => (!e.data ? "" : SMath.formatMoney(e.data))}
                />

                <DinamicTable.Col
                    key="total_monto_egresos"
                    wrap
                    label="EGRESOS TOTALES"
                    width={60}
                    data={e => e.row?.total_monto_egresos ?? 0}
                    cellStyle={{ alignItems: "flex-end", backgroundColor: "#ffc10733" }}
                    format={e => (!e.data ? "" : SMath.formatMoney(e.data))}
                />

                <DinamicTable.Col
                    key="total_cantidad_egresos"
                    wrap
                    label="CANT. DE EGRESOS"
                    width={60}
                    data={e => e.row?.total_cantidad_egresos ?? 0}
                    cellStyle={{ alignItems: "flex-end", backgroundColor: "#ffc10733" }}
                    format={e => (!e.data ? "" : SMath.formatMoney(e.data))}
                />

                <DinamicTable.Col
                    key="admin"
                    label="CAJERO"
                    width={120}
                    data={e => e.row?.usuario?.Nombres ?? "Sin cajero"}
                    customComponent={e => {
                        const key = e.row?.key_usuario;
                        const nombre = e.row?.usuario?.Nombres ?? "Sin cajero";
                        return key ? (
                            <SView col="xs-12" row center>
                                <SView
                                    style={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: 100,
                                        overflow: "hidden",
                                        backgroundColor: STheme.color.card + "66",
                                    }}
                                >
                                    <SImage
                                        src={`${SSocket.api.root}usuario/${key}`}
                                        style={{ resizeMode: "cover" }}
                                    />
                                </SView>
                                <SView width={5} />
                                <SText flex numberOfLines={1} style={e.textStyle}>
                                    {nombre}
                                </SText>
                            </SView>
                        ) : (
                            <SText>Sin cajero</SText>
                        );
                    }}
                />
            </DinamicTable>
        );
    }

    render() {
        return (
            <SPage title="Tabla de Caja" disableScroll>
                <SView width={260} center>
                    <DateTimeBetween
                        fecha_inicio={this.state.fecha_inicio}
                        fecha_fin={this.state.fecha_fin}
                        onChange={({ fecha_inicio, fecha_fin }) => {
                            const esPrimerLlamado = !this._periodoListo;
                            this._periodoListo = true;
                            this.setState({ fecha_inicio, fecha_fin }, () => {
                                // El primer llamado (al montarse) ya lo cubre la carga inicial de DinamicTable.
                                if (!esPrimerLlamado && this.DinamicTable) this.DinamicTable.loadData();
                            });
                        }}
                    />
                </SView>
                {this.renderTabla()}
                <SHr h={16} />
            </SPage>
        );
    }
}