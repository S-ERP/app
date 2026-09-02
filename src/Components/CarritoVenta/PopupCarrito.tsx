import React from "react";

import { Animated, FlatList, Image } from "react-native";
import { SDate, SGradient, SInput, SMath, SNotification, SPopup, SText, STheme, SView } from "servisofts-component";
import SSocket from "servisofts-socket";

import SIconApp from "../../Assets/SIconApp";
import MDL from "../../MDL";
import FiltroMoneda from "../../Pages/puntoventa/Components/FiltroMoneda";
import SInput2, { SInput2Class } from "../SForm2/SInput2";
import InputSelector from "../Selectores/InputSelector";
import PopupCarritoConfirmar from "./PopupCarritoConfirmar";
const colorVenta = "#2e7d32";
const colorAdvertencia = "#EAB308"; // amarillo para avisos (no es un error)

type PopupCarritoProps = {}
const UI = {
    font: { icon: 18, title: 16, subtitle: 14, small: 12, tiny: 10 },
    get colors() {
        return {
            background: STheme.color.background,
            header: colorVenta,
            danger: STheme.color.danger,
            card: STheme.color.card,
            textMuted: STheme.color.lightGray,
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

// Obligatorio: TODOS los slots de miembros deben estar completos (cliente + fecha_inicio + fecha_fin).
const validarSuscripcionesCompletasItems = (items: any[]): CampoIncompletoSusc => {
    for (const item of items) {
        const cantidadMiembros = Number(item.cantidad || 0) * Number(item.modelo?.cantidad_suscriptores || 0);
        if (!cantidadMiembros) continue;
        const suscriptores = normalizeSuscriptores(item);
        for (let i = 0; i < cantidadMiembros; i++) {
            const s = suscriptores[i];
            const completo = !!(s?.key_cliente || s?.cliente?.key) && !!s?.fecha_inicio && !!s?.fecha_fin;
            if (!completo) return { itemDesc: item.modelo?.descripcion ?? "un producto", index: i };
        }
    }
    return null;
};

// yyyy-MM-dd sin importar si viene como fecha o timestamp ("2026-08-03T04:00:00.000Z")
const toYmd = (v: any): string => {
    if (!v) return "";
    if (typeof v === "string") return v.length >= 10 ? v.slice(0, 10) : v;
    try { return new SDate(v).toString("yyyy-MM-dd"); } catch { return ""; }
};
const hoyYmd = (): string => String(new SDate().toString("yyyy-MM-dd"));

// Cache de modelo->tipo_producto (para filtrar suscripciones del mismo tipo)
let __modeloTipoMapPromise: Promise<Record<string, string>> | null = null;
const getModeloTipoMap = (): Promise<Record<string, string>> => {
    if (!__modeloTipoMapPromise) {
        __modeloTipoMapPromise = (async () => {
            try {
                const modelos: any = await MDL.inventario.getAllModelo();
                const list = Array.isArray(modelos) ? modelos : Object.values(modelos || {});
                const map: Record<string, string> = {};
                list.forEach((m: any) => { if (m?.key) map[m.key] = m?.key_tipo_producto; });
                return map;
            } catch { return {}; }
        })();
    }
    return __modeloTipoMapPromise;
};

// Sin cache: consulta fresca al servidor en cada selección para recalcular siempre.
const getSubsCliente = (key_cliente: string): Promise<any[]> => {
    return MDL.inventario.getSuscripcionesByCliente(key_cliente).catch(() => []);
};

// Calcula la fecha de inicio encadenada para un cliente y un item:
//  - sin cobertura activa del mismo tipo_producto -> hoy
//  - con cobertura activa (fecha_fin >= hoy)       -> fin + 1 dia
// Considera suscripciones ya registradas y los OTROS slots ya cargados en el carrito.
// Excluye el slot actual (item + index) para no anclarse en su propio valor previo.
type ResultadoInicio = { inicio: string; vigenteHasta: string | null };
const calcularInicioEncadenado = async (key_cliente: string, item: any, index?: number): Promise<ResultadoInicio> => {
    const hoy = hoyYmd();
    if (!key_cliente) return { inicio: hoy, vigenteHasta: null };
    const tipoActual = item?.modelo?.key_tipo_producto;
    let anchor: string | null = null;
    const considerar = (fin?: string, estado?: number) => {
        if (estado != null && Number(estado) <= 0) return;
        const f = toYmd(fin);
        if (f && f >= hoy && (!anchor || f > anchor)) anchor = f;
    };
    try {
        const [subs, tipoMap] = await Promise.all([getSubsCliente(key_cliente), getModeloTipoMap()]);
        (subs || []).forEach((s: any) => {
            const km = s?.producto?.key_modelo;
            const tipo = tipoMap[km];
            if (tipoActual && tipo && tipo !== tipoActual) return; // distinto tipo_producto
            considerar(s?.fecha_fin, s?.estado);
        });
    } catch { }
    // Encadenado con OTROS slots ya cargados en el carrito (mismo cliente + mismo tipo).
    try {
        const items = (MDL as any).carrito?.carrito_venta?.items || [];
        items.forEach((it: any) => {
            if (tipoActual && it?.modelo?.key_tipo_producto !== tipoActual) return;
            (it?.modelo?.suscriptores || []).forEach((s: any, sIdx: number) => {
                if (it === item && sIdx === index) return; // excluir el slot actual
                const kc = s?.key_cliente || s?.cliente?.key;
                if (kc !== key_cliente) return;
                considerar(s?.fecha_fin);
            });
        });
    } catch { }
    if (anchor) return { inicio: String(new SDate(anchor, "yyyy-MM-dd").addDay(1).toString("yyyy-MM-dd")), vigenteHasta: anchor };
    return { inicio: hoy, vigenteHasta: null };
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
                    borderWidth: 1,
                    borderColor: STheme.color.card,
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
        MDL.carrito.removeEventListener("handleChange", this.handleChange);
        if (this.evento) {
            MDL.compra_venta.removeEventListener("moneda_seleccionada", this.evento);
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
                                return precio < 0;
                            });
                            if (itemConPrecioInvalido) {
                                SNotification.send({
                                    title: "Precio requerido",
                                    body: `El producto "${itemConPrecioInvalido.modelo?.descripcion ?? "desconocido"}" no tiene precio registrado.`,
                                    color: STheme.color.danger,
                                });
                                console.warn("[ProKeybindings] archivo: condición no cumplida, se cancela.");
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
                                console.warn("[ProKeybindings] archivo: condición no cumplida, se cancela.");
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
                                console.warn("[ProKeybindings] archivo: condición no cumplida, se cancela.");
                                return;
                            }

                            const suscError = validarSuscripcionesCompletasItems(items);
                            if (suscError) {
                                SNotification.send({
                                    title: "Falta seleccionar el miembro",
                                    body: `Seleccioná el cliente y las fechas del miembro ${suscError.index + 1} de "${suscError.itemDesc}". Todos los miembros son obligatorios.`,
                                    color: colorAdvertencia,
                                    time: 6000,
                                });
                                console.warn("[ProKeybindings] archivo: condición no cumplida, se cancela.");
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
                                        console.warn("[ProKeybindings] archivo: condición no cumplida, se cancela.");
                                        return;
                                    }
                                    if (!tieneCliente && tieneMonto) {
                                        SNotification.send({
                                            title: "Costo incompleto",
                                            body: `El costo "${costo.descripcion ?? ""}" de "${it.modelo?.descripcion ?? "un producto"}" necesita un cliente asignado.`,
                                            color: STheme.color.danger,
                                            time: 6000,
                                        });
                                        console.warn("[ProKeybindings] archivo: condición no cumplida, se cancela.");
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
        if (!moneda || !item?.modelo) return item?.modelo?.precio_venta || 0;
        if (item.modelo.venta_moneda?.key === moneda?.key) {
            return item.modelo.precio_venta;
        }
        const tipoCambioVenta = item.modelo.venta_moneda?.tipo_cambio || 1;
        const tipoCambioSeleccionada = moneda?.tipo_cambio || 1;
        if (tipoCambioSeleccionada === 0) return item.modelo.precio_venta || 0;
        return (item.modelo.precio_venta || 0) * (tipoCambioVenta / tipoCambioSeleccionada);
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
                                                if (!e || typeof e !== 'string') return;
                                                setPrecioStr(e);
                                                const n = parseFloat(e);
                                                if (isNaN(n)) return;
                                                setPrecio(n);
                                                if (item?.modelo && moneda?.tipo_cambio) {
                                                    item.modelo.precio_venta_moneda = n * moneda.tipo_cambio;
                                                }
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
                                        console.warn("[ProKeybindings] archivo: condición no cumplida, se cancela.");
                                        return
                                    }}
                                />
                            )}
                        </SView>
                        <SView style={{
                            width: 52, height: 22, borderRadius: 6, alignItems: "center", justifyContent: "center", overflow: "hidden",
                            backgroundColor: item?.cantidad < 1 ? STheme.color.danger : STheme.color.lightGray + "18",

                            borderWidth: 1,
                            borderColor: (item?.cantidad || 0) === 0 ? STheme.color.danger : STheme.color.lightGray + "40",
                        }}>
                            <SInput
                                style={{ fontSize: UI.font.small, paddingLeft: 0.5, textAlign: "center", color: (item?.cantidad || 0) === 0 ? STheme.color.white : STheme.color.text, fontWeight: "bold" }}
                                type="money2"
                                icon={<SText fontSize={10} color={(item?.cantidad || 0) === 0 ? STheme.color.white : STheme.color.text}>{"x"}</SText>}
                                value={(item?.cantidad || 0).toString()}
                                onChangeText={(e) => {
                                    if (typeof e !== 'string') return;
                                    if (e?.trim() === '') {
                                        if (item?.modelo) {
                                            item.cantidad = 0;
                                            MDL.carrito.calcularValoresCarritDeVentas();
                                        }
                                        return;
                                    }
                                    const cantidad = parseFloat(e);
                                    if (isNaN(cantidad) || cantidad < 0) return;
                                    if (item?.modelo) {
                                        item.cantidad = cantidad;
                                        MDL.carrito.calcularValoresCarritDeVentas();
                                    }
                                }}
                            />
                        </SView>
                        <SText fontSize={UI.font.subtitle} bold color={STheme.color.text} style={{ textAlign: "right", minWidth: 55, ...(subtotalLargo ? { width: "100%" } : {}) }} numberOfLines={1}>
                            {subtotalStr}
                        </SText>
                    </SView>
                </SView>
            </SView>
            <ListaReceta item={item} />
            <ListaCostos item={item} moneda={moneda} totalItem={precio * item.cantidad} />
            <ListaSuscripciones item={item} />
        </SView>
    );
};

