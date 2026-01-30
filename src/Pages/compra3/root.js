import React from "react";
import { SHr, SIcon, SInput, SNavigation, SNotification, SPage, SText, STheme, SThread, SView } from "servisofts-component";
import MDL from "../../MDL";
import SIconApp from "../../Assets/SIconApp";
import detalle from "../compra/detalle";
import { Dimensions, FlatList } from "react-native";
import SSocket from "servisofts-socket";
import PButtom from "../../Components/PButtom";
import SelectTipoPago from "../caja2/components/SelectTipoPago";
import Categoria from "./Components/Categoria";
import Modelo from "./Components/Modelo";
import Carrito from "./Components/Carrito";


//  import React from "react";
// import { SHr, SIcon, SInput, SNavigation, SNotification, SPage, SText, STheme, SThread, SView } from "servisofts-component";
// import MDL from "../../MDL";
// import SIconApp from "../../Assets/SIconApp";
// import { FlatList } from "react-native";
// import SSocket from "servisofts-socket";
// import PButtom from "../../Components/PButtom";
// import SelectTipoPago from "../caja2/components/SelectTipoPago";

export default class Root extends React.Component {

    cajaActiva = false; // Bandera sin usar state
    selectedMoneda = this.props.selectedMoneda || null; // Moneda seleccionada
    selectedTipoKey = "all";
    searchText = "";
    selectedMoneda = null;
    state = {
        almacenes: [],
        modelos: [],
        proveedores: [],
        detalle: [
            { producto: "", cantidad: 1, precio: 0, modelo: null, moneda: null }, // Añadir moneda al estado inicial
        ],
        monedas: [], // Almacenar monedas desde MDL.empresa.getFull()
        showCarritoModal: false,
        carritoModalData: [],
        conStock: false, // Mover conStock al estado, inicializado en false
    };

    setTipoKey = (key) => {
        this.selectedTipoKey = key;
        this.forceUpdate();
    };

    setSearchText = (text) => {
        this.searchText = text;
        this.forceUpdate();
    };

    setMoneda = (moneda) => {
        this.selectedMoneda = moneda;
        this.forceUpdate();
    };

    setConStock = (value) => {
        this.setState({ conStock: value }, () => {
            this.carritoRef?.ajustarCarrito(); // Ajustar carrito después de actualizar el estado
        });
    };

    async checkCaja() {
        try {
            const activa = await MDL.caja.getActiva();
            this.cajaActiva = !!activa;
            if (!this.cajaActiva) {
                SNotification.send({
                    title: "Caja no aperturada",
                    message: "Debes abrir la caja antes de continuar con las operaciones.",
                    type: "danger",
                    body: "⚠️Debe abrir caja⚠️",
                    color: STheme.color.danger,
                    time: 5000,
                });
                SNavigation.replace("/caja2");
                return;
            }

            const data = await MDL.empresa.getFull();

            this.setState({ monedas: data.monedas || [] }, () => {
                // Esto se ejecuta **después** de que monedas se cargaron
                if (!this.selectedMoneda && this.state.monedas.length > 1) {
                    this.selectedMoneda = this.state.monedas.find(a => a.tipo == "base"); // segunda moneda
                    this.props.onSelectMoneda?.(this.selectedMoneda);
                    this.forceUpdate();
                }
            });

            // this.setState({ monedas: data.monedas || [] }); // Actualizar estado con monedas
            // if (!this.selectedMoneda && this.state.monedas.length > 0) {
            //     this.selectedMoneda = this.state.monedas[1];
            //     this.props.onSelectMoneda?.(this.selectedMoneda);
            // }

            // this.forceUpdate();
        } catch (e) {
            console.error("Error al obtener estado de caja", e);
        }
    }

    handleMonedaChange = (val) => {
        const nuevaMoneda = this.state.monedas.find(moneda => moneda.key === val) || null;
        if (!nuevaMoneda && this.state.monedas.length > 0) return; // Evitar errores si no hay moneda válida
        this.selectedMoneda = nuevaMoneda;
        this.props.onSelectMoneda?.(nuevaMoneda);

        // Actualizar precios según la nueva moneda y tipo_cambio
        const nuevosDetalles = this.state.detalle.map(item => {
            if (item.precio && item.moneda && nuevaMoneda) {
                const tipoCambioAnterior = item.moneda.tipo_cambio || 1;
                const tipoCambioNuevo = nuevaMoneda.tipo_cambio || 1;
                const precioBase = item.precio * tipoCambioAnterior; // Convertir a una base común (ej. moneda base)
                return {
                    ...item,
                    precio: precioBase / tipoCambioNuevo, // Convertir al nuevo tipo_cambio
                    moneda: nuevaMoneda,
                };
            }
            return { ...item, moneda: nuevaMoneda };
        });
        this.setState({ detalle: nuevosDetalles });
        this.forceUpdate();
    };

