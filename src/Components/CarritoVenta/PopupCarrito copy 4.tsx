import React from "react";
import { SDate, SImage, SInput, SMath, SNotification, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../MDL";
import SSocket from "servisofts-socket";
import SIconApp from "../../Assets/SIconApp";
import { FlatList } from "react-native";
import PopupCarritoConfirmar from "./PopupCarritoConfirmar";
import InputSelector from "../Selectores/InputSelector";
import FiltroMoneda from "../../Pages/puntoventa/Components/FiltroMoneda";
import SInput2 from "../SForm2/SInput2";

type PopupCarritoProps = {}
const DEFAULT_MONEDA_KEY = "";

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

const validarSuscripciones = (items: any[]) => {
    for (const item of items) {
        const cantidadMiembros = Number(item.cantidad || 0) * Number(item.modelo?.cantidad_suscriptores || 0);
        if (!cantidadMiembros) continue;
        const suscriptores = normalizeSuscriptores(item);
        for (let i = 0; i < cantidadMiembros; i++) {
            const suscriptor = suscriptores[i] || {};
            const clienteKey = suscriptor?.key_cliente || suscriptor?.cliente?.key || suscriptor?.cliente?.value;
            if (!clienteKey) return false;
            if (!suscriptor?.fecha_inicio) return false;
            if (!suscriptor?.fecha_fin) return false;
        }
    }
    return true;
};

export default class PopupCarrito extends React.Component<PopupCarritoProps> {
    state = {
        selectedMoneda: MDL.compra_venta.getMonedaSeleccionada() || null,
        options: [] as any[],
        contactosSeleccionados: [] as any[],
        tipoCostosSeleccionados: [] as any[],
        suscriptoresSeleccionados: [] as any[],
    };
    rapido: any;
    evento: any;

    static open(props: PopupCarritoProps) {
        SPopup.open({
            key: "PopupCarrito", type: "3", content:
                <SView style={{
                    position: "absolute", top: 8, right: 8,
                    width: "100%", maxWidth: 300,
                    height: "95%", maxHeight: 620,
                    backgroundColor: "#252a33",
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
            const monedaDefault = monedas.find(m => m.key === DEFAULT_MONEDA_KEY);
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
        const { selectedMoneda } = this.state;

        return (
            <SView col={"xs-12"} height style={{ backgroundColor: "#252a33", }}>

                {/* Header */}
                <SView row style={{ backgroundColor: "#198754", paddingHorizontal: 14, paddingVertical: 8, alignItems: "center", }}>
                    <SView style={{ width: 24, height: 24, justifyContent: "center", alignItems: "center", marginRight: 8 }}>
                        <SText fontSize={18}>🛒</SText>
                    </SView>
                    <SText fontSize={15} bold color={STheme.color.text}  >{"Carrito de Ventas"}</SText>
                    <SView flex />
                    <SView style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: "#dc3545", justifyContent: "center", alignItems: "center", }} onPress={() => SPopup.close("PopupCarrito")} >
                        <SText fontSize={10} bold color={STheme.color.text}>{"✕"}</SText>
                    </SView>
                </SView>

                {/* Selector de moneda */}
                <SView style={{ padding: 8 }}>

                    <FiltroMoneda
                        onSelect={(moneda: string) => {
                            this.setState({ selectedMoneda: moneda });
                            MDL.compra_venta.setMonedaSeleccionada(moneda);
                            MDL.carrito.calcularValoresCarritDeVentas();
                        }}
                    />
                </SView>

                {/* Título de sección */}
                <SView row style={{ paddingHorizontal: 10, paddingVertical: 8, alignItems: "center" }}>
                    <SText fontSize={12} color={STheme.color.text}> {"Productos ("}{MDL.carrito.carrito_venta.cantidad_items}{")"} </SText>
                    <SView flex />
                    <SText fontSize={12} color={STheme.color.text}> {"Sub: "}{selectedMoneda?.observacion ?? "Bs"}{" "}{SMath.formatMoney(MDL.carrito.carrito_venta.monto_total)} </SText>
                </SView>

                {/* Lista de productos */}
                <FlatList
                    data={items}
                    renderItem={({ item }) => <ItemComp item={item} moneda={selectedMoneda} />}
                    keyExtractor={(item) => item.modelo.key}
                    style={{ flex: 1, paddingHorizontal: 8 }}
                />

                {/* Resumen y acciones */}
                <SView style={{ backgroundColor: "#1e222b", borderTopWidth: 1, borderTopColor: "#434c5d", paddingHorizontal: 14, paddingVertical: 10, }}>
                    <SView row style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}  >
                        <SText fontSize={12} bold color={STheme.color.text}>{"Total Venta"}</SText>
                        <SText fontSize={12} bold color={STheme.color.text}>
                            {selectedMoneda?.observacion ?? "Bs"}{" "}{SMath.formatMoney(MDL.carrito.carrito_venta.monto_total)}
                        </SText>
                    </SView>

                    <SView row style={{ gap: 8 }}  >
                        <SView flex style={{ backgroundColor: "#dc3545", borderRadius: 4, paddingVertical: 8, alignItems: "center", justifyContent: "center", }} onPress={() => {
                            SPopup.confirm({
                                title: "¿Seguro que quieres limpiar el carrito?",
                                onPress: () => {
                                    MDL.carrito.limpiarCarritoVentas();
                                    SPopup.close("PopupCarrito");
                                }
                            })
                        }}>
                            <SText fontSize={13} bold color={STheme.color.text}>{"Limpiar"}</SText>

                            {/* <SText fontSize={13} bold color={STheme.color.text}>{"Limpiar"}</SText> */}
                        </SView>

                        <SView flex style={{ backgroundColor: "#198754", borderRadius: 4, paddingVertical: 8, alignItems: "center", justifyContent: "center", }} onPress={() => {
                            const items = MDL.carrito.carrito_venta.items;
                            const itemConPrecioInvalido = items.find(it => {
                                const precio = (it?.modelo as any)?.precio_compra_moneda ?? 0;
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
                            PopupCarritoConfirmar.open({});
                        }}>
                            <SText fontSize={13} bold color={STheme.color.text}>{"Confirmar venta"}</SText>
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
    React.useEffect(() => { setPrecio(calcularPrecio()); }, [moneda, item.modelo.precio_venta]);
    const precioFormateado = (precio ?? 0).toFixed(2);
    const puedeEditarPrecio = MDL.rolesPermisos.getPermiso({ url: "/empresa/punto_venta", permiso: "carrito_editar_precio" });

    return (
        <SView style={{
            backgroundColor: "#303744",
            borderRadius: 10,
            padding: 10,
            marginBottom: 10,
        }}>
            {/* Fila superior: imagen + info */}
            <SView row style={{ gap: 8, alignItems: "flex-start" }}>

                {/* Imagen */}
                <SView style={{ position: "relative" }} border={"blue"}>
                    <SView style={{ width: 35, height: 35, borderRadius: 8, overflow: "hidden" }}>
                        {/* <SView style={{ width: 56, height: 56, borderRadius: 8, overflow: "hidden" }}> */}
                        <SImage src={(SSocket.api as any).inventario + "modelo/" + item.modelo.key} style={{ resizeMode: "cover" }} />
                    </SView>
                    <SView style={{ position: "absolute", top: -6, left: -6, width: 18, height: 18, borderRadius: 10, backgroundColor: "#ff5252", justifyContent: "center", alignItems: "center", }}
                        onPress={() => MDL.carrito.removerItemAlCarritoDeVentas(item)} >
                        <SText fontSize={10} bold color={STheme.color.text}>{"✕"}</SText>
                    </SView>
                </SView>

                {/* Info del producto */}
                <SView flex  >
                    <SText fontSize={15} bold color={STheme.color.text} style={{ marginBottom: 2 }} numberOfLines={2}>{item.modelo.descripcion} </SText>

                    {/* Fila precio / cantidad / subtotal */}
                    <SView row style={{ alignItems: "center", gap: 8 }}>

                        {/* Precio unitario editable */}
                        <SView flex style={{
                            backgroundColor: Number(precioFormateado) > 0 ? "#1f242d" : "#bf0505",
                            borderRadius: 2,
                            paddingHorizontal: 1,
                            height: 18,
                            justifyContent: "center",
                        }}>
                            {puedeEditarPrecio ? (
                                <SView row center>
                                    <SText fontSize={10} color={"#6cffb4"} style={{ marginRight: 2 }}>
                                        {moneda?.observacion ?? "BS"}
                                    </SText>
                                    <SView flex>
                                        <SInput2
                                            name="precio"
                                            type="money"
                                            style={{ fontSize: 12, textAlign: "right", paddingRight: 0, color: "#6cffb4" }}
                                            defaultValue={precioFormateado.toString()}
                                            onChangeText={(e) => {
                                                const n = parseFloat(e) || 0;
                                                setPrecio(n);
                                                item.modelo.precio_venta_moneda = n * (moneda?.tipo_cambio || 1);
                                                MDL.carrito.calcularValoresCarritDeVentas();
                                            }}
                                        />
                                    </SView>
                                </SView>
                            ) : (
                                <SInput2
                                    name="precio"
                                    type="money"
                                    style={{ fontSize: 12, paddingRight: 0, textAlign: "right", color: "#6cffb4" }}
                                    value={precioFormateado.toString()}
                                    onChangeText={() => {
                                        SNotification.send({
                                            title: "Sin permiso",
                                            body: "No tiene permiso para editar el precio de venta.",
                                            color: STheme.color.warning,
                                        });
                                    }}
                                />
                            )}
                        </SView>

                        {/* Badge cantidad */}
                        <SView style={{
                            width: 32,
                            height: 18,
                            // backgroundColor: "#198754",
                            borderRadius: 2,
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                        }}>
                            <SInput
                                style={{ fontSize: 12, paddingLeft: 0.5, textAlign: "center", color: STheme.color.text, fontWeight: "bold" }}
                                // style={{ fontSize: 12, padding: 0, textAlign: "center", color: STheme.color.text, fontWeight: "bold", width: 46 }}
                                type="money2"
                                icon={<SText fontSize={10} color={STheme.color.text}>{"x"}</SText>}
                                value={item.cantidad.toString()}
                                onChangeText={(e) => {
                                    item.cantidad = e;
                                    MDL.carrito.calcularValoresCarritDeVentas();
                                }}
                            />
                        </SView>

                        {/* Subtotal */}
                        <SText fontSize={13} bold color={STheme.color.text} style={{ textAlign: "right", minWidth: 55 }} numberOfLines={1}>
                            {SMath.formatMoney(precio * item.cantidad)}
                        </SText>
                    </SView>
                </SView>
            </SView>

            {/* Paneles de costos y suscripciones */}
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
    const cantidadMiembros = Number(item.cantidad || 0) * Number(item.modelo.cantidad_suscriptores || 0);
    console.log("cantidadMiembros", JSON.stringify(item));
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

    return (
        <SView style={{ marginTop: 10 }}>
            <SView row style={{
                borderColor: STheme.color.lightGray,
                borderBottomWidth: 1, paddingBottom: 4, marginBottom: 4, alignItems: "center",
            }} onPress={() => setIsOpen(!isOpen)}>
                <SText fontSize={12} bold color={STheme.color.text}>{"Miembros"}</SText>
                <SView flex />
                <SText fontSize={10} color={STheme.color.text}>{" ("}{cantidadMiembros}{")"}</SText>
                {/* <SText fontSize={11} color={"#8a94a6"}>{" ("}{cantidadMiembros}{")"}</SText> */}
                <SView style={{ width: 16, height: 16, justifyContent: "center", alignItems: "center", marginLeft: 4 }}>
                    <SIconApp name="Back" fill={STheme.color.lightGray} width={8}
                        style={{ transform: [{ rotate: isOpen ? "-90deg" : "180deg" }], userSelect: "none", pointerEvents: "none" }}
                    />
                </SView>
            </SView>
            {isOpen && (
                <SView col={"xs-12"}>
                    {Array.from({ length: cantidadMiembros }, (_, i) => (
                        <SuscripcionItem
                            key={`suscripcion-${item.modelo.key}-${i}`}
                            index={i}
                            item={item}
                            suscriptor={item.modelo.suscriptores[i] || null}
                        />
                    ))}
                </SView>
            )}
        </SView>
    );
};

const SuscripcionItem = ({ index, item, suscriptor }: any) => {
    const [fechaInicio, setFechaInicio] = React.useState(suscriptor?.fecha_inicio || "");
    const [fechaFin, setFechaFin] = React.useState(suscriptor?.fecha_fin || "");
    const [cliente, setCliente] = React.useState(suscriptor?.cliente || null);
    const [clientes, setClientes] = React.useState<any[]>(Array.isArray(item.modelo.clientes) ? item.modelo.clientes : []);
    const [loadingClientes, setLoadingClientes] = React.useState(false);

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
                const allClientes = Array.isArray(resp)
                    ? resp
                    : Object.values(resp || {}).filter((c: any) => !!c);
                setClientes(allClientes);
            })
            .catch((err: any) => { console.error("Error cargando clientes:", err); })
            .finally(() => { if (!mounted) return; setLoadingClientes(false); });
        return () => { mounted = false; };
    }, [item.modelo.clientes]);

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

    return (
        <SView style={{ marginBottom: 10 }}>

            <SText fontSize={10} bold color={STheme.color.text} style={{ marginBottom: 2 }}>
                {"Miembro "}{index + 1}
            </SText>

            {/* Selector de cliente */}
            <SView style={{ height: 20, backgroundColor: STheme.color.card, borderRadius: 2, marginBottom: 6 }}>
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

            {/* Fechas */}
            <SView row style={{ gap: 8 }}>
                <SView flex style={{ height: 20, backgroundColor: "#1f242d", borderRadius: 2 }}>
                    <SInput
                        style={{ height: 20, fontSize: 12, padding: 0, paddingLeft: 4 }}
                        type="date"
                        icon={<SText width={50} fontSize={10} numberOfLines={1} color={STheme.color.text} style={{ marginLeft: 4 }}>{"F. Inicio"}</SText>}
                        value={fechaInicio}
                        onChangeText={onChangeFechaInicio}
                    />
                </SView>
                <SView flex style={{ height: 20, backgroundColor: "#1f242d", borderRadius: 2 }}>
                    <SInput
                        style={{ height: 20, fontSize: 12, padding: 0, paddingLeft: 4 }}
                        type="date"
                        icon={<SText width={40} fontSize={10} numberOfLines={1} color={STheme.color.text} style={{ marginLeft: 4 }}>{"F. Fin"}</SText>}
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

    React.useEffect(() => {
        if (!costo.key_modelo_cliente) return;
        const cliente = (costo.clientes || []).find((c: any) => c.key === costo.key_modelo_cliente);
        if (!cliente) return;
        const comision = parseFloat(cliente.comision || "0");
        const nuevoMonto = totalItem * (comision / 100);
        setMonto(nuevoMonto);
        setInputValue(nuevoMonto.toFixed(2));
        costo.monto = nuevoMonto;
    }, [totalItem]);

    return (
        <SView style={{ marginBottom: 4 }}>
            <SText fontSize={11} color={"#bfc7d4"} style={{ marginBottom: 1 }}>{costo.descripcion}</SText>
            <SView row style={{ gap: 8 }}>
                <SView flex style={{ height: 20, backgroundColor: STheme.color.card, borderRadius: 2 }}>






                    <InputSelector
                        customStyle="erp"
                        placeholder="Seleccionar cliente"
                        options={(costo.clientes || []).map((c: any) => ({
                            label: c.cliente?.nombres,
                            value: c.key,
                            data: c,
                            customComponent: () => (
                                <SText fontSize={10} color={STheme.color.lightGray}>{c.comision} %</SText>
                            ),
                        }))}
                        defaultValue={costo.key_modelo_cliente || null}
                        onSelect={(selected: any) => {
                            costo.key_modelo_cliente = selected.value;
                            costo.__descripcion = `Costo por ${costo.descripcion} para ${selected.data.cliente?.nombres}`;
                            const comision = parseFloat(selected.data.comision || "0");
                            const nuevoMonto = totalItem * (comision / 100);
                            setMonto(nuevoMonto);
                            setInputValue(nuevoMonto.toFixed(2));
                            costo.monto = nuevoMonto;
                        }}
                    />





                </SView>
                <SView style={{ width: 95, height: 20, backgroundColor: STheme.color.card, borderRadius: 2 }}>
                    {/* <SView style={{ width: 80, height: 36, backgroundColor: "#1f242d", borderRadius: 8 }}> */}
                    <SInput
                        style={{ height: 20, fontSize: 12, padding: 0, paddingRight: 4, textAlign: "right" }}
                        // style={{ height: 36, fontSize: 12, padding: 0, paddingRight: 4, textAlign: "right" }}
                        type="money2"
                        icon={<SText width={24} fontSize={10} numberOfLines={1} color={STheme.color.lightGray}>{moneda?.observacion ?? "BS"}</SText>}
                        value={inputValue}
                        onChangeText={(e: string) => setInputValue(e)}
                        onBlur={() => {
                            const valor = parseFloat(inputValue || "0");
                            setMonto(valor);
                            setInputValue(valor.toFixed(2));
                            costo.monto = valor;
                        }}
                    />
                </SView>
            </SView>
        </SView>
    );
};
