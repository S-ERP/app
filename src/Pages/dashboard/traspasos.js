import React from "react";
import { SPage, SView, SText, SHr, STheme, SForm, SIcon, SDate } from "servisofts-component";
import { DinamicTable } from 'servisofts-table';
import MDL from "../../MDL";
import { ScrollView } from "react-native-gesture-handler";
import Config from '../../Config';
import FechaFullFilter from "../../Components/FechaFullFilter";
import BarraRechartsBd from "../recharts/Components/BarraRechartsBd";
import LineaRechartsBd from "../recharts/Components/LineaRechartsBd";
import CircularRechartsBd from "../recharts/Components/CircularRechartsBd";
import InputSelector from "../../Components/Selectores/InputSelector";

export default class traspasos extends React.Component {

    state = {
        fecha_inicio: this.formatDate(
            new Date(new Date().setDate(new Date().getDate() - 6))
        ),
        fecha_fin: this.formatDate(new Date()),

        empresaSeleccionada: null,
        almacenes: [],
        selectedAlmacen: null,

        dataTraspasos: [],

        loading: true,
        loadingTraspasos: true,
    };

    componentDidMount() {
        this._mounted = true;
        this.initDashboard();
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    // ==========================
    // FECHAS
    // ==========================

    formatDate(date) {
        if (!date) return "";
        const d = new Date(date);
        const pad = (n) => n.toString().padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }

    // ==========================
    // FILTROS
    // ==========================

    handleAlmacenSelect = (almacen) => {
        this.setState({
            selectedAlmacen: almacen
        }, this.loadDashboardData);
    };

    handleFechaChange = (dates) => {
        this.setState({
            fecha_inicio: dates.fecha_inicio,
            fecha_fin: dates.fecha_fin
        }, this.loadDashboardData);
    };

    // ==========================
    // INIT
    // ==========================

    initDashboard = async () => {

        const waitForSelect = async (timeout = 3000, interval = 200) => {
            const start = Date.now();
            while (!MDL.empresa.select && Date.now() - start < timeout) {
                await new Promise(res => setTimeout(res, interval));
            }
            return MDL.empresa.select;
        };

        const selected = MDL.empresa.select || await waitForSelect();
        if (!selected) {
            if (this._mounted) {
                this.setState({ loading: false, loadingTraspasos: false });
            }
            return;
        }

        const almacenesAll = await MDL.inventario.getAllAlmacen() || [];
        const almacenes = almacenesAll.filter(
            almacen => almacen.key_empresa === selected.key
        );

        if (this._mounted) {
            this.setState({
                empresaSeleccionada: selected,
                almacenes
            }, this.loadDashboardData);
        }
    };

    // ==========================
    // DATA
    // ==========================

    loadDashboardData = async () => {
        const {
            empresaSeleccionada,
            fecha_inicio,
            fecha_fin,
            selectedAlmacen
        } = this.state;

        if (!empresaSeleccionada) return;

        this.setState({ loading: true });

        await this.loadReporteTraspasos(
            empresaSeleccionada.key,
            fecha_inicio,
            fecha_fin,
            selectedAlmacen?.key
        );

        if (this._mounted) {
            this.setState({ loading: false });
        }
    };

    // Reporte de movimientos de traspaso entre almacenes.
    // Requiere la función SQL nueva `rep_traspasos_inventario_detalle` (creada desde cero,
    // sin editar ninguna función existente) porque las funciones genéricas ya existentes
    // (get_all, get_by_key) devuelven un objeto JSON y el endpoint reporte/execute_function
    // exige que la respuesta sea un array JSON.
    loadReporteTraspasos = async (keyEmpresa, fecha_inicio, fecha_fin, keyAlmacen) => {
        this.setState({ loadingTraspasos: true });
        try {
            let raw = await MDL.inventario.execute_function(
                "rep_traspasos_inventario_detalle",
                [keyEmpresa, fecha_inicio, fecha_fin, keyAlmacen]
            );
            if (typeof raw === "string") {
                try { raw = JSON.parse(raw); } catch (e) { raw = []; }
            }

            const detalle = (Array.isArray(raw) ? raw : []).map(item => ({
                key_traspaso: item.key_traspaso,
                fecha_on: item.fecha_on,
                fecha: String(item.fecha_on).substring(0, 10),
                descripcion: item.descripcion || "",
                key_almacen_origen: item.key_almacen_origen,
                almacen_origen: item.almacen_origen || "Sin almacén",
                key_almacen_destino: item.key_almacen_destino,
                almacen_destino: item.almacen_destino || "Sin almacén",
                key_modelo: item.key_modelo,
                producto: item.producto || "Producto",
                cantidad: Number(item.cantidad) || 0,
                precio_referencia: Number(item.precio_compra_referencia) || 0,
                valor_referencia: Number(item.valor_referencia) || 0,
            }));

            // console.log("loadReporteTraspasos detalle:", detalle);

            if (this._mounted) {
                console.log("loadReporteTraspasos detalle:", detalle);
                this.setState({ dataTraspasos: detalle, loadingTraspasos: false });
            }
        } catch (e) {
            console.error("Error en loadReporteTraspasos:", e);
            if (this._mounted) {
                this.setState({ dataTraspasos: [], loadingTraspasos: false });
            }
        }
    };

    // ==========================
    // AGREGACIONES PARA GRAFICOS
    // ==========================

    getResumenTraspasos = () => {
        const { dataTraspasos } = this.state;
        const traspasosUnicos = new Set();
        const almacenesInvolucrados = new Set();
        let totalUnidades = 0;
        let totalValor = 0;

        dataTraspasos.forEach(d => {
            traspasosUnicos.add(d.key_traspaso);
            totalUnidades += d.cantidad;
            totalValor += d.valor_referencia;
            if (d.key_almacen_origen) almacenesInvolucrados.add(d.key_almacen_origen);
            if (d.key_almacen_destino) almacenesInvolucrados.add(d.key_almacen_destino);
        });

        return {
            totalTraspasos: traspasosUnicos.size,
            totalUnidades,
            totalValor,
            totalAlmacenes: almacenesInvolucrados.size,
        };
    };

    getDataPorAlmacenDestino = () => {
        const map = {};
        this.state.dataTraspasos.forEach(d => {
            const name = d.almacen_destino || "Sin almacén";
            map[name] = (map[name] || 0) + d.cantidad;
        });
        return Object.entries(map)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    };

    getDataPorProducto = () => {
        const map = {};
        this.state.dataTraspasos.forEach(d => {
            const name = d.producto || "Sin producto";
            map[name] = (map[name] || 0) + d.cantidad;
        });
        return Object.entries(map)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
    };

    getDataPorDia = () => {
        const map = {};
        this.state.dataTraspasos.forEach(d => {
            map[d.fecha] = (map[d.fecha] || 0) + d.cantidad;
        });
        return Object.keys(map)
            .sort()
            .map(fecha => ({ name: fecha, value: map[fecha] }));
    };

    formatCurrency = (amount) => {
        return "Bs. " + (parseFloat(amount) || 0).toLocaleString('es-BO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    // ==========================
    // RENDER TARJETAS
    // ==========================

    renderResumenTarjetas = () => {
        const resumen = this.getResumenTraspasos();

        return (
            <SView row col="xs-12">
                <CardResumen
                    label="Traspasos"
                    value={resumen.totalTraspasos}
                    icon="tpIn"
                />
                <CardResumen
                    label="Unidades trasladadas"
                    value={resumen.totalUnidades.toLocaleString('es-ES')}
                    icon="blender/group"
                />
                <CardResumen
                    label="Valor referencial"
                    value={this.formatCurrency(resumen.totalValor)}
                    icon="iconHome"
                />
                <CardResumen
                    label="Almacenes involucrados"
                    value={resumen.totalAlmacenes}
                    icon="AlertOutline"
                />
            </SView>
        );
    };

    // ==========================
    // RENDER
    // ==========================

    render() {

        let permiso = MDL.rolesPermisos.getPermiso({ url: "/dashboard/traspasos", permiso: 'ver' })
        if (!permiso) {
            return (
                <SPage title="Dashboard Traspasos" center>
                    <SView col="xs-12" center>
                        <SText fontSize={16} color={STheme.color.danger}>No tienes permiso para ver este contenido.</SText>
                    </SView>
                </SPage>
            );
        }

        const {
            fecha_inicio,
            fecha_fin,
            almacenes,
            selectedAlmacen,
            loadingTraspasos,
            dataTraspasos,
        } = this.state;

        console.log("Render traspasos dataTraspasos:", dataTraspasos);

        const cellstyle = { padding: 4 };

        const dataPorAlmacenDestino = this.getDataPorAlmacenDestino();
        const dataPorProducto = this.getDataPorProducto();
        const dataPorDia = this.getDataPorDia();

        return (
            <SPage title="Traspasos de Inventario">

                {/* <ScrollView> */}

                <SView padding={16}>

                    <SText
                        fontSize={18}
                        bold
                    >
                        Traspasos de Inventario
                    </SText>

                    <SHr />

                    {/* FILTROS */}

                    <SView col="xs-12" row card center padding={8}>
                        <SView col={"xs-12 md-4"}>
                            <SForm
                                style={{ zIndex: 99, height: 65, marginTop: -35 }}
                                inputs={{
                                    almacen: {
                                        placeholder: "Seleccione una almacén",
                                        type: "custom",
                                        customInputClass: InputSelector,
                                        defaultValue: selectedAlmacen?.key ?? "todos",
                                        options: [
                                            {
                                                label: "Todos los almacenes",
                                                value: "todos",
                                                data: null
                                            },
                                            ...(almacenes || []).map(item => ({
                                                label: item.descripcion,
                                                value: item.key,
                                                data: item
                                            }))
                                        ],
                                        onSelect: (val) => {
                                            this.handleAlmacenSelect(val.data);
                                        }
                                    }
                                }}
                            />
                        </SView>

                        <SView col={"xs-12 md-8"} center>
                            <FechaFullFilter
                                key_opciones="esta_semana"
                                fecha_inicio={fecha_inicio}
                                fecha_fin={fecha_fin}
                                onChange={this.handleFechaChange}
                            />
                        </SView>
                    </SView>

                    {/* TARJETAS RESUMEN */}

                    {this.renderResumenTarjetas()}



                    {/* TABLA DETALLE */}

                    <SView col="xs-12" padding={5} row height={450} style={{ width: "100%" }}>
                        <SView card padding={15} style={{ borderRadius: 10 }} flex>

                            <SText color={STheme.color.text} bold fontSize={16}>
                                Detalle de traspasos entre almacenes
                            </SText>
                            <SHr />

                            {loadingTraspasos ? (
                                <SText>Cargando...</SText>
                            ) : dataTraspasos.length === 0 ? (
                                <SText>No hay traspasos registrados para el período/almacén seleccionado.</SText>
                            ) : (
                                <DinamicTable
                                    ref={ref => (this.DinamicTable = ref)}
                                    loadData={async () => dataTraspasos}
                                    keyExtractor={e => `${e.key_traspaso}_${e.key_modelo}`}
                                    language="es"
                                    style={{ width: "100%" }}
                                    center
                                    selectType="single"
                                    {...Config.table.applyTheme()}

                                    renderLoading={() => (
                                        <SView col={"xs-12"} center padding={24}>
                                            <SText fontSize={13} color={STheme.color.text + "99"}>Cargando movimientos...</SText>
                                        </SView>
                                    )}

                                    renderNoResults={() => (
                                        <SView col={"xs-12"} center padding={24}>
                                            <SText fontSize={13} color={STheme.color.text + "99"}>No se encontraron movimientos en el rango seleccionado.</SText>
                                        </SView>
                                    )}

                                    renderError={({ error }) => (
                                        <SView col={"xs-12"} padding={16}>
                                            <SText fontSize={13} color={STheme.color.danger}>Error: {error?.message || String(error)}</SText>
                                        </SView>
                                    )}

                                    loadInitialState={async () => ({
                                        sorters: [{ key: "fecha", order: "desc", type: "date" }],
                                    })}

                                    listFooterComponent={() => {
                                        return <SHr height={100} />

                                    }}
                                >
                                    <DinamicTable.Col key="index" label="#" width={40} data={(e) => e.index + 1} />
                                    <DinamicTable.Col
                                        key="fecha"
                                        label='Fecha'
                                        width={90}
                                        dataType="date"
                                        dateFormat="yyyy-MM-dd"
                                        data={e => (e.row?.fecha ? new SDate(e.row.fecha, "yyyy-MM-dd").date : e.row.fecha)}
                                    />
                                    <DinamicTable.Col
                                        key="descripcion"
                                        label='Descripción'
                                        width={160}
                                        wrap
                                        data={e => e.row.descripcion}
                                    />

                                    <DinamicTable.Col
                                        key="almacen_origen"
                                        label='Origen'
                                        width={130}
                                        wrap
                                        data={e => e.row.almacen_origen}
                                    />
                                    <DinamicTable.Col
                                        key="almacen_destino"
                                        label='Destino'
                                        width={130}
                                        wrap
                                        data={e => e.row.almacen_destino}
                                    />
                                    <DinamicTable.Col
                                        key="producto"
                                        label='Producto'
                                        width={180}
                                        wrap
                                        data={e => e.row.producto}
                                    />
                                    <DinamicTable.Col
                                        key="cantidad"
                                        label='Cantidad'
                                        width={80}
                                        wrap
                                        cellStyle={cellstyle}
                                        data={e => e.row.cantidad.toLocaleString('es-ES')}
                                        footerComponent={(e) => {
                                            let total = 0;
                                            e.dinamicTable.data.map(a => {
                                                total += a.cantidad || 0
                                            })
                                            return <SView style={{ alignItems: "center" }}>
                                                <SText style={e.dinamicTable.textStyle}>{total.toLocaleString('es-ES')}</SText>
                                            </SView>
                                        }}
                                    />
                                    <DinamicTable.Col
                                        key="precio_referencia"
                                        label='Precio Ref.'
                                        width={90}
                                        wrap
                                        cellStyle={cellstyle}
                                        data={e => this.formatCurrency(e.row.precio_referencia)}
                                    />
                                    <DinamicTable.Col
                                        key="valor_referencia"
                                        label='Valor Ref.'
                                        width={100}
                                        wrap
                                        cellStyle={cellstyle}
                                        data={e => this.formatCurrency(e.row.valor_referencia)}
                                        footerComponent={(e) => {
                                            let total = 0;
                                            e.dinamicTable.data.map(a => {
                                                total += a.valor_referencia || 0
                                            })
                                            return <SView style={{ alignItems: "center" }}>
                                                <SText style={e.dinamicTable.textStyle}>{this.formatCurrency(total)}</SText>
                                            </SView>
                                        }}
                                    />
                                </DinamicTable>
                            )}

                        </SView>
                    </SView>



                    {/* GRAFICO PRINCIPAL: LINEA POR DIA */}
                    <SView padding={5} col="xs-12">
                        <SView card padding={15} style={{ borderRadius: 10 }}>

                            <SText bold fontSize={16}>
                                Unidades traspasadas por día
                            </SText>
                            <SHr />
                            {loadingTraspasos ? (
                                <SText>Cargando datos...</SText>
                            ) : (
                                <LineaRechartsBd
                                    data={dataPorDia}
                                    nameKey="name"
                                    valueKey="value"
                                    height={280}
                                />
                            )}

                        </SView>
                    </SView>





                    {/* DOS GRAFICOS: BARRA POR ALMACEN DESTINO + CIRCULAR POR PRODUCTO */}

                    <SView row col="xs-12">

                        <SView padding={5} col="xs-12 md-6">
                            <SView card padding={15} style={{ borderRadius: 10 }}>
                                <SText bold fontSize={16}>
                                    Unidades recibidas por almacén destino
                                </SText>
                                <SHr />
                                {loadingTraspasos ? (
                                    <SText>Cargando datos...</SText>
                                ) : (
                                    <BarraRechartsBd
                                        data={dataPorAlmacenDestino}
                                        nameKey="name"
                                        valueKey="value"
                                        valueKey2={null}
                                        height={300}
                                    />
                                )}
                            </SView>
                        </SView>

                        <SView padding={5} col="xs-12 md-6">
                            <SView card padding={15} style={{ borderRadius: 10 }}>
                                <SText bold fontSize={16}>
                                    Productos más traspasados
                                </SText>
                                <SHr />
                                {loadingTraspasos ? (
                                    <SText>Cargando datos...</SText>
                                ) : (
                                    <CircularRechartsBd
                                        data={dataPorProducto}
                                        nameKey="name"
                                        valueKey="value"
                                        height={300}
                                    />
                                )}
                            </SView>
                        </SView>

                    </SView>



                </SView>

                {/* </ScrollView> */}

            </SPage>
        );
    }
}

const CardResumen = ({ label, value, icon }) => (
    <SView
        padding={5}
        style={{
            flex: 1,
            minWidth: 120,
            borderRadius: 10,
            paddingTop: 10
        }}
    >
        <SView
            padding={15}
            card
            row
            style={{
                borderRadius: 10,
                minHeight: 90,
                justifyContent: "space-between",
                alignItems: "center"
            }}
        >
            <SView flex>
                <SText
                    fontSize={14}
                    color={STheme.color.lightGray}
                    bold
                >
                    {label}
                </SText>

                <SText
                    fontSize={24}
                    bold
                >
                    {value}
                </SText>
            </SView>
            <SView width={50} height={50} style={{ borderRadius: 80, backgroundColor: STheme.color.card }} center>
                <SIcon
                    name={icon}
                    width={30}
                    height={30}
                    fill={STheme.color.text}
                />
            </SView>
        </SView>
    </SView>
);