    inputs = {};
    componentDidMount() {
        // MDL.rolesPermisos.getPermisoAsync({ url: "/compra2", permiso: "ver" }).then((permit) => {
        //     if (!permit) {
        //         SNavigation.goBack();
        //         return;
        //     }
        // }).catch(e => {
        //     console.error(e);
        // })

        this.checkCaja();
        this.renderCarrito();
        Dimensions.addEventListener("change", this.onChangeDimensions);
        this.evento = MDL.compra_venta.addEventListener("carrito_globo", () => {
            this.forceUpdate()
        });

        // MDL.empresa.getAllSucursales().then(sucursales => {
        //     if (this.inputs["sucursal"]) this.inputs["sucursal"].setValue(sucursales[0]?.descripcion);
        //     this.setState({ sucursales });
        // });
        MDL.inventario.getAllModeloStock().then(modelos => {
            this.setState({ modelos });
        });
        MDL.crm.cliente.getAll().then(proveedores => {
            this.setState({ proveedores });
        });
        // MDL.inventario.proveedor.getAllProveedor().then(proveedores => {
        //     this.setState({ proveedores });
        // });
        MDL.inventario.getAllAlmacen().then(almacenes => {
            const arr = almacenes.filter(a => a.key_sucursal == MDL.caja?.activa?.key_sucursal);

            if (this.inputs["almacen"]) this.inputs["almacen"].setValue(arr[0]?.descripcion)
            this.setState({ almacenes: arr })
        });
    }

    onChangeDimensions = () => {
        this.forceUpdate();
    };


    handleSubmit = async (tipos_pago) => {
        console.log("DETALLE ", this.state.detalle);
        try {
            SNotification.send({
                key: "compra_rapida",
                title: "Cargando",
                type: "loading",
            });

            const almacenVal = this.inputs["almacen"].getValue();
            const almacen = this.state.almacenes.find(a => a.descripcion === almacenVal);
            // if (!almacen) {
            //     SNotification.send({
            //         key: "compra_rapida",
            //         title: "Error",
            //         body: "Almacén no encontrado.",
            //         color: STheme.color.danger,
            //         time: 4000,
            //     });
            //     return;
            // }
            // data.

            const provValue = this.inputs["proveedor"].getValue();
            const proveedor = this.state.proveedores.find(a => a.nombres === provValue);

            console.log(this.selectedMoneda)
            const data = {
                descripcion: "Compra rapida",
                observacion: "Sin observacion",
                key_proveedor: proveedor.key,
                key_usuario: MDL.usuario.session.key,
                facturar: this.facturar || false,
                facturar_luego: this.facturar_luego || false,
                key_caja: MDL.caja.activa.key,
                key_almacen: almacen?.key,
                tipos_pago: tipos_pago,
                key_moneda: this.selectedMoneda?.key || this.state.monedas[0]?.key, // Enviar moneda seleccionada
            };
            data.detalle = this.state.detalle.map(item => ({
                cantidad: item.cantidad,
                precio_unitario: Math.round((item.precioConvertido / item.cantidad) * 100) / 100,
                precio_unitario_base: Math.round((item.precio / item.cantidad) * 100) / 100,
                detalle: item.detalle,
                descuento: 0,
                descripcion: item.producto,
                key_modelo: item.modelo?.key,
                moneda: item.moneda?.key || this.selectedMoneda?.key, // Añadir moneda al detalle
            }));

            console.log(data);

            // return;
            const compraResp = await SSocket.sendPromise({
                service: "caja",
                component: "caja_detalle",
                type: "compra",
                data: data,
            });
            // const compraResp = await SSocket.sendPromise({
            //     service: "compra_venta",
            //     component: "compra_venta",
            //     type: "compraRapida",
            //     data: data,
            // });

            SelectTipoPago.closePopup();
            SNavigation.goBack();
            SNotification.remove("compra_rapida");
            MDL.caja.dispatchEvent({ type: "onDetalleChange" });
            console.log("Compra", compraResp);
        } catch (error) {
            console.error("Error al realizar la compra:", error);
            SNotification.send({
                key: "compra_rapida",
                title: "Error al realizar la compra",
                body: error?.error || "Ocurrió un error inesperado.",
                type: "danger",
                time: 4000,
            });
        }
    };

    getColSize() {
        const width = Dimensions.get("window").width;
        if (width >= 1200) return parseFloat((12 / 8).toFixed(2));
        if (width >= 768) return parseFloat((12 / 4).toFixed(2));
        return parseFloat((12 / 3).toFixed(2));
    }

