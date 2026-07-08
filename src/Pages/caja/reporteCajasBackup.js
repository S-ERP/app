import React, { Component } from 'react';
import { SView, SPage, SHr, SScrollView2, STheme, SDate, SText, SImage, SPopup, SMath, SNavigation } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import SSocket from 'servisofts-socket';
import MDL from '../../MDL';
import Config from '../../Config';
import DateTimeBetween from '../../Components/DateTimeBetween';
import FiltroCaja from '../productos/modelo/Components/FiltroCaja';

export default class reporteCajas extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fecha_inicio: new SDate('2024-01-01', 'yyyy-MM-dd hh:mm').toString("yyyy-MM-dd"),
            // fecha_inicio: new SDate().addMonth(-10).setDay(1).toString("yyyy-MM-dd"),
            fecha_fin: new SDate().toString("yyyy-MM-dd"),
            data: [], // Estado para almacenar los datos de la tabla
            estado_caja: null, // Filtro de estado de caja (abierta/cerrada)
        };
    }

    componentDidMount() {
        this.loadInitialData().then(data => {
            this.setState({ data }); // Actualizar el estado con los datos iniciales
        });
    }

    async loadInitialData() {
        try {
            console.log("📦 Cargando movimientos de caja...");
            const empresaKey = MDL.empresa.select?.key;






            if (!empresaKey) throw new Error("Empresa no seleccionada.");
            const { fecha_inicio, fecha_fin } = this.state;
            // const fechaInicioRef = fecha_inicio ?? new SDate().addMonth(-1).setDay(1).toString('yyyy-MM-dd');
            // const fechaFinRef = fecha_fin ?? new SDate().toString('yyyy-MM-dd');
            const movimientos = await MDL.caja.getAllCajasByEmpresa(empresaKey, fecha_inicio, fecha_fin);
            if (!Array.isArray(movimientos)) {
                console.warn("No se recibieron movimientos válidos.");
                return [];
            }
            // console.log("Movimientos recibidos:", JSON.stringify(movimientos));
            const empresa = await MDL.empresa.getFull();

            const base = empresa.monedas.find(a => a.tipo == "base");

            // console.log("fullllllllllllll " + JSON.stringify(base))


            const sucursales = empresa?.sucursales ?? [];
            const puntos_ventas = sucursales.flatMap(s => s.puntos_venta || []);
            const usuarioKeys = [...new Set(movimientos.map(m => m.key_usuario).filter(Boolean))];
            const usuarios = (await MDL.usuario.getByKeys(usuarioKeys)) ?? [];
            const usuarioMap = Object.fromEntries(usuarios.map(u => [u.key, u]));
            let processedData = movimientos.map(mov => ({
                ...mov,
                usuario: usuarioMap[mov.key_usuario] ?? null,
                puntos_venta: puntos_ventas.find(pv => pv.key === mov.key_punto_venta) ?? null,
                sucursal: sucursales.find(s => s.key === mov.key_sucursal) ?? null,
                moneda: base,
            }));
            if (this.state.estado_caja) {
                processedData = processedData.filter(mov => mov.estado_caja === this.state.estado_caja);
            }
            // console.log("Datos procesados para la tabla:", JSON.stringify(processedData));
            return processedData;
        } catch (error) {
            console.error("❌ Error al cargar movimientos:", error);
            // SPopup.alert("Error al cargar los movimientos. Intenta nuevamente.");
            return [];
        }
    }

    renderTabla() {
        return (
            <DinamicTable
                ref={ref => (this.DinamicTable = ref)}
                loadData={() => this.loadInitialData()}
                data={this.state.data} // Pasar los datos del estado
                key="id"
                keyExtractor={e => e.key}
                language="es"
                center
                selectType="single"
                loadInitialState={async () => ({
                    sorters: [{ key: "fecha_on", order: "desc", type: "date" }],
                })}
                {...Config.table.applyTheme()}
            >
                <DinamicTable.Col key="index" label="N°" width={30} data={e => e.index + 1} />
                <DinamicTable.Col
                    key="fecha"
                    label="FECHA"
                    width={80}
                    dataType="date"
                    data={e => (e.row?.fecha_on ? new SDate(e.row.fecha_on, "yyyy-MM-ddThh:mm:ss").date : null)}

                    // data={e => (e.row?.fecha_on ? new SDate(e.row.fecha_on, "yyyy-MM-dd").date : null)}
                    // data={e => (e.row?.fecha ? new SDate(e.row.fecha, "yyyy-MM-dd").date : null)}
                    textStyle={{ fontSize: 12, color: STheme.color.text }}
                    dateFormat="yyyy-MM-dd"
                />
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
                    width={100}
                    data={e => e.row?.puntos_venta?.descripcion ?? "Sin punto de venta"}
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
                <DinamicTable.Col
                    key="estado_caja"
                    label="ESTADO"
                    width={80}
                    data={e => e.row?.estado_caja ?? "Desconocido"}
                    customComponent={e => {
                        const estado = e.row?.estado_caja ?? "Desconocido";
                        return (
                            <SView col={"xs-12"} row center >
                                <SView
                                    padding={6}
                                    center
                                    row
                                    style={{
                                        backgroundColor: estado === "cerrada" ? STheme.color.danger + "33" : STheme.color.success + "33",
                                        borderColor: estado === "cerrada" ? STheme.color.danger : STheme.color.success,
                                        borderWidth: 1,
                                        borderRadius: 4,
                                    }}
                                    onPress={() => {
                                        SNavigation.navigate("/caja/detail", { key: e.row?.key })
                                    }}
                                >
                                    <SView
                                        width={6}
                                        height={6}
                                        style={{
                                            backgroundColor: estado === "cerrada" ? STheme.color.danger : STheme.color.success,
                                            borderRadius: 8,
                                        }}
                                    />
                                    <SView width={4} />
                                    <SText
                                        style={{
                                            textTransform: "uppercase",
                                            fontSize: 10,
                                            fontWeight: "bold",
                                            // color: estado === "cerrada" ? STheme.color.danger : STheme.color.success,
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
                    width={130}
                    dataType="date"
                    data={e => (e.row?.fecha_on ? new SDate(e.row.fecha_on, "yyyy-MM-ddThh:mm:ss").date : null)}
                    // textStyle={{ fontSize: 12, color: STheme.color.text }}
                    dateFormat="yyyy-MM-dd hh:mm"
                />

                <DinamicTable.Col
                    key="fecha_cierre"
                    label="F.CIERRE"
                    width={130}
                    dataType="date"
                    data={e =>
                        e.row?.fecha_cierre ? new SDate(e.row.fecha_cierre, "yyyy-MM-ddThh:mm:ss").date : null
                    }
                    dateFormat="yyyy-MM-dd hh:mm"
                // textStyle={{ fontSize: 12, color: STheme.color.text }}
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
                {/* 
                <DinamicTable.Col
                    key="moneda"
                    wrap
                    label="MONEDA"
                    width={60}
                    data={e => e.row?.moneda.observacion ?? 0}
                />


                <DinamicTable.Col
                    key="monedasa"
                    wrap
                    center
                    label="TIPO DE CAMBIO"
                    width={60}
                    data={e => e.row?.moneda.tipo_cambio ?? 0}
                /> */}

                <DinamicTable.Col
                    key="total_monto_apertura"
                    wrap
                    label="MONTO APERTURA"
                    width={90}
                    data={e => e.row?.total_monto_apertura ?? 0}
                    cellStyle={{ backgroundColor: "#007bff33" }}
                    textStyle={{ textAlign: "right" }}
                    format={e => (!e.data ? "" : SMath.formatMoney(e.data))}
                />

                <DinamicTable.Col
                    key="total_monto_venta"
                    wrap
                    label="VENTAS TOTALES"
                    width={90}
                    data={e => e.row?.total_monto_venta ?? 0}
                    cellStyle={{ backgroundColor: "#28a74566" }}
                    textStyle={{ textAlign: "right" }}
                    format={e => (!e.data ? "" : SMath.formatMoney(e.data))}
                />

                <DinamicTable.Col
                    key="total_monto_ingresos"
                    wrap
                    label="INGRESOS TOTALES"
                    width={90}
                    data={e => e.row?.total_monto_ingresos ?? 0}
                    cellStyle={{ backgroundColor: "#28a74533" }}
                    textStyle={{ textAlign: "right" }}
                    format={e => (!e.data ? "" : SMath.formatMoney(e.data))}
                />

                <DinamicTable.Col
                    key="total_cantidad_ingresos"
                    wrap
                    label="CANT. DE INGRESOS"
                    width={90}
                    data={e => e.row?.total_cantidad_ingresos ?? 0}
                    cellStyle={{ backgroundColor: "#28a74533" }}
                    textStyle={{ textAlign: "right" }}
                    format={e => (!e.data ? "" : SMath.formatMoney(e.data))}
                />

                <DinamicTable.Col
                    key="total_monto_compra"
                    wrap
                    label="MONTO COMPRAS"
                    width={90}
                    data={e => e.row?.total_monto_compra ?? 0}
                    cellStyle={{ backgroundColor: "#ffc10766" }}
                    textStyle={{ textAlign: "right" }}
                    format={e => (!e.data ? "" : SMath.formatMoney(e.data))}
                />

                <DinamicTable.Col
                    key="total_monto_egresos"
                    wrap
                    label="EGRESOS TOTALES"
                    width={90}
                    data={e => e.row?.total_monto_egresos ?? 0}
                    cellStyle={{ backgroundColor: "#ffc10733" }}
                    textStyle={{ textAlign: "right" }}
                    format={e => (!e.data ? "" : SMath.formatMoney(e.data))}
                />

                <DinamicTable.Col
                    key="total_cantidad_egresos"
                    wrap
                    label="CANT. DE EGRESOS"
                    width={90}
                    data={e => e.row?.total_cantidad_egresos ?? 0}
                    cellStyle={{ backgroundColor: "#ffc10733" }}
                    textStyle={{ textAlign: "right" }}
                    format={e => (!e.data ? "" : SMath.formatMoney(e.data))}
                />

            </DinamicTable>
        );
    }

    render() {
        return (
            <SPage title="Reporte de Cajas por Sucursal filtro de caja abierta" disableScroll>
                <SHr></SHr>
                <SView row col={"xs-12"} style={{ alignItems: 'center', flexWrap: 'wrap', paddingHorizontal: 8, gap: 8 }}>
                    <SView width={260} center>
                        <DateTimeBetween
                            fecha_inicio={this.state.fecha_inicio}
                            fecha_fin={this.state.fecha_fin}
                            onChange={({ fecha_inicio, fecha_fin }) => {
                                // console.log("Fechas seleccionadas:", fecha_inicio, fecha_fin);
                                this.setState({ fecha_inicio, fecha_fin }, () => {
                                    // Recargar los datos de la tabla al cambiar fechas
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
                    <FiltroCaja
                        onSelectEstado={item => {
                            this.setState({ estado_caja: item?.key ?? null }, () => {
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
                <SHr></SHr>



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