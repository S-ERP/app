import React from "react";
import { SDate, SGradient, SInput, SMath, SNotification, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../MDL";
import SSocket from "servisofts-socket";
import SIconApp from "../../Assets/SIconApp";
import { FlatList, Image } from "react-native";
import PopupCarritoConfirmar from "./PopupCarritoConfirmar";
import InputSelector from "../Selectores/InputSelector";
import FiltroMoneda from "../../Pages/puntoventa/Components/FiltroMoneda";
import SInput2, { SInput2Class } from "../SForm2/SInput2";

const colorVenta = "#2e7d32";

type PopupCarritoProps = {}
const UI = {
    font: { icon: 18, title: 16, subtitle: 14, small: 12, tiny: 10 },
    get colors() {
        return {
            background: STheme.color.background,
            header: colorVenta,
            danger: STheme.color.danger,
            card: STheme.color.card,
            itemBg: STheme.color.background,
            mutedDark: STheme.color.background,
            accent: colorVenta,
            error: STheme.color.danger,
            textMuted: STheme.color.lightGray,
            border: STheme.color.lightGray + "40",
        };
    }
};

const convertirADias = (tipo: string, cantidad: number) => {
    if (!tipo || !cantidad || isNaN(cantidad)) return 0;
    const conversiones: Record<string, number> = {
        horas: cantidad / 24,
        dias: cantidad,
        semanas: cantidad * 7,
        meses: cantidad * 30,
        anos: cantidad * 365,
        años: cantidad * 365,
    };
    return conversiones[tipo] ?? 0;
};

const normalizeSuscriptores = (item: any) => {
    let suscriptores = item.modelo.suscriptores || item.modelo.Suscritores || [];
    if (typeof suscriptores === 'object' && !Array.isArray(suscriptores)) {
        suscriptores = [suscriptores];
    } else if (!Array.isArray(suscriptores)) {
        suscriptores = [];
    }
    item.modelo.suscriptores = suscriptores;
    if (item.modelo.Suscritores) {
        delete item.modelo.Suscritores;
    }
    return suscriptores;
};

type CampoIncompletoSusc = { itemDesc: string; index: number } | null;

const validarSuscripcionesParcialesItems = (items: any[]): CampoIncompletoSusc => {
    for (const item of items) {
        const cantidadMiembros = Number(item.cantidad || 0) * Number(item.modelo?.cantidad_suscriptores || 0);
        if (!cantidadMiembros) continue;
        const suscriptores = normalizeSuscriptores(item);
        for (let i = 0; i < cantidadMiembros; i++) {
            const s = suscriptores[i];
            const hayAlgo = !!(s?.cliente || s?.key_cliente || s?.fecha_inicio || s?.fecha_fin);
            const completo = !!(s?.key_cliente || s?.cliente?.key) && !!s?.fecha_inicio && !!s?.fecha_fin;
            if (hayAlgo && !completo) return { itemDesc: item.modelo?.descripcion ?? "un producto", index: i };
        }
    }
    return null;
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
            this.cargarMonedaSeleccionada();
        });
        this.cargarMonedaSeleccionada();
        (globalThis as any).document?.addEventListener("keydown", this.handleKeyDown);
    }

    cargarMonedaSeleccionada() {
        const moneda = MDL.compra_venta.getMonedaSeleccionada();
        this.setState({ selectedMoneda: moneda || null });
    }

    componentWillUnmount(): void {
        MDL.carrito.removeEventListener(this.handleChange);
        if (this.evento) {
            MDL.compra_venta.removeEventListener(this.evento);
        }
        (globalThis as any).document?.removeEventListener("keydown", this.handleKeyDown);
    }

    render() {
        const items = MDL.carrito.carrito_venta.items;
        const { selectedMoneda } = this.state;
        return (
            <SView col={"xs-12"} height style={{ backgroundColor: UI.colors.background }}>
                <SView style={{ position: "relative", overflow: "hidden" }}>
                    <SGradient colors={[colorVenta, "#1b5e20"]} deg={120} />
                    <SView row style={{ paddingHorizontal: 14, paddingVertical: 10, alignItems: "center", }}>
                        <SView style={{ width: 24, height: 24, justifyContent: "center", alignItems: "center", marginRight: 8 }}> <SText fontSize={UI.font.icon}>🛒</SText> </SView>
                        <SText fontSize={UI.font.title} bold color={STheme.color.white}>{"Carrito de Ventas"}</SText>
                        <SView flex />
                        <SView style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: UI.colors.danger, justifyContent: "center", alignItems: "center", }} onPress={() => SPopup.close("PopupCarrito")} > <SText fontSize={UI.font.tiny} bold color={STheme.color.white}>{"✕"}</SText> </SView>
                    </SView>
                </SView>
                <SView style={{ padding: 8 }}>
                    <FiltroMoneda
                        onSelect={(moneda: string) => {
                            this.setState({ selectedMoneda: moneda });
                            MDL.compra_venta.setMonedaSeleccionada(moneda);
                            MDL.carrito.calcularValoresCarritDeVentas();
                        }}
                    />
                </SView>
                <SView row style={{ paddingHorizontal: 10, paddingVertical: 6, alignItems: "center", backgroundColor: colorVenta + "1c", borderBottomWidth: 1, borderBottomColor: colorVenta + "40" }}>
                    <SText fontSize={UI.font.small} color={STheme.color.text}> {"Productos ("}{MDL.carrito.carrito_venta.cantidad_items}{")"} </SText>
                    <SView flex />
                    <SText fontSize={UI.font.small} bold color={colorVenta}> {"Sub: "}{selectedMoneda?.observacion ?? "$"}{" "}{SMath.formatMoney(MDL.carrito.carrito_venta.monto_total)} </SText>
                </SView>
                <FlatList
                    data={items}
                    renderItem={({ item }) => <ItemComp item={item} moneda={selectedMoneda} />}
                    keyExtractor={(item) => item.modelo.key}
                    style={{ flex: 1, paddingHorizontal: 8 }}
                />
                <SView style={{
                    backgroundColor: STheme.color.background, borderTopWidth: 1, borderTopColor: STheme.color.lightGray + "50",
                    paddingHorizontal: 14, paddingVertical: 10,
                    shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12,
                }}>
                    <SView row style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <SText fontSize={UI.font.small} bold color={STheme.color.text}>{"Total Venta"}</SText>
                        <SText fontSize={UI.font.title} bold color={colorVenta}>
                            {selectedMoneda?.observacion ?? "$"}{" "}{SMath.formatMoney(MDL.carrito.carrito_venta.monto_total)}
                        </SText>
                    </SView>
                    <SView row style={{ gap: 8 }}>
                        <SView flex style={{ backgroundColor: UI.colors.danger, borderRadius: 6, paddingVertical: 9, alignItems: "center", justifyContent: "center", }} onPress={() => {
                            SPopup.confirm({
                                title: "¿Seguro que quieres limpiar el carrito?",
                                onPress: () => {
                                    MDL.carrito.limpiarCarritoVentas();
                                    SPopup.close("PopupCarrito");
                                }
                            })
                        }}>
                            <SText fontSize={UI.font.subtitle} bold color={STheme.color.white}>{"Limpiar"}</SText>
                        </SView>
                        <SView flex style={{
                            backgroundColor: UI.colors.header, borderRadius: 6, paddingVertical: 9, alignItems: "center", justifyContent: "center",
                            shadowColor: colorVenta, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 8,
                        }} onPress={() => {
                            const items = MDL.carrito.carrito_venta.items;
                            const itemConPrecioInvalido = items.find(it => {
                                const precio = (it?.modelo as any)?.precio_venta_moneda || (it?.modelo as any)?.precio_venta || 0;
                                return precio <= 0;
                            });
                            if (itemConPrecioInvalido) {
                                SNotification.send({
                                    title: "Precio requerido",
                                    body: `El producto "${itemConPrecioInvalido.modelo?.descripcion ?? "desconocido"}" no tiene precio registrado.`,
                                    color: STheme.color.danger,
                                });
                                return;
                            }
                            const itemConCantidadInvalida = items.find(it => {
                                const cantidad = it?.cantidad ?? 0;
                                return cantidad <= 0;
                            });
                            if (itemConCantidadInvalida) {
                                SNotification.send({
                                    title: "Cantidad requerida",
                                    body: `El producto "${itemConCantidadInvalida.modelo?.descripcion ?? "desconocido"}" tiene cantidad 0.`,
                                    color: STheme.color.danger,
                                });
                                return;
                            }

                            const itemSinStock = items.find(it => {
                                if ((it.modelo as any)?.tipo_producto?.tipo === 'servicio') return false;
                                const stock = (it.modelo as any)?.stock ?? (it.modelo as any)?.stock_actual;
                                if (stock === undefined || stock === null) return false;
                                return Number(stock) < Number(it.cantidad);
                            });
                            if (itemSinStock) {
                                const stock = (itemSinStock.modelo as any)?.stock ?? (itemSinStock.modelo as any)?.stock_actual ?? 0;
                                SNotification.send({
                                    title: "Stock insuficiente",
                                    body: `"${itemSinStock.modelo?.descripcion ?? "un producto"}" solo tiene ${stock} unidad(es) en stock.`,
                                    color: STheme.color.danger,
                                    time: 5000,
                                });
                                return;
                            }

                            const suscError = validarSuscripcionesParcialesItems(items);
                            if (suscError) {
                                SNotification.send({
                                    title: "Miembro incompleto",
                                    body: `El miembro ${suscError.index + 1} de "${suscError.itemDesc}" tiene campos sin completar. Completá todos los datos o borrálos.`,
                                    color: STheme.color.danger,
                                    time: 6000,
                                });
                                return;
                            }

                            for (const it of items) {
                                const costos: any[] = (it.modelo as any)?.tipoCostos || [];
                                for (const costo of costos) {
                                    const tieneCliente = !!costo.key_modelo_cliente;
                                    const tieneMonto = !!costo.monto && costo.monto > 0;
                                    if (tieneCliente && !tieneMonto) {
                                        SNotification.send({
                                            title: "Costo incompleto",
                                            body: `El costo "${costo.descripcion ?? ""}" de "${it.modelo?.descripcion ?? "un producto"}" necesita un monto.`,
                                            color: STheme.color.danger,
                                            time: 6000,
                                        });
                                        return;
                                    }
                                    if (!tieneCliente && tieneMonto) {
                                        SNotification.send({
                                            title: "Costo incompleto",
                                            body: `El costo "${costo.descripcion ?? ""}" de "${it.modelo?.descripcion ?? "un producto"}" necesita un cliente asignado.`,
                                            color: STheme.color.danger,
                                            time: 6000,
                                        });
                                        return;
                                    }
                                }
                            }
                            PopupCarritoConfirmar.open({});
                        }}>
                            <SText fontSize={UI.font.subtitle} bold color={STheme.color.white}>{"Confirmar venta"}</SText>
                        </SView>
                    </SView>
                </SView>
            </SView>
        );
    }
}