    renderCarrito() {
        return (
            <Carrito
                ref={(ref) => (this.carritoRef = ref)}
                onModificarStock={(key, delta) => this.modeloRef?.modificarStock(key, delta)}
                selectedMoneda={this.selectedMoneda}
                conStock={this.state.conStock} // Usar estado conStock
                onChangeConStock={this.setConStock} // Pasar función para actualizar conStock
            />
        );
    }

    render() {
        return (
            <SPage title={"Compras Rápidas"} disableScroll > {/* Corregido el título */}
                <SView col={"xs-12"} flex  >
                    <SView col="xs-12" row flex>
                        <SView col={"xs-12"}
                            style={{
                                display: this.state.showCarritoModal ? "none" : "flex",
                                borderRightWidth: 1,
                                borderRightColor: STheme.color.card,
                                //backgroundColor: STheme.color.background + "90"
                            }}>
                            <Categoria
                                onSelect={this.setTipoKey}
                                selected={this.selectedTipoKey}
                                value={this.searchText}
                                onChangeText={this.setSearchText}
                                selectedMoneda={this.selectedMoneda}
                                onSelectMoneda={this.setMoneda}
                                conStock={this.state.conStock} // Usar estado conStock
                                onChangeConStock={this.setConStock} // Pasar función para actualizar conStock
                            />
                            {this.cajaActiva && (
                                <Modelo
                                    ref={(ref) => (this.modeloRef = ref)}
                                    tipoKey={this.selectedTipoKey}
                                    searchText={this.searchText}
                                    selectedMoneda={this.selectedMoneda}
                                    conStock={this.state.conStock} // Usar estado conStock
                                    onPressProducto={(producto) => {
                                        console.log("PRODUCTO SELECT ", producto)
                                        this.carritoRef?.addProducto2(producto);
                                        this.carritoRefModal?.addProducto2?.(producto);
                                    }}
                                // data={this.state.modelos}

                                />
                            )}
                        </SView>
                    </SView>
                </SView>
            </SPage>
        );
    }
}

