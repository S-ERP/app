import React from "react";
import { SPage, SView, SText, SHr, STheme, SButtom, SNavigation } from "servisofts-component";
import { DinamicTable } from 'servisofts-table';
import MDL from "../../MDL";
import { ScrollView } from "react-native-gesture-handler";
import FechaFullFilter from "../../Components/FechaFullFilter";
import BarraRechartsBd from "../recharts/Components/BarraRechartsBd";
import LineaRechartsBd from "../recharts/Components/LineaRechartsBd";
import CircularRechartsBd from "../recharts/Components/CircularRechartsBd";
import DetalleTabla from "./Components/DetalleTabla";
import Model from "../../Model";

export default class ventas extends React.Component {
    state = {
        periodo: "hoy",
        fecha_inicio: this.formatDate(new Date(new Date().setDate(new Date().getDate() - 6))),
        fecha_fin: this.formatDate(new Date()),
        selectedSucursal: null,
        selectedTipoProducto: null,
        sucursales: [],
        tipoProducto: [],
        dataTimeSeries: [],
        dataTopProducts: [],
        dataBranchShare: [],
        dataBranchShareBarras: [],
        dataMetodoPago: [],
        tipoProductoLista: [],
        loading: true,
        empresaSeleccionada: null,
    };

    componentDidMount() {
        this._mounted = true;
        this.initDashboard();
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    formatDate(date) {
        if (!date) return "";
        const d = new Date(date);
        const pad = (n) => n.toString().padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }

    startOfWeek = (date) => {
        const d = new Date(date);
        const day = d.getDay() || 7;
        d.setDate(d.getDate() - day + 1);
        return d;
    };

    endOfWeek = (date) => {
        const d = this.startOfWeek(date);
        d.setDate(d.getDate() + 6);
        return d;
    };

    startOfMonth = (date) => {
        const d = new Date(date);
        return new Date(d.getFullYear(), d.getMonth(), 1);
    };

    endOfMonth = (date) => {
        const d = new Date(date);
        return new Date(d.getFullYear(), d.getMonth() + 1, 0);
    };

    startOfYear = (date) => new Date(date.getFullYear(), 0, 1);
    endOfYear = (date) => new Date(date.getFullYear(), 11, 31);

    getRangeForPeriodo = (periodo) => {
        const today = new Date();
        switch (periodo) {
            case "hoy":
                return { fecha_inicio: this.formatDate(today), fecha_fin: this.formatDate(today) };
            case "semana":
                return { fecha_inicio: this.formatDate(this.startOfWeek(today)), fecha_fin: this.formatDate(today) };
            case "este_mes":
                return { fecha_inicio: this.formatDate(this.startOfMonth(today)), fecha_fin: this.formatDate(this.endOfMonth(today)) };
            case "año":
                return { fecha_inicio: this.formatDate(this.startOfYear(today)), fecha_fin: this.formatDate(this.endOfYear(today)) };
            default:
                return { fecha_inicio: this.formatDate(this.startOfWeek(today)), fecha_fin: this.formatDate(today) };
        }
    };

    getPeriodoFromKeyOpciones = (key_opciones, fecha_inicio = this.state.fecha_inicio, fecha_fin = this.state.fecha_fin) => {
        console.log("getPeriodoFromKeyOpciones", { key_opciones, fecha_inicio, fecha_fin });
        switch (key_opciones) {
            case "hoy":
                return "hoy";

            case "esta_semana":
                return "semana";

            case "este_mes":
                return "este_mes";

            case "este_año":
                return "año";

            case "entre": {
                // // const { fecha_inicio, fecha_fin } = this.state;
                console.log("getPeriodoFromKeyOpciones entre", { fecha_inicio, fecha_fin });
                const hoy = new Date();

                // const fi = this.formatDate(fecha_inicio);
                // const ff = this.formatDate(fecha_fin);
                const fi = String(fecha_inicio).substring(0, 10);
                const ff = String(fecha_fin).substring(0, 10);

                // Hoy
                const hoyStr = this.formatDate(hoy);
                if (fi === hoyStr && ff === hoyStr) {
                    console.log("Periodo determinado como 'hoy' por fechas:", fi, ff);
                    return "hoy";
                }

                // Semana actual
                const semanaInicio = this.formatDate(this.startOfWeek(hoy));
                const semanaFin = this.formatDate(hoy);

                if (fi === semanaInicio && ff === semanaFin) {
                    console.log("Periodo determinado como 'semana' por fechas:", fi, ff);
                    return "semana";
                }

                // Mes actual
                const mesInicio = this.formatDate(this.startOfMonth(hoy));
                const mesFin = this.formatDate(this.endOfMonth(hoy));

                if (fi === mesInicio && ff === mesFin) {
                    console.log("Periodo determinado como 'este_mes' por fechas:", fi, ff);
                    return "este_mes";
                }

                // Año actual
                const anioInicio = this.formatDate(this.startOfYear(hoy));
                const anioFin = this.formatDate(this.endOfYear(hoy));

                if (fi === anioInicio && ff === anioFin) {
                    console.log("Periodo determinado como 'año' por fechas:", fi, ff);
                    return "año";
                }

                // Si es un rango personalizado
                return "entre";




                // try {
                //     // let { fecha_inicio, fecha_fin } = this.state;
                //     // if (!fecha_inicio || !fecha_fin) return this.state.periodo;
                //     let inicio = new Date(fecha_inicio);
                //     let fin = new Date(fecha_fin);
                //     if (isNaN(inicio) || isNaN(fin)) return this.state.periodo;
                //     // si están invertidas, las invierte
                //     if (inicio > fin) {
                //         const tmp = inicio; inicio = fin; fin = tmp;
                //     }

                //     const hoy = new Date();
                //     // comparar usando formato YYYY-MM-DD para evitar problemas de zona horaria
                //     const inicioStr = this.formatDate(inicio);
                //     const finStr = this.formatDate(fin);
                //     const hoyStr = this.formatDate(hoy);

                //     const semanaInicioStr = this.formatDate(this.startOfWeek(hoy));
                //     const semanaFinStr = this.formatDate(this.endOfWeek(hoy));
                //     const mesInicioStr = this.formatDate(this.startOfMonth(hoy));
                //     const mesFinStr = this.formatDate(this.endOfMonth(hoy));
                //     const anioInicioStr = this.formatDate(this.startOfYear(hoy));
                //     const anioFinStr = this.formatDate(this.endOfYear(hoy));
                //     console.log(inicioStr, finStr);

                //     if (inicioStr === hoyStr && finStr === hoyStr) return "hoy";
                //     if (inicioStr === semanaInicioStr && finStr === semanaFinStr) return "semana";
                //     if (inicioStr === mesInicioStr && finStr === mesFinStr) return "este_mes";
                //     if (inicioStr === anioInicioStr && finStr === anioFinStr) return "año";
                // } catch (e) {
                //     console.warn("getPeriodoFromKeyOpciones entre error:", e);
                // }
            }

            default:
                console.log("Periodo por defecto:", this.state.periodo);
                return this.state.periodo;
        }
    };

    // getPeriodoFromKeyOpciones = (key_opciones) => {
    //     console.log("key_opciones", key_opciones);
    //     console.log(this.state.periodo);
    //     switch (key_opciones) {
    //         case "hoy":
    //             return "hoy";
    //         case "esta_semana":
    //             return "semana";
    //         case "este_mes":
    //             return "este_mes";
    //         case "este_año":
    //             return "año";
    //         case "entre":
    //             // // validar si fecha_inicio y fecha_fin corresponden a un rango específico
    //             // try {
    //             //     let { fecha_inicio, fecha_fin } = this.state;
    //             //     if (!fecha_inicio || !fecha_fin) return this.state.periodo;
    //             //     let inicio = new Date(fecha_inicio);
    //             //     let fin = new Date(fecha_fin);
    //             //     if (isNaN(inicio) || isNaN(fin)) return this.state.periodo;
    //             //     // si están invertidas, las invierte
    //             //     if (inicio > fin) {
    //             //         const tmp = inicio; inicio = fin; fin = tmp;
    //             //     }

    //             //     const hoy = new Date();
    //             //     // comparar usando formato YYYY-MM-DD para evitar problemas de zona horaria
    //             //     const inicioStr = this.formatDate(inicio);
    //             //     const finStr = this.formatDate(fin);
    //             //     const hoyStr = this.formatDate(hoy);

    //             //     const semanaInicioStr = this.formatDate(this.startOfWeek(hoy));
    //             //     const semanaFinStr = this.formatDate(this.endOfWeek(hoy));
    //             //     const mesInicioStr = this.formatDate(this.startOfMonth(hoy));
    //             //     const mesFinStr = this.formatDate(this.endOfMonth(hoy));
    //             //     const anioInicioStr = this.formatDate(this.startOfYear(hoy));
    //             //     const anioFinStr = this.formatDate(this.endOfYear(hoy));
    //             //     console.log(inicioStr, finStr);

    //             //     if (inicioStr === hoyStr && finStr === hoyStr) return "hoy";
    //             //     if (inicioStr === semanaInicioStr && finStr === semanaFinStr) return "semana";
    //             //     if (inicioStr === mesInicioStr && finStr === mesFinStr) return "este_mes";
    //             //     if (inicioStr === anioInicioStr && finStr === anioFinStr) return "año";
    //             // } catch (e) {
    //             //     console.warn("getPeriodoFromKeyOpciones entre error:", e);
    //             // }

    //         default:
    //             return this.state.periodo;
    //     }
    // };

    getTimeSeriesFunctionName = (periodo) => {
        if (periodo === "semana") return "ventas_por_dia_por_tipo2";
        if (periodo === "este_mes") return "ventas_por_dia_por_tipo";
        if (periodo === "año") return "ventas_por_mes_por_tipo";
        if (periodo === "entre") return "ventas_entre_fechas_por_tipo";
        return "ventas_por_hora_por_tipo";
    };

    initDashboard = async () => {
        const waitForSelect = async (timeout = 3000, interval = 200) => {
            const start = Date.now();
            while (!MDL.empresa.select && Date.now() - start < timeout) {
                await new Promise((res) => setTimeout(res, interval));
            }
            return MDL.empresa.select;
        };

        const selected = MDL.empresa.select || await waitForSelect();
        if (!selected) {
            if (this._mounted) {
                this.setState({ loading: false });
            }
            return;
        }

        const sucursales = await MDL.empresa.getAllSucursales();

        const tipoProducto = await MDL.inventario.getAllTipoProducto();
        if (this._mounted) {
            this.setState({ empresaSeleccionada: selected, sucursales, tipoProducto }, this.loadDashboardData);
        }
    };

    loadDashboardData = async () => {
        const { empresaSeleccionada } = this.state;
        if (!empresaSeleccionada) return;
        this.setState({ loading: true });
        await Promise.all([
            this.loadTimeSeries(empresaSeleccionada.key),
            this.loadTopProducts(empresaSeleccionada.key),
            this.loadMetodoPago(empresaSeleccionada.key),
        ]);
        if (this._mounted) this.setState({ loading: false });
    };

    loadTimeSeries = async (keyEmpresa) => {
        try {
            const { fecha_inicio, fecha_fin, selectedSucursal, selectedTipoProducto, periodo } = this.state;
            const sucursales = await MDL.empresa.getAllSucursales();
            console.log("sucursales disponibles:", sucursales);

            console.log("PERIODO", periodo);
            const functionName = this.getTimeSeriesFunctionName(periodo);
            console.log("PERIODO", periodo, "función a ejecutar:", functionName);

            const res = await MDL.compra_venta.execute_function(functionName, [keyEmpresa, "venta", fecha_inicio, fecha_fin]);

            console.log("BASE DE DATOS:", res);
            // const rescompleto = res.find((item) => item.key_sucursal === sucursales?.key) || res.find((item) => item.key_sucursal == null) || res;
            // const itemSucursal = res.filter(
            //     (item) => item.key_sucursal === sucursales?.key
            // );
            // console.log("itemSucursal:", itemSucursal);
            // const rescompleto = itemSucursal
            //     ? {
            //         ...itemSucursal,
            //         descripcion: sucursales?.descripcion
            //     }
            //     : res.find((item) => item.key_sucursal == null) || res;
            // console.log("rescompleto:", rescompleto);
            // const raw = Array.isArray(res) ? res : res?.data ?? res?.result ?? [];

            const rescompleto = res.map((item) => {
                const sucursal = sucursales.find(
                    (s) => s.key === item.key_sucursal
                );

                return {
                    ...item,
                    descripcion: sucursal?.descripcion || null
                };
            });

            const raw = Array.isArray(rescompleto) ? rescompleto : rescompleto?.data ?? rescompleto?.result ?? [];
            console.log("Respuesta de ventas_por_dia2:", raw);
            console.log("sucursal seleccionada para serie temporal:", selectedSucursal);

            const data = this.transformTimeSeries(raw, sucursales, selectedSucursal?.key, selectedTipoProducto);
            const branchShare = this.transformBranchShare(raw, selectedTipoProducto);
            const branchShareBarras = this.transformBranchShareBarras(raw, selectedTipoProducto);
            const tipoProductoLista = this.extractTipoProductoLista(raw);
            console.log("Datos transformados para participación por sucursal:", branchShare);
            console.log("Datos transformados para participación por sucursal (barras):", branchShareBarras);
            if (this._mounted) {
                this.setState({
                    dataTimeSeries: data,
                    dataBranchShare: branchShare,
                    dataBranchShareBarras: branchShareBarras,
                    tipoProductoLista: tipoProductoLista.length ? tipoProductoLista : this.state.tipoProductoLista,
                });
            }
        } catch (e) {
            console.error("Error en ventas_por_dia2:", e);
            if (this._mounted) {
                this.setState({ dataTimeSeries: [], dataBranchShare: [], dataBranchShareBarras: [] });
            }
        }
    };

    loadTopProducts = async (keyEmpresa) => {
        try {
            const { fecha_inicio, fecha_fin, selectedSucursal, selectedTipoProducto } = this.state;
            const res = await MDL.compra_venta.execute_function("productos_mas_vendidos2", [keyEmpresa, "venta", fecha_inicio, fecha_fin]);
            // const res = await MDL.compra_venta.execute_function("productos_mas_vendidos_tipo", [keyEmpresa, "venta", fecha_inicio, fecha_fin]);
            console.log("PRODUCTOS MÁS VENDIDOS:", res);

            const raw = Array.isArray(res) ? res : res?.data ?? res?.result ?? [];
            const products = raw
                .map((item) => ({
                    producto: item.producto ?? item.nombre ?? "Sin nombre",
                    cantidad_total_vendida: Number(item.cantidad_total_vendida ?? item.cantidad ?? item.total_ventas ?? 0),
                    total: Number(item.total_bs_ganado ?? item.total_bs ?? item.total ?? 0),
                    sucursales: Array.isArray(item.sucursales) ? item.sucursales : [],
                    tipos_producto: Array.isArray(item.tipos_producto) ? item.tipos_producto : [] // Aseguramos que sea un array, incluso si viene como null o string
                }))

                .filter((item) => {
                    if (!selectedSucursal?.key) return true;
                    return item.sucursales.length === 0 || item.sucursales.includes(selectedSucursal.key);
                })
                .sort((a, b) => b.cantidad_total_vendida - a.cantidad_total_vendida)
                .slice(0, 5);



            if (this._mounted) {
                this.setState({ dataTopProducts: products });
            }
        } catch (e) {
            console.error("Error en productos_mas_vendidos2:", e);
            if (this._mounted) {
                this.setState({ dataTopProducts: [] });
            }
        }
    };

    loadMetodoPago = async (keyEmpresa) => {
        try {
            const res = await MDL.compra_venta.execute_function("ventas_por_metodo_pago", [keyEmpresa]);
            const raw = Array.isArray(res) ? res : res?.data ?? res?.result ?? [];
            const data = raw.map((item) => ({
                metodo_pago: item.metodo_pago ?? item.tipo_pago ?? "N/A",
                total_bs: Number(item.total_bs ?? item.total ?? item.total_ventas ?? 0),
            }));
            if (this._mounted) {
                this.setState({ dataMetodoPago: data });
            }
        } catch (e) {
            console.error("Error en ventas_por_metodo_pago:", e);
            if (this._mounted) {
                this.setState({ dataMetodoPago: [] });
            }
        }
    };

    extractTipoProductoLista = (raw) => {
        if (!Array.isArray(raw)) return [];
        const tipos = raw.flatMap((row) => {
            const dias = Array.isArray(row.dias) ? row.dias : [row];
            return dias.flatMap((item) => {
                const detalles = Array.isArray(item.tipos) ? item.tipos : [item];
                // console.log("detalles tipo_producto:", detalles);
                return detalles.map((tipo) => tipo?.tipo_producto).filter(Boolean);
            });
        });
        return [...new Set(tipos)];
    };

    getTipoProductoLabel = (tipoKey) => {
        const tipo = (this.state.tipoProducto || []).find((item) => item.key === tipoKey);
        return tipo?.descripcion ?? tipoKey;
    };

    transformTimeSeries = (raw, sucursales, selectedSucursalKey, selectedTipoProducto) => {
        if (!Array.isArray(raw)) return [];
        console.log("Transformando datos para serie temporal:", { raw, selectedSucursalKey, sucursales, selectedTipoProducto });
        const seriesMap = {};
        const rows = selectedSucursalKey ? raw.filter((row) => row.key_sucursal === selectedSucursalKey) : raw;

        rows.forEach((row) => {
            const dias = Array.isArray(row.dias) ? row.dias : [row];
            dias.forEach((item) => {
                const label = item.hora || item.fecha || item.mes || (item.dia != null ? String(item.dia) : null);
                if (!label) return;
                const detalles = Array.isArray(item.tipos) ? item.tipos : [item];
                const filtered = detalles.filter((tipo) => !selectedTipoProducto || tipo.tipo_producto === selectedTipoProducto);
                const totalVentas = filtered.reduce((sum, tipo) => sum + Number(tipo.cantidad_ventas ?? tipo.cantidad ?? 0), 0);
                const totalMonto = filtered.reduce((sum, tipo) => sum + Number(tipo.monto_total ?? tipo.total_bs ?? tipo.total ?? 0), 0);
                const key = String(label);
                if (!seriesMap[key]) {
                    seriesMap[key] = {
                        label: key,
                        cantidad_ventas: 0,
                        monto_total: 0,
                    };
                }
                seriesMap[key].cantidad_ventas += totalVentas;
                seriesMap[key].monto_total += totalMonto;
            });
        });

        return Object.values(seriesMap).sort((a, b) => {
            const aN = Number(a.label.replace(/\D/g, ""));
            const bN = Number(b.label.replace(/\D/g, ""));
            if (!isNaN(aN) && !isNaN(bN)) return aN - bN;
            return a.label.localeCompare(b.label, "es", { numeric: true });
        });
    };

    transformBranchShare = (raw, selectedTipoProducto) => {
        console.log("Transformando datos para participación por sucursal:", raw, selectedTipoProducto);
        if (!Array.isArray(raw)) return [];
        const branchTotals = {};
        raw.forEach((row) => {
            console.log("Procesando fila para reparto de sucursal:", row);
            const key = row.key_sucursal || row.key;
            const name = row.descripcion || row.sucursal || row.sucursal_descripcion || row.descripcion_sucursal || "Sucursal";
            const dias = Array.isArray(row.dias) ? row.dias : [row];
            const total = dias.reduce((sum, item) => {
                const detalles = Array.isArray(item.tipos) ? item.tipos : [item];
                return sum + detalles.reduce((sub, tipo) => {
                    if (selectedTipoProducto && tipo.tipo_producto !== selectedTipoProducto) return sub;
                    return sub + Number(tipo.monto_total ?? tipo.total_bs ?? tipo.total ?? 0);
                }, 0);
            }, 0);
            if (total <= 0) return;
            console.log("total", total, "para sucursal", name);
            if (!branchTotals[key]) {
                branchTotals[key] = { name, value: 0, total: 0 };
            }
            branchTotals[key].value += total;
        });
        return Object.values(branchTotals)
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);
    };

