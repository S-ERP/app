import React from "react";
import { SGradient, SImage, SInput, SMath, SNotification, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../MDL";
import SSocket from "servisofts-socket";
import { FlatList } from "react-native";
import PopupCarritoConfirmar from "./PopupCarritoConfirmar";
import FiltroMoneda from "../../Pages/puntoventa/Components/FiltroMoneda";
import SInput2, { SInput2Class } from "../SForm2/SInput2";
import { ColorCompraVenta } from "../../Config/theme";

const colorCompra = ColorCompraVenta.compra;

type PopupCarritoProps = {}
const UI = {
    font: { icon: 18, title: 16, subtitle: 14, small: 12, tiny: 10 },
};

export default class PopupCarrito extends React.Component<PopupCarritoProps> {
    state = { selectedMoneda: MDL.compra_venta.getMonedaSeleccionada() || null, };
    evento: any;
    static open(props: PopupCarritoProps) {
        SPopup.open({
            key: "PopupCarrito", type: "3", content:
                <SView style={{
                    position: "absolute", top: 8, right: 8,
                    width: "100%", maxWidth: 300,
                    height: "95%", maxHeight: 620,
                    backgroundColor: STheme.color.background,
                    borderWidth: 1,
                    borderColor: STheme.color.card,
                    borderRadius: 8,
                    overflow: "hidden",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.4,
                    shadowRadius: 30,
                }} withoutFeedback>
                    <PopupCarrito {...props} />
                </SView>
        })
    }

    handleChange = () => { this.forceUpdate(); }
    handleKeyDown = (e: any) => {
        if (e.key === "Escape") SPopup.close("PopupCarrito");
    }

    componentDidMount(): void {
        MDL.carrito.addEventListener("handleChange", this.handleChange);
        this.evento = MDL.compra_venta.addEventListener("moneda_seleccionada", () => {
            const moneda = MDL.compra_venta.getMonedaSeleccionada();
            this.setState({ selectedMoneda: moneda || null });
        });
        const moneda = MDL.compra_venta.getMonedaSeleccionada();
        this.setState({ selectedMoneda: moneda || null });
        (globalThis as any).document?.addEventListener("keydown", this.handleKeyDown);
    }

    componentWillUnmount(): void {
        MDL.carrito.removeEventListener(this.handleChange);
        if (this.evento) {
            MDL.compra_venta.removeEventListener(this.evento);
        }
        (globalThis as any).document?.removeEventListener("keydown", this.handleKeyDown);
    }

    render() {
        const items = MDL.carrito.carrito_compra?.items || [];
        const { selectedMoneda } = this.state;
        return (
            <SView col={"xs-12"} height >
                <SView style={{ position: "relative", overflow: "hidden" }}>
                    <SGradient colors={[colorCompra, "#6d1fc4"]} deg={120} />
                    <SView row style={{ paddingHorizontal: 14, paddingVertical: 10, alignItems: "center" }}>
                        <SView style={{ width: 24, height: 24, justifyContent: "center", alignItems: "center", marginRight: 8 }}>
                            <SText fontSize={UI.font.icon}>🛍️</SText>
                        </SView>
                        <SText fontSize={UI.font.title} bold color={STheme.color.white}>{"Carrito de Compras"}</SText>
                        <SView flex />
                        <SView style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: STheme.color.danger, justifyContent: "center", alignItems: "center" }}
                            onPress={() => SPopup.close("PopupCarrito")}>
                            <SText fontSize={UI.font.tiny} bold color={STheme.color.white}>{"✕"}</SText>
                        </SView>
                    </SView>
                </SView>
                <SView style={{ padding: 8 }}>
                    <FiltroMoneda
                        onSelect={(moneda: any) => {
                            this.setState({ selectedMoneda: moneda });
                            MDL.compra_venta.setMonedaSeleccionada(moneda);
                            MDL.carrito.calcularValoresCarritDeCompras();
                        }}
                    />
                </SView>
                <SView row style={{ paddingHorizontal: 10, paddingVertical: 6, alignItems: "center", backgroundColor: colorCompra + "1c", borderBottomWidth: 1, borderBottomColor: colorCompra + "40", }}>
                    <SText fontSize={UI.font.small} color={STheme.color.text}>
                        {"Productos ("}{MDL.carrito.carrito_compra?.cantidad_items}{")"}
                    </SText>
                    <SView flex />
                    <SText fontSize={UI.font.small} bold color={colorCompra}>
                        {"Sub: "}{selectedMoneda?.observacion ?? "Bs"}{" "}{SMath.formatMoney(MDL.carrito.carrito_compra?.monto_total || 0)}
                    </SText>
                </SView>

                <FlatList
                    data={items}
                    renderItem={({ item }) => <ItemComp item={item} moneda={selectedMoneda} />}
                    keyExtractor={(item) => item.modelo?.key ?? Math.random().toString()}
                    style={{ flex: 1, paddingHorizontal: 8, paddingTop: 8 }}
                />
                <SView style={{
                    backgroundColor: STheme.color.background, borderTopWidth: 1, borderTopColor: STheme.color.lightGray + "50",
                    paddingHorizontal: 14, paddingVertical: 10,
                    shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12,
                }}>
                    <SView row style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <SText fontSize={UI.font.small} bold color={STheme.color.text}>{"Total Compra"}</SText>
                        <SText fontSize={UI.font.title} bold color={colorCompra}>
                            {selectedMoneda?.observacion ?? "Bs"}{" "}{SMath.formatMoney(MDL.carrito.carrito_compra?.monto_total || 0)}
                        </SText>
                    </SView>
                    <SView row style={{ gap: 8 }}>
                        <SView flex style={{ backgroundColor: STheme.color.danger, borderRadius: 6, paddingVertical: 9, alignItems: "center", justifyContent: "center" }}
                            onPress={() => {
                                SPopup.confirm({
                                    title: "¿Seguro que quieres limpiar el carrito?",
                                    onPress: () => {
                                        MDL.carrito.limpiarCarritoCompras();
                                        SPopup.close("PopupCarrito");
                                    }
                                });
                            }}>
                            <SText fontSize={UI.font.subtitle} bold color={STheme.color.white}>{"Limpiar"}</SText>
                        </SView>
                        <SView flex style={{
                            backgroundColor: colorCompra, borderRadius: 6, paddingVertical: 9, alignItems: "center", justifyContent: "center",
                            shadowColor: colorCompra, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 8,
                        }}
                            onPress={() => {
                                const items = MDL.carrito.carrito_compra?.items ?? [];
                                const itemConPrecioInvalido = items.find(it => {
                                    const precio = (it?.modelo as any)?.precio_compra_moneda || (it?.modelo as any)?.precio_compra || 0;
                                    return precio <= 0;
                                });
                                if (itemConPrecioInvalido) {
                                    SNotification.send({
                                        title: "Precio requerido",
                                        body: `El producto "${itemConPrecioInvalido.modelo?.descripcion ?? "desconocido"}" no tiene precio de costo registrado.`,
                                        color: STheme.color.danger,
                                    });
                                    return;
                                }
                                const itemConCantidadInvalida = items.find(it => (it?.cantidad ?? 0) <= 0);
                                if (itemConCantidadInvalida) {
                                    SNotification.send({
                                        title: "Cantidad requerida",
                                        body: `El producto "${itemConCantidadInvalida.modelo?.descripcion ?? "desconocido"}" tiene cantidad 0.`,
                                        color: STheme.color.danger,
                                    });
                                    return;
                                }
                                PopupCarritoConfirmar.open({ moneda: selectedMoneda });
                            }}>
                            <SText fontSize={UI.font.subtitle} bold color={STheme.color.white}>{"Confirmar compra"}</SText>
                        </SView>
                    </SView>
                </SView>
            </SView>
        );
    }
}

