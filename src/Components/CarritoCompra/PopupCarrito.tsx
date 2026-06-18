import React from "react";
import { SImage, SInput, SMath, SNotification, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../MDL";
import SSocket from "servisofts-socket";
import { FlatList } from "react-native";
import PopupCarritoConfirmar from "./PopupCarritoConfirmar";
import FiltroMoneda from "../../Pages/puntoventa/Components/FiltroMoneda";
import SInput2 from "../SForm2/SInput2";

type PopupCarritoProps = {}

const UI = {
    font: { icon: 18, title: 16, subtitle: 14, small: 12, tiny: 10 },
    colors: {
        background: "#252a33",
        header: "#a046e8",
        danger: "#dc3545",
        itemBg: "#303744",
        mutedDark: "#1f242d",
        accent: "#6cffb4",
        error: "#bf0505",
        border: "#434c5d",
    }
};

export default class PopupCarrito extends React.Component<PopupCarritoProps> {
    state = {
        selectedMoneda: MDL.compra_venta.getMonedaSeleccionada() || null,
    };
    evento: any;

    static open(props: PopupCarritoProps) {
        SPopup.open({
            key: "PopupCarrito", type: "3", content:
                <SView style={{
                    position: "absolute", top: 8, right: 8,
                    width: "100%", maxWidth: 300,
                    height: "95%", maxHeight: 620,
                    backgroundColor: UI.colors.background,
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
            <SView col={"xs-12"} height style={{ backgroundColor: UI.colors.background }}>

                {/* Header */}
                <SView row style={{ backgroundColor: UI.colors.header, paddingHorizontal: 14, paddingVertical: 8, alignItems: "center" }}>
                    <SView style={{ width: 24, height: 24, justifyContent: "center", alignItems: "center", marginRight: 8 }}>
                        <SText fontSize={UI.font.icon}>🛍️</SText>
                    </SView>
                    <SText fontSize={UI.font.title} bold color={STheme.color.text}>{"Carrito de Compras"}</SText>
                    <SView flex />
                    <SView style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: UI.colors.danger, justifyContent: "center", alignItems: "center" }}
                        onPress={() => SPopup.close("PopupCarrito")}>
                        <SText fontSize={UI.font.tiny} bold color={STheme.color.text}>{"✕"}</SText>
                    </SView>
                </SView>

                {/* Selector de moneda */}
                <SView style={{ padding: 8 }}>
                    <FiltroMoneda
                        onSelect={(moneda: any) => {
                            this.setState({ selectedMoneda: moneda });
                            MDL.compra_venta.setMonedaSeleccionada(moneda);
                            MDL.carrito.calcularValoresCarritDeCompras();
                        }}
                    />
                </SView>

                {/* Título de sección */}
                <SView row style={{ paddingHorizontal: 10, paddingVertical: 8, alignItems: "center" }}>
                    <SText fontSize={UI.font.small} color={STheme.color.text}>
                        {"Productos ("}{MDL.carrito.carrito_compra.cantidad_items}{")"}
                    </SText>
                    <SView flex />
                    <SText fontSize={UI.font.small} color={STheme.color.text}>
                        {"Sub: "}{selectedMoneda?.observacion ?? "Bs"}{" "}{SMath.formatMoney(MDL.carrito.carrito_compra?.monto_total || 0)}
                    </SText>
                </SView>

                {/* Lista de productos */}
                <FlatList
                    data={items}
                    renderItem={({ item }) => <ItemComp item={item} moneda={selectedMoneda} />}
                    keyExtractor={(item) => item.modelo?.key ?? Math.random().toString()}
                    style={{ flex: 1, paddingHorizontal: 8 }}
                />

                {/* Resumen y acciones */}
                <SView style={{ backgroundColor: "#1e222b", borderTopWidth: 1, borderTopColor: UI.colors.border, paddingHorizontal: 14, paddingVertical: 10 }}>
                    <SView row style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <SText fontSize={UI.font.small} bold color={STheme.color.text}>{"Total Compra"}</SText>
                        <SText fontSize={UI.font.small} bold color={STheme.color.text}>
                            {selectedMoneda?.observacion ?? "Bs"}{" "}{SMath.formatMoney(MDL.carrito.carrito_compra?.monto_total || 0)}
                        </SText>
                    </SView>

                    <SView row style={{ gap: 8 }}>
                        <SView flex style={{ backgroundColor: UI.colors.danger, borderRadius: 4, paddingVertical: 8, alignItems: "center", justifyContent: "center" }}
                            onPress={() => {
                                SPopup.confirm({
                                    title: "¿Seguro que quieres limpiar el carrito?",
                                    onPress: () => {
                                        MDL.carrito.limpiarCarritoCompras();
                                        SPopup.close("PopupCarrito");
                                    }
                                });
                            }}>
                            <SText fontSize={UI.font.subtitle} bold color={STheme.color.text}>{"Limpiar"}</SText>
                        </SView>

                        <SView flex style={{ backgroundColor: UI.colors.header, borderRadius: 4, paddingVertical: 8, alignItems: "center", justifyContent: "center" }}
                            onPress={() => {
                                const items = MDL.carrito.carrito_compra.items ?? [];
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
                            <SText fontSize={UI.font.subtitle} bold color={STheme.color.text}>{"Confirmar compra"}</SText>
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

    const calcularPrecio = () => {
        if (!moneda) return precioBase;
        if (ventaMonedaKey === moneda.key) return precioBase;
        return precioBase * (tipoCambioVenta / tipoCambioSeleccionada);
    };

    const [precio, setPrecio] = React.useState(calcularPrecio);
    const [precioStr, setPrecioStr] = React.useState(() => (calcularPrecio() ?? 0).toFixed(2));

    React.useEffect(() => {
        const p = calcularPrecio();
        setPrecio(p);
        setPrecioStr((p ?? 0).toFixed(2));
    }, [moneda, precioBase]);

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

    return (
        <SView style={{
            backgroundColor: Number(precioFormateado) > 0 ? UI.colors.itemBg : "#3a1515",
            borderRadius: 10,
            padding: 10,
            marginBottom: 10,
            borderLeftWidth: 3,
            borderLeftColor: Number(precioFormateado) > 0 ? UI.colors.header : UI.colors.danger,
        }}>
            <SView row style={{ gap: 8, alignItems: "flex-start" }}>

                {/* Imagen */}
                <SView style={{ position: "relative" }}>
                    <SView style={{ width: 35, height: 35, borderRadius: 2, overflow: "hidden" }}>
                        <SImage src={(SSocket.api as any).inventario + "modelo/" + (modelo?.key ?? "")} style={{ resizeMode: "cover" }} />
                    </SView>
                    <SView style={{ position: "absolute", top: -6, left: -6, width: 18, height: 18, borderRadius: 10, backgroundColor: "#ff5252", justifyContent: "center", alignItems: "center" }}
                        onPress={() => MDL.carrito.removerItemAlCarritoDeCompras(item)}>
                        <SText fontSize={10} bold color={STheme.color.text}>{"✕"}</SText>
                    </SView>
                </SView>

                {/* Info del producto */}
                <SView flex>
                    <SText fontSize={UI.font.title} bold color={STheme.color.text} style={{ marginBottom: 2 }} numberOfLines={2}>
                        {modelo?.descripcion ?? "Producto"}
                    </SText>

                    {/* Fila precio / cantidad / subtotal */}
                    <SView row style={{ alignItems: "center", gap: 8, flexWrap: "wrap" }}>

                        {/* Precio unitario */}
                        <SView flex style={{
                            backgroundColor: Number(precioFormateado) > 0 ? UI.colors.mutedDark : UI.colors.error,
                            borderRadius: 2,
                            height: 18,
                            justifyContent: "center",
                        }}>
                            {puedeEditarCosto ? (
                                <SView row center style={{ paddingHorizontal: 2 }}>
                                    <SText fontSize={UI.font.tiny} color={UI.colors.accent} style={{ marginRight: 2 }}>{moneda?.observacion ?? "BS"}</SText>
                                    <SView flex>
                                        <SInput2
                                            name="precio"
                                            type="money"
                                            style={{ fontSize: UI.font.small, textAlign: "right", paddingRight: 0, color: UI.colors.accent }}
                                            defaultValue={precioFormateado}
                                            onChangeText={(e) => {
                                                setPrecioStr(e);
                                                const n = parseFloat(e) || 0;
                                                setPrecio(n);
                                                if (modelo) {
                                                    modelo.precio_compra_moneda = moneda ? n * (moneda.tipo_cambio || 1) : n;
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
                                    style={{ height: 18, width: "100%", paddingRight: 0, textAlign: "right" }}
                                    editable={false}
                                    icon={<SText color={STheme.color.lightGray}>{moneda?.observacion ?? "$"}</SText>}
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

                        {/* Badge cantidad */}
                        <SView style={{ width: 50, height: 18, borderRadius: 2, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
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

                        {/* Subtotal */}
                        <SText fontSize={UI.font.subtitle} bold color={STheme.color.text}
                            style={{ textAlign: "right", minWidth: 55, ...(subtotalLargo ? { width: "100%" } : {}) }}
                            numberOfLines={1}>
                            {subtotalStr}
                        </SText>
                    </SView>

                    {/* Fecha de vencimiento */}
                    <SView style={{ height: 20, backgroundColor: UI.colors.mutedDark, borderRadius: 2, marginTop: 6 }}>
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
