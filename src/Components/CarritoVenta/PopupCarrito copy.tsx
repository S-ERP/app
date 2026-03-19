import React from "react";
import { SHr, SImage, SInput, SMath, SNotification, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../MDL";
import SSocket from "servisofts-socket";
import SIconApp from "../../Assets/SIconApp";
import { FlatList } from "react-native";
import PopupCarritoConfirmar from "./PopupCarritoConfirmar";
import InputSelector from "../Selectores/InputSelector";
import FiltroMoneda from "../../Pages/puntoventa/Components/FiltroMoneda";


type PopupCarritoProps = {}
const DEFAULT_MONEDA_KEY = "";

export default class PopupCarrito extends React.Component<PopupCarritoProps> {
    state = {
        selectedMoneda: MDL.compra_venta.getMonedaSeleccionada() || null,
        options: [] as any[],
        contactosSeleccionados: [] as any[],
        tipoCostosSeleccionados: [] as any[],
    };

    rapido: any;
    evento: any;

    static open(props: PopupCarritoProps) {
        SPopup.open({
            key: "PopupCarrito",
            type: "3",
            content:
                <SView style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    width: "100%",
                    maxWidth: 300,
                    height: 500,
                    maxHeight: "100%",
                    backgroundColor: STheme.color.background,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: STheme.color.card,
                }} withoutFeedback>
                    <PopupCarrito {...props} />
                </SView>
        })
    }

    handleChange = () => {
        this.forceUpdate();
    }

    componentDidMount(): void {
        MDL.carrito.addEventListener("handleChange", this.handleChange);
        this.evento = MDL.compra_venta.addEventListener("moneda_seleccionada", () => {
            this.cargarMonedaSeleccionada();
        });
        this.cargarMonedaSeleccionada();
        this.cargarMonedas();
    }

    cargarMonedaSeleccionada() {
        const moneda = MDL.compra_venta.getMonedaSeleccionada();
        if (this.rapido && moneda) {
            this.rapido.setValue(moneda.key);
        }
        this.setState({ selectedMoneda: moneda || null });
    }

    async cargarMonedas() {
        try {
            const monedas = await MDL.empresa.getMonedas();
            if (!Array.isArray(monedas)) return;
            const monedaDefault = monedas.find(
                m => m.key === DEFAULT_MONEDA_KEY
            );
            this.setState({
                options: monedas,
                selectedMoneda: monedaDefault ?? this.state.selectedMoneda
            });
        } catch (e) {
            console.error("Error cargando monedas:", e);
        }
    }

    componentWillUnmount(): void {
        MDL.carrito.removeEventListener(this.handleChange);
        if (this.evento) {
            MDL.compra_venta.removeEventListener(this.evento);
        }
    }

    render() {
        const items = MDL.carrito.carrito_venta.items;
        const { selectedMoneda, options } = this.state;
        if (!selectedMoneda || !options) return null;

        return <SView col={"xs-12"} height>
            <SHr />
            <SText center color={STheme.color.lightGray} bold>{"Carrito de ventas"}</SText>
            <SView row col={"xs-12"} style={{ padding: 8 }}>
                <FiltroMoneda
                    onSelect={(moneda) => {
                        this.setState({ selectedMoneda: moneda });
                        MDL.compra_venta.setMonedaSeleccionada(moneda);
                        MDL.carrito.calcularValoresCarritDeVentas();
                    }}
                />
            </SView>
            <SView style={{ padding: 4, width: 33, height: 33, position: "absolute", right: 0, top: 0 }} onPress={() => { SPopup.close("PopupCarrito") }}>
                <SIconApp name="Close" fill={STheme.color.text} />
            </SView>
            <SHr />
            <SView row col={"xs-12"} style={{ paddingHorizontal: 8 }}>
                <SText color={STheme.color.lightGray} fontSize={12}>{"Productos"} ({MDL.carrito.carrito_venta.cantidad_items})</SText>
                <SView flex />
                <SText color={STheme.color.lightGray} fontSize={12}>{"Sub Total"}</SText>
            </SView>
            <SHr h={1} color={STheme.color.card} />
            <FlatList
                data={items}
                renderItem={({ item }) => <ItemComp
                    item={item}
                    moneda={selectedMoneda}
                // contactosSeleccionados={this.state.contactosSeleccionados}
                // tipoCostosSeleccionados={this.state.tipoCostosSeleccionados}
                // setParentState={(fn) => this.setState(fn)}
                />}
                keyExtractor={(item) => item.modelo.key}
            />
            <SHr h={1} color={STheme.color.card} />
            <SView padding={8}>
                <SText col={"xs-12"} style={{ textAlign: "right" }}>
                    {"Total:"} {selectedMoneda.observacion + " "}
                    {SMath.formatMoney(
                        items.reduce((acc, item) => {
                            const precio = selectedMoneda ? item.modelo.precio_venta_moneda / (selectedMoneda.tipo_cambio || 1) : item.modelo.precio_venta_moneda;
                            return acc + precio * item.cantidad;
                        }, 0)
                    )}
                </SText>
            </SView>
            <SHr h={1} color={STheme.color.card} />
            <SView padding={8}>
                <SView col={"xs-12"} row flex center>
                    <SView padding={4} card style={{ backgroundColor: STheme.color.danger }} onPress={() => {
                        SPopup.confirm({
                            title: "Seguro que quieres limpiar el carrito?",
                            onPress: () => {
                                MDL.carrito.limpiarCarritoVentas();
                                SPopup.close("PopupCarrito");
                            }
                        })
                    }}>
                        <SText fontSize={12}>{"Limpiar carrito"}</SText>
                    </SView>
                    <SView flex />

                    <SView style={{ backgroundColor: STheme.color.success }} padding={4} card

                        onPress={() => {
                            const items = MDL.carrito.carrito_venta.items;

                            // Validar precios
                            const itemConPrecioInvalido = items.find(it => {
                                const precio = it?.modelo?.precio_venta_moneda ?? 0;
                                return precio <= 0;
                            });
                            if (itemConPrecioInvalido) {
                                SNotification.send({
                                    title: "precio_invalido",
                                    body: "Debe registrar precio antes de continuar.",
                                    color: STheme.color.danger,
                                });
                                return; // detener confirmación
                            }

                            // Validar cantidades
                            const itemConCantidadInvalida = items.find(it => {
                                const cantidad = it?.cantidad ?? 0;
                                return cantidad <= 0;
                            });
                            if (itemConCantidadInvalida) {
                                SNotification.send({
                                    title: "cantidad_invalida",
                                    body: "Debe registrar cantidad antes de continuar.",
                                    color: STheme.color.danger,
                                });
                                return; // detener confirmación
                            }

                            // Todo válido → abrir popup de confirmación
                            PopupCarritoConfirmar.open({});
                        }}
                    // onPress={() => {
                    //     const itemSinPrecio = items.find(it => (it?.precio ?? it?.modelo?.precio_venta_moneda ?? 0) <= 1);

                    //     console.clear();
                    //     console.log("%cprecio:", "color:#2ECC40;font-weight:bold;", itemSinPrecio?.precio);
                    //     console.log("%cprecio_modelo:", "color:#2ECC40;font-weight:bold;", itemSinPrecio?.modelo?.precio_venta_moneda);
                    //     console.log("%citem encontrado:", "color:#3498DB;font-weight:bold;", itemSinPrecio);

                    //     PopupCarritoConfirmar.open({})
                    // }}

                    >
                        <SText fontSize={12}>{"Confirmar la venta"}</SText>
                    </SView>

                    {/* <SView style={{ backgroundColor: STheme.color.success }} padding={4} card onPress={() => {
                         const itemSinPrecio = items.find(it => (it?.precio ?? it?.modelo?.precio_venta_moneda ?? 0) <= 1);

                        console.clear();
                        console.log("%c" + it?.precio, `color: #2ECC40; font-weight: bold;`);
                        console.log("%c" + it?.modelo?.precio_venta_moneda, `color: #2ECC40; font-weight: bold;`);

 
                        PopupCarritoConfirmar.open({})
                    }}>
                        <SText fontSize={12}>{"Confirmar la venta"}</SText>
                    </SView> */}
                </SView>
            </SView>
        </SView>
    }
}