class Detalle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            precioConvertido: 0,

            // precioConvertido: this.convertPrice(this.props.data.precio, this.props.data.moneda, this.props.selectedMoneda),
        };
    }

    componentDidMount() {
        this.updatePrecio();
    }

    componentDidUpdate(prevProps) {
        // Si cambió moneda, producto o cantidad
        if (
            prevProps.selectedMoneda !== this.props.selectedMoneda ||
            prevProps.data.precio !== this.props.data.precio ||
            prevProps.data.cantidad !== this.props.data.cantidad
        ) {
            this.updatePrecio();
        }
    }

    convertPrice = (precio, monedaOrigen, monedaDestino) => {
        if (!precio || !monedaOrigen || !monedaDestino) return precio || 0;
        const tipoCambioOrigen = monedaOrigen?.tipo_cambio || 1;
        const tipoCambioDestino = monedaDestino?.tipo_cambio || 1;
        const precioBase = precio * tipoCambioOrigen; // Convertir a base común
        return precioBase / tipoCambioDestino; // Convertir al tipo de cambio de destino
    };

    updatePrecio = (actualizarInput = true) => {
        const { data, selectedMoneda } = this.props;
        const precioBase = data.modelo?.precio_compra || data.precio || 0;
        // const precioConvertido = this.convertPrice(precioBase, data.moneda || selectedMoneda, selectedMoneda) * (data.cantidad || 1);
        const tc = selectedMoneda?.tipo_cambio ?? 1
        data.precioConvertido = precioBase / tc;
        // this.setState({ precioConvertido });
        if (actualizarInput && this.inputs["precio"]) {
            const vl = Math.round((data.precioConvertido * (data.cantidad || 1)) * 100) / 100
            this.inputs["precio"].setValue(vl.toString());
        }
    };




    inputs = {};
    render() {
        let modelos_arr = this.props.parent.state.modelos;
        let prov = this.props.parent.inputs["proveedor"]?.getValue() || "";
        let modelos_arr_filter = modelos_arr.filter(e => {
            return true;
            if (prov) {
                return !!(e.proveedores ?? []).find(p => p.proveedor.razon_social === prov);
            }
            return true;
        });

        const moneda = this.props.selectedMoneda || { key: "", descripcion: "Sin moneda" };


        // const moneda = this.props.selectedMoneda || { key: "", descripcion: "Sin moneda" };
        // const precioConvertido = this.state.precioConvertido || this.props.data.precio || 0;
        this.precio_compra_moneda = !this.props.data.precio ? "" : parseFloat(this.props.data.precio / this.props.selectedMoneda?.tipo_cambio).toFixed(2) || 0;
        this.props.data.precioConvertido = this.precio_compra_moneda
        console.log("tipo cambio ", this.props.selectedMoneda?.observacion);
        console.log("precio actualizado ", moneda.tipo_cambio);
        // console.log("precio actualizadssso ", precioConvertido);
        return (
            <SView col={"xs-12"} row style={{ borderBottomWidth: 0.5, borderBottomColor: STheme.color.card, paddingBottom: 8, paddingTop: 8 }}>
                <SView col={"xs-12 sm-7"} padding={4}>
                    <SInput
                        ref={ref => (this.inputs["producto"] = ref)}
                        type="select2"
                        required
                        customStyle={"erp"}
                        placeholder={"Seleccione un producto"}
                        defaultValue={this.props.data.producto}
                        options={modelos_arr_filter.map(a => a.descripcion)}
                        onChangeText={e => {
                            this.props.data.producto = e;
                        }}
                        label={"Producto"}
                        onBlur={() => {
                            new SThread(200, "test", true).start(() => {
                                const value = this.inputs["producto"].getValue();
                                if (!value) return;
                                const producto = modelos_arr_filter.find(a => a.descripcion === value);
                                if (!producto) {
                                    SNotification.send({
                                        title: "El producto seleccionado no está registrado en el sistema",
                                        time: 4000,
                                    });
                                } else {
                                    const tc = this.props.selectedMoneda.tipo_cambio
                                    this.props.data.modelo = producto;
                                    this.props.data.precio = producto.precio_compra || 0;
                                    this.props.data.moneda = this.props.selectedMoneda; // Actualizar moneda al seleccionar producto
                                    this.props.data.precioConvertido = producto.precio_compra / tc;
                                    // console.log(this.props.data, this.props.selectedMoneda);
                                    // this.setState({
                                    //     precioConvertido: this.props.data.precioConvertido
                                    // });
                                    this.inputs["precio"].setValue((parseFloat(this.props.data.precioConvertido || 0) * parseFloat(this.props.data.cantidad)).toString());
                                }
                            });
                        }}
                    />
                    <SHr h={4} />
                    <SInput
                        ref={ref => (this.inputs["detalle"] = ref)}
                        placeholder={"Detalle"}
                        customStyle={"erp"}
                        label={"Detalle"}
                        defaultValue={this.props.data.detalle}
                        onChangeText={e => {
                            this.props.data.detalle = e;
                        }}
                        type="default"
                    />
                </SView>
                <SView col={"xs-12 sm-5"} row>
                    <SView flex padding={4}>
                        <SInput
                            ref={ref => (this.inputs["cantidad"] = ref)}
                            placeholder={`Cantidad (${moneda.descripcion})`}
                            customStyle={"erp"}
                            label={"Cantidad"}
                            defaultValue={this.props.data.cantidad || "1"}
                            onChangeText={e => {
                                this.props.data.cantidad = parseFloat(e) || 0;
                                this.updatePrecio(true); // No actualizar el input, solo recalcular precio interno
                                this.forceUpdate();
                            }}
                            icon={<SView />}
                            type="money2"
                        />
                    </SView>
                    <SView flex padding={4}>
                        <SInput
                            ref={ref => (this.inputs["precio"] = ref)}
                            icon={<SText fontSize={10} padding={2} >{this.props.selectedMoneda?.observacion || ""}</SText>}
                            placeholder={`Precio (${moneda.descripcion})`}
                            customStyle={"erp"}
                            label={"Precio"}
                            // value={`${this.precio_compra_moneda}`}

                            // value={{this.props.selectedMoneda?.observacion}+" " precioConvertido}
                            onChangeText={e => {
                                const nuevoPrecio = parseFloat(e) || 0;
                                this.props.data.precioConvertido = nuevoPrecio;
                                const tc = this.props.selectedMoneda?.tipo_cambio ?? 1
                                this.props.data.precio = nuevoPrecio * tc;
                                // this.updatePrecio(false); // No actualizar el input, solo recalcular precio interno

                                // this.updatePrecio(); // recalcula al cambiar manualmente
                            }}
                            // defaultValue={precioConvertido.toString()}
                            // onChangeText={e => {
                            //     const nuevoPrecio = parseFloat(e) || 0;
                            //     this.props.data.precio = nuevoPrecio;
                            //     this.setState({ precioConvertido: this.convertPrice(nuevoPrecio, moneda, moneda) });
                            // }}
                            type="money2"
                        />
                    </SView>
                    <SView width={20} height={20} card padding={0} center onPress={this.props.onDelete}>
                        <SIconApp name="Delete" />
                    </SView>
                </SView>
            </SView>
        );
    }
}