const ItemComp = ({ item, moneda }: { item: any; moneda: any }) => {
    const calcularPrecio = () => {
        if (!moneda) return item.modelo.precio_venta;
        if (item.modelo.venta_moneda?.key === moneda?.key) {
            return item.modelo.precio_venta;
        }
        const tipoCambioVenta = item.modelo.venta_moneda?.tipo_cambio || 1;
        const tipoCambioSeleccionada = moneda?.tipo_cambio || 1;
        return item.modelo.precio_venta * (tipoCambioVenta / tipoCambioSeleccionada);
    };
    const [precio, setPrecio] = React.useState(calcularPrecio);
    const [precioStr, setPrecioStr] = React.useState(() => (calcularPrecio() ?? 0).toFixed(2));
    const [imgError, setImgError] = React.useState(false);
    const inputPrecioRef = React.useRef<SInput2Class>(null);
    React.useEffect(() => {
        const p = calcularPrecio();
        setPrecio(p);
        const str = (p ?? 0).toFixed(2);
        setPrecioStr(str);
        inputPrecioRef.current?.setValue(str);
    }, [moneda, item.modelo.precio_venta]);

    // console.log()
    const precioFormateado = (precio ?? 0).toFixed(2);
    const puedeEditarPrecio = MDL.rolesPermisos.getPermiso({ url: "/empresa/punto_venta", permiso: "carrito_editar_precio" });
    const subtotalStr = SMath.formatMoney(precio * item.cantidad);
    const precioDigits = puedeEditarPrecio ? precioStr.replace(/[^0-9]/g, '').length : precioFormateado.replace(/[^0-9]/g, '').length;
    const subtotalLargo = puedeEditarPrecio ? precioDigits >= 10 : precioDigits >= 4;
    const precioValido = Number(precioFormateado) > 0;
    return (
        <SView style={{
            backgroundColor: precioValido ? colorVenta + "25" : STheme.color.danger + "25",
            borderRadius: 12,
            padding: 10,
            marginBottom: 10,
            borderLeftWidth: 4,
            borderLeftColor: precioValido ? colorVenta : STheme.color.danger,
            borderWidth: 1,
            borderColor: precioValido ? STheme.color.lightGray + "35" : STheme.color.danger + "45",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 6,
        }}>
            <SView row style={{ gap: 8, alignItems: "flex-start" }}>
                <SView style={{ position: "relative" }}>
                    <SView style={{
                        width: 35, height: 35, borderRadius: 6, overflow: "hidden",
                        borderWidth: 1, borderColor: STheme.color.lightGray + "50",
                        backgroundColor: STheme.color.lightGray + "20",
                        justifyContent: "center", alignItems: "center",
                    }}>
                        {imgError ? (
                            <SText fontSize={10} color={STheme.color.lightGray}>IMG</SText>
                            // <SText fontSize={11} color={STheme.color.lightGray}>{(item.modelo.descripcion?.trim()?.charAt(0) || "?").toUpperCase()}</SText>
                        ) : (
                            <Image
                                source={{ uri: (SSocket.api as any).inventario + "modelo/" + item.modelo.key }}
                                style={{ width: "100%", height: "100%", resizeMode: "cover" }}
                                onError={() => setImgError(true)}
                            />
                        )}
                    </SView>
                    <SView style={{
                        position: "absolute", top: -6, left: -6, width: 18, height: 18, borderRadius: 10, backgroundColor: STheme.color.danger, justifyContent: "center", alignItems: "center",
                        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 3,
                    }}
                        onPress={() => MDL.carrito.removerItemAlCarritoDeVentas(item)} >
                        <SText fontSize={10} bold color={STheme.color.white}>{"✕"}</SText>
                    </SView>
                </SView>
                <SView flex>
                    <SText fontSize={UI.font.title} bold color={STheme.color.text} style={{ marginBottom: 2 }} numberOfLines={2}>{item.modelo.descripcion}</SText>
                    <SView row style={{ alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <SView flex style={{
                            backgroundColor: precioValido ? colorVenta + "25" : STheme.color.danger + "25",
                            borderWidth: 1.5,
                            borderColor: precioValido ? colorVenta : STheme.color.danger,
                            borderRadius: 6, height: 22, justifyContent: "center",
                        }}>
                            {puedeEditarPrecio ? (
                                <SView row center style={{ paddingHorizontal: 4 }}>
                                    <SText fontSize={UI.font.small} color={precioValido ? colorVenta : STheme.color.danger} bold style={{ marginRight: 2 }}>
                                        {moneda?.observacion ?? "$"}
                                    </SText>
                                    <SView flex row>
                                        <SInput2
                                            ref={inputPrecioRef}
                                            name="precio"
                                            type="money"
                                            style={{ width: "100%", fontSize: UI.font.small, textAlign: "right", paddingRight: 0, color: STheme.color.text }}
                                            defaultValue={precioFormateado.toString()}
                                            onChangeText={(e) => {
                                                setPrecioStr(e);
                                                const n = parseFloat(e) || 0;
                                                setPrecio(n);
                                                item.modelo.precio_venta_moneda = n * (moneda?.tipo_cambio || 1);
                                                MDL.carrito.calcularValoresCarritDeVentas();
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
                                            body: "No tiene permiso para editar el precio de venta.",
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
                                    MDL.carrito.calcularValoresCarritDeVentas();
                                }}
                            />
                        </SView>
                        <SText fontSize={UI.font.subtitle} bold color={STheme.color.text} style={{ textAlign: "right", minWidth: 55, ...(subtotalLargo ? { width: "100%" } : {}) }} numberOfLines={1}>
                            {subtotalStr}
                        </SText>
                    </SView>
                </SView>
            </SView>
            <ListaCostos item={item} moneda={moneda} totalItem={precio * item.cantidad} />
            <ListaSuscripciones item={item} />
        </SView>
    );
};

const ListaCostos = ({ item, moneda, totalItem }: any) => {
    const [isOpen, setIsOpen] = React.useState(true);
    if (!item?.modelo?.tipoCostos?.length) return null;
    return (
        <SView style={{ marginTop: 10 }}>
            <SView row style={{ borderBottomWidth: 1, borderColor: STheme.color.lightGray, paddingBottom: 4, marginBottom: 4, alignItems: "center", }} onPress={() => setIsOpen(!isOpen)}>
                <SText fontSize={12} bold color={STheme.color.text}>{"Costos"}</SText>
                <SView flex />
                <SText fontSize={10} color={STheme.color.lightGray}>{" ("}{item.modelo.tipoCostos.length}{")"}</SText>
                <SView style={{ width: 16, height: 16, justifyContent: "center", alignItems: "center", marginLeft: 4 }}>
                    <SIconApp name="Back" fill={STheme.color.lightGray} width={8} style={{ transform: [{ rotate: isOpen ? "-90deg" : "180deg" }], userSelect: "none", pointerEvents: "none" }} />
                </SView>
            </SView>
            {isOpen && item.modelo.tipoCostos.map((costo: any) => (
                <CostoItem key={costo.key_tipo_costo} costo={costo} moneda={moneda} totalItem={totalItem} />
            ))}
        </SView>
    );
};

const ListaSuscripciones = ({ item }: any) => {
    const [isOpen, setIsOpen] = React.useState(true);
    const [clientes, setClientes] = React.useState<any[]>(Array.isArray(item.modelo.clientes) ? item.modelo.clientes : []);
    const [loadingClientes, setLoadingClientes] = React.useState(false);
    const [visible, setVisible] = React.useState(3);
    const cantidadMiembros = Number(item.cantidad || 0) * Number(item.modelo.cantidad_suscriptores || 0);
    if (!cantidadMiembros) return null;
    let suscriptores = item.modelo.suscriptores || item.modelo.Suscritores || [];
    if (typeof suscriptores === 'object' && !Array.isArray(suscriptores)) {
        suscriptores = [suscriptores];
    } else if (!Array.isArray(suscriptores)) {
        suscriptores = [];
    }
    item.modelo.suscriptores = suscriptores;
    if (item.modelo.Suscritores) {
        delete item.modelo.Suscritores;
    }

    React.useEffect(() => {
        let mounted = true;
        if (Array.isArray(item.modelo.clientes) && item.modelo.clientes.length > 0) {
            setClientes(item.modelo.clientes);
            return () => { mounted = false; };
        }
        setLoadingClientes(true);
        MDL.crm.cliente.getAll()
            .then((resp: any) => {
                if (!mounted) return;
                const all = Array.isArray(resp) ? resp : Object.values(resp || {}).filter((c: any) => !!c);
                setClientes(all);
                item.modelo.clientes = all;
            })
            .catch((err: any) => { console.error("Error cargando clientes:", err); })
            .finally(() => { if (mounted) setLoadingClientes(false); });
        return () => { mounted = false; };
    }, []);

    return (
        <SView style={{ marginTop: 10 }}>
            <SView row style={{ borderColor: STheme.color.lightGray, borderBottomWidth: 1, paddingBottom: 4, marginBottom: 4, alignItems: "center", }} onPress={() => setIsOpen(!isOpen)}>
                <SText fontSize={UI.font.small} bold color={STheme.color.text}>{"Miembros"}</SText>
                <SView flex />
                <SText fontSize={UI.font.tiny} color={STheme.color.text}>{" ("}{cantidadMiembros}{")"}</SText>
                <SView style={{ width: 16, height: 16, justifyContent: "center", alignItems: "center", marginLeft: 4 }}>
                    <SIconApp name="Back" fill={STheme.color.lightGray} width={8}
                        style={{ transform: [{ rotate: isOpen ? "-90deg" : "180deg" }], userSelect: "none", pointerEvents: "none" }} />
                </SView>
            </SView>
            {isOpen && (
                <SView col={"xs-12"}>
                    {Array.from({ length: Math.min(visible, cantidadMiembros) }, (_, i) => (
                        <SuscripcionItem
                            key={`suscripcion-${item.modelo.key}-${i}`}
                            index={i}
                            item={item}
                            suscriptor={item.modelo.suscriptores[i] || null}
                            clientes={clientes}
                            loadingClientes={loadingClientes}
                        />
                    ))}
                    {visible < cantidadMiembros && (
                        <SView style={{ paddingVertical: 8, alignItems: "center", backgroundColor: STheme.color.card, borderRadius: 4, marginTop: 4 }}
                            onPress={() => setVisible(v => v + 10)}>
                            <SText fontSize={12} color={STheme.color.lightGray}>
                                {`Mostrar ${Math.min(10, cantidadMiembros - visible)} más (${cantidadMiembros - visible} restantes)`}
                            </SText>
                        </SView>
                    )}
                </SView>
            )}
        </SView>
    );
};

const SuscripcionItem = ({ index, item, suscriptor, clientes, loadingClientes }: any) => {
    const [fechaInicio, setFechaInicio] = React.useState(suscriptor?.fecha_inicio || "");
    const [fechaFin, setFechaFin] = React.useState(suscriptor?.fecha_fin || "");
    const [cliente, setCliente] = React.useState(suscriptor?.cliente || null);
    const calcularFechaFin = (fechaInicioValue: string) => {
        if (!fechaInicioValue) return "";
        const dias = convertirADias(item.modelo?.duracion_medida, Number(item.modelo?.duracion || 0));
        if (!dias || isNaN(dias)) return "";
        const fecha = new SDate(fechaInicioValue, "yyyy-MM-dd");
        return fecha.addDay(dias - 1).toString("yyyy-MM-dd");
    };
    React.useEffect(() => {
        const inicio = suscriptor?.fecha_inicio || "";
        const fin = suscriptor?.fecha_fin || calcularFechaFin(inicio);
        setCliente(suscriptor?.cliente || null);
        setFechaInicio(inicio);
        setFechaFin(fin);
    }, [suscriptor]);
    const saveSuscriptor = (updates: any) => {
        let suscriptores = item.modelo.suscriptores || item.modelo.Suscritores || [];
        if (typeof suscriptores === 'object' && !Array.isArray(suscriptores)) {
            suscriptores = [suscriptores];
        } else if (!Array.isArray(suscriptores)) {
            suscriptores = [];
        }
        item.modelo.suscriptores = suscriptores;
        if (item.modelo.Suscritores) delete item.modelo.Suscritores;
        const current = item.modelo.suscriptores[index] || {};
        item.modelo.suscriptores[index] = {
            ...current,
            key: current.key || `suscriptor-${item.modelo.key}-${index}`,
            cliente: updates.cliente !== undefined ? updates.cliente : cliente,
            key_cliente: updates.key_cliente !== undefined ? updates.key_cliente : cliente?.key,
            fecha_inicio: updates.fecha_inicio !== undefined ? updates.fecha_inicio : fechaInicio,
            fecha_fin: updates.fecha_fin !== undefined ? updates.fecha_fin : fechaFin,
        };
    };

    const onChangeFechaInicio = (value: string) => {
        const fin = calcularFechaFin(value);
        setFechaInicio(value);
        setFechaFin(fin);
        saveSuscriptor({ fecha_inicio: value, fecha_fin: fin });
    };
    const onChangeFechaFin = (value: string) => {
        setFechaFin(value);
        saveSuscriptor({ fecha_fin: value });
    };
    const options = clientes.length > 0 ? clientes.map((c: any) => {
        const clienteData = c?.cliente ? c.cliente : c;
        return {
            label: clienteData?.nombres || clienteData?.razon_social || "Sin cliente",
            value: c?.key || clienteData?.key || "",
            data: c,
            customComponent: (
                <SText fontSize={10} color={STheme.color.lightGray}>
                    {c?.comision ? `${c.comision} %` : clienteData?.nit ? clienteData?.nit : "Cliente"}
                </SText>
            ),
        };
    }) : [{ label: loadingClientes ? "Cargando clientes..." : "No hay clientes", value: "", data: null }];
    const hayAlgo = !!cliente || !!fechaInicio || !!fechaFin;
    const clienteError = hayAlgo && !cliente;
    const fechaInicioError = hayAlgo && !fechaInicio;
    const fechaFinError = hayAlgo && !fechaFin;

    return (
        <SView style={{ marginBottom: 10 }}>
            <SText fontSize={UI.font.tiny} bold color={STheme.color.text} style={{ marginBottom: 2 }}> {"Miembro "}{index + 1} </SText>
            <SView style={{
                height: 22, borderRadius: 6, marginBottom: 6,
                backgroundColor: clienteError ? STheme.color.danger + "18" : STheme.color.lightGray + "15",
                borderWidth: 1, borderColor: clienteError ? STheme.color.danger + "50" : STheme.color.lightGray + "35",
            }}>
                <InputSelector
                    customStyle="erp"
                    placeholder="Selecciona un cliente"
                    options={options}
                    defaultValue={cliente?.key || null}
                    onSelect={(selected: any) => {
                        const selectedCliente = selected?.data?.cliente || selected?.data;
                        setCliente(selectedCliente);
                        saveSuscriptor({ cliente: selectedCliente, key_cliente: selected?.value });
                    }}
                />
            </SView>
            <SView row style={{ gap: 8 }}>
                <SView flex style={{
                    height: 22, borderRadius: 6,
                    backgroundColor: fechaInicioError ? STheme.color.danger + "18" : STheme.color.lightGray + "15",
                    borderWidth: 1, borderColor: fechaInicioError ? STheme.color.danger + "50" : STheme.color.lightGray + "35",
                }}>
                    <SInput style={{ height: 20, fontSize: UI.font.small, padding: 0, paddingLeft: 4 }} type="date"
                        icon={<SText width={50} fontSize={UI.font.tiny} numberOfLines={1} color={STheme.color.text} style={{ marginLeft: 4 }}>{"F. Inicio"}</SText>}
                        value={fechaInicio}
                        onChangeText={onChangeFechaInicio}
                    />
                </SView>
                <SView flex style={{
                    height: 22, borderRadius: 6,
                    backgroundColor: fechaFinError ? STheme.color.danger + "18" : STheme.color.lightGray + "15",
                    borderWidth: 1, borderColor: fechaFinError ? STheme.color.danger + "50" : STheme.color.lightGray + "35",
                }}>
                    <SInput style={{ height: 20, fontSize: UI.font.small, padding: 0, paddingLeft: 4 }} type="date"
                        icon={<SText width={40} fontSize={UI.font.tiny} numberOfLines={1} color={STheme.color.text} style={{ marginLeft: 4 }}>{"F. Fin"}</SText>}
                        value={fechaFin}
                        onChangeText={onChangeFechaFin}
                    />
                </SView>
            </SView>
        </SView>
    );
};

const CostoItem = ({ costo, moneda, totalItem }: any) => {
    const [monto, setMonto] = React.useState(costo.monto || 0);
    const [inputValue, setInputValue] = React.useState((costo.monto || 0).toFixed(2));
    const [clienteKey, setClienteKey] = React.useState(costo.key_modelo_cliente || "");
    const [resetKey, setResetKey] = React.useState(0);
    const setProgrammaticMonto = (nuevoMonto: number) => {
        setMonto(nuevoMonto);
        setInputValue(nuevoMonto.toFixed(2));
        setResetKey(k => k + 1);
        costo.monto = nuevoMonto;
    };
    React.useEffect(() => {
        if (!costo.key_modelo_cliente) return;
        const cliente = (costo.clientes || []).find((c: any) => c.key === costo.key_modelo_cliente);
        if (!cliente) return;
        const comision = parseFloat(cliente.comision || "0");
        setProgrammaticMonto(totalItem * (comision / 100));
    }, [totalItem, costo.key_modelo_cliente]);
    const clienteError = !!monto && !clienteKey;
    const montoError = !!clienteKey && !monto;
    return (
        <SView style={{ marginBottom: 4 }}>
            <SText fontSize={UI.font.small} color={UI.colors.textMuted} style={{ marginBottom: 1 }}>{costo.descripcion}</SText>
            <SView row style={{ gap: 8 }}>
                <SView flex style={{
                    height: 22, borderRadius: 6,
                    backgroundColor: clienteError ? STheme.color.danger + "18" : STheme.color.lightGray + "15",
                    borderWidth: 1, borderColor: clienteError ? STheme.color.danger + "50" : STheme.color.lightGray + "35",
                }}>
                    <InputSelector
                        customStyle="erp"
                        placeholder="Seleccionar cliente"
                        options={(costo.clientes || []).map((c: any) => ({
                            label: c.cliente?.nombres || c.cliente?.razon_social || c.nombres || "Sin nombre",
                            value: c.key,
                            data: c,
                            customComponent: (
                                <SText fontSize={UI.font.tiny} color={STheme.color.lightGray}>{c.comision} %</SText>
                            ),
                        }))}
                        defaultValue={costo.key_modelo_cliente || null}
                        onSelect={(selected: any) => {
                            costo.key_modelo_cliente = selected.value;
                            costo.__descripcion = `Costo por ${costo.descripcion} para ${selected.data.cliente?.nombres}`;
                            const comision = parseFloat(selected.data.comision || "0");
                            setProgrammaticMonto(totalItem * (comision / 100));
                            setClienteKey(selected.value);
                        }}
                    />
                </SView>
                <SView style={{
                    width: 95, height: 22, borderRadius: 6,
                    backgroundColor: montoError ? STheme.color.danger + "18" : STheme.color.lightGray + "15",
                    borderWidth: 1, borderColor: montoError ? STheme.color.danger + "50" : STheme.color.lightGray + "35",
                }}>
                    <SView row style={{ alignItems: "center", height: "100%", paddingHorizontal: 4 }}>
                        <SText fontSize={UI.font.tiny} color={STheme.color.lightGray}>{moneda?.observacion ?? "$"}</SText>
                        <SView flex>
                            <SInput2
                                key={resetKey}
                                name={`monto_${costo.key_tipo_costo}`}
                                type="money"
                                style={{ fontSize: UI.font.small, padding: 0, paddingRight: 4, textAlign: "right" }}
                                defaultValue={inputValue}
                                onChangeText={(e: string) => {
                                    setInputValue(e);
                                    const valor = parseFloat(e) || 0;
                                    setMonto(valor);
                                    costo.monto = valor;
                                }}
                            />
                        </SView>
                    </SView>
                </SView>
            </SView>
        </SView>
    );
};