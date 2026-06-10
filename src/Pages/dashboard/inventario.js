import React from "react";
import { SPage, SView, SText, SHr, STheme, SButtom, SNavigation, SForm } from "servisofts-component";
import { DinamicTable } from 'servisofts-table';
import MDL from "../../MDL";
import { ScrollView } from "react-native-gesture-handler";
import FechaFullFilter from "../../Components/FechaFullFilter";
import BarraRechartsBd from "../recharts/Components/BarraRechartsBd";
import LineaRechartsBd from "../recharts/Components/LineaRechartsBd";
import CircularRechartsBd from "../recharts/Components/CircularRechartsBd";
import DetalleTabla from "./Components/DetalleTabla";
import Model from "../../Model";
import InputSelector from "../../Components/Selectores/InputSelector";

export default class inventario extends React.Component {

    state = {
        periodo: "semana",
        fecha_inicio: this.formatDate(
            new Date(new Date().setDate(new Date().getDate() - 6))
        ),
        fecha_fin: this.formatDate(new Date()),

        empresaSeleccionada: null,
        sucursales: [],
        selectedSucursal: null,

        almacenes: [],
        categorias: [],

        dataStockByCategoria: [],
        dataStockByAlmacen: [],
        dataProductosMayorStock: [],
        dataProductosBajoStock: [],
        dataDistribucionProductos: [],

        loading: true,
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

    // formatDate = (date) => { };
    // startOfWeek = (date) => { };
    // endOfWeek = (date) => { };
    // startOfMonth = (date) => { };
    // endOfMonth = (date) => { };
    // startOfYear = (date) => { };
    // endOfYear = (date) => { };

    // getRangeForPeriodo = (periodo) => { };
    // getPeriodoFromKeyOpciones = (key, fi, ff) => { };
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

    handleChangePeriodo = (periodo) => {
        const range = this.getRangeForPeriodo(periodo);

        this.setState({
            periodo,
            ...range
        }, this.loadDashboardData);
    };

    handleSucursalSelect = (sucursal) => {
        this.setState({
            selectedSucursal: sucursal
        }, this.loadDashboardData);
    };

    // ==========================
    // INIT
    // ==========================

    initDashboard = async () => {

        // const selected = MDL.empresa.select;
        const selected = MDL.empresa.select || await waitForSelect();
        if (!selected) {
            if (this._mounted) {
                this.setState({ loading: false });
            }
            return;
        }

        const sucursales =
            await MDL.empresa.getAllSucursales();

        const almacenes =
            await MDL.inventario.getAllAlmacen();

        const categorias =
            // await MDL.inventario.getAllCategoria();
            await MDL.inventario.getAllProducto?.() || []
                .reduce((acc, producto) => {
                    const cat = producto.categoria || "Sin categoría";
                    if (!acc.includes(cat)) {
                        acc.push(cat);
                    }
                    return acc;
                }, []).map(categoria => ({
                    key: categoria,
                    descripcion: categoria
                }));


        this.setState({
            empresaSeleccionada: selected,
            sucursales,
            almacenes,
            categorias
        }, this.loadDashboardData);
    };

    // ==========================
    // DATA
    // ==========================

    loadDashboardData = async () => {
        console.log("KEYEMPRESA_:", empresaSeleccionada, fecha_inicio, fecha_fin, selectedSucursal);
        const {
            empresaSeleccionada,
            fecha_inicio,
            fecha_fin,
            selectedSucursal
        } = this.state;

        // const { empresaSeleccionada } = this.state;
        if (!empresaSeleccionada) return;

        this.setState({
            loading: true
        });

        await Promise.all([
            this.loadProductosMayorStock(
                empresaSeleccionada.key,
                fecha_inicio,
                fecha_fin,
                selectedSucursal?.key
            ),

            this.loadStockByCategoria(
                empresaSeleccionada.key,
                fecha_inicio,
                fecha_fin,
                selectedSucursal?.key
            ),

            this.loadStockByAlmacen(
                empresaSeleccionada.key,
                fecha_inicio,
                fecha_fin,
                selectedSucursal?.key
            ),

            this.loadProductosBajoStock(
                empresaSeleccionada.key,
                fecha_inicio,
                fecha_fin,
                selectedSucursal?.key
            ),

            this.loadDistribucionProductos(
                empresaSeleccionada.key,
                fecha_inicio,
                fecha_fin,
                selectedSucursal?.key
            ),
        ]);

        this.setState({
            loading: false
        });
    };

    loadProductosMayorStock = async (
        keyEmpresa,
        fecha_inicio,
        fecha_fin,
        keySucursal
    ) => {
        console.log("KEYEMPRESA_:", keyEmpresa, fecha_inicio, fecha_fin, keySucursal);
        const res =
            await MDL.compra_venta.execute_function(
                "productos_mayor_stock_compra_venta_inventario",
                // "productos_mayor_stock_compra_venta",
                [
                    keyEmpresa,
                    fecha_inicio,
                    fecha_fin,
                    keySucursal
                ]
            );

        console.log("Productos mayor stock:", res);

        this.setState({
            dataProductosMayorStock: res
        });
    };

    // loadStockByCategoria = async (...) => {};
    loadStockByCategoria = async (keyEmpresa) => {
        try {
            // Obtener todos los productos
            const productos = await MDL.inventario.getAllProducto?.() || [];

            // Agrupar por categoría y sumar stock
            const stockPorCategoria = {};

            productos.forEach(producto => {
                const categoria = producto.categoria || "Sin categoría";
                const stock = Number(producto.stock ?? producto.cantidad ?? 0);

                if (!stockPorCategoria[categoria]) {
                    stockPorCategoria[categoria] = 0;
                }
                stockPorCategoria[categoria] += stock;
            });

            const data = Object.entries(stockPorCategoria).map(([categoria, stock]) => ({
                name: categoria,
                pv: stock,
                total: stock,
            })).sort((a, b) => b.pv - a.pv);

            console.log("Stock por categoría:", data);

            if (this._mounted) {
                this.setState({ dataStockByCategoria: data });
            }
        } catch (e) {
            console.error("Error en loadStockByCategoria:", e);
            if (this._mounted) {
                this.setState({ dataStockByCategoria: [] });
            }
        }
    };
    // loadStockByAlmacen = async (...) => { };
    loadStockByAlmacen = async (keyEmpresa, fecha_inicio,
        fecha_fin,
        keySucursal) => {
        try {
            const almacenes = this.state.almacenes || [];
            // const productos = await MDL.inventario.getAllProducto?.() || [];
            const productos = await MDL.inventario.getAllModeloStock?.(keySucursal) || [];

            const stockPorAlmacen = {};
            console.log("Almacenes obtenidos:", almacenes);

            almacenes.forEach(almacen => {
                stockPorAlmacen[almacen.key] = {
                    name: almacen.descripcion || almacen.nombre || "Almacén",
                    cantidad: 0,
                };
            });
            console.log("PRODUC_:", productos);
            productos.forEach(producto => {
                const almacen = producto.key_almacen || producto.almacen;
                // const stock = Number(producto.stock ?? producto.cantidad ?? 0);

                // if (stockPorAlmacen[almacen]) {
                //     console.log("entro")
                //     stockPorAlmacen[almacen].cantidad += stock;
                // }
                console.log(producto.stock)
                const stock = Number(producto.stock ?? producto.cantidad ?? 0);
                stockPorAlmacen.cantidad += stock;

            });
            console.log("Stock por almacén sin formato:", productos);
            console.log("ALMACEN", stockPorAlmacen)
            const data = Object.values(stockPorAlmacen)
                .sort((a, b) => b.cantidad - a.cantidad)
                .map(item => ({
                    name: item.name,
                    value: item.cantidad,
                }));

            console.log("Stock por almacén:", data);

            if (this._mounted) {
                this.setState({ dataStockByAlmacen: data });
            }
        } catch (e) {
            console.error("Error en loadStockByAlmacen:", e);
            if (this._mounted) {
                this.setState({ dataStockByAlmacen: [] });
            }
        }
    };
    // loadProductosBajoStock = async (...) => { };
    loadProductosBajoStock = async (keyEmpresa) => {
        try {
            const productos = await MDL.inventario.getAllProductos?.(keyEmpresa) || [];
            console.log("Productos obtenidos para bajo stock:", productos);
            // Productos con stock menor al 20% de su stock mínimo (o stock < 10 si no tienen mínimo)
            const bajoStock = productos
                .filter(p => {
                    const stock = Number(p.stock ?? p.cantidad ?? 0);
                    const stockMinimo = Number(p.stock_minimo ?? 10);
                    return stock <= (stockMinimo * 0.2);
                })
                .map(p => ({
                    producto: p.descripcion || p.nombre || "Producto",
                    stock_actual: Number(p.stock ?? p.cantidad ?? 0),
                    stock_minimo: Number(p.stock_minimo ?? 10),
                    porcentaje: Math.round((Number(p.stock ?? 0) / Number(p.stock_minimo ?? 1)) * 100),
                }))
                .sort((a, b) => a.stock_actual - b.stock_actual)
                .slice(0, 10);

            console.log("Productos bajo stock:", bajoStock);

            if (this._mounted) {
                this.setState({ dataProductosBajoStock: bajoStock });
            }
        } catch (e) {
            console.error("Error en loadProductosBajoStock:", e);
            if (this._mounted) {
                this.setState({ dataProductosBajoStock: [] });
            }
        }
    };
    // loadDistribucionProductos = async (...) => { };
    loadDistribucionProductos = async (
        keyEmpresa,
        fecha_inicio,
        fecha_fin,
        keySucursal
    ) => {
        console.log("keyEmpresa:", keyEmpresa);
        try {
            // const productos = await MDL.inventario.getAllProductos?.(keyEmpresa) || [];
            const productos =
                await MDL.inventario.execute_function(
                    "get_modelos_con_stock_sucursal_inventario",
                    // "productos_mayor_stock_compra_venta",
                    [
                        keyEmpresa,
                        // fecha_inicio,
                        // fecha_fin,
                        keySucursal
                    ]
                );
            console.log("PRODUCTOS:", productos);
            // Agrupar por categoría con conteo
            const distribucion = {};

            productos.forEach(producto => {
                const categoria = producto.categoria || "Sin categoría";
                distribucion[categoria] = (distribucion[categoria] || 0) + 1;
            });

            console.log("Distribución sin formato:", distribucion);
            const data = Object.entries(distribucion)
                .map(([name, value]) => ({
                    name,
                    value,
                }))
                .sort((a, b) => b.value - a.value);

            console.log("Distribución de productos:", data);

            if (this._mounted) {
                this.setState({ dataDistribucionProductos: data });
            }
        } catch (e) {
            console.error("Error en loadDistribucionProductos:", e);
            if (this._mounted) {
                this.setState({ dataDistribucionProductos: [] });
            }
        }
    };



    // ==========================
    // RENDER TARJETAS
    // ==========================

    renderResumenTarjetas = () => {

        const {
            dataProductosMayorStock,
            dataProductosBajoStock,
            dataStockByAlmacen
        } = this.state;

        const stockTotal =
            dataProductosMayorStock.reduce(
                (sum, item) =>
                    sum + Number(item.stock_actual),
                0
            );

        return (
            <SView row>

                <CardResumen
                    label="Stock Total"
                    value={stockTotal}
                />

                <CardResumen
                    label="Productos"
                    value={dataProductosMayorStock.length}
                />

                <CardResumen
                    label="Almacenes"
                    value={dataStockByAlmacen.length}
                />

                <CardResumen
                    label="Bajo Stock"
                    value={dataProductosBajoStock.length}
                />

            </SView>
        );
    };

    // ==========================
    // RENDER
    // ==========================

    render() {

        const {
            periodo,
            fecha_inicio,
            fecha_fin,
            sucursales,
            selectedSucursal,
            loading
        } = this.state;

        return (
            <SPage title="Dashboard de Inventario">

                <ScrollView>

                    <SView padding={16}>

                        <SText
                            fontSize={18}
                            bold
                        >
                            Dashboard de Inventario
                        </SText>

                        <SHr />

                        {/* FILTROS */}

                        <SView col="xs-12" row card center padding={8} >
                            <SView col={"xs-12 md-4"}>
                                <SForm
                                    style={{ zIndex: 99, height: 65, marginTop: -35 }}
                                    inputs={{
                                        sucursal: {
                                            // label: "Sucursales",
                                            placeholder: "Seleccione una sucursal",
                                            type: "custom",
                                            customInputClass: InputSelector,
                                            defaultValue: selectedSucursal?.key ?? "todos",
                                            options: [
                                                {
                                                    label: "Todas las sucursales",
                                                    value: "todos",
                                                    data: null
                                                },
                                                ...(sucursales || []).map(item => ({
                                                    label: item.descripcion,
                                                    value: item.key,
                                                    data: item
                                                }))
                                            ],
                                            onSelect: (val) => {
                                                this.handleSucursalSelect(val.data);
                                            }
                                        }
                                    }}
                                />
                            </SView>
                            <SView row col="xs-2" />
                            <SView
                                col="xs-12 md-4 lg-4"
                            >

                                <FechaFullFilter
                                    fecha_inicio={fecha_inicio}
                                    fecha_fin={fecha_fin}
                                    onChange={(dates) => {

                                        const periodo =
                                            this.getPeriodoFromKeyOpciones(
                                                dates.key_opciones,
                                                dates.fecha_inicio,
                                                dates.fecha_fin
                                            );

                                        this.setState({
                                            fecha_inicio:
                                                dates.fecha_inicio,
                                            fecha_fin:
                                                dates.fecha_fin,
                                            periodo
                                        }, this.loadDashboardData);

                                    }}
                                />

                            </SView>

                            <SView
                                col="xs-12 md-2 lg-2"
                                flex
                            >
                                <SView style={{ alignItems: "flex-end", justifyContent: "flex-end" }} row center>

                                    {[
                                        'Día',
                                        'Semana',
                                        // 'este_mes',
                                        'Año'
                                    ].map(item => (

                                        <SButtom
                                            key={item}
                                            style={{ minWidth: 70, width: 70, height: 30, paddingHorizontal: 0 }}
                                            type={
                                                periodo === item
                                                    ? 'danger'
                                                    : 'outline'
                                            }
                                            onPress={() =>
                                                this.handleChangePeriodo(item)
                                            }
                                        >
                                            <SText>
                                                {item}
                                            </SText>
                                        </SButtom>

                                    ))}

                                </SView>
                            </SView>
                        </SView>

                        {/* SUCURSALES */}

                        {/* <SView
                            col="xs-12"
                            row
                            padding={8}
                        >

                            <ScrollView horizontal>

                                <SButtom
                                    type={
                                        !selectedSucursal
                                            ? 'danger'
                                            : 'outline'
                                    }
                                    onPress={() =>
                                        this.handleSucursalSelect(null)
                                    }
                                >
                                    <SText>
                                        Todas
                                    </SText>
                                </SButtom>

                                {sucursales.map(
                                    sucursal => (

                                        <SButtom
                                            key={sucursal.key}
                                            type={
                                                selectedSucursal?.key ===
                                                    sucursal.key
                                                    ? 'danger'
                                                    : 'outline'
                                            }
                                            onPress={() =>
                                                this.handleSucursalSelect(
                                                    sucursal
                                                )
                                            }
                                        >
                                            <SText>
                                                {sucursal.descripcion}
                                            </SText>
                                        </SButtom>

                                    )
                                )}

                            </ScrollView>

                        </SView> */}

                        {/* TARJETAS */}

                        {this.renderResumenTarjetas()}

                        {/* GRAFICO PRINCIPAL */}

                        <SView card padding={15}>

                            <SText bold>
                                Stock por Producto
                            </SText>

                            <BarraRechartsBd
                                data={this.state.dataProductosMayorStock}
                                nameKey="producto"
                                valueKey="stock_actual"
                                height={320}
                            />

                        </SView>

                        {/* DOS GRAFICOS */}

                        <SView row col="xs-12" gap={16}>

                            <SView padding={10}
                                col="xs-12 lg-6"
                            >
                                <SView center card padding={5}>
                                    <CircularRechartsBd
                                        data={this.state.dataDistribucionProductos}
                                    />
                                </SView>
                            </SView>

                            <SView padding={10}
                                col="xs-12 lg-6"
                            >
                                <SView center card padding={5}>
                                    <CircularRechartsBd
                                        data={this.state.dataStockByAlmacen}
                                    />
                                </SView>
                            </SView>

                        </SView>

                        {/* BAJO STOCK */}

                        <SView card padding={15}>

                            <SText
                                color={STheme.color.danger}
                                bold
                            >
                                Productos con Bajo Stock
                            </SText>

                            {/* listado */}

                        </SView>

                        {/* TABLA */}

                        <SView card padding={15}>

                            <SText bold>
                                Detalle Inventario
                            </SText>

                            <DinamicTable>
                                ...
                            </DinamicTable>

                        </SView>

                    </SView>

                </ScrollView>

            </SPage>
        );
    }
}

CardResumen = ({ label, value }) => (
    <SView
        card
        padding={16}
        margin={8}
        style={{
            flex: 1,
            minWidth: 120,
        }}
    >
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
);