const ListaCostos = React.memo(({ item, moneda, totalItem }: any) => {
    const [isOpen, setIsOpen] = React.useState(true);
    if (!item?.modelo?.tipoCostos?.length) return null;

    const costos = React.useMemo(() => item.modelo.tipoCostos, [item.modelo.tipoCostos]);

    return (
        <SView style={{ marginTop: 10 }}>
            <SView row style={{ borderBottomWidth: 1, borderColor: STheme.color.lightGray, paddingBottom: 4, marginBottom: 4, alignItems: "center", }} onPress={() => setIsOpen(!isOpen)}>
                <SText fontSize={12} bold color={STheme.color.text}>{"Costos"}</SText>
                <SView flex />
                <SText fontSize={10} color={STheme.color.lightGray}>{" ("}{costos.length}{")"}</SText>
                <SView style={{ width: 16, height: 16, justifyContent: "center", alignItems: "center", marginLeft: 4 }}>
                    <SIconApp name="Back" fill={STheme.color.lightGray} width={8} style={{ transform: [{ rotate: isOpen ? "-90deg" : "180deg" }], userSelect: "none", pointerEvents: "none" }} />
                </SView>
            </SView>
            {isOpen && costos.map((costo: any) => (
                <CostoItem key={costo.key_tipo_costo} costo={costo} moneda={moneda} totalItem={totalItem} />
            ))}
        </SView>
    );
}, (prev, next) => {
    return prev.item.modelo.tipoCostos === next.item.modelo.tipoCostos &&
        prev.moneda === next.moneda &&
        prev.totalItem === next.totalItem;
});

