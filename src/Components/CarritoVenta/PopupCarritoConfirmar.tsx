import React from "react";
import { SHr, SInput, SNavigation, SNotification, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../MDL";
import SSocket from "servisofts-socket";
import SIconApp from "../../Assets/SIconApp";
import SelectorAlmacen from "../Selectores/SelectorAlmacen";
import PopupCarritoConfirmarResumen from "./PopupCarritoConfirmarResumen";

type PopupCarritoConfirmarProps = {}

export default class PopupCarritoConfirmar extends React.Component<PopupCarritoConfirmarProps> {
    static open(props: PopupCarritoConfirmarProps) {
        SPopup.open({
            key: "PopupCarritoConfirmar",
            type: "3",
            content: <SView style={{
                position: "absolute",
                top: 8,
                right: 8,
                width: "100%",
                maxWidth: 300,
                height: "95%",
                maxHeight: 620,
                backgroundColor: STheme.color.background,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: STheme.color.card,
                cursor: "default",
                userSelect: "text",
                overflow: "hidden",
            }} withoutFeedback>
                <PopupCarritoConfirmar {...props} />
            </SView>
        })
    }

    proveedor: any;
    inputCliente: SInput | null = null;
    inputRazonSocial: SInput | null = null;
    inputNit: SInput | null = null;
    inputDescuento: SInput | null = null;
    inputDescripcionVenta: SInput | null = null;
    evento: any;
    _mounted = false;

    state: {
        almacen: any;
        moneda: any;
        factura: boolean;
        razon_social: string;
        nit: string;
        clientes: any[];
        key_cliente: string | null;
        cliente_texto: string;
        descuentos: any[];
        descuentoSeleccionado: any | null;
        esCredito: boolean;
    } = {
        almacen: null,
        moneda: null,
        factura: false,
        razon_social: "",
        nit: "",
        clientes: [],
        key_cliente: null,
        cliente_texto: "",
        descuentos: [],
        descuentoSeleccionado: null,
        esCredito: false,
    }

    onTipoPagoChange = (esCredito: boolean) => {
        this.setState({ esCredito });
    };

    handleKeyDown = (e: any) => {
        if (e.key === "Escape") SPopup.close("PopupCarritoConfirmar");
    }

    componentDidMount() {
        this._mounted = true;
        this.evento = MDL.compra_venta.addEventListener("moneda_seleccionada", this.cargarMonedaSeleccionada);
        this.cargarMonedaSeleccionada();
        this.cargarClientes();
        this.cargarDescuentos();
        (globalThis as any).document?.addEventListener("keydown", this.handleKeyDown);
    }

    componentWillUnmount(): void {
        this._mounted = false;
        if (this.evento) {
            MDL.compra_venta.removeEventListener(this.evento);
        }
        (globalThis as any).document?.removeEventListener("keydown", this.handleKeyDown);
    }

    cargarMonedaSeleccionada = () => {
        const moneda = MDL.compra_venta.getMonedaSeleccionada();
        this.setState({ moneda: moneda || null });
    };

    async cargarClientes() {
        try {
            let clientes = await MDL.crm.cliente.getAll();
            if (!this._mounted) return;
            if (clientes && !Array.isArray(clientes)) clientes = Object.values(clientes);
            this.setState({ clientes: (clientes as any[] || []).filter((c: any) => !!c) });
        } catch (e) {
            console.error("Error cargando clientes", e);
        }
    }

    async cargarDescuentos() {
        try {
            const resp = await SSocket.sendPromise({
                service: "compra_venta",
                component: "descuento",
                type: "getAll",
                key_empresa: MDL.empresa?.select?.key
            });
            if (!this._mounted) return;
            const descuentos = Object.values(resp?.data || {});
            this.setState({ descuentos });
        } catch (e) {
            console.error("Error cargando descuentos", e);
        }
    }

    handleOnPress = async () => {
        try {
            const { moneda, almacen, descuentoSeleccionado, factura } = this.state;
            if (!moneda) {
                SNotification.send({
                    key: "venta_rapida",
                    title: "Moneda requerida",
                    body: "Debe seleccionar una moneda antes de continuar.",
                    color: STheme.color.danger,
                    time: 4000,
                });
                return;
            }
            if (!almacen) {
                SNotification.send({
                    key: "venta_rapida",
                    title: "Almacén requerido",
                    body: "Debe seleccionar un almacén.",
                    color: STheme.color.danger,
                    time: 4000,
                });
                return;
            }

            const carritoItems = MDL.carrito.carrito_venta?.items || [];
            if (carritoItems.length === 0) {
                SNotification.send({ key: "venta_rapida", title: "Carrito vacío", body: "No hay productos en el carrito.", color: STheme.color.danger, time: 3000 });
                return;
            }

            let subtotal = MDL.carrito.carrito_venta?.monto_total || 0;
            subtotal = parseFloat(Number(subtotal).toFixed(2));
            let porcentajeDescuento = 0;
            let montoFinal = subtotal;
            let descuentos: any[] = [];
            if (descuentoSeleccionado?.porcentaje) {
                porcentajeDescuento = descuentoSeleccionado.porcentaje;
                const descuentoMonto = Math.round((montoFinal * porcentajeDescuento) * 100) / 100;
                montoFinal = parseFloat((montoFinal - descuentoMonto).toFixed(2));
                descuentos = [descuentoSeleccionado];
            }

            const descripcionVenta = this.inputDescripcionVenta?.getValue?.() || "";
            const cliente = {
                ...(this.proveedor || {}),
                key: this.proveedor?.key || this.state.key_cliente || null,
                nit: this.state.nit || this.proveedor?.nit || "",
                razon_social: this.state.razon_social || this.proveedor?.razon_social || this.proveedor?.nombres || "",
            };

            PopupCarritoConfirmarResumen.open({
                subtotal,
                montoMaximo: montoFinal,
                key_moneda: moneda?.key,
                porcentajeDescuento,
                descuentoSeleccionado: descuentos,
                solo_para_caja: false,
                cliente,
                factura: !!factura,
                moneda,
                almacen,
                descripcion: descripcionVenta,
                onTipoPagoChange: this.onTipoPagoChange,
            });
        } catch (error: any) {
            console.error("Error al realizar la venta:", error);
            SNotification.send({
                key: "venta_rapida",
                title: "Error al realizar la venta",
                body: error?.error || JSON.stringify(error),
                color: STheme.color.danger,
                time: 4000,
            });
        }
    }

    render() {
        return (
            <SView col={"xs-12"} height>
                {/* Header */}
                <SView row style={{ backgroundColor: "#198754", paddingHorizontal: 14, paddingVertical: 8, alignItems: "center" }}>
                    <SView style={{ width: 28, height: 28, justifyContent: "center", alignItems: "center", marginRight: 8 }}
                        onPress={() => SPopup.close("PopupCarritoConfirmar")}>
                        <SIconApp name="Arrow" fill={STheme.color.text} />
                    </SView>
                    <SText fontSize={16} bold color={STheme.color.text}>{"Confirmar Venta"}</SText>
                    <SView flex />
                    <SView style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: "#dc3545", justifyContent: "center", alignItems: "center" }}
                        onPress={() => SPopup.close("PopupCarritoConfirmar")}>
                        <SText fontSize={10} bold color={STheme.color.text}>{"✕"}</SText>
                    </SView>
                </SView>

                <SView flex>
                    <SView padding={8}>
                        {/* Datos del cliente + checkbox factura */}
                        <SView row col={"xs-12"} style={{ alignItems: "center", marginBottom: 4 }}>
                            <SText col={"xs-6"} color={STheme.color.lightGray}>{"Datos del Cliente:"}</SText>
                            <SView col={"xs-6"} row style={{ alignItems: "center", justifyContent: "flex-end" }}>
                                <SInput
                                    height={30}
                                    style={{ marginTop: 0 }}
                                    label={"Con factura"}
                                    type="checkBox"
                                    labelStyle={{ left: 12 }}
                                    onChangeText={(val) => {
                                        this.setState({ factura: val }, () => {
                                            if (val && this.proveedor) {
                                                this.inputRazonSocial?.setValue(this.proveedor.razon_social || "");
                                                this.inputNit?.setValue(this.proveedor.nit || "");
                                            }
                                        });
                                    }}
                                />
                            </SView>
                        </SView>
                        <SHr />

                        {/* Selector de cliente */}
                        <SInput
                            ref={ref => (this.inputCliente = ref)}
                            inputStyle={this.state.factura || this.state.esCredito ? { borderColor: STheme.color.danger, borderWidth: 1 } : undefined}
                            icon={<SText color={STheme.color.lightGray} bold>{"Cliente: "}</SText>}
                            placeholder={"Escriba el nombre del cliente"}
                            height={40}
                            type="select2"
                            options={(this.state.clientes || [])
                                .map(c => (c?.razon_social || c?.nombres || "").trim())
                                .filter(a => !!a)
                            }
                            onChangeText={(text) => {
                                const t = (text || "").trim();
                                const encontrado = (this.state.clientes || []).find(c =>
                                    (c?.razon_social || c?.nombres || "").trim().toLowerCase() === t.toLowerCase()
                                );
                                if (encontrado?.key) {
                                    this.proveedor = encontrado;
                                    this.setState({
                                        key_cliente: encontrado.key,
                                        cliente_texto: t,
                                        razon_social: encontrado?.razon_social || encontrado?.nombres || "",
                                        nit: encontrado?.nit || "",
                                    });
                                    this.inputRazonSocial?.setValue?.(encontrado?.razon_social || encontrado?.nombres || "");
                                    this.inputNit?.setValue?.(encontrado?.nit || "");
                                } else {
                                    this.proveedor = null;
                                    this.setState({ key_cliente: null, cliente_texto: t });
                                }
                            }}
                            iconR={
                                (!this.state.key_cliente && !!this.state.cliente_texto) ? (
                                    <SView center style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: STheme.color.card }}
                                        onPress={async () => {
                                            const nombre = (this.state.cliente_texto || "").trim();
                                            if (!nombre) return;
                                            try {
                                                const resp = await MDL.crm.cliente.registrar({
                                                    razon_social: nombre,
                                                    nombres: nombre,
                                                    nit: this.inputNit?.getValue?.() || "",
                                                    key_empresa: MDL.empresa.select?.key,
                                                });
                                                if (!resp?.key) {
                                                    SNotification.send({ title: "Error", body: "No se pudo crear el cliente.", color: STheme.color.danger, time: 3000 });
                                                    return;
                                                }
                                                this.proveedor = resp;
                                                this.setState(prev => ({
                                                    clientes: [...((prev as any).clientes || []), resp],
                                                    key_cliente: resp.key,
                                                    cliente_texto: resp?.razon_social || resp?.nombres || nombre,
                                                    razon_social: resp?.razon_social || resp?.nombres || "",
                                                    nit: resp?.nit || "",
                                                }));
                                                (this.inputCliente as any)?.setSelect?.(resp);
                                                this.inputRazonSocial?.setValue?.(resp?.razon_social || resp?.nombres || "");
                                                this.inputNit?.setValue?.(resp?.nit || "");
                                                SNotification.send({ title: "Cliente creado", body: "Se registró correctamente.", time: 2500, color: STheme.color.success });
                                            } catch (err: any) {
                                                SNotification.send({ title: "Error", body: err?.error || "No se pudo crear el cliente.", color: STheme.color.danger, time: 4000 });
                                            }
                                        }}>
                                        <SIconApp name="Add" />
                                    </SView>
                                ) : (
                                    <SView center style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: STheme.color.card }}
                                        onPress={() => {
                                            SNavigation.navigate("/cliente", {
                                                onSelect: (cliente: any) => {
                                                    if (!cliente?.key) return;
                                                    this.proveedor = cliente;
                                                    this.setState(prev => ({
                                                        clientes: (prev as any).clientes.some((c: any) => c.key === cliente.key)
                                                            ? (prev as any).clientes
                                                            : [...(prev as any).clientes, cliente],
                                                        key_cliente: cliente.key,
                                                        cliente_texto: cliente?.razon_social || cliente?.nombres || "",
                                                        razon_social: cliente?.razon_social || cliente?.nombres || "",
                                                        nit: cliente?.nit || "",
                                                    }));
                                                    (this.inputCliente as any)?.setSelect?.(cliente);
                                                    this.inputRazonSocial?.setValue?.(cliente?.razon_social || cliente?.nombres || "");
                                                    this.inputNit?.setValue?.(cliente?.nit || "");
                                                    SNavigation.goBack();
                                                }
                                            });
                                        }}>
                                        <SIconApp name="Search" />
                                    </SView>
                                )
                            }
                        />

                        {/* Campos de factura */}
                        {this.state.factura && <>
                            <SHr h={10} />
                            <SInput
                                inputStyle={{ borderColor: STheme.color.danger, borderWidth: 1 }}
                                ref={ref => this.inputRazonSocial = ref}
                                icon={<SText color={STheme.color.lightGray} bold>{"Razón Social:"}</SText>}
                                placeholder={"Razón Social"}
                                value={this.state.razon_social}
                                onChangeText={(valor) => this.setState({ razon_social: valor || "" })}
                            />
                            <SHr h={10} />
                            <SInput
                                inputStyle={{ borderColor: STheme.color.danger, borderWidth: 1 }}
                                ref={ref => this.inputNit = ref}
                                icon={<SText color={STheme.color.lightGray} bold>{"# NIT:"}</SText>}
                                placeholder={"Escriba el nit"}
                                value={this.state.nit}
                                onChangeText={(e) => {
                                    const nit = (e || "").trim();
                                    this.setState({ nit });
                                    if (nit.length >= 6) {
                                        MDL.crm.cliente.buscar_nit(nit)
                                            .then((proveedor: any) => {
                                                if (!proveedor) return;
                                                this.proveedor = proveedor;
                                                this.setState({
                                                    razon_social: proveedor?.razon_social || proveedor?.nombres || "",
                                                    nit: proveedor?.nit || "",
                                                });
                                                (this.inputCliente as any)?.setSelect?.(proveedor);
                                                this.inputRazonSocial?.setValue?.(proveedor?.razon_social || proveedor?.nombres || "");
                                            })
                                            .catch((err: any) => console.error("Error buscando NIT:", err));
                                    }
                                }}
                                iconR={
                                    <SView card style={{ width: 40, height: 40 }}
                                        onPress={() => {
                                            SNavigation.navigate("/cliente", {
                                                onSelect: (proveedor: any) => {
                                                    if (!proveedor) return;
                                                    this.proveedor = proveedor;
                                                    (this.inputCliente as any)?.setSelect?.(proveedor);
                                                    this.inputRazonSocial?.setValue?.(proveedor?.razon_social || proveedor?.nombres || "");
                                                    this.inputNit?.setValue?.(proveedor?.nit || "");
                                                    SNavigation.goBack();
                                                }
                                            });
                                        }}>
                                        <SIconApp name="Search" />
                                    </SView>
                                }
                            />
                            <SHr h={4} />
                        </>}
                    </SView>

                    <SHr />

                    {/* Descuento */}
                    <SView style={{ paddingHorizontal: 8, paddingVertical: 5 }}>
                        <SText color={STheme.color.lightGray}>{"Descuento"}</SText>
                        <SInput
                            ref={ref => this.inputDescuento = ref}
                            icon={<SText color={STheme.color.lightGray} bold>{"Descuento:"}</SText>}
                            placeholder={"Seleccione descuento"}
                            height={40}
                            type="select2"
                            options={this.state.descuentos.map(c => `${(c?.descripcion || "").trim()} - ${c?.porcentaje ?? 0}%`).filter(a => !!a)}
                            onChangeText={(text) => {
                                const t = (text || "").trim();
                                const encontrado = (this.state.descuentos || []).find(c =>
                                    (`${(c?.descripcion || "").trim()} - ${c?.porcentaje ?? 0}%`).trim().toLowerCase() === t.toLowerCase()
                                );
                                this.setState({ descuentoSeleccionado: encontrado || null });
                            }}
                        />
                    </SView>

                    <SHr />

                    {/* Almacén */}
                    <SView style={{ paddingHorizontal: 8, paddingVertical: 5 }}>
                        <SText color={STheme.color.lightGray}>{"Seleccione el almacén"}</SText>
                        <SelectorAlmacen
                            selectFirst
                            icon={<SText color={STheme.color.lightGray} bold>{"Almacén:"}</SText>}
                            placeholder={"Escriba el nombre del almacén"}
                            filterData={(e) => e.key_sucursal == MDL.caja.activa?.key_sucursal}
                            onChangeSelect={e => this.setState({ almacen: e })}
                        />
                    </SView>

                    <SHr />

                    {/* Descripción */}
                    <SView style={{ paddingHorizontal: 8, paddingVertical: 5 }}>
                        <SText color={STheme.color.lightGray}>{"Descripción"}</SText>
                        <SInput
                            type="textArea"
                            ref={ref => this.inputDescripcionVenta = ref}
                            placeholder={"Descripción de la venta"}
                            style={{ minHeight: 20, height: 50, borderWidth: 1, borderColor: STheme.color.gray, marginVertical: 4 }}
                        />
                    </SView>

                    <SHr />
                </SView>

                {/* Footer */}
                <SView style={{ backgroundColor: "#1e222b", borderTopWidth: 1, borderTopColor: "#434c5d", paddingHorizontal: 14, paddingVertical: 10 }}>
                    <SView style={{ backgroundColor: "#198754", borderRadius: 4, paddingVertical: 10, alignItems: "center", justifyContent: "center" }}
                        onPress={() => this.handleOnPress()}>
                        <SText fontSize={14} bold color={STheme.color.text}>{"Continuar"}</SText>
                    </SView>
                </SView>
            </SView>
        );
    }
}