    transformBranchShareBarras = (raw, selectedTipoProducto) => {
        console.log("Transformando datos para participación por sucursal (barras):", raw, selectedTipoProducto);
        if (!Array.isArray(raw)) return [];
        const branchTotals = {};
        raw.forEach((row) => {
            console.log("Procesando fila para reparto de sucursal:", row);
            const key = row.key_sucursal || row.key;
            const name = row.descripcion || row.sucursal || row.sucursal_descripcion || row.descripcion_sucursal || "Sucursal";
            const dias = Array.isArray(row.dias) ? row.dias : [row];
            const total = dias.reduce((sum, item) => {
                const detalles = Array.isArray(item.tipos) ? item.tipos : [item];
                return sum + detalles.reduce((sub, tipo) => {
                    if (selectedTipoProducto && tipo.tipo_producto !== selectedTipoProducto) return sub;
                    return sub + Number(tipo.monto_total ?? tipo.total_bs ?? tipo.total ?? 0);
                }, 0);
            }, 0);
            const cantidad = dias.reduce((sum, item) => {
                const detalles = Array.isArray(item.tipos) ? item.tipos : [item];
                return sum + detalles.reduce((sub, tipo) => {
                    if (selectedTipoProducto && tipo.tipo_producto !== selectedTipoProducto) return sub;
                    return sub + Number(tipo.cantidad_ventas ?? tipo.total_ventas ?? tipo.cantidad ?? 0);
                }, 0);
            }, 0);
            if (total <= 0) return;
            console.log("total", total, "para sucursal", name);
            if (!branchTotals[key]) {
                branchTotals[key] = { name, value: 0, cantidad: 0, key: null };
            }
            branchTotals[key].value += total;
            branchTotals[key].cantidad += cantidad;
            branchTotals[key].key = key;
        });
        return Object.values(branchTotals)
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);
    };

    handleChangePeriodo = (periodo) => {
        const range = this.getRangeForPeriodo(periodo);
        this.setState({ periodo, ...range }, this.loadDashboardData);
    };

    handleSucursalSelect = (sucursal) => {
        this.setState({ selectedSucursal: sucursal }, () => this.loadDashboardData());
    };
    handleTipoProductoSelect = (tipoProducto) => {
        this.setState({ selectedTipoProducto: tipoProducto }, () => this.loadDashboardData());
    };

    render() {
        // let permiso = Model.usuarioPage.Action.getPermiso({ url: "/venta", permiso: "admin" })
        let permiso = MDL.rolesPermisos.getPermiso({ url: "/dashboard", permiso: 'ver' })
        if (!permiso) {
            return (
                <SPage title="Dashboard de Ventas" center>
                    <SView col="xs-12" center>
                        <SText fontSize={16} color={STheme.color.danger}>No tienes permiso para ver este contenido.</SText>
                    </SView>
                </SPage>
            );
        }

        const {
            periodo,
            fecha_inicio,
            fecha_fin,
            sucursales,
            selectedSucursal,
            dataTimeSeries,
            dataTopProducts,
            dataBranchShare,
            dataBranchShareBarras,
            dataMetodoPago,
            loading,
            tipoProducto,
            tipoProductoLista,
            selectedTipoProducto,
        } = this.state;

        const selectedBranchName = selectedSucursal?.descripcion || "Todas las sucursales";
        const lineTitle = periodo === "hoy" ? "Ventas por hora" : periodo === "año" ? "Ventas por mes" : "Ventas por día";

        console.log("dataBranchShare 2", dataBranchShare);
        console.log("dataBranchShareBarras", dataBranchShareBarras);
        console.log("dataTopProducts", dataTopProducts);

        const renderResumenTarjetas = () => {
            const totalMonto = dataTimeSeries.reduce((sum, item) => sum + Number(item.monto_total || 0), 0);
            const totalTickets = dataTimeSeries.reduce((sum, item) => sum + Number(item.cantidad_ventas || 0), 0);
            const topProduct = dataTopProducts[0]?.producto || "N/A";

            return (
                <SView col="xs-12" row style={{ gap: 0, flexWrap: 'wrap' }} >
                    {[{
                        label: "Sucursal",
                        value: selectedBranchName,
                    }, {
                        label: "Total ventas",
                        value: `Bs. ${Number(totalMonto).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
                    }, {
                        label: "Cantidad de ventas",
                        value: totalTickets,
                    }, {
                        label: "Top producto",
                        value: topProduct,
                    }].map((item, index) => (
                        <SView key={index}
                            col="xs-12 md-6 lg-3" padding={5} >
                            <SView

                                card
                                style={{ padding: 15, minHeight: 80, borderRadius: 10, borderWidth: 1, borderColor: STheme.color.gray + "44", }}
                            >
                                <SText fontSize={14} bold color={STheme.color.lightGray}>{item.label}</SText>
                                <SText fontSize={18} bold>{item.value}</SText>
                            </SView>
                        </SView>
                    ))}
                </SView>
            );
        };
        // console.log("dataBranchShare", dataBranchShare);
        // console.log("dataTopProducts", dataTopProducts);
        // console.log("dataBranchShareBarras", dataBranchShareBarras);
        // console.log("dataTimeSeries", dataTimeSeries);
        console.log("selectedTipoProducto", selectedTipoProducto);
        console.log("tipoProductoLista", tipoProductoLista);
        console.log("tipoProducto", tipoProducto);
        console.log("fecha_inicio", fecha_inicio);
        console.log("fecha_fin", fecha_fin);
        return (
            <SPage title="Dashboard de Ventas">
                <ScrollView>
                    <SView col="xs-12" padding={16}>
                        <SText fontSize={18} bold>Dashboard de Ventas</SText>
                        <SHr height={20} />
                        <SView col="xs-12" row card center padding={8}>
                            <SView row col="xs-12 md-6 lg-4" style={{}}  >
                                <FechaFullFilter
                                    key_opciones={
                                        periodo === 'hoy' ? 'hoy' :
                                            periodo === 'este_mes' ? 'este_mes' :
                                                periodo === 'año' ? 'este_año' :
                                                    'esta_semana'
                                    }
                                    fecha_inicio={fecha_inicio}
                                    fecha_fin={fecha_fin}
                                    onChange={(dates) => {
                                        const newPeriodo = this.getPeriodoFromKeyOpciones(dates.key_opciones, dates.fecha_inicio, dates.fecha_fin);
                                        console.log("newPeriodo", newPeriodo);
                                        this.setState({
                                            fecha_inicio: dates.fecha_inicio,
                                            fecha_fin: dates.fecha_fin,
                                            periodo: newPeriodo,
                                        }, this.loadDashboardData);
                                    }}
                                />
                            </SView>
                            <SView col="xs-12 md-6 lg-8" flex   >
                                <SView style={{ alignItems: "flex-end", justifyContent: "flex-end" }} row center>
                                    {['hoy', 'semana', 'año'].map((item) => (
                                        <SButtom
                                            key={item}
                                            type={periodo === item ? 'danger' : 'outline'}
                                            onPress={() => this.handleChangePeriodo(item)}
                                            style={{ minWidth: 70, width: 70, height: 30, paddingHorizontal: 0, borderColor: STheme.color.gray + "66", }}
                                        >
                                            <SText>{item === 'hoy' ? 'Día' : item === 'semana' ? 'Semana' : 'Año'}</SText>
                                        </SButtom>
                                    ))}
                                </SView>
                            </SView>
                        </SView>

                        <SView col="xs-12" row center style={{ gap: 0, flexWrap: 'wrap', marginTop: 5 }} >

                            <SView col="xs-12 md-6 lg-8" row style={{ gap: 8, flexWrap: 'wrap' }} padding={8} >
                                <SButtom
                                    type={!selectedSucursal ? 'danger' : 'outline'}
                                    onPress={() => this.handleSucursalSelect(null)}
                                    style={{ minWidth: 80, height: 40 }}
                                >
                                    <SText>Todos</SText>
                                </SButtom>
                                {(sucursales || []).slice(0, 4).map((sucursal) => (
                                    <SButtom
                                        key={sucursal.key}
                                        type={selectedSucursal?.key === sucursal.key ? 'danger' : 'outline'}
                                        onPress={() => this.handleSucursalSelect(sucursal)}
                                        style={{ minWidth: 130, padding: 5, height: 40 }}
                                    >
                                        <SText>{sucursal.descripcion}</SText>
                                    </SButtom>
                                ))}
                            </SView>
                            <SView col="xs-12 md-6 lg-4" padding={8} card style={{ backgroundColor: STheme.color.secondary + "60" }}>
                                {/* <FechaFullFilter
                                    key_opciones={periodo === 'hoy' ? 'hoy' : periodo === 'año' ? 'este_año' : 'esta_semana'}
                                    fecha_inicio={fecha_inicio}
                                    fecha_fin={fecha_fin}
                                    onChange={(dates) => {
                                        this.setState({ fecha_inicio: dates.fecha_inicio, fecha_fin: dates.fecha_fin }, this.loadDashboardData);
                                    }}
                                /> */}
                                <SText fontSize={14} color={STheme.color.text}>Período seleccionado: {fecha_inicio} → {fecha_fin}</SText>
                                <SText fontSize={14} color={STheme.color.text}>Sucursal: {selectedBranchName}</SText>
                            </SView>
                            <SView col="xs-12" row style={{ gap: 8, flexWrap: 'wrap' }} padding={8} >
                                <SButtom
                                    type={!selectedTipoProducto ? 'danger' : 'outline'}
                                    onPress={() => this.handleTipoProductoSelect(null)}
                                    style={{ minWidth: 80, height: 40 }}
                                >
                                    <SText>Todos</SText>
                                </SButtom>
                                {(tipoProductoLista || []).map((tipoKey) => (
                                    <SButtom
                                        key={tipoKey}
                                        type={selectedTipoProducto === tipoKey ? 'danger' : 'outline'}
                                        onPress={() => this.handleTipoProductoSelect(tipoKey)}
                                        style={{ minWidth: 130, padding: 5, height: 40 }}
                                    >
                                        <SText>{this.getTipoProductoLabel(tipoKey)}</SText>
                                    </SButtom>
                                ))}
                            </SView>
                        </SView>

                        {/* <SHr style={{ marginVertical: 0 }} /> */}
                        {/* <SView col="xs-12" style={{ marginVertical: 10 }}>
                            <SText fontSize={14} color={STheme.color.gray}>Período seleccionado: {fecha_inicio} → {fecha_fin}</SText>
                            <SText fontSize={14} color={STheme.color.gray}>Sucursal: {selectedBranchName}</SText>
                        </SView> */}

                        {renderResumenTarjetas()}

                        {/* <SHr style={{ marginVertical: 10 }} /> */}

                        <SView col="xs-12" row style={{ flexWrap: 'wrap' }} >
                            <SView col="xs-12 lg-8" row padding={5} >
                                <SView
                                    col="xs-12"
                                    card
                                    style={{ padding: 15, borderRadius: 10, borderWidth: 1, borderColor: STheme.color.gray + "44", }}
                                >
                                    <SText fontSize={16} bold>{lineTitle}</SText>
                                    <SHr />
                                    {loading ? (
                                        <SText>Cargando datos...</SText>
                                    ) : dataTimeSeries.length === 0 ? (
                                        <SText>No hay datos para este período.</SText>
                                    ) : (
                                        <LineaRechartsBd
                                            data={dataTimeSeries}
                                            nameKey="label"
                                            valueKey="monto_total"
                                            height={320}
                                        />
                                    )}
                                </SView>
                            </SView>
                            <SView col="xs-12 lg-4" row padding={5} >
                                {/* <SView card
                                    col="xs-12"
                                    style={{ padding: 15, borderRadius: 10, borderWidth: 1, borderColor: STheme.color.gray + "44", }} >
                                    <SText fontSize={16} bold>Participación por sucursal</SText>
                                    <SHr />
                                    {loading ? (
                                        <SText>Cargando datos...</SText>
                                    ) : dataBranchShare.length === 0 ? (
                                        <SText>No hay datos por sucursal.</SText>
                                    ) : (
                                        <CircularRechartsBd
                                            data={dataBranchShare}
                                            nameKey="name"
                                            valueKey="value"
                                            height={320}
                                        />
                                    )}
                                </SView> */}
                                <SView
                                    col="xs-12"
                                    card
                                    style={{ padding: 15, borderRadius: 10, borderWidth: 1, borderColor: STheme.color.gray + "44", }}
                                >
                                    <SText fontSize={16} bold>Ventas por método de pago</SText>
                                    <SHr />
                                    {loading ? (
                                        <SText>Cargando datos...</SText>
                                    ) : dataMetodoPago.length === 0 ? (
                                        <SText>No hay datos disponibles.</SText>
                                    ) : (
                                        <CircularRechartsBd
                                            data={dataMetodoPago}
                                            nameKey="metodo_pago"
                                            valueKey="total_bs"
                                            height={320}
                                        />
                                    )}
                                </SView>
                            </SView>
                        </SView>





                        <SView col="xs-12" row>
                            <SView col="xs-12 lg-6" row padding={5} >
                                <SView
                                    col="xs-12"
                                    card
                                    style={{ padding: 15, borderRadius: 10, borderWidth: 1, borderColor: STheme.color.gray + "44", }}
                                >
                                    <SText fontSize={16} bold>Ventas por Sucursal</SText>
                                    <SHr />
                                    {loading ? (
                                        <SText>Cargando datos...</SText>
                                    ) : dataBranchShareBarras.length === 0 ? (
                                        <SText>No hay datos por sucursal.</SText>
                                    ) : (
                                        <BarraRechartsBd
                                            data={dataBranchShareBarras}
                                            nameKey="name"
                                            valueKey="value"
                                            valueKey2="cantidad"
                                            key="key"
                                            height={320}
                                            onClick={(data) => {
                                                const keySucursal = data?.activePayload[0]?.payload?.key;
                                                console.log("barraaaas:", data);
                                                console.log(keySucursal);
                                                // const sucursalSeleccionada = sucursales.find(s => s.key === keySucursal);
                                                // this.handleSucursalSelect(sucursalSeleccionada || null);
                                                console.log("Sucursal seleccionada en gráfico de barras:", keySucursal);
                                                // SNavigation.navigate("/sucursal", {
                                                //     key: keySucursal
                                                // });
                                                DetalleTabla.openPopup({
                                                    // estado: "por_cerrar",
                                                    estado: "fuera_tiempo_",
                                                    key_sucursal: keySucursal,
                                                    fecha_inicio: this.state.fecha_inicio,
                                                    fecha_fin: this.state.fecha_fin,
                                                    // estado:"falta_matricula",
                                                })

                                            }}
                                        />
                                    )}
                                </SView>
                            </SView>
                            <SView col="xs-12 lg-6" padding={5}>
                                <SView card
                                    col="xs-12"
                                    style={{ padding: 15, borderRadius: 10, borderWidth: 1, borderColor: STheme.color.gray + "44", }} >
                                    <SText fontSize={16} bold>Participación por sucursal</SText>
                                    <SHr />
                                    {loading ? (
                                        <SText>Cargando datos...</SText>
                                    ) : dataBranchShare.length === 0 ? (
                                        <SText>No hay datos por sucursal.</SText>
                                    ) : (
                                        <CircularRechartsBd
                                            data={dataBranchShare}
                                            nameKey="name"
                                            valueKey="value"
                                            height={320}
                                        />
                                    )}
                                </SView>

                            </SView>
                        </SView>





                        <SView col="xs-12" row>
                            <SView col="xs-12 lg-12" row padding={5} >
                                <SView
                                    col="xs-12"
                                    card
                                    style={{ padding: 15, borderRadius: 10, borderWidth: 1, borderColor: STheme.color.gray + "44", }}
                                >
                                    <SText fontSize={16} bold>TOP 5 Productos</SText>
                                    <SHr />
                                    {loading ? (
                                        <SText>Cargando datos...</SText>
                                    ) : dataTopProducts.length === 0 ? (
                                        <SText>No hay productos disponibles.</SText>
                                    ) : (
                                        <BarraRechartsBd
                                            data={dataTopProducts}
                                            nameKey="producto"
                                            valueKey="cantidad_total_vendida"
                                            height={320}
                                        />
                                    )}
                                </SView>
                            </SView>
                            {/* <SView col="xs-12 lg-6" padding={5}>
                                <SView
                                    col="xs-12"
                                    card
                                    style={{ padding: 15, borderRadius: 10, borderWidth: 1, borderColor: STheme.color.gray + "44", }}
                                >
                                    <SText fontSize={16} bold>Ventas por método de pago</SText>
                                    <SHr />
                                    {loading ? (
                                        <SText>Cargando datos...</SText>
                                    ) : dataMetodoPago.length === 0 ? (
                                        <SText>No hay datos disponibles.</SText>
                                    ) : (
                                        <CircularRechartsBd
                                            data={dataMetodoPago}
                                            nameKey="metodo_pago"
                                            valueKey="total_bs"
                                            height={320}
                                        />
                                    )}
                                </SView>
                            </SView> */}
                        </SView>




                        {/* <SHr style={{ marginVertical: 10 }} /> */}

                        <SView col="xs-12" padding={8}>
                            <SView
                                col="xs-12"
                                card
                                style={{ padding: 15, borderRadius: 10, borderWidth: 1, borderColor: STheme.color.gray + "44", }}
                            >
                                <SText fontSize={16} bold>Detalle de ventas por producto</SText>
                                <SHr />
                                {loading ? (
                                    <SText>Cargando datos...</SText>
                                ) : dataTopProducts.length === 0 ? (
                                    <SText>No hay datos de productos.</SText>
                                ) : (
                                    <DinamicTable
                                        language="es"
                                        hiddenMenu
                                        textTitleStyle={{ fontSize: 12, lineHeight: 14 }}
                                        colors={{ header: "#2E86AB", textHeader: "white" }}
                                        cellStyle={{ padding: 4 }}
                                        textStyle={{ fontSize: 10 }}
                                        loadData={async () => dataTopProducts}
                                    >
                                        <DinamicTable.Col
                                            key="producto"
                                            label='Producto'
                                            width={200}
                                            data={e => e.row.producto}
                                        />
                                        <DinamicTable.Col
                                            key="cantidad_total_vendida"
                                            label='Cantidad Vendida'
                                            width={100}
                                            data={e => e.row.cantidad_total_vendida}
                                        />
                                        <DinamicTable.Col
                                            key="total"
                                            label='Total Bs'
                                            width={120}
                                            data={e => `Bs. ${Number(e.row.total).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
                                        />
                                    </DinamicTable>
                                )}
                            </SView>
                        </SView>
                    </SView>
                </ScrollView>
            </SPage>
        );
    }
}