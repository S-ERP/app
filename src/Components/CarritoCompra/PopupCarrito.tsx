import React from "react";
import { SHr, SImage, SInput, SMath, SNotification, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
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
        MDL.carrito.addEventListener("handleChange", this.handleChange)
        this.evento = MDL.compra_venta.addEventListener("moneda_seleccionada", () => { this.cargarMonedaSeleccionada(); });
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
        MDL.carrito.removeEventListener(this.handleChange)
    }

    render() {
        const items = MDL.carrito.carrito_compra?.items || [];
        const { selectedMoneda } = this.state;
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
                padding: 4, width: 33, height: 33, position: "absolute",
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
                    {"Total:"} {(selectedMoneda?.observacion ?? "") + " "}
                    {SMath.formatMoney(MDL.carrito.carrito_compra?.monto_total || 0)}
                </SText>
            </SView>
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
                        style={{ backgroundColor: STheme.color.success }}
                        padding={4}
                        card
                        onPress={() => {
                            const items = MDL.carrito.carrito_compra.items ?? [];
                            console.table(
                                items.map(it => ({
                                    precio: it?.precio,
                                    precio_modelo: it?.modelo?.precio_compra_moneda,
                                    cantidad: it?.cantidad
                                }))
                            );

                            const itemConPrecioInvalido = items.find(it => {
                                const precio = it?.modelo?.precio_compra_moneda ?? 0;
                                if (precio <= 0) {
                                    console.error("ITEM CON PRECIO INVALIDO:", it);
                                    return true;
                                }
                                return false;
                            });
                            if (itemConPrecioInvalido) {
                                SNotification.send({
                                    title: "precio_invalido",
                                    body: "Debe registrar precio antes de continuar.",
                                    color: STheme.color.danger,
                                });
                                return;
                            }
                            const itemConCantidadInvalida = items.find(it => {
                                const cantidad = it?.cantidad ?? 0;
                                if (cantidad <= 0) {
                                    console.error("ITEM CON CANTIDAD INVALIDA:", it);
                                    return true;
                                }
                                return false;
                            });
                            if (itemConCantidadInvalida) {
                                SNotification.send({
                                    title: "cantidad_invalida",
                                    body: "Debe registrar cantidad antes de continuar.",
                                    color: STheme.color.danger,
                                });
                                return;
                            }
                            PopupCarritoConfirmar.open({ moneda: selectedMoneda });
                        }}
                    >
                        <SText fontSize={12}>
                            {"Confirmar la compra"}
                        </SText>
                    </SView>
                </SView>
            </SView>
        </SView>
    }
}
const ItemComp = ({ item, moneda }: { item: any; moneda: any }) => {
    if (!item?.modelo) {
        return (
            <SView padding={8}>
                <SText color={STheme.color.warning}>Producto inválido</SText>
            </SView>
        );
    }
    const modelo = item.modelo;
    const precioBase = modelo?.precio_compra ?? 0;
    const ventaMonedaKey = modelo?.venta_moneda?.key;
    const tipoCambioVenta = modelo?.venta_moneda?.tipo_cambio || 1;
    const tipoCambioSeleccionada = moneda?.tipo_cambio || 1;
    const [precio, setPrecio] = React.useState(0);
    const calcularPrecio = () => {
        if (!moneda) return precioBase;
        if (ventaMonedaKey === moneda.key) {
            return precioBase;
        }
        return precioBase * (tipoCambioVenta / tipoCambioSeleccionada);
    };
    React.useEffect(() => { setPrecio(calcularPrecio()); }, [moneda, precioBase]);
    const precioFormateado = Number.isInteger(precio) ? precio.toString() : (precio ?? 0);

    // const formatFecha = (dateStr: string) => {
    //     if (!dateStr) return "";
    //     const d = new Date(dateStr);
    //     if (isNaN(d.getTime())) return "";
    //     return d.toLocaleString("es-BO");
    // };

    // const formatFecha = (dateStr: string) => {
    //     if (!dateStr) return "";
    //     const d = new Date(dateStr);
    //     if (isNaN(d.getTime())) return "";
    //     return d.toLocaleDateString("es-BO", {
    //         day: "2-digit",
    //         month: "2-digit",
    //         year: "numeric",
    //     });
    // };

    const formatFecha = (dateStr: string) => {
        if (!dateStr) return "";

        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "";

        d.setDate(d.getDate() + 1);

        return d.toLocaleDateString("es-BO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    return (
        <SView padding={8}>
            <SView row>
                <SView
                    center
                    style={{ width: 20, height: 20, padding: 2 }}
                    // onPress={() => MDL.carrito.removerItemAlCarritoDeVentas(item)}
                    onPress={() => MDL.carrito.removerItemAlCarritoDeCompras(item)}
                >
                    <SIconApp name="Close" fill={STheme.color.warning} />
                </SView>
                <SView center style={{ width: 35, height: 35, borderRadius: 4, overflow: "hidden", borderColor: STheme.color.card, borderWidth: 1 }} >
                    <SImage
                        src={SSocket.api.inventario + "modelo/" + (item.modelo?.key ?? "")}
                        style={{ resizeMode: "cover" }}
                    />
                </SView>
                <SView width={4} />
                <SView flex>
                    <SText fontSize={14} bold>
                        {item.modelo?.descripcion ?? "Producto"}
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
                                    textAlign: "right",
                                    backgroundColor: Number(precioFormateado) > 0 ? STheme.color.card : "#ffb5b5"
                                }}
                                type="money2"
                                icon={
                                    <SText
                                        width={20}
                                        fontSize={10}
                                        numberOfLines={1}
                                        color={STheme.color.lightGray}
                                    >
                                        {moneda?.observacion ?? "BS"}
                                    </SText>
                                }
                                value={precioFormateado.toString()}
                                onChangeText={(e) => {
                                    setPrecio(e);
                                    if (item.modelo) {
                                        item.modelo.precio_compra_moneda = moneda ? e * (moneda.tipo_cambio || 1) : e;
                                    }
                                    MDL.carrito.calcularValoresCarritDeCompras();
                                }}
                            />
                        </SView>
                        <SView width={4} />
                        <SView width={60}>
                            <SInput style={{ height: 16, fontSize: 12, padding: 0, paddingRight: 4, textAlign: "right" }}
                                type="money2"
                                icon={<SText width={15} fontSize={10} color={STheme.color.lightGray} > x </SText>}
                                value={item.cantidad.toString()}
                                onChangeText={(e) => {
                                    item.cantidad = e;
                                    MDL.carrito.calcularValoresCarritDeCompras();
                                }}
                            />
                        </SView>
                        <SView flex />
                        {/* alvaro */}


                        {/* <SView col={"xs-12"} row style={{ borderBottomWidth: 1, borderColor: STheme.color.card, paddingVertical: 4, alignItems: "center" }}   >
                            <SHr />
                            <SText fontSize={12}  >Fecha de Vencimiento</SText>
                            <SView flex />
                            <SInput
                                style={{ height: 16, fontSize: 11, padding: 0, paddingRight: 4, textAlign: "right" }} type="date"
                                value={formatFecha(item.modelo.fecha_vencimiento)}
                                onChangeText={(e) => {
                                    item.modelo.fecha_vencimiento = new Date(e).toISOString();
                                    console.log("Fecha de vencimiento actualizada:", item.modelo.fecha_vencimiento);
                                    MDL.carrito.calcularValoresCarritDeCompras();
                                }}
                            />
                        </SView> */}

                        {/* <SView width={120}>
                            <SInput
                                style={{ height: 16, fontSize: 11, padding: 0, paddingRight: 4, textAlign: "right" }} type="date" icon={<SText width={50} fontSize={10} color={STheme.color.lightGray} numberOfLines={1} > Vencimiento </SText>}
                                value={formatFecha(item.modelo.fecha_vencimiento)}
                                onChangeText={(e) => {
                                    item.modelo.fecha_vencimiento = new Date(e).toISOString();
                                    MDL.carrito.calcularValoresCarritDeCompras();
                                }}
                            />
                        </SView> */}

                        <SView flex />


                        <SView width={80} style={{ justifyContent: "center" }}>
                            <SText fontSize={12} bold style={{ textAlign: "right" }}>
                                {SMath.formatMoney(precio * (item.cantidad ?? 0))}
                            </SText>
                        </SView>

                        <SView flex />
                        <SHr height={8} />

                        {/* <SView width={128}>
                            <SInput
                                style={{ height: 16, fontSize: 11, padding: 0, paddingRight: 4, textAlign: "right" }} type="date" icon={<SText width={50} fontSize={10} color={STheme.color.lightGray} numberOfLines={1} > Vencimiento </SText>}
                                value={formatFecha(item.modelo.fecha_vencimiento)}
                                onChangeText={(e) => {
                                    item.modelo.fecha_vencimiento = new Date(e).toISOString();
                                    MDL.carrito.calcularValoresCarritDeCompras();
                                }}
                            />
                        </SView> */}
                        <SHr />
                        <SHr />


                        {/* <SView col={"xs-12"} row>
                            <SInput
                                style={{ height: 16, fontSize: 11, padding: 0 }} type="date" icon={<SText width={110} fontSize={10} color={STheme.color.text} numberOfLines={1} padding={4} >Fecha de Vencimiento </SText>}
                                value={formatFecha(item.modelo.fecha_vencimiento)}
                                onChangeText={(e) => {
                                    item.modelo.fecha_vencimiento = new Date(e).toISOString();
                                    MDL.carrito.calcularValoresCarritDeCompras();
                                }}
                            />
                        </SView> */}


                        <SView col={"xs-12"} padding={1}>
                            <SInput type="date" style={{ height: 32, fontSize: 12, borderRadius: 4, paddingHorizontal: 8, }}
                                icon={<SText width={128} fontSize={12} color={STheme.color.text} padding={4} numberOfLines={1} > Fecha de vencimiento </SText>}
                                value={formatFecha(item.modelo.fecha_vencimiento)}
                                onChangeText={(e) => {
                                    item.modelo.fecha_vencimiento = new Date(e).toISOString();
                                    MDL.carrito.calcularValoresCarritDeCompras();
                                }}
                            />
                        </SView>


                        {/* <SView col={"xs-12"} row style={{ borderBottomWidth: 1, borderColor: STheme.color.card, paddingVertical: 4, alignItems: "center" }}   >
                            <SHr />
                            <SText fontSize={12}  >Fecha de Vencimiento</SText>
                            <SView flex />
                            <SInput
                                style={{ height: 16, fontSize: 11, padding: 0, paddingRight: 4, textAlign: "right" }} type="date"
                                value={formatFecha(item.modelo.fecha_vencimiento)}
                                onChangeText={(e) => {
                                    item.modelo.fecha_vencimiento = new Date(e).toISOString();
                                    console.log("Fecha de vencimiento actualizada:", item.modelo.fecha_vencimiento);
                                    MDL.carrito.calcularValoresCarritDeCompras();
                                }}
                            />
                        </SView> */}


                    </SView>
                </SView>
            </SView>
        </SView>
    );
};