import React from "react";
import { SHr, SImage, SInput, SMath, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
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
                    <SView style={{ backgroundColor: STheme.color.success }} padding={4} card onPress={() => {
                        // console.log("%cContactos:", "color: #2ECC40; font-weight: bold;", JSON.stringify(this.state.contactosSeleccionados, null, 2));
                        // console.log("%cTipos Costo:", "color: #df512e; font-weight: bold;", JSON.stringify(this.state.tipoCostosSeleccionados, null, 2));
                        // console.log(items)
                        PopupCarritoConfirmar.open({})
                    }}>
                        <SText fontSize={12}>{"Confirmar la venta"}</SText>
                    </SView>
                </SView>
            </SView>
        </SView>
    }
}

const ItemComp = ({ item, moneda }: { item: any; moneda: any }) => {
    const [precio, setPrecio] = React.useState(0);

    // Calcular el precio inicial según la moneda seleccionada
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

    // Inicializar precio al montar y actualizar cuando cambie la moneda o precio base
    React.useEffect(() => {
        const nuevoPrecio = calcularPrecio();
        setPrecio(nuevoPrecio);
    }, [moneda, item.modelo.precio_venta]);

    const precioFormateado = Number.isInteger(precio) ? precio.toString() : precio.toFixed(2);


    return (
        <SView padding={8}>
            <SView row>
                {/* Botón para eliminar */}
                <SView center style={{ width: 20, height: 20, padding: 2 }} onPress={() => MDL.carrito.removerItemAlCarritoDeVentas(item)}>
                    <SIconApp name="Close" fill={STheme.color.warning} />
                </SView>

                {/* Imagen del producto */}
                <SView center style={{ width: 35, height: 35, borderRadius: 4, overflow: "hidden", borderColor: STheme.color.card, borderWidth: 1 }}>
                    <SImage src={SSocket.api.inventario + "modelo/" + item.modelo.key} style={{ resizeMode: "cover" }} />
                </SView>

                <SView width={4} />

                <SView flex>
                    {/* Descripción */}
                    <SText fontSize={14} bold>{item.modelo.descripcion}</SText>
                    <SHr h={2} />

                    {/* Precio y cantidad */}
                    <SView row col={"xs-12"} style={{ alignItems: "center" }}>
                        {/* Precio */}
                        <SView width={60}>
                            <SInput
                                style={{ height: 16, fontSize: 12, padding: 0, paddingRight: 4, textAlign: "right" }}
                                type="money2"
                                icon={
                                    <SText width={20} fontSize={10} numberOfLines={1} color={STheme.color.lightGray}>
                                        {moneda ? moneda.observacion : "BS"}
                                    </SText>
                                }
                                value={precioFormateado}
                                onChangeText={(e) => {
                                    const valor = parseFloat(e || "0");
                                    setPrecio(valor); // actualiza el input local
                                    // Guardar el precio real en la moneda del producto
                                    item.modelo.precio_venta_moneda = moneda
                                        ? valor * (moneda.tipo_cambio || 1)
                                        : valor;
                                    MDL.carrito.calcularValoresCarritDeVentas(); // recalcula subtotal y total
                                }}
                            />
                        </SView>

                        <SView width={4} />

                        {/* Cantidad */}
                        <SView width={60}>
                            <SInput
                                style={{ height: 16, fontSize: 12, padding: 0, paddingRight: 4, textAlign: "right" }}
                                type="money2"
                                icon={<SText width={15} fontSize={10} color={STheme.color.lightGray}>x</SText>}
                                value={item.cantidad.toString()}
                                onChangeText={(e) => {
                                    item.cantidad = e;
                                    // item.cantidad = parseFloat(e || "0");
                                    MDL.carrito.calcularValoresCarritDeVentas();
                                }}
                            />
                        </SView>

                        <SView flex />

                        {/* Subtotal del item */}
                        <SView width={80} style={{ justifyContent: "center" }}>
                            <SText fontSize={12} bold style={{ textAlign: "right" }}>
                                {SMath.formatMoney(precio * item.cantidad)}
                            </SText>
                        </SView>
                    </SView>

                    {/* Aquí puedes agregar contactos o costos como antes */}
                </SView>
            </SView>
        </SView>
    );
};




// Componente para la lista de costos colapsible
const ListaCostos = ({ item, moneda }: { item: any, moneda: any }) => {
    const [isOpen, setIsOpen] = React.useState(true);

    if (!item?.modelo?.tipoCostos?.length) return null;

    return (
        <>
            <SView
                col={"xs-12"}
                row
                style={{
                    borderBottomWidth: 1,
                    borderColor: STheme.color.card,
                    paddingVertical: 4,
                    alignItems: "center"
                }}
                onPress={() => setIsOpen(!isOpen)}
            >
                <SHr />
                <SText fontSize={12} bold>Costos</SText>
                <SView flex />
                <SText fontSize={10} color={STheme.color.lightGray}>
                    ({item.modelo.tipoCostos.length})
                </SText>
                <SView width={4} />
                <SView style={{
                    width: 16,
                    height: 16,
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    <SIconApp
                        name="Back"
                        fill={STheme.color.card}
                        width={8}
                        // transform={isOpen ? "rotate(90deg)" : "rotate(90deg)"}
                        // @ts-ignore
                        style={{
                            transform: [{ rotate: isOpen ? "-90deg" : "180deg" }],
                            userSelect: "none",
                            pointerEvents: "none"
                        }}
                    />
                </SView>
            </SView>

            {isOpen && item.modelo.tipoCostos.map((costo: any) => (
                <SView key={costo.key_tipo_costo} col={"md-12"} height={35} >
                    <SText fontSize={10}>{costo.descripcion}</SText>
                    <SView style={{ width: "100%" }} row>
                        <SView style={{ flex: 1, height: 18, backgroundColor: STheme.color.card }}>
                            <InputSelector
                                customStyle="erp"
                                placeholder="Selecciona un cliente"
                                options={(costo.clientes || []).map((c: any) => ({
                                    label: c.cliente.nombres,
                                    value: c.key,
                                    data: c,
                                    customComponent: () => {
                                        return <SText fontSize={10} color={STheme.color.lightGray}>{c.comision} %</SText>
                                    }
                                }))}
                                defaultValue={costo.key_modelo_cliente || null}
                                onSelect={(selected: any) => {
                                    console.log("Seleccionado tipo costo:", selected);
                                    costo.key_modelo_cliente = selected.value;
                                    costo.monto = 0;
                                    costo.__descripcion = "Costo por " + costo.descripcion + " para " + selected.data.cliente.nombres;
                                }}
                            />
                        </SView>
                        <SView width={4} />
                        <SView style={{ width: 70 }}>
                            <SInput
                                style={{ height: 18, fontSize: 12, padding: 0, paddingRight: 4, textAlign: "right" }}
                                type="money2"
                                icon={<SText width={20} fontSize={10} numberOfLines={1} color={STheme.color.lightGray}>{moneda ? moneda.observacion : "BS"}</SText>}
                                defaultValue={costo.monto}
                                onChangeText={(e: string) => {
                                    costo.monto = parseFloat(e || "0");
                                }}
                            />
                        </SView>
                    </SView>
                </SView>
            ))}
        </>
    );
};