const normalizeSuscriptoresInline = (item: any) => {
    if (item.modelo._suscriptoresNormalizados) return;
    let suscriptores = item.modelo.suscriptores || item.modelo.Suscritores || [];
    if (typeof suscriptores === 'object' && !Array.isArray(suscriptores)) {
        suscriptores = [suscriptores];
    } else if (!Array.isArray(suscriptores)) {
        suscriptores = [];
    }
    item.modelo.suscriptores = suscriptores;
    if (item.modelo.Suscritores) delete item.modelo.Suscritores;
    item.modelo._suscriptoresNormalizados = true;
};

// Store reactivo compartido de clientes: se refresca fresco al abrir (refleja altas/bajas
// externas) y notifica en vivo a todos los selectores cuando se crea uno inline.
const keyDe = (c: any) => c?.key || c?.cliente?.key || "";
const clientesStore = (() => {
    let list: any[] = [];
    const subs = new Set<() => void>();
    const notify = () => subs.forEach(fn => { try { fn(); } catch { } });
    const normalize = (resp: any) => (Array.isArray(resp) ? resp : Object.values(resp || {})).filter(Boolean);
    return {
        getList: () => list,
        subscribe(fn: () => void) { subs.add(fn); return () => { subs.delete(fn); }; },
        async refresh() {
            try {
                const resp = await MDL.crm?.cliente?.getAll?.();
                list = normalize(resp);
                notify();
            } catch { /* mantenemos la lista previa */ }
            return list;
        },
        add(c: any) {
            const k = keyDe(c);
            if (!k || list.some((x: any) => keyDe(x) === k)) return;
            list = [...list, c];
            notify();
        },
        remove(key: string) {
            const before = list.length;
            list = list.filter((x: any) => keyDe(x) !== key);
            if (list.length !== before) notify();
        },
    };
})();

