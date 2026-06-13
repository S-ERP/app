import React from "react";
import { SHr, SDate, SImage, SInput, SMath, SNotification, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../MDL";
import SSocket from "servisofts-socket";
import SIconApp from "../../Assets/SIconApp";
import { FlatList } from "react-native";
import PopupCarritoConfirmar from "./PopupCarritoConfirmar";
import InputSelector from "../Selectores/InputSelector";
import FiltroMoneda from "../../Pages/puntoventa/Components/FiltroMoneda";

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

    // Convertir a array si es un objeto JSON único
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
                <SView style={{ position: "absolute", top: 8, right: 8, width: "100%", maxWidth: 300, height: 500, maxHeight: "100%", backgroundColor: STheme.color.background, borderRadius: 8, borderWidth: 1, borderColor: STheme.color.card, }} withoutFeedback>
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
            <SView style={{ padding: 4, width: 33, height: 33, position: "absolute", right: 0, top: 0 }} onPress={() => {
                SPopup.close("PopupCarrito")
            }}>
                <SIconApp name="Close" fill={STheme.color.text} />
            </SView>
            <SHr />
            <SView row col={"xs-12"} style={{ paddingHorizontal: 8 }}>
                <SText color={STheme.color.lightGray} fontSize={12}>{"Productos"} ({MDL.carrito.carrito_venta.cantidad_items})</SText>
                <SView flex />
                <SText color={STheme.color.lightGray} fontSize={12}>{"Sub Totaaaaaal"}</SText>
            </SView>
            <SHr h={1} color={STheme.color.card} />
            <FlatList data={items} renderItem={({ item }) => <ItemComp item={item} moneda={selectedMoneda} />}
                keyExtractor={(item) => item.modelo.key}
            />
            <SHr h={1} color={STheme.color.card} />
            <SView padding={8}>
                <SText col={"xs-12"} style={{ textAlign: "right" }}>
                    {"Total:"} {selectedMoneda?.observacion ?? "Bs"} {SMath.formatMoney(MDL.carrito.carrito_venta.monto_total)}
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
                                return;
                            }
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
                                return;
                            }
                            // if (!validarSuscripciones(items)) {
                            //     SNotification.send({
                            //         title: "suscripciones_incompletas",
                            //         body: "Cada miembro debe tener cliente, fecha inicio y fecha fin.",
                            //         color: STheme.color.danger,
                            //     });
                            //     return;
                            // }
                            PopupCarritoConfirmar.open({});
                        }}
                    >
                        <SText fontSize={12}>{"Confirmar la venta"}</SText>
                    </SView>
                </SView>
            </SView>
        </SView>
    }
}

const ItemComp = ({ item, moneda }: { item: any; moneda: any }) => {
    const [precio, setPrecio] = React.useState(0);
    const calcularPrecio = () => {
        if (!moneda) return item.modelo.precio_venta;
        if (item.modelo.venta_moneda?.key === moneda?.key) {
            return item.modelo.precio_venta;
        }
        const tipoCambioVenta = item.modelo.venta_moneda?.tipo_cambio || 1;
        const tipoCambioSeleccionada = moneda?.tipo_cambio || 1;
        return item.modelo.precio_venta * (tipoCambioVenta / tipoCambioSeleccionada);
    };
    React.useEffect(() => { setPrecio(calcularPrecio()); }, [moneda, item.modelo.precio_venta]);
    const precioFormateado = Number.isInteger(precio) ? precio.toString() : (precio ?? 0);
    const puedeEditarPrecio = MDL.rolesPermisos.getPermiso({ url: "/empresa/punto_venta", permiso: "carrito_editar_precio" });

    return (
        <SView padding={8}>
            <SView row>
                <SView center style={{ width: 20, height: 20, padding: 2 }} onPress={() => {
                    MDL.carrito.removerItemAlCarritoDeVentas(item)
                }}>
                    <SIconApp name="Close" fill={STheme.color.warning} />
                </SView>
                <SView center style={{ width: 35, height: 35, borderRadius: 4, overflow: "hidden", borderColor: STheme.color.card, borderWidth: 1 }}>
                    <SImage src={SSocket.api.inventario + "modelo/" + item.modelo.key} style={{ resizeMode: "cover" }} />
                </SView>
                <SView width={4} />
                <SView flex>
                    <SText fontSize={14} bold>{item.modelo.descripcion}</SText>
                    <SHr h={2} />
                    <SView row col={"xs-12"} style={{ alignItems: "center" }}>

                        <SView width={70} style={{ borderWidth: 1, backgroundColor: Number(precioFormateado) > 0 ? STheme.color.card : "#bf0505" }} >

                            {puedeEditarPrecio ? (
                                <SInput
                                    style={{ height: 16, fontSize: 12, padding: 0, paddingRight: 4, textAlign: "right" }}
                                    type="money2"
                                    icon={<SText width={20} fontSize={10} numberOfLines={1} color={STheme.color.text} > {moneda?.observacion ?? "BS"} </SText>}
                                    value={precioFormateado}
                                    onChangeText={(e) => {
                                        setPrecio(e);
                                        item.modelo.precio_venta_moneda = e * (moneda?.tipo_cambio || 1);
                                        MDL.carrito.calcularValoresCarritDeVentas();
                                    }}
                                />
                            ) : (

                                <SInput style={{ height: 16, fontSize: 12, padding: 0, paddingRight: 4, textAlign: "right" }}
                                    type="money2"
                                    icon={<SText width={20} fontSize={10} numberOfLines={1} color={STheme.color.text} > {moneda?.observacion ?? "BS"} </SText>}
                                    value={precioFormateado}
                                    onChangeText={(e) => {
                                        SNotification.send({
                                            title: "No tiene permiso",
                                            body: "par apoder editar precio venta.",
                                            color: STheme.color.warning,
                                        });
                                        return;
                                    }}
                                />
                            )}
                        </SView>


                        {/* <SView width={70}>
                            <SInput style={{ height: 16, fontSize: 12, padding: 0, paddingRight: 4, textAlign: "right" }}
                                type="money2"
                                value={precioFormateado}
                                onChangeText={(e) => {
                                    setPrecio(e);
                                    item.modelo.precio_venta_moneda = e * (moneda?.tipo_cambio || 1);
                                    MDL.carrito.calcularValoresCarritDeVentas();
                                }}
                            />
                        </SView> */}
                        <SView width={4} />
                        <SView width={50}>
                            <SInput style={{ height: 16, fontSize: 12, padding: 0, paddingRight: 4, textAlign: "right" }}
                                type="money2"
                                icon={<SText width={15} fontSize={10} color={STheme.color.lightGray}>x</SText>}
                                value={item.cantidad.toString()}
                                onChangeText={(e) => {
                                    item.cantidad = e;
                                    MDL.carrito.calcularValoresCarritDeVentas();
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
                    <ListaCostos item={item} moneda={moneda} totalItem={precio * item.cantidad} />
                    <ListaSuscripciones item={item} />
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
            <SView col={"xs-12"} row style={{ borderBottomWidth: 1, borderColor: STheme.color.card, paddingVertical: 4, alignItems: "center" }} onPress={() => setIsOpen(!isOpen)}>
                <SHr />
                <SText fontSize={12} bold>Costos</SText>
                <SView flex />
                <SText fontSize={10} color={STheme.color.lightGray}> ({item.modelo.tipoCostos.length}) </SText>
                <SView width={4} />
                <SView style={{ width: 16, height: 16, justifyContent: "center", alignItems: "center" }}>
                    <SIconApp name="Back" fill={STheme.color.card} width={8} style={{ transform: [{ rotate: isOpen ? "-90deg" : "180deg" }], userSelect: "none", pointerEvents: "none" }} />
                </SView>
            </SView>
            {isOpen && item.modelo.tipoCostos.map((costo: any) => (<CostoItem key={costo.key_tipo_costo} costo={costo} moneda={moneda} totalItem={totalItem} />))}
        </>
    );
};

const ListaSuscripciones = ({ item }: any) => {
    const [isOpen, setIsOpen] = React.useState(true);
    const cantidadMiembros = Number(item.cantidad || 0) * Number(item.modelo.cantidad_suscriptores || 0);
    console.log("cantidadMiembros", JSON.stringify(item));
    if (!cantidadMiembros) return null;
    let suscriptores = item.modelo.suscriptores || item.modelo.Suscritores || [];

    // Convertir a array si es un objeto JSON único
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
        <>
            <SView col={"xs-12"} row style={{ borderBottomWidth: 1, borderColor: STheme.color.card, paddingVertical: 4, alignItems: "center" }} onPress={() => setIsOpen(!isOpen)}>
                <SHr />
                <SText fontSize={12} bold>Miembros</SText>
                <SView flex />
                <SText fontSize={10} color={STheme.color.lightGray}> ({cantidadMiembros}) </SText>
                <SView width={4} />
                <SView style={{ width: 16, height: 16, justifyContent: "center", alignItems: "center" }}>
                    <SIconApp name="Back" fill={STheme.color.card} width={8} style={{ transform: [{ rotate: isOpen ? "-90deg" : "180deg" }], userSelect: "none", pointerEvents: "none" }} />
                </SView>
            </SView>
            {isOpen && (
                <SView col={"xs-12"} style={{ paddingVertical: 4 }}>
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
        </>
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
            .catch((err: any) => {
                console.error("Error cargando clientes:", err);
            })
            .finally(() => {
                if (!mounted) return;
                setLoadingClientes(false);
            });
        return () => { mounted = false; };
    }, [item.modelo.clientes]);

    const saveSuscriptor = (updates: any) => {
        let suscriptores = item.modelo.suscriptores || item.modelo.Suscritores || [];

        // Convertir a array si es un objeto JSON único
        if (typeof suscriptores === 'object' && !Array.isArray(suscriptores)) {
            suscriptores = [suscriptores];
        } else if (!Array.isArray(suscriptores)) {
            suscriptores = [];
        }

        item.modelo.suscriptores = suscriptores;
        if (item.modelo.Suscritores) {
            delete item.modelo.Suscritores;
        }
        const current = item.modelo.suscriptores[index] || {};
        const updated = {
            ...current,
            key: current.key || `suscriptor-${item.modelo.key}-${index}`,
            cliente: updates.cliente !== undefined ? updates.cliente : cliente,
            key_cliente: updates.key_cliente !== undefined ? updates.key_cliente : cliente?.key,
            fecha_inicio: updates.fecha_inicio !== undefined ? updates.fecha_inicio : fechaInicio,
            fecha_fin: updates.fecha_fin !== undefined ? updates.fecha_fin : fechaFin,
        };
        item.modelo.suscriptores[index] = updated;
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
        <SView col={"xs-12"} style={{ paddingVertical: 6, borderBottomWidth: 1, borderColor: STheme.color.card, }}>
            <SText fontSize={10} bold> Miembro {index + 1} </SText>
            <SView style={{ width: "100%" }} row>
                <SView style={{ flex: 1, height: 18, backgroundColor: STheme.color.card }}>
                    <InputSelector customStyle="erp" placeholder="Selecciona un cliente" options={options}
                        defaultValue={cliente?.key || null}
                        onSelect={(selected: any) => {
                            const selectedCliente = selected?.data?.cliente || selected?.data;
                            setCliente(selectedCliente);
                            saveSuscriptor({ cliente: selectedCliente, key_cliente: selected?.value });
                        }}
                    />
                </SView>
                <SView width={4} />
                <SView style={{ width: "100%", justifyContent: "space-between" }} row>
                    <SView style={{ flex: 1, height: 18, backgroundColor: STheme.color.card }}>
                        <SInput style={{ height: 18, fontSize: 12, padding: 0, paddingRight: 4, }} type="date"
                            icon={<SText width={40} fontSize={10} numberOfLines={1}>F. Inicio</SText>}
                            value={fechaInicio}
                            onChangeText={onChangeFechaInicio}
                        />
                    </SView>
                    <SView width={4} />
                    <SView style={{ flex: 1, height: 18, backgroundColor: STheme.color.card }}>
                        <SInput style={{ height: 18, fontSize: 12, padding: 0, paddingRight: 4, }} type="date" icon={<SText width={40} fontSize={10} numberOfLines={1}>F. Fin</SText>} value={fechaFin}
                            onChangeText={onChangeFechaFin}
                        />
                    </SView>
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
        <SView key={costo.key_tipo_costo} col={"md-12"} height={35}>
            <SText fontSize={10}>{costo.descripcion}</SText>
            <SView style={{ width: "100%" }} row>
                <SView style={{ flex: 1, height: 18, backgroundColor: STheme.color.card }}>
                    <InputSelector customStyle="erp" placeholder="Selecciona un cliente" options={(costo.clientes || []).map((c: any) => ({
                        label: c.cliente.nombres, value: c.key, data: c,
                        customComponent: () => (
                            <SText fontSize={10} color={STheme.color.lightGray}>
                                {c.comision} %
                            </SText>
                        ),
                    }))}
                        defaultValue={costo.key_modelo_cliente || null}
                        onSelect={(selected: any) => {
                            costo.key_modelo_cliente = selected.value;
                            costo.__descripcion = `Costo por ${costo.descripcion} para ${selected.data.cliente.nombres}`;
                            const comision = parseFloat(selected.data.comision || "0");
                            const nuevoMonto = totalItem * (comision / 100);
                            setMonto(nuevoMonto);
                            setInputValue(nuevoMonto.toFixed(2));
                            costo.monto = nuevoMonto;
                        }}
                    />
                </SView>
                <SView width={4} />
                <SView style={{ width: 70 }}>
                    <SInput style={{ height: 18, fontSize: 12, padding: 0, paddingRight: 4, textAlign: "right" }} type="money2"
                        icon={<SText width={20} fontSize={10} numberOfLines={1} color={STheme.color.lightGray}> {moneda ? moneda.observacion : "BS"} </SText>}
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