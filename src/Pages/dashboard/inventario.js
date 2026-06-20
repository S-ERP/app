import React from "react";
import { SPage, SView, SText, SHr, STheme, SButtom, SNavigation, SForm, SIcon } from "servisofts-component";
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
        almacenes: [],

        selectedSucursal: null,
        selectedAlmacen: null,


        categorias: [],

        dataStockByCategoria: [],
        dataStockByAlmacen: [],
        dataStockBySucursal: [],
        dataProductosMayorStock: [],
        dataProductosBajoStock: [],
        dataDistribucionProductos: [],
        dataValorProductosPorSucursal: [],
        dataValorProductos: [],
        dataValorInventario: [],

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

    // handleSucursalSelect = (sucursal) => {
    //     this.setState({
    //         selectedSucursal: sucursal
    //     }, this.loadDashboardData);
    // };
    handleSucursalSelect = async (sucursal) => {

        let almacenes = [];
        let almacenesAll = await MDL.inventario.getAllAlmacen();
        if (sucursal?.key) {

            almacenes = almacenesAll.filter(
                a => a.key_sucursal === sucursal?.key
            );
            console.log(almacenes)
        } else {
            console.log("ninguno")
            almacenes= almacenesAll
        }

        this.setState({
            selectedSucursal: sucursal,
            selectedAlmacen: null,
            almacenes
        }, this.loadDashboardData);
    };

    handleAlmacenSelect = (almacen) => {

        this.setState({
            selectedAlmacen: almacen
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

        const empresa = await MDL.empresa.getFull();
        if (!empresa) throw new Error("No se pudo obtener la empresa.");
        console.log("EMPRESA_", empresa)
        const monedaBase = empresa.monedas.find(
            moneda => moneda.tipo === "base"
        );

        const sucursales =
            await MDL.empresa.getAllSucursales();

        const almacenesAll =
            await MDL.inventario.getAllAlmacen();
        console.log(almacenesAll)
        const almacenes = almacenesAll.filter(almacen =>
            sucursales.some(sucursal =>
                sucursal.key === almacen.key_sucursal
            )
        );
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
            categorias,
            monedaBase
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
            selectedSucursal,
            selectedAlmacen
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
                selectedSucursal?.key,
                selectedAlmacen?.key
            ),

            this.loadStockByCategoria(
                empresaSeleccionada.key,
                fecha_inicio,
                fecha_fin,
                selectedSucursal?.key,
                selectedAlmacen?.key
            ),

            this.loadStockByAlmacen(
                empresaSeleccionada.key,
                fecha_inicio,
                fecha_fin,
                selectedSucursal?.key,
                selectedAlmacen?.key
            ),
            this.loadStockBySucursal(
                empresaSeleccionada.key,
                fecha_inicio,
                fecha_fin,
                selectedSucursal?.key,
                selectedAlmacen?.key
            ),

            this.loadProductosBajoStock(
                empresaSeleccionada.key,
                // fecha_inicio,
                // fecha_fin,
                selectedSucursal?.key,
                selectedAlmacen?.key
            ),

            this.loadDistribucionProductos(
                empresaSeleccionada.key,
                fecha_inicio,
                fecha_fin,
                selectedSucursal?.key,
                selectedAlmacen?.key
            ),
            this.loadValorInventario(
                empresaSeleccionada.key,
                // fecha_inicio,
                // fecha_fin,
                selectedSucursal?.key,
                selectedAlmacen?.key
            ),
            // this.loadValorInventarioPorSucursal(
            //     empresaSeleccionada.key,
            //     // fecha_inicio,
            //     // fecha_fin,
            //     // selectedSucursal?.key
            // ),

        ]);

        this.setState({
            loading: false
        });
    };

    loadProductosMayorStock = async (
        keyEmpresa,
        fecha_inicio,
        fecha_fin,
        keySucursal,
        keyAlmacen
    ) => {
        console.log("KEYEMPRESA_:", keyEmpresa, fecha_inicio, fecha_fin, keySucursal, keyAlmacen);
        const res =
            await MDL.compra_venta.execute_function(
                "productos_mayor_stock_compra_venta_inventario",
                // "productos_mayor_stock_compra_venta",
                [
                    keyEmpresa,
                    fecha_inicio,
                    fecha_fin,
                    keySucursal,
                    keyAlmacen
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
            const sucursales = this.state.sucursales || [];
            // const productos = await MDL.inventario.getAllProducto?.() || [];
            const productos = await MDL.inventario.getAllModeloStock?.(keySucursal) || [];

            const stockPorAlmacen = {};
            console.log("sucursales obtenidos:", sucursales);

            sucursales.forEach(sucursal => {
                stockPorAlmacen[sucursal.key] = {
                    name: sucursal.descripcion || sucursal.nombre || "Sucursal",
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

    loadStockBySucursal__ = async (keyEmpresa, fecha_inicio,
        fecha_fin,
        keySucursal) => {
        try {
            const sucursales = this.state.sucursales || [];
            // const productos = await MDL.inventario.getAllProducto?.() || [];
            // const productos = await MDL.inventario.getAllModeloStock?.(keySucursal) || [];

            const stockPorSucursal = {};
            console.log("sucursales obtenidos:", sucursales);

            const sucursalesConStock = await Promise.all(
                sucursales.map(async (sucursal) => {
                    // if (sucursal?.key) return;
                    console.log("keyyyy")

                    console.log(sucursal.key)
                    const productos = await MDL.inventario.getAllModeloStock?.(sucursal?.key_ ?? "", sucursal?.key ?? "") || [];
                    console.log("productos", productos)
                    const stockTotal = productos.reduce((sum, item) => {
                        return sum + (parseFloat(item.stock) || 0);
                    }, 0);
                    console.log("stockTotal", stockTotal)
                    return {
                        name: sucursal.descripcion,
                        value: stockTotal,
                        key_sucursal: sucursal.key
                    };
                })
            );


            console.log("sucursalesConStock", sucursalesConStock)


            if (this._mounted) {
                this.setState({ dataStockBySucursal: sucursalesConStock });
                this.setState({ loading: false });
            }
        } catch (e) {
            console.error("Error en loadStockBySucursal:", e);
            if (this._mounted) {
                this.setState({ dataStockBySucursal: [] });
            }
        }
    };

    loadStockBySucursal = async (keyEmpresa, fecha_inicio,
        fecha_fin,
        keySucursal, keyAlmacen) => {
        try {
            const sucursales = this.state.sucursales || [];
            // const productos = await MDL.inventario.getAllProducto?.() || [];
            // const productos = await MDL.inventario.getAllModeloStock?.(keySucursal) || [];

            const stockPorSucursal = {};
            console.log("sucursales obtenidos:", sucursales);

            // const sucursalesConStock = await Promise.all(
            //     sucursales.map(async (sucursal) => {
            //         // if (sucursal?.key) return;
            //         console.log("keyyyy")

            //         console.log(sucursal.key)
            //         const productos = await MDL.inventario.getAllModeloStock?.(sucursal?.key_ ?? "", sucursal?.key ?? "") || [];
            //         console.log("productos", productos)
            //         const stockTotal = productos.reduce((sum, item) => {
            //             return sum + (parseFloat(item.stock) || 0);
            //         }, 0);
            //         console.log("stockTotal", stockTotal)
            //         return {
            //             name: sucursal.descripcion,
            //             value: stockTotal,
            //             key_sucursal: sucursal.key
            //         };
            //     })
            // );
            const sucursalesConStock = await MDL.inventario.execute_function("get_stock_por_sucursal_inventario", [keyEmpresa, keySucursal, keyAlmacen]);

            console.log("sucursalesConStock", sucursalesConStock)

            const nuevoData = sucursalesConStock.map(item => ({
                ...item,
                name: sucursales.find(
                    suc => suc.key === item.key_sucursal
                )?.descripcion || ""
            }));

            console.log("NUEVODATA", nuevoData)

            const dataResumen = nuevoData.map(item => ({
                ...item,
                stock_total: (item.productos || []).reduce(
                    (sum, p) => sum + Number(p.stock || 0),
                    0
                ),
                valor_inventario_total: (item.productos || []).reduce(
                    (sum, p) => sum + Number(p.valor_inventario || 0),
                    0
                ).toFixed(2)
            }));
            console.log("dataResumen", dataResumen)
            if (this._mounted) {
                this.setState({ dataStockBySucursal: dataResumen });
                this.setState({ loading: false });
            }
        } catch (e) {
            console.error("Error en loadStockBySucursal:", e);
            if (this._mounted) {
                this.setState({ dataStockBySucursal: [] });
            }
        }
    };




    // loadProductosBajoStock = async (...) => { };
    loadProductosBajoStock = async (keyEmpresa, keySucursal) => {
        console.log(keyEmpresa)
        console.log(keySucursal)
        this.setState({ dataProductosBajoStock: [] });
        try {
            // const productos = await MDL.inventario.execute_function("calcular_valor_stock", [keyEmpresa]);
            const productos = await MDL.inventario.execute_function("calcular_valor_stock_inventario", [keyEmpresa, keySucursal]);
            console.log("Productos obtenidos para bajo stock:", productos);
            // Productos con stock menor al 20% de su stock mínimo (o stock < 10 si no tienen mínimo)
            // const bajoStock = productos
            //     .filter(p => {
            //         const stock = Number(p.stock_actual ?? p.cantidad ?? 0);
            //         // const stockMinimo = Number(p.stock_minimo ?? 10);
            //         const stockMinimo = Number(15);
            //         // return stock <= (stockMinimo * 0.2);
            //         return stock <= (stockMinimo);
            //     })
            //     .map(p => ({
            //         producto: p.modelo || p.nombre || "Producto",
            //         stock_actual: Number(p.stock_actual ?? p.cantidad ?? 0),
            //         // stock_minimo: Number(p.stock_minimo ?? 10),
            //         // porcentaje: Math.round((Number(p.stock ?? 0) / Number(p.stock_minimo ?? 1)) * 100),
            //     }))
            //     .sort((a, b) => a.stock_actual - b.stock_actual)
            //     .slice(0, 10);
            const bajoStock = productos
                .filter(p => Number(p.stock_actual) < 10)
                .map(p => ({
                    producto: p.modelo || p.nombre || "Producto",
                    stock: Number(p.stock_actual)
                }))
                .sort((a, b) => b.stock - a.stock)
            // .slice(0, 10);

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
        // console.log("keyEmpresa:", keyEmpresa);
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


    loadValorInventarioPorSucursal = async (
        keyEmpresa,
        // fecha_inicio,
        // fecha_fin,
        // keySucursal
    ) => {
        // console.log("keyEmpresa:", keyEmpresa);
        try {
            // const productos = await MDL.inventario.getAllProductos?.(keyEmpresa) || [];
            const productos =
                await MDL.compra_venta.execute_function(
                    "get_valor_inventario_por_sucursal",
                    // "productos_mayor_stock_compra_venta",
                    [
                        keyEmpresa,
                        // fecha_inicio,
                        // fecha_fin,
                        // keySucursal
                    ]
                );
            console.log("PROD__:", productos);
            // Agrupar por categoría con conteo
            const valor = {};
            const raw = Array.isArray(productos) ? productos : (productos?.data ?? productos?.result ?? []);
            const data = raw.map(item => ({
                producto: item.producto ?? "Sin nombre",
                valor_inventario: item.valor_inventario ?? 0
            }));

            console.log(data);

            // productos.forEach(producto => {
            //     const categoria = producto.categoria || "Sin categoría";
            //     valor[categoria] = (valor[categoria] || 0) + 1;
            // });

            // console.log("VALOR INVENTARIO:", valor);
            // const data = Object.entries(valor)
            //     .map(([name, value]) => ({
            //         name,
            //         value,
            //     }))
            //     .sort((a, b) => b.value - a.value);

            console.log("valor de productos:", data);

            if (this._mounted) {
                this.setState({ dataValorProductosPorSucursal: data });
            }
        } catch (e) {
            console.error("Error en loadValorInventarioPorSucursal:", e);
            if (this._mounted) {
                this.setState({ dataValorProductosPorSucursal: [] });
            }
        }
    };

    loadValorInventario = async (keyEmpresa, keySucursal, keyAlmacen) => {
        this.setState({ dataValorInventario: [] });
        try {
            const res = await MDL.inventario.execute_function("calcular_valor_stock_inventario", [keyEmpresa, keySucursal, keyAlmacen]);
            console.log("RESULTADO", res)
            const raw = Array.isArray(res) ? res : (res?.data ?? res?.result ?? []);
            const data = raw.map(item => ({
                key_modelo: item.key_modelo ?? "",
                modelo: item.modelo ?? "Sin nombre",
                stock_actual: item.stock_actual ?? 0,
                precio_compra_unitario: item.precio_compra_unitario ?? 0,
                valor_inventario: item.valor_inventario ?? 0
            }));
            console.log("data", data)
            if (this._mounted) this.setState({ dataValorInventario: data, loadingValorInventario: false });
        } catch (e) {
            console.error("Error en calcular_valor_stock:", e);
            if (this._mounted) this.setState({ loadingValorInventario: false });
            if (this._mounted) {
                this.setState({ dataValorInventario: [] });
            }


        }
    };

    //   const res = await MDL.compra_venta.execute_function("valor_compra_venta", [keyEmpresa]);
    //             const raw = Array.isArray(res) ? res : (res?.data ?? res?.result ?? []);
    //             const data = raw.map(item => ({
    //                 producto: item.producto ?? "Sin nombre",
    //                 stock_actual: item.stock_actual ?? 0,
    //                 precio_compra: item.precio_compra ?? 0,
    //                 valor_inventario: item.valor_inventario ?? 0
    //             }));

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

        const {
            dataProductosMayorStock,
            dataProductosBajoStock,
            dataStockByAlmacen,
            sucursales
        } = this.state;

        console.log(dataProductosBajoStock)

        const stockTotal =
            dataProductosMayorStock.reduce(
                (sum, item) =>
                    sum + Number(item.stock_actual),
                0
            );

        return (
            <SView row>

                {/* <CardResumen
                    label="Stock Total"
                    value={stockTotal}
                    icon="tpIn"
                />

                <CardResumen
                    label="Productos"
                    value={dataProductosMayorStock.length}
                    icon="blender/group"
                />

                <CardResumen
                    label="Sucursales"
                    value={sucursales.length}
                    icon="iconHome"
                />

                <CardResumen
                    label="Bajo Stock"
                    value={dataProductosBajoStock.length}
                    icon="AlertOutline"
                /> */}

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
            selectedAlmacen,
            loading,
            dataValorInventario,
            loadingValorInventario,
            dataProductosBajoStock,
            dataStockBySucursal,
            monedaBase,
            almacenes

        } = this.state;
        const cellstyle = { padding: 4 };
        const size = 80;
        console.log("monedaBase", monedaBase)
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
                            <SView col={"xs-12 md-4"}>
                                <SForm
                                    style={{ zIndex: 99, height: 65, marginTop: -35 }}
                                    inputs={{
                                        sucursal: {
                                            // label: "Sucursales",
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
                            {/* <SView center
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

                            </SView> */}

                            {/* <SView
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
                            </SView> */}
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
                        <SView padding={5} col="xs-12" >
                            <SView card padding={15} style={{ borderRadius: 10 }}>

                                <SText bold fontSize={16}>
                                    Stock por Producto
                                </SText>
                                <SHr />
                                <BarraRechartsBd
                                    data={this.state.dataProductosMayorStock}
                                    nameKey="producto"
                                    valueKey="stock_actual"
                                    height={320}
                                />

                            </SView>
                        </SView>

                        {/* DOS GRAFICOS */}

                        <SView row col="xs-12" >

                            <SView padding={5} col="xs-12" >
                                <SView card padding={15} style={{ borderRadius: 10 }}>
                                    <SText bold fontSize={16}>
                                        Valor del Inventario en {monedaBase?.descripcion ?? ''}
                                    </SText>
                                    <SHr />
                                    {/* <CircularRechartsBd
                                        data={this.state.dataValorProductos}
                                    /> */}
                                    <BarraRechartsBd
                                        // data={this.state.dataValorProductos}
                                        data={dataValorInventario}

                                        nameKey="modelo"
                                        valueKey="valor_inventario"
                                        height={320}
                                    />
                                </SView>
                            </SView>



                        </SView>

                        <SView padding={5} col="xs-12" >
                            <SView card padding={15} style={{ borderRadius: 10 }}>
                                <SText color={STheme.color.text} bold fontSize={16}>
                                    Stock por Sucursal
                                </SText>
                                {loading ? (
                                    <SText>Cargando datos...</SText>
                                ) : dataStockBySucursal.length === 0 ? (
                                    <SText>No hay datos disponibles.</SText>
                                ) : (
                                    <CircularRechartsBd
                                        data={dataStockBySucursal}
                                        nameKey="name"
                                        valueKey="stock_total"
                                        height={320}
                                    />
                                )}
                                {/* <CircularRechartsBd
                                    data={this.state.dataStockBySucursal}
                                /> */}
                            </SView>
                        </SView>

                        <SView col="xs-12" row>

                            {/* BAJO STOCK */}
                            <SView col="xs-12 md-5" padding={5}>
                                <SView card padding={15} style={{ borderRadius: 10 }}>

                                    <SText color={STheme.color.text} bold fontSize={16}>
                                        Productos con Bajo Stock
                                    </SText>
                                    {loadingValorInventario ? (
                                        <SText>Cargando...</SText>
                                    ) : dataProductosBajoStock.length === 0 ? (
                                        <SText>No hay datos disponibles</SText>
                                    ) : (
                                        <DinamicTable
                                            language={"es"}
                                            hiddenMenu
                                            textTitleStyle={{ fontSize: 12, lineHeight: 14 }}
                                            colors={{ header: "#2E86AB", textHeader: "white" }}
                                            cellStyle={{ padding: 4 }}
                                            textStyle={{ fontSize: 10 }}
                                            loadData={async () => {
                                                return dataProductosBajoStock.sort((a, b) => b.valor_inventario - a.valor_inventario);
                                            }}
                                        >
                                            <DinamicTable.Col
                                                key="producto"
                                                label='Producto'
                                                width={200}
                                                data={e => e.row.producto}
                                                footerComponent={(e) => {
                                                    return <SView style={{ alignItems: "center" }}>
                                                        <SText style={e.dinamicTable.textStyle}>{"Total"}</SText>
                                                    </SView>
                                                }}
                                            />
                                            <DinamicTable.Col
                                                key="stock"
                                                label='Stock'
                                                width={60}
                                                wrap
                                                cellStyle={cellstyle}
                                                data={e => e.row.stock.toLocaleString('es-ES')}
                                                footerComponent={(e) => {
                                                    let total = 0;
                                                    e.dinamicTable.data.map(a => {
                                                        total += a.stock || 0
                                                    })
                                                    return <SView style={{ alignItems: "center" }}>
                                                        <SText style={e.dinamicTable.textStyle}>{total.toLocaleString('es-ES')}</SText>
                                                    </SView>
                                                }}
                                            />


                                        </DinamicTable>
                                    )}
                                    {/* listado */}

                                </SView>
                            </SView>
                            {/* <SHr /> */}
                            {/* TABLA */}
                            <SView col="xs-12 md-7" padding={5}>
                                <SView card padding={15} style={{ borderRadius: 10 }}>

                                    <SText bold fontSize={16}>
                                        Valor del Inventario por modelo
                                    </SText>

                                    {loadingValorInventario ? (
                                        <SText>Cargando...</SText>
                                    ) : dataValorInventario.length === 0 ? (
                                        <SText>No hay datos disponibles</SText>
                                    ) : (
                                        <DinamicTable
                                            language={"es"}
                                            hiddenMenu
                                            textTitleStyle={{ fontSize: 12, lineHeight: 14 }}
                                            colors={{ header: "#2E86AB", textHeader: "white" }}
                                            cellStyle={{ padding: 4 }}
                                            textStyle={{ fontSize: 10 }}
                                            loadData={async () => {
                                                return dataValorInventario.sort((a, b) => b.valor_inventario - a.valor_inventario);
                                            }}
                                        >
                                            <DinamicTable.Col
                                                key="modelo"
                                                label='Modelo'
                                                width={200}
                                                data={e => e.row.modelo}
                                                footerComponent={(e) => {
                                                    return <SView style={{ alignItems: "center" }}>
                                                        <SText style={e.dinamicTable.textStyle}>{"Total"}</SText>
                                                    </SView>
                                                }}
                                            />
                                            <DinamicTable.Col
                                                key="stock_actual"
                                                label='Stock'
                                                width={60}
                                                wrap
                                                cellStyle={cellstyle}
                                                data={e => e.row.stock_actual.toLocaleString('es-ES')}
                                                footerComponent={(e) => {
                                                    let total = 0;
                                                    e.dinamicTable.data.map(a => {
                                                        total += a.stock_actual || 0
                                                    })
                                                    return <SView style={{ alignItems: "center" }}>
                                                        <SText style={e.dinamicTable.textStyle}>{total.toLocaleString('es-ES')}</SText>
                                                    </SView>
                                                }}
                                            />
                                            <DinamicTable.Col
                                                key="precio_compra_unitario"
                                                label='Precio Unitario'
                                                width={size}
                                                wrap
                                                cellStyle={cellstyle}
                                                data={e => this.formatCurrency(e.row.precio_compra_unitario)}
                                                footerComponent={(e) => {
                                                    let total = 0;
                                                    let count = 0;
                                                    e.dinamicTable.data.map(a => {
                                                        total += a.precio_compra_unitario || 0;
                                                        count++;
                                                    })
                                                    const promedio = count > 0 ? total / count : 0;
                                                    return <SView style={{ alignItems: "center" }}>
                                                        <SText style={e.dinamicTable.textStyle}>{this.formatCurrency(promedio)}</SText>
                                                    </SView>
                                                }}
                                            />
                                            <DinamicTable.Col
                                                key="valor_inventario"
                                                label='Valor Total'
                                                width={size}
                                                wrap
                                                cellStyle={cellstyle}
                                                data={e => this.formatCurrency(e.row.valor_inventario)}
                                                footerComponent={(e) => {
                                                    let total = 0;
                                                    e.dinamicTable.data.map(a => {
                                                        total += a.valor_inventario || 0
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
                        </SView>
                    </SView>

                </ScrollView>

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
                    name={icon} // el icono que quieras
                    width={30}
                    height={30}
                    fill={STheme.color.text}
                />
            </SView>
        </SView>
    </SView>
    // <SView

    //     padding={5}
    //     // margin={8}
    //     style={{
    //         flex: 1,
    //         minWidth: 120,
    //         borderRadius: 10,
    //         paddingTop: 10
    //     }}
    // >
    //     <SView padding={15} card style={{
    //         // flex: 1,
    //         // minWidth: 120,
    //         borderRadius: 10,
    //         minHeight: 90
    //     }}>
    //         <SText
    //             fontSize={14}
    //             color={STheme.color.lightGray}
    //             bold
    //         >
    //             {label}
    //         </SText>
    //         <SText
    //             fontSize={24}
    //             bold
    //         >
    //             {value}
    //         </SText>
    //     </SView>
    // </SView>
);