const ListaSuscripciones = ({ item }: any) => {
    const [isOpen, setIsOpen] = React.useState(true);
    const [clientes, setClientes] = React.useState<any[]>(clientesStore.getList());
    const [loadingClientes, setLoadingClientes] = React.useState(clientesStore.getList().length === 0);
    const [visible, setVisible] = React.useState(3);

    normalizeSuscriptoresInline(item);

    const cantidadMiembros = Number(item.cantidad || 0) * Number(item.modelo.cantidad_suscriptores || 0);

    React.useEffect(() => {
        const unsub = clientesStore.subscribe(() => setClientes(clientesStore.getList()));
        if (clientesStore.getList().length === 0) setLoadingClientes(true);
        clientesStore.refresh().finally(() => setLoadingClientes(false));
        return unsub;
    }, []);

    const handleClienteCreado = React.useCallback((c: any) => { clientesStore.add(c); }, []);

    if (!cantidadMiembros) return null;

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
                    {Array.from({ length: Math.min(Math.max(0, visible || 0), Math.max(0, cantidadMiembros || 0)) }, (_, i) => (
                        <SuscripcionItem
                            key={`suscripcion-${item.modelo.key}-${i}`}
                            index={i}
                            item={item}
                            suscriptor={item.modelo.suscriptores?.[i] || null}
                            clientes={clientes}
                            loadingClientes={loadingClientes}
                            onClienteCreado={handleClienteCreado}
                        />
                    ))}
                    {(visible || 0) < (cantidadMiembros || 0) && (
                        <SView style={{ paddingVertical: 8, alignItems: "center", backgroundColor: STheme.color.card, borderRadius: 4, marginTop: 4 }}
                            onPress={() => setVisible(v => v + 10)}>
                            <SText fontSize={12} color={STheme.color.lightGray}>
                                {`Mostrar ${Math.min(10, Math.max(0, (cantidadMiembros || 0) - (visible || 0)))} más (${Math.max(0, (cantidadMiembros || 0) - (visible || 0))} restantes)`}
                            </SText>
                        </SView>
                    )}
                </SView>
            )}
        </SView>
    );
};