const ItemComp = ({ item, moneda }: { item: any; moneda: any }) => {
    const modelo = item?.modelo;
    const precioBase = modelo?.precio_compra ?? 0;
    const ventaMonedaKey = modelo?.venta_moneda?.key;
    const tipoCambioVenta = modelo?.venta_moneda?.tipo_cambio || 1;
    const tipoCambioSeleccionada = moneda?.tipo_cambio || 1;
    const monedaKey = moneda?.key ?? '__base';
    const calcularPrecio = () => {
        const editado = modelo?.__precioEditado;
        if (editado && editado.key === monedaKey) return editado.precio;
        if (!moneda) return precioBase;
        if (ventaMonedaKey === moneda.key) return precioBase;
        return precioBase * (tipoCambioVenta / tipoCambioSeleccionada);
    };
    const [precio, setPrecio] = React.useState(calcularPrecio);
    const [precioStr, setPrecioStr] = React.useState(() => (calcularPrecio() ?? 0).toFixed(2));
    const inputPrecioRef = React.useRef<SInput2Class>(null);
    React.useEffect(() => {
        const p = calcularPrecio();
        setPrecio(p);
        const str = (p ?? 0).toFixed(2);
        setPrecioStr(str);
        inputPrecioRef.current?.setValue(str);
    }, [monedaKey, precioBase]);
    const puedeEditarCosto = MDL.rolesPermisos.getPermiso({ url: "/compra", permiso: "carrito_editar_costo" });
    if (!modelo) {
        return (
            <SView style={{ padding: 8 }}>
                <SText color={STheme.color.warning}>{"Producto inválido"}</SText>
            </SView>
        );
    }
    const precioFormateado = (precio ?? 0).toFixed(2);
    const subtotalStr = SMath.formatMoney(precio * (item.cantidad ?? 0));
    const subtotalLargo = precioStr.replace(/[^0-9]/g, '').length > 8;
    const formatFecha = (dateStr: string) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "";
        d.setDate(d.getDate() + 1);
        return d.toLocaleDateString("es-BO", { day: "2-digit", month: "2-digit", year: "numeric" });
    };
    const precioValido = Number(precioFormateado) > 0;
    return (
        <SView style={{
            backgroundColor: precioValido ? STheme.color.card : STheme.color.danger + "0d",
            borderRadius: 12,
            padding: 10,
            marginBottom: 10,
            borderLeftWidth: 4,
            borderLeftColor: precioValido ? colorCompra : STheme.color.danger,
            borderWidth: 1,
            borderColor: precioValido ? STheme.color.lightGray + "35" : STheme.color.danger + "45",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 6,
        }}>
            <SView row style={{ gap: 8, alignItems: "flex-start" }}>
                <SView style={{ position: "relative" }}>
                    <SView style={{ width: 35, height: 35, borderRadius: 6, overflow: "hidden" }}>
                        <SImage src={(SSocket.api as any).inventario + "modelo/" + (modelo?.key ?? "")} style={{ resizeMode: "cover" }} />
                    </SView>
                    <SView style={{
                        position: "absolute", top: -6, left: -6, width: 18, height: 18, borderRadius: 10, backgroundColor: STheme.color.danger, justifyContent: "center", alignItems: "center",
                        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 3,
                    }}
                        onPress={() => MDL.carrito.removerItemAlCarritoDeCompras(item)}>
                        <SText fontSize={10} bold color={STheme.color.white}>{"✕"}</SText>
                    </SView>
                </SView>
                <SView flex>
                    <SText fontSize={UI.font.title} bold color={STheme.color.text} style={{ marginBottom: 2 }} numberOfLines={2}>
                        {modelo?.descripcion ?? "Producto"}
                    </SText>
                    <SView row style={{ alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <SView flex style={{
                            backgroundColor: precioValido ? colorCompra + "25" : STheme.color.danger + "25",
                            borderWidth: 1.5,
                            borderColor: precioValido ? colorCompra : STheme.color.danger,
                            borderRadius: 6, height: 22, justifyContent: "center",
                        }}>
                            {puedeEditarCosto ? (
                                <SView row center style={{ paddingHorizontal: 4 }}>
                                    <SText fontSize={UI.font.small} color={precioValido ? colorCompra : STheme.color.danger} style={{ marginRight: 2 }} bold>{moneda?.observacion ?? "BS"}</SText>
                                    <SView flex>
                                        <SInput2
                                            ref={inputPrecioRef}
                                            name="precio"
                                            type="money"
                                            style={{ fontSize: UI.font.small, textAlign: "right", paddingRight: 0, color: STheme.color.text }}
                                            defaultValue={precioFormateado}
                                            onChangeText={(e) => {
                                                setPrecioStr(e);
                                                const n = parseFloat(e) || 0;
                                                setPrecio(n);
                                                if (modelo) {
                                                    modelo.precio_compra_moneda = moneda ? n * (moneda.tipo_cambio || 1) : n;
                                                    modelo.__precioEditado = { key: monedaKey, precio: n };
                                                }
                                                MDL.carrito.calcularValoresCarritDeCompras();
                                            }}
                                        />
                                    </SView>
                                </SView>
                            ) : (
                                <SInput
                                    name="precio"
                                    type="money"
                                    style={{ height: 20, width: "100%", paddingRight: 4, textAlign: "right" }}
                                    editable={false}
                                    icon={<SText color={STheme.color.lightGray} style={{ marginLeft: 4 }}>{moneda?.observacion ?? "$"}</SText>}
                                    value={precioFormateado.toString()}
                                    onChangeText={() => {
                                        SNotification.send({
                                            title: "Sin permiso",
                                            body: "No tiene permiso para editar el precio de costo",
                                            color: STheme.color.warning,
                                        });
                                        return
                                    }}
                                />
                            )}
                        </SView>
                        <SView style={{
                            width: 52, height: 22, borderRadius: 6, alignItems: "center", justifyContent: "center", overflow: "hidden",
                            backgroundColor: STheme.color.lightGray + "18", borderWidth: 1, borderColor: STheme.color.lightGray + "40",
                        }}>
                            <SInput
                                style={{ fontSize: UI.font.small, paddingLeft: 0.5, textAlign: "center", color: STheme.color.text, fontWeight: "bold" }}
                                type="money2"
                                icon={<SText fontSize={10} color={STheme.color.text}>{"x"}</SText>}
                                value={item.cantidad.toString()}
                                onChangeText={(e) => {
                                    item.cantidad = e;
                                    MDL.carrito.calcularValoresCarritDeCompras();
                                }}
                            />
                        </SView>
                        <SText fontSize={UI.font.subtitle} bold color={STheme.color.text}
                            style={{ textAlign: "right", minWidth: 55, ...(subtotalLargo ? { width: "100%" } : {}) }}
                            numberOfLines={1}>
                            {subtotalStr}
                        </SText>
                    </SView>
                    <SView style={{
                        height: 22, borderRadius: 6, marginTop: 6, justifyContent: "center",
                        backgroundColor: STheme.color.lightGray + "10", borderWidth: 1, borderColor: STheme.color.lightGray + "30",
                    }}>
                        <SInput
                            style={{ height: 20, fontSize: UI.font.small, padding: 0, paddingLeft: 4 }}
                            type="date"
                            icon={<SText width={110} fontSize={UI.font.tiny} numberOfLines={1} color={STheme.color.text} style={{ marginLeft: 4 }}>{"Fecha vencimiento"}</SText>}
                            value={formatFecha(modelo.fecha_vencimiento)}
                            onChangeText={(e) => {
                                modelo.fecha_vencimiento = new Date(e).toISOString();
                                MDL.carrito.calcularValoresCarritDeCompras();
                            }}
                        />
                    </SView>
                </SView>
            </SView>
        </SView>
    );
};