const ItemComp = ({ item, moneda }: { item: any; moneda: any }) => {

    const [precio, setPrecio] = React.useState(0);
    const [cantidad, setCantidad] = React.useState(item.cantidad || 1);

    const calcularPrecio = () => {
        if (!moneda) return item.modelo.precio_venta;

        if (item.modelo.venta_moneda.key === moneda.key) {
            return item.modelo.precio_venta;
        } else {
            const tipoCambioVenta = item.modelo.venta_moneda.tipo_cambio || 1;
            const tipoCambioSeleccionada = moneda.tipo_cambio || 1;
            return item.modelo.precio_venta * (tipoCambioVenta / tipoCambioSeleccionada);
        }
    };

    // 🔥 inicializa precio correctamente
    React.useEffect(() => {
        setPrecio(calcularPrecio());
    }, [moneda, item.modelo.precio_venta]);

    // 🔥 sincroniza hacia el item (opcional pero ordenado)
    React.useEffect(() => {
        item.cantidad = cantidad;
    }, [cantidad]);

    React.useEffect(() => {
        item.modelo.precio_venta_moneda = moneda
            ? precio * (moneda.tipo_cambio || 1)
            : precio;
    }, [precio]);

    const totalItem = precio * cantidad;

    return (
        <SView padding={8}>
            <SView row>

                {/* eliminar */}
                <SView onPress={() => MDL.carrito.removerItemAlCarritoDeVentas(item)}>
                    <SIconApp name="Close" fill={STheme.color.warning} />
                </SView>

                <SView flex>

                    <SText bold>{item.modelo.descripcion}</SText>

                    <SView row>

                        {/* PRECIO */}
                        <SInput
                            type="money2"
                            value={precio}
                            onChangeText={(e) => {
                                const val = parseFloat(e || "0");
                                setPrecio(val);
                                MDL.carrito.calcularValoresCarritDeVentas();
                            }}
                        />

                        {/* CANTIDAD */}
                        <SInput
                            value={cantidad.toString()}
                            onChangeText={(e) => {
                                const val = parseFloat(e || "0");
                                setCantidad(val);
                                MDL.carrito.calcularValoresCarritDeVentas();
                            }}
                        />

                        {/* SUBTOTAL */}
                        <SText>
                            {SMath.formatMoney(totalItem)}
                        </SText>

                    </SView>

                    {/* 🔥 IMPORTANTE: esto ahora SIEMPRE se actualiza */}
                    <ListaCostos
                        item={item}
                        moneda={moneda}
                        totalItem={totalItem}
                    />

                </SView>
            </SView>
        </SView>
    );
};


