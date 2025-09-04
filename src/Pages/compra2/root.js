import React from "react";
import { SHr, SIcon, SInput, SNavigation, SNotification, SPage, SText, STheme, SThread, SView } from "servisofts-component";
import MDL from "../../MDL";
import SIconApp from "../../Assets/SIconApp";
import detalle from "../compra/detalle";
import { FlatList } from "react-native";
import SSocket from "servisofts-socket";
import PButtom from "../../Components/PButtom";
import SelectTipoPago from "../caja2/components/SelectTipoPago";


//  import React from "react";
// import { SHr, SIcon, SInput, SNavigation, SNotification, SPage, SText, STheme, SThread, SView } from "servisofts-component";
// import MDL from "../../MDL";
// import SIconApp from "../../Assets/SIconApp";
// import { FlatList } from "react-native";
// import SSocket from "servisofts-socket";
// import PButtom from "../../Components/PButtom";
// import SelectTipoPago from "../caja2/components/SelectTipoPago";

export default class root extends React.Component {
    cajaActiva = false; // Bandera sin usar state
    selectedMoneda = this.props.selectedMoneda || null; // Moneda seleccionada

    state = {
        sucursales: [],
        modelos: [],
        proveedores: [],
        detalle: [
            { producto: "", cantidad: 1, precio: 0, modelo: null, moneda: null }, // Añadir moneda al estado inicial
        ],
        monedas: [], // Almacenar monedas desde MDL.empresa.getFull()
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
                    this.selectedMoneda = this.state.monedas[1]; // segunda moneda
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
        this.checkCaja();

        MDL.empresa.getAllSucursales().then(sucursales => {
            if (this.inputs["sucursal"]) this.inputs["sucursal"].setValue(sucursales[0]?.descripcion);
            this.setState({ sucursales });
        });
        MDL.inventario.getAllModeloStock().then(modelos => {
            this.setState({ modelos });
        });
        MDL.inventario.proveedor.getAllProveedor().then(proveedores => {
            this.setState({ proveedores });
        });
    }

    handleSubmit = async (tipos_pago) => {
        console.log("DETALLE ", this.state.detalle);
        try {
            SNotification.send({
                key: "compra_rapida",
                title: "Cargando",
                type: "loading",
            });

            const sucValue = this.inputs["sucursal"].getValue();
            const sucursal = this.state.sucursales.find(a => a.descripcion === sucValue);
            const provValue = this.inputs["proveedor"].getValue();
            const proveedor = this.state.proveedores.find(a => a.razon_social === provValue);

            const data = {
                descripcion: "Compra rapida",
                observacion: "Sin observacion",
                key_proveedor: proveedor.key,
                key_usuario: MDL.usuario.session.key,
                facturar: this.facturar || false,
                facturar_luego: this.facturar_luego || false,
                key_caja: MDL.caja.activa.key,
                tipos_pago: tipos_pago,
                key_moneda: this.selectedMoneda?.key || this.state.monedas[0]?.key, // Enviar moneda seleccionada
            };
            data.detalle = this.state.detalle.map(item => ({
                cantidad: item.cantidad,
                precio_unitario: item.precio / item.cantidad,
                detalle: item.detalle,
                descuento: 0,
                descripcion: item.producto,
                key_modelo: item.modelo?.key,
                moneda: item.moneda?.key || this.selectedMoneda?.key, // Añadir moneda al detalle
            }));

            const compraResp = await SSocket.sendPromise({
                service: "compra_venta",
                component: "compra_venta",
                type: "compraRapida",
                data: data,
            });

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

    render() {
        return (
            <SPage title={"Compras Rápidas"}> {/* Corregido el título */}
                <SView col={"xs-12"} center>
                    <SHr height={15} />
                    <SView col={"xs-11.5 sm-11 md-10 lg-8 xl-6"} flex padding={15} card>
                        <SView col={"xs-12"} row>
                            <SView col={"xs-12"} padding={4} style={{ alignItems: "flex-end" }} height={60}>
                                <SView width={200} style={{ marginTop: 0 }}>
                                    <SInput
                                        label={"Con factura"}
                                        type="checkBox"
                                        defaultValue={false}
                                        onChangeText={(text) => {
                                            this.facturar = text;
                                            this.forceUpdate();
                                        }}
                                        style={{ marginTop: 0 }}
                                    />
                                </SView>
                                <SView width={200} style={{ position: "absolute", right: 280, marginTop: -20 }}>
                                    <SInput
                                        type="select"
                                        placeholder="Seleccionar Moneda"
                                        value={this.selectedMoneda?.key || ""}
                                        customStyle="calistenia"
                                        style={{
                                            width: 120,
                                            height: 40,
                                            backgroundColor: STheme.color.card,
                                            borderRadius: 8,
                                            paddingHorizontal: 8,
                                        }}
                                        options={[
                                            { key: "", content: "— Seleccionar —" },
                                            ...this.state.monedas.map(moneda => ({
                                                key: moneda.key,
                                                content: `${moneda.descripcion} ${moneda.observacion ? `(${moneda.observacion})` : ""}`,
                                            })),
                                        ]}
                                        onChangeText={(val) => this.handleMonedaChange(val)}
                                    />
                                </SView>
                            </SView>
                            {this.facturar && (
                                <SView col={"xs-12"} padding={4} style={{ alignItems: "flex-end" }} height={30}>
                                    <SView width={200} style={{ marginTop: 0 }}>
                                        <SInput
                                            label={"Entregar factura mas tarde"}
                                            type="checkBox"
                                            defaultValue={false}
                                            onChangeText={(text) => {
                                                this.facturar_luego = text;
                                                this.forceUpdate();
                                            }}
                                            style={{ marginTop: 0 }}
                                        />
                                    </SView>
                                </SView>
                            )}
                            <SView col={"xs-12 sm-6"} padding={2}>
                                <SInput
                                    ref={ref => (this.inputs["sucursal"] = ref)}
                                    label={"Sucursal"}
                                    customStyle={"erp"}
                                    type="select2"
                                    placeholder={"Seleccione una sucursal"}
                                    options={this.state.sucursales.map(a => a.descripcion)}
                                />
                            </SView>
                            <SView col={"xs-12 sm-6"} padding={2}>
                                <SInput
                                    ref={ref => (this.inputs["proveedor"] = ref)}
                                    label={"Proveedor"}
                                    customStyle={"erp"}
                                    type="select2"
                                    placeholder={"Seleccione un proveedor"}
                                    onChangeText={e => {
                                        this.forceUpdate();
                                    }}
                                    options={this.state.proveedores.map(a => a?.razon_social || "")}
                                />
                            </SView>
                        </SView>
                        <SHr />
                        <SHr h={1} color={STheme.color.card} />
                        <SView col={"xs-12"} flex>
                            <SText fontSize={10} padding={4} color={STheme.color.lightGray}>PRODUCTOS:</SText>
                            <FlatList
                                data={this.state.detalle}
                                renderItem={({ item, index }) => (
                                    <Detalle
                                        parent={this}
                                        data={item}
                                        monedas={this.state.monedas}
                                        selectedMoneda={this.selectedMoneda}
                                        onDelete={() => {
                                            this.state.detalle.splice(index, 1);
                                            this.setState({ detalle: this.state.detalle });
                                        }}
                                    />
                                )}
                                keyExtractor={(item, index) => index.toString()}
                                ListEmptyComponent={() => <SText center>No hay productos agregados</SText>}
                            />
                        </SView>
                        <SHr height={5} />
                        <SView col={"xs-12"} style={{ alignItems: "flex-end" }}>
                            <SView
                                width={85}
                                height={35}
                                onPress={() => {
                                    this.state.detalle.push({
                                        producto: "",
                                        cantidad: 1,
                                        precio: 0,
                                        modelo: null,
                                        moneda: this.selectedMoneda,
                                    });
                                    this.setState({ detalle: this.state.detalle });
                                    console.log("DETALLE ", this.state.detalle);
                                }}
                                row
                                center
                                style={{
                                    backgroundColor: STheme.color.danger,
                                    borderRadius: 4,
                                }}
                            >
                                <SIcon name="iconAdd" width={15} height={15} fill={STheme.color.white} />
                                <SView width={10} />
                                <SText fontSize={14} color={STheme.color.white}>AÑADIR</SText>
                            </SView>
                        </SView>
                        <SView col={"xs-12"} center>
                            <SHr height={25} />
                            <PButtom
                                type="primary"
                                small
                                onPress={() => {

                                    var max = 0;
                                    var max2 = 0;
                                    var max3 = 0;
                                    this.state.detalle.forEach(item => {
                                        max += item.precio;
                                        max2 += item.cantidad * item.precioBase;
                                        max3 += item.precioConvertido;
                                    });



                                    // console.log("MONTO MAXIMO: ", max);

                                    // return;


                                    SelectTipoPago.openPopup({
                                        key_punto_venta: MDL.caja.activa.key_punto_venta,
                                        montoMaximo: max,
                                        key_moneda: this.selectedMoneda?.key || this.state.monedas[0]?.key,
                                        onSelect: (tipos_pago) => this.handleSubmit(tipos_pago),
                                    });
                                }}
                            >
                                GUARDAR
                            </PButtom>
                        </SView>
                    </SView>
                </SView>
                <SHr height={25} />
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
        const precioConvertido = this.convertPrice(precioBase, data.moneda || selectedMoneda, selectedMoneda) * (data.cantidad || 1);
        data.precioConvertido = precioConvertido;
        this.setState({ precioConvertido });
        if (actualizarInput && this.inputs["precio"]) {
            this.inputs["precio"].setValue(precioConvertido.toString());
        }
    };




    inputs = {};
    render() {
        let modelos_arr = this.props.parent.state.modelos;
        let prov = this.props.parent.inputs["proveedor"]?.getValue() || "";
        let modelos_arr_filter = modelos_arr.filter(e => {
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
                                    this.props.data.modelo = producto;
                                    this.props.data.precio = producto.precio_compra || 0;
                                    this.props.data.moneda = this.props.selectedMoneda; // Actualizar moneda al seleccionar producto
                                    this.props.data.precioConvertido = this.convertPrice(producto.precio_compra || 0, this.props.selectedMoneda, this.props.selectedMoneda),
                                        this.setState({
                                            precioConvertido: this.props.data.precioConvertido
                                        });
                                    this.inputs["precio"].setValue((parseFloat(producto.precio_compra || 0) * parseFloat(this.props.data.cantidad)).toString());
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
                            value={`${this.precio_compra_moneda}`}

                            // value={{this.props.selectedMoneda?.observacion}+" " precioConvertido}
                            onChangeText={e => {
                                const nuevoPrecio = parseFloat(e) || 0;
                                this.props.data.precio = nuevoPrecio;
                                this.updatePrecio(false); // No actualizar el input, solo recalcular precio interno

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