const ListaReceta = ({ item }: any) => {
    const [isOpen, setIsOpen] = React.useState(true);
    const receta = item.modelo?.receta;
    const cantidadCarrito = item.cantidad || 0;
    const ingredientes = receta && Array.isArray(receta) ? receta : [];

    const inicializarSelecciones = () => {
        const selecciones: Record<string, any> = {};
        if (!Array.isArray(ingredientes)) return selecciones;
        ingredientes.forEach((ing: any, idx: number) => {
            const cantidadIngrediente = ing.cantidad || 1;
            const totalSelectores = cantidadCarrito * cantidadIngrediente;
            for (let i = 0; i < totalSelectores; i++) {
                selecciones[`${idx}-${i}`] = ing.opciones?.[0] || null;
            }
        });
        return selecciones;
    };

    const [selecciones, setSelecciones] = React.useState(inicializarSelecciones());

    if (!receta || !Array.isArray(receta) || cantidadCarrito === 0 || ingredientes.length === 0) return null;

    return (
        <SView style={{ marginTop: 10 }}>
            <SView row style={{ borderColor: STheme.color.lightGray, borderBottomWidth: 1, paddingBottom: 4, marginBottom: 4, alignItems: "center", }} onPress={() => setIsOpen(!isOpen)}>
                <SText fontSize={UI.font.small} bold color={STheme.color.text}>{"Combo"}</SText>
                <SView flex />
                <SText fontSize={UI.font.tiny} color={STheme.color.text}>{" ("}{ingredientes.length}{")"}</SText>
                <SView style={{ width: 16, height: 16, justifyContent: "center", alignItems: "center", marginLeft: 4 }}>
                    <SIconApp name="Back" fill={STheme.color.lightGray} width={8}
                        style={{ transform: [{ rotate: isOpen ? "-90deg" : "180deg" }], userSelect: "none", pointerEvents: "none" }} />
                </SView>
            </SView>
            {isOpen && (
                <SView col={"xs-12"}>
                    {ingredientes.map((ing: any, idx: number) => {
                        const cantidadIngrediente = ing.cantidad || 1;
                        const cantidadCarrito = item.cantidad || 1;
                        const totalSelectores = cantidadCarrito * cantidadIngrediente;
                        const opciones = ing.opciones && Array.isArray(ing.opciones) ? ing.opciones : [];
                        const options = opciones.map((op: any) => ({
                            label: op.descripcion || "Sin descripción",
                            value: op.key_modelo || idx,
                            data: op,
                            customComponent: (
                                <SText fontSize={UI.font.tiny} color={STheme.color.lightGray}>
                                    {op.precio_venta || 0}
                                </SText>
                            ),
                        }));

                        return (
                            <SView key={idx} style={{ marginBottom: 10 }}>
                                <SView row style={{ alignItems: "center", gap: 4, marginBottom: 6 }}>
                                    <SText fontSize={UI.font.small} bold color={STheme.color.text}>
                                        {ing.descripcion || "Sin descripción"}
                                    </SText>
                                    <SText fontSize={UI.font.tiny} color={STheme.color.textMuted}>
                                        ({totalSelectores})
                                    </SText>
                                </SView>
                                {Array.from({ length: totalSelectores }).map((_, i) => {
                                    const key = `${idx}-${i}`;
                                    const selectedOpcion = selecciones[key] || opciones[0];
                                    return (
                                        <SView key={key} style={{ marginBottom: 8 }}>
                                            <SText fontSize={UI.font.small} color={STheme.color.text}>
                                                {selectedOpcion?.descripcion || "Sin descripción"}
                                            </SText>
                                        </SView>
                                    );
                                })}
                            </SView>
                        );
                    })}
                </SView>
            )}
        </SView>
    );
};