const ListaCostos = ({ item, moneda, totalItem }: any) => {

    const [isOpen, setIsOpen] = React.useState(true);

    if (!item?.modelo?.tipoCostos?.length) return null;

    return (
        <>
            <SView onPress={() => setIsOpen(!isOpen)}>
                <SText bold>
                    Costos ({item.modelo.tipoCostos.length})
                </SText>
            </SView>

            {isOpen && item.modelo.tipoCostos.map((costo: any) => (
                <CostoItem
                    key={costo.key_tipo_costo}
                    costo={costo}
                    totalItem={totalItem}
                />
            ))}
        </>
    );
};

const CostoItem = ({ costo, totalItem }: any) => {

    const [monto, setMonto] = React.useState(costo.monto || 0);

    // 🔥 recalcula cuando cambia el total
    React.useEffect(() => {
        if (!costo.key_modelo_cliente) return;

        const cliente = (costo.clientes || [])
            .find((c: any) => c.key === costo.key_modelo_cliente);

        if (!cliente) return;

        const comision = parseFloat(cliente.comision || "0");

        const nuevoMonto = totalItem * (comision / 100) + 10;

        setMonto(nuevoMonto);
        costo.monto = nuevoMonto;

    }, [totalItem]);

    return (
        <SView>

            <SText>{costo.descripcion}</SText>

            <SView row>

                <InputSelector
                    placeholder="Selecciona cliente"
                    options={(costo.clientes || []).map((c: any) => ({
                        label: c.cliente.nombres,
                        value: c.key,
                        data: c
                    }))}
                    onSelect={(selected: any) => {

                        costo.key_modelo_cliente = selected.value;

                        const comision = parseFloat(selected.data.comision || "0");

                        const nuevoMonto = totalItem * (comision / 100) + 10;

                        setMonto(nuevoMonto);
                        costo.monto = nuevoMonto;
                    }}
                />

                <SInput
                    type="money2"
                    value={monto}
                    onChangeText={(e: string) => {
                        const val = parseFloat(e || "0");
                        setMonto(val);
                        costo.monto = val;
                    }}
                />

            </SView>
        </SView>
    );
};