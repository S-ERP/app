import React from "react";
import { SHr, SImage, SInput, SMath, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../MDL";
import SSocket from "servisofts-socket";
import SIconApp from "../../Assets/SIconApp";
import { FlatList } from "react-native";
import PopupCarritoConfirmar from "./PopupCarritoConfirmar";
import FiltroMoneda from "../../Pages/puntoventa/Components/FiltroMoneda";
const DEFAULT_MONEDA_KEY = "";
type PopupCarritoProps = {}
export default class PopupCarrito extends React.Component<PopupCarritoProps> {
    state = {
        selectedMoneda: MDL.compra_venta.getMonedaSeleccionada() || null,



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
                    cursor: "default",
                    userSelect: "text"
                }} withoutFeedback>
                    <PopupCarrito {...props} />
                </SView>
        })
    }
    handleChange = () => {
        this.forceUpdate();
    }
    componentDidMount(): void {
        MDL.carrito.addEventListener("handleChange", this.handleChange.bind(this))
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
        MDL.carrito.removeEventListener(this.handleChange.bind(this))
    }
    render() {
        const items = MDL.carrito.carrito_compra.items;
        const { selectedMoneda } = this.state;
        if (!selectedMoneda) return null;
        return <SView col={"xs-12"} height>
            <SHr />
            <SText center color={STheme.color.lightGray} bold>{"Carrito de compras"}</SText>
            <SView row col={"xs-12"} style={{ padding: 8 }}>
                <FiltroMoneda
                    onSelect={(moneda) => {
                        this.setState({ selectedMoneda: moneda });
                        MDL.compra_venta.setMonedaSeleccionada(moneda);
                        MDL.carrito.calcularValoresCarritDeCompras();
                    }}
                />
            </SView>
            <SView style={{
                padding: 4,
                width: 33, height: 33,
                position: "absolute",
                right: 0,
                top: 0,
            }} onPress={() => {
                SPopup.close("PopupCarrito")
            }}>
                <SIconApp name="Close" fill={STheme.color.text} />
            </SView>
            <SHr />
            <SView row col={"xs-12"} style={{
                paddingHorizontal: 8
            }}>
                <SText color={STheme.color.lightGray} fontSize={12}>{"Productos"} ({MDL.carrito.carrito_compra.cantidad_items})</SText>
                <SView flex />
                <SText color={STheme.color.lightGray} fontSize={12}>{"Sub Total"}</SText>
            </SView>
            <SHr />
            <SHr h={1} color={STheme.color.card} />
            <FlatList
                data={items}
                renderItem={({ item, index }) => {
                    return <ItemComp
                        item={item}
                        moneda={selectedMoneda}
                    />
                }}
            />
            <SHr h={1} color={STheme.color.card} />
            <SView padding={8}>
                <SText col={"xs-12"} style={{ textAlign: "right" }}>
                    {"Total:"} {selectedMoneda.observacion + " "}
                    {SMath.formatMoney(MDL.carrito.carrito_compra.monto_total)}
                </SText>
            </SView>
            {/* <SView padding={8}>
                <SText col={"xs-12"} style={{ textAlign: "right" }}>
                    {"Total:"} {selectedMoneda.observacion + " "}
                    {SMath.formatMoney(
                        items.reduce((acc, item) => {
                            const precio = selectedMoneda ? item.modelo.precio_compra_moneda / (selectedMoneda.tipo_cambio || 1) : item.modelo.precio_compra_moneda;
                            const precio = selectedMoneda ? item.modelo.precio_compra_moneda / (selectedMoneda.tipo_cambio || 1) : item.modelo.precio_compra_moneda;
                            return acc + precio * item.cantidad;
                        }, 0)
                    )}
                </SText>
            </SView> */}
            <SHr h={1} color={STheme.color.card} />
            <SView padding={8}>
                <SView col={"xs-12"} row flex center>
                    <SView padding={4} card style={{
                        backgroundColor: STheme.color.danger
                    }} onPress={() => {
                        SPopup.confirm({
                            title: "Seguro que quieres limpiar el carrito?",
                            onPress: () => {
                                MDL.carrito.limpiarCarritoCompras();
                                SPopup.close("PopupCarrito")
                            }
                        })
                    }}>
                        <SText fontSize={12}>{"Limpiar carrito"}</SText>
                    </SView>
                    <SView flex />
                    <SView
                        style={{
                            backgroundColor: STheme.color.success
                        }}
                        padding={4} card onPress={() => {
                            PopupCarritoConfirmar.open({
                            })
                        }}>
                        <SText fontSize={12}>{"Confirmar la compra"}</SText>
                    </SView>
                </SView>
            </SView>
        </SView>
    }
}
const ItemComp = ({ item, moneda }: { item: any; moneda: any }) => {
    const [precio, setPrecio] = React.useState(0);
    const calcularPrecio = () => {
        if (!moneda) return item.modelo.precio_compra;
        if (item.modelo.venta_moneda.key === moneda.key) {
            return item.modelo.precio_compra;
        }
        const tipoCambioVenta = item.modelo.venta_moneda.tipo_cambio || 1;
        const tipoCambioSeleccionada = moneda.tipo_cambio || 1;
        return item.modelo.precio_compra * (tipoCambioVenta / tipoCambioSeleccionada);
    };
    React.useEffect(() => {
        setPrecio(calcularPrecio());
    }, [moneda, item.modelo.precio_compra]);
    const precioFormateado = Number.isInteger(precio)
        ? precio.toString()
        : (precio ?? 0).toFixed(2);
    return (
        <SView padding={8}>
            <SView row>
                <SView
                    center
                    style={{ width: 20, height: 20, padding: 2 }}
                    onPress={() => MDL.carrito.removerItemAlCarritoDeVentas(item)}
                >
                    <SIconApp name="Close" fill={STheme.color.warning} />
                </SView>
                <SView
                    center
                    style={{
                        width: 35,
                        height: 35,
                        borderRadius: 4,
                        overflow: "hidden",
                        borderColor: STheme.color.card,
                        borderWidth: 1
                    }}
                >
                    <SImage
                        src={SSocket.api.inventario + "modelo/" + item.modelo.key}
                        style={{ resizeMode: "cover" }}
                    />
                </SView>
                <SView width={4} />
                <SView flex>
                    <SText fontSize={14} bold>
                        {item.modelo.descripcion}
                    </SText>
                    <SHr h={2} />
                    <SView row style={{ alignItems: "center" }}>
                        <SView width={60}>
                            <SInput
                                style={{
                                    height: 16,
                                    fontSize: 12,
                                    padding: 0,
                                    paddingRight: 4,
                                    textAlign: "right"
                                }}
                                type="money2"
                                icon={
                                    <SText
                                        width={20}
                                        fontSize={10}
                                        numberOfLines={1}
                                        color={STheme.color.lightGray}
                                    >
                                        {moneda ? moneda.observacion : "BS"}
                                    </SText>
                                }
                                value={precioFormateado}
                                onChangeText={(e) => {
                                    const valor = parseFloat(e || "0");
                                    setPrecio(valor);
                                    item.modelo.precio_compra_moneda = moneda
                                        ? valor * (moneda.tipo_cambio || 1)
                                        : valor;
                                    MDL.carrito.calcularValoresCarritDeCompras();
                                }}
                            />
                        </SView>
                        <SView width={4} />
                        <SView width={60}>
                            <SInput
                                style={{
                                    height: 16,
                                    fontSize: 12,
                                    padding: 0,
                                    paddingRight: 4,
                                    textAlign: "right"
                                }}
                                type="money2"
                                icon={
                                    <SText
                                        width={15}
                                        fontSize={10}
                                        color={STheme.color.lightGray}
                                    >
                                        x
                                    </SText>
                                }
                                value={item.cantidad.toString()}
                                onChangeText={(e) => {
                                    item.cantidad = parseFloat(e || "0");
                                    MDL.carrito.calcularValoresCarritDeCompras();
                                }}
                            />
                        </SView>
                        <SView flex />
                        <SView width={80} style={{ justifyContent: "center" }}>
                            <SText fontSize={12} bold style={{ textAlign: "right" }}>
                                {SMath.formatMoney(precio * item.cantidad)}
                            </SText>
                        </SView>
                    </SView>
                </SView>
            </SView>
        </SView>
    );
};
























































