// Parpadeo mientras `active` (campo obligatorio vacío) para llamar la atención.
const useBlink = (active: boolean) => {
    const anim = React.useRef(new Animated.Value(0)).current;
    React.useEffect(() => {
        if (!active) { anim.stopAnimation(); anim.setValue(0); return; }
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(anim, { toValue: 1, duration: 550, useNativeDriver: false }),
                Animated.timing(anim, { toValue: 0, duration: 550, useNativeDriver: false }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, [active, anim]);
    return anim;
};

// Contenedor de campo obligatorio: borde/fondo rojo parpadeante si `error`, normal si no.
const CampoObligatorio = ({ error, flex, style, children }: any) => {
    const anim = useBlink(!!error);
    const base: any = { borderRadius: 6, borderWidth: 1, ...(flex ? { flex: 1 } : null), ...(style || {}) };
    if (!error) {
        return (
            <SView style={{ ...base, backgroundColor: STheme.color.lightGray + "15", borderColor: STheme.color.lightGray + "35" }}>
                {children}
            </SView>
        );
    }
    return (
        <Animated.View style={{
            ...base,
            backgroundColor: anim.interpolate({ inputRange: [0, 1], outputRange: [STheme.color.danger + "12", STheme.color.danger + "55"] }),
            borderColor: anim.interpolate({ inputRange: [0, 1], outputRange: [STheme.color.danger + "40", STheme.color.danger] }),
        }}>
            {children}
        </Animated.View>
    );
};

const SuscripcionItemBase = ({ index, item, suscriptor, clientes, loadingClientes, onClienteCreado }: any) => {
    const [fechaInicio, setFechaInicio] = React.useState(suscriptor?.fecha_inicio || "");
    const [fechaFin, setFechaFin] = React.useState(suscriptor?.fecha_fin || "");
    const [cliente, setCliente] = React.useState(suscriptor?.cliente || null);
    const [vigenteHasta, setVigenteHasta] = React.useState<string | null>(null);

    const calcularFechaFin = React.useCallback((fechaInicioValue: string) => {
        if (!fechaInicioValue) return "";
        const medida = item.modelo?.duracion_medida;
        const cantidad = Number(item.modelo?.duracion || 0);
        if (!cantidad || isNaN(cantidad)) return "";
        const fecha = new SDate(fechaInicioValue, "yyyy-MM-dd");
        // "meses"/"años" -> calendario (ej. 1 mes: 26 -> 26). Resto -> inicio + (dias - 1).
        if (medida === "meses") return fecha.addMonth(cantidad).toString("yyyy-MM-dd");
        if (medida === "anos" || medida === "años") return fecha.addYear(cantidad).toString("yyyy-MM-dd");
        const dias = convertirADias(medida, cantidad);
        if (!dias || isNaN(dias)) return "";
        return fecha.addDay(dias - 1).toString("yyyy-MM-dd");
    }, [item.modelo?.duracion_medida, item.modelo?.duracion]);

    React.useEffect(() => {
        const inicio = suscriptor?.fecha_inicio || "";
        const fin = suscriptor?.fecha_fin || (inicio ? calcularFechaFin(inicio) : "");
        setCliente(suscriptor?.cliente || null);
        setFechaInicio(inicio);
        setFechaFin(fin);
        setVigenteHasta(null);
    }, [suscriptor, calcularFechaFin]);

    const saveSuscriptor = React.useCallback((updates: any) => {
        if (!item?.modelo?.suscriptores || !Array.isArray(item.modelo.suscriptores)) return;
        const suscriptores = item.modelo.suscriptores;
        const current = suscriptores[index] || {};
        suscriptores[index] = {
            ...current,
            key: current.key || `suscriptor-${item.modelo?.key || 'unknown'}-${index}`,
            cliente: updates.cliente !== undefined ? updates.cliente : cliente,
            key_cliente: updates.key_cliente !== undefined ? updates.key_cliente : cliente?.key,
            fecha_inicio: updates.fecha_inicio !== undefined ? updates.fecha_inicio : fechaInicio,
            fecha_fin: updates.fecha_fin !== undefined ? updates.fecha_fin : fechaFin,
        };
    }, [index, item?.modelo?.key, cliente, fechaInicio, fechaFin]);

    const onChangeFechaInicio = React.useCallback((value: string) => {
        const fin = calcularFechaFin(value);
        setFechaInicio(value);
        setFechaFin(fin);
        saveSuscriptor({ fecha_inicio: value, fecha_fin: fin });
    }, [calcularFechaFin, saveSuscriptor]);

    const onChangeFechaFin = React.useCallback((value: string) => {
        setFechaFin(value);
        saveSuscriptor({ fecha_fin: value });
    }, [saveSuscriptor]);

    const options = React.useMemo(() => {
        if (clientes.length > 0) {
            return clientes.map((c: any) => {
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
            });
        }
        return [{ label: loadingClientes ? "Cargando clientes..." : "No hay clientes", value: "", data: null }];
    }, [clientes, loadingClientes]);

    // El cliente del miembro es obligatorio: se marca en rojo mientras no se seleccione.
    const clienteError = !cliente;
    const fechaInicioError = !fechaInicio;
    const fechaFinError = !fechaFin;

    const onSelectCliente = React.useCallback(async (selected: any) => {
        if (!selected) return;
        const selectedCliente = selected?.data?.cliente || selected?.data;
        const key_cliente = selected?.value || selectedCliente?.key;
        setCliente(selectedCliente);
        saveSuscriptor({ cliente: selectedCliente, key_cliente });
        // Cálculo automático de fechas (encadenado) al seleccionar el miembro
        try {
            const { inicio, vigenteHasta: vh } = await calcularInicioEncadenado(key_cliente, item, index);
            const fin = calcularFechaFin(inicio);
            setFechaInicio(inicio);
            setFechaFin(fin);
            setVigenteHasta(vh);
            saveSuscriptor({ cliente: selectedCliente, key_cliente, fecha_inicio: inicio, fecha_fin: fin });
        } catch { }
    }, [saveSuscriptor, item, index, calcularFechaFin]);

    // Crear cliente inline cuando no existe (escribe el nombre y elige "+ Registrar ...")
    const onCreateCliente = React.useCallback(async (texto: string) => {
        const nombre = (texto || "").trim();
        if (!nombre) throw new Error("Nombre vacío");
        const resp: any = await MDL.crm.cliente.registrar({
            razon_social: nombre,
            nombres: nombre,
            key_empresa: MDL.empresa.select?.key,
        } as any);
        if (!resp?.key) {
            SNotification.send({ title: "Error", body: "No se pudo crear el cliente.", color: STheme.color.danger, time: 3000 });
            throw new Error("No se pudo crear el cliente");
        }
        onClienteCreado?.(resp);
        SNotification.send({ title: "Cliente creado", body: nombre, time: 2000, color: STheme.color.success });
        return { label: resp?.nombres || resp?.razon_social || nombre, value: resp.key, data: resp };
    }, [onClienteCreado]);

    return (
        <SView style={{ marginBottom: 10 }}>
            <SText fontSize={UI.font.tiny} bold color={STheme.color.text} style={{ marginBottom: 2 }}> {"Miembro "}{index + 1} </SText>
            <CampoObligatorio error={clienteError} style={{ height: 22, marginBottom: 6 }}>
                <InputSelector
                    customStyle="erp"
                    placeholder="Selecciona o escribe para crear"
                    options={options}
                    defaultValue={cliente?.key || null}
                    onSelect={onSelectCliente}
                    onCreate={onCreateCliente}
                />
            </CampoObligatorio>
            <SView row style={{ gap: 8 }}>
                <CampoObligatorio error={fechaInicioError} flex style={{ height: 22 }}>
                    <SInput style={{ height: 20, fontSize: UI.font.small, padding: 0, paddingLeft: 4 }} type="date"
                        icon={<SText width={40} fontSize={UI.font.tiny} numberOfLines={1} color={STheme.color.text} style={{ marginLeft: 4 }}>{"Desde"}</SText>}
                        value={fechaInicio}
                        onChangeText={onChangeFechaInicio}
                    />
                </CampoObligatorio>
                <CampoObligatorio error={fechaFinError} flex style={{ height: 22 }}>
                    <SInput style={{ height: 20, fontSize: UI.font.small, padding: 0, paddingLeft: 4 }} type="date"
                        icon={<SText width={40} fontSize={UI.font.tiny} numberOfLines={1} color={STheme.color.text} style={{ marginLeft: 4 }}>{"Hasta"}</SText>}
                        value={fechaFin}
                        onChangeText={onChangeFechaFin}
                    />
                </CampoObligatorio>
            </SView>
            {vigenteHasta ? (
                <SText fontSize={UI.font.tiny} color={colorAdvertencia} style={{ marginTop: 3 }}>
                    {`Su suscripción activa vence el ${new SDate(vigenteHasta, "yyyy-MM-dd").toString("dd/MM/yyyy")}. La nueva inicia al día siguiente.`}
                </SText>
            ) : null}
        </SView>
    );
};

const SuscripcionItem = React.memo(SuscripcionItemBase, (prev, next) => {
    return prev.index === next.index &&
        prev.suscriptor === next.suscriptor &&
        prev.clientes === next.clientes &&
        prev.loadingClientes === next.loadingClientes;
});

const CostoItemBase = ({ costo, moneda, totalItem }: any) => {
    const [monto, setMonto] = React.useState(costo.monto || 0);
    const [inputValue, setInputValue] = React.useState((costo.monto || 0).toFixed(2));
    const [clienteKey, setClienteKey] = React.useState(costo.key_modelo_cliente || "");
    const [resetKey, setResetKey] = React.useState(0);

    const setProgrammaticMonto = React.useCallback((nuevoMonto: number) => {
        setMonto(nuevoMonto);
        setInputValue(nuevoMonto.toFixed(2));
        setResetKey(k => k + 1);
        costo.monto = nuevoMonto;
    }, [costo]);

    React.useEffect(() => {
        if (!costo?.key_modelo_cliente) return;
        const cliente = (costo?.clientes || []).find((c: any) => c?.key === costo.key_modelo_cliente);
        if (!cliente) return;
        const comision = parseFloat(cliente?.comision || "0");
        if (isNaN(comision)) return;
        const nuevoMonto = (totalItem || 0) * (comision / 100);
        if (!isNaN(nuevoMonto)) {
            setProgrammaticMonto(nuevoMonto);
        }
    }, [totalItem, costo?.key_modelo_cliente, costo, setProgrammaticMonto]);

    const clienteError = !!monto && !clienteKey;
    const montoError = !!clienteKey && !monto;

    const clienteOptions = React.useMemo(() =>
        (costo.clientes || []).map((c: any) => ({
            label: c.cliente?.nombres || c.cliente?.razon_social || c.nombres || "Sin nombre",
            value: c.key,
            data: c,
            customComponent: (
                <SText fontSize={UI.font.tiny} color={STheme.color.lightGray}>{c.comision} %</SText>
            ),
        })),
        [costo.clientes]);

    const onSelectCliente = React.useCallback((selected: any) => {
        if (!selected || !costo) return;
        costo.key_modelo_cliente = selected?.value || "";
        const clienteNombre = selected?.data?.cliente?.nombres || selected?.data?.nombres || "Cliente";
        costo.__descripcion = `Costo por ${costo?.descripcion || ""} para ${clienteNombre}`;
        const comision = parseFloat(selected?.data?.comision || "0");
        if (!isNaN(comision)) {
            const nuevoMonto = (totalItem || 0) * (comision / 100);
            if (!isNaN(nuevoMonto)) {
                setProgrammaticMonto(nuevoMonto);
            }
        }
        setClienteKey(selected?.value || "");
    }, [costo, totalItem, setProgrammaticMonto]);

    const onChangeMonto = React.useCallback((e: string) => {
        if (!e || typeof e !== 'string' || !costo) return;
        setInputValue(e);
        const valor = parseFloat(e);
        if (isNaN(valor)) return;
        setMonto(valor);
        costo.monto = valor;
    }, [costo]);

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
                        options={clienteOptions}
                        defaultValue={costo.key_modelo_cliente || null}
                        onSelect={onSelectCliente}
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
                                onChangeText={onChangeMonto}
                            />
                        </SView>
                    </SView>
                </SView>
            </SView>
        </SView>
    );
};

const CostoItem = React.memo(CostoItemBase, (prev, next) => {
    return prev.costo === next.costo &&
        prev.moneda === next.moneda &&
        prev.totalItem === next.totalItem;
});