import React from "react";
import { SHr, SInput, SNavigation, SNotification, SPopup, SText, STheme, SView } from "servisofts-component";
import SMath from "servisofts-component/Component/SMath";
import MDL from "../../MDL";
import SSocket from "servisofts-socket";
import SIconApp from "../../Assets/SIconApp";
import SelectorAlmacen from "../Selectores/SelectorAlmacen";
import SelectorMoneda from "../Selectores/SelectorMoneda";
import ComprobanteCarta from "../PDF/compra/ComprobanteCarta";
import SelectTipoPagoCompra from "../../Pages/caja2/components/SelectTipoPagoCompra";
type PopupCarritoConfirmarProps = {
    moneda?: any;
}
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
                cursor: "default" as any,
                userSelect: "text" as any,
                overflow: "hidden",
            }} withoutFeedback>
                <PopupCarritoConfirmar {...props} />
            </SView>
        })
    }
    inputCliente: SInput | null = null;
    inputDescripcionVenta: SInput | null = null;
    inputRazonSocial: SInput | null = null;
    inputNit: SInput | null = null;
    evento: any;
    proveedor: any;
    _mounted = false;
    state: {
        almacen: any;
        moneda: any;
        factura: boolean;
        esCredito: boolean;
        subtotal: number;
        clientes: any[];
        key_cliente: string | null;
        cliente_texto: string;
        razon_social: string;
        nit: string;
    } = {
            almacen: null,
            moneda: MDL.compra_venta.getMonedaSeleccionada() || null,
            factura: false,
            esCredito: false,
            subtotal: 0,
            clientes: [],
            key_cliente: null,
            cliente_texto: "",
            razon_social: "",
            nit: "",
        }
    handleKeyDown = (e: any) => {
        if (e.key === "Escape") SPopup.close("PopupCarritoConfirmar");
    }
    componentDidMount(): void {
        this._mounted = true;
        this.evento = MDL.compra_venta.addEventListener("moneda_seleccionada", () => {
            const moneda = MDL.compra_venta.getMonedaSeleccionada();
            this.setState({ moneda: moneda || null });
            this.cargarSubtotal();
        });
        this.cargarSubtotal();
        this.cargarClientes();
        (globalThis as any).document?.addEventListener("keydown", this.handleKeyDown);
    }
    componentWillUnmount(): void {
        this._mounted = false;
        if (this.evento) {
            MDL.compra_venta.removeEventListener(this.evento);
        }
        (globalThis as any).document?.removeEventListener("keydown", this.handleKeyDown);
    }
    async cargarClientes() {
        try {
            let clientes = await MDL.crm.cliente.getAll();
            if (!this._mounted) return;
            if (clientes && !Array.isArray(clientes)) clientes = Object.values(clientes);
            if (!clientes) clientes = [];
            this.setState({ clientes: (clientes as any[]).filter((c: any) => !!c) });
        } catch (error) {
            console.error("Error cargando clientes:", error);
        }
    }
    generateRandomCode(length = 6) {
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length) - 1;
        return "C-" + Math.floor(min + Math.random() * (max - min + 1)).toString();
    }
    cargarSubtotal() {
        try {
            const monedaActual = MDL.compra_venta.getMonedaSeleccionada();
            const carritoItems = MDL.carrito.carrito_compra?.items || [];
            const subtotal = carritoItems.reduce((acc, item) => {
                const precioBase = item?.modelo?.precio_compra_moneda || 0;
                const tipoCambio = monedaActual?.tipo_cambio || 1;
                const precio = monedaActual ? precioBase / tipoCambio : precioBase;
                return acc + precio * (item?.cantidad || 0);
            }, 0);
            this.setState({ subtotal });
        } catch (error) {
            console.error("Error al calcular subtotal:", error);
            this.setState({ subtotal: 0 });
        }
    }
    handleOnPress2 = async (saveRecurrente: boolean) => {
        try {
            const key_moneda = this.state.moneda?.key || this.props.moneda?.key;
            const selectedMoneda = MDL.carrito.selectedMoneda || this.state.moneda || this.props.moneda;
            if (!this.state.almacen) {
                SNotification.send({
                    key: "compra_rapida",
                    title: "Almacén requerido",
                    body: "Debe seleccionar un almacén antes de continuar.",
                    color: STheme.color.danger,
                    time: 4000,
                });
                return;
            }
            if (!key_moneda || !selectedMoneda?.key) {
                SNotification.send({
                    key: "compra_rapida",
                    title: "Moneda requerida",
                    body: "Debe seleccionar una moneda antes de continuar.",
                    color: STheme.color.danger,
                    time: 4000,
                });
                return;
            }
            const total = this.state.subtotal * (selectedMoneda.tipo_cambio || 1);
            SelectTipoPagoCompra.openPopup({
                key_punto_venta: MDL.caja.activa?.key_punto_venta as any,
                montoMaximo: total,
                key_moneda,
                onSelect: (tipos_pago: any) => this.handleSubmit(tipos_pago, key_moneda, saveRecurrente),
                solo_para_caja: false,
                compra: true,
            });
        } catch (error: any) {
            console.error(JSON.stringify(error))
            const mensaje = error instanceof Error ? error.message : (error?.error || JSON.stringify(error));
            SNotification.send({
                key: "compra_rapida",
                title: "Error al realizar la compra",
                body: mensaje,
                color: STheme.color.danger,
                time: 4000,
            });
        }
    };
    showCompraPopup(key_compra: string) {
        SPopup.open({
            key: "popup-compra-completada",
            content: (
                <SView col="xs-11 md-4" backgroundColor={STheme.color.background} padding={24}
                    style={{ borderRadius: 16, maxWidth: "100%", alignItems: "center" }}>
                    <SView width={80} height={80} borderRadius={40} backgroundColor={"#a046e8"} center style={{ marginBottom: 16 }}>
                        <SText fontSize={36} color="white">✔</SText>
                    </SView>
                    <SText bold fontSize={20} center style={{ marginBottom: 8 }}>¡Compra realizada con éxito!</SText>
                    <SText fontSize={14} center style={{ color: STheme.color.text, marginBottom: 24 }}>Tu transacción se ha completado correctamente. </SText>
                    <SView row col="xs-12 md-11" style={{ justifyContent: "space-between", gap: 16, width: "100%", flexWrap: "nowrap" }}>
                        <SView flex height={40} borderRadius={8} center backgroundColor={STheme.color.text}
                            onPress={() => SPopup.close("popup-compra-completada")}>
                            <SText color={STheme.color.background} center>Salir</SText>
                        </SView>
                        <SView flex height={40} borderRadius={8} center backgroundColor={"#a046e8"}
                            onPress={() => { SPopup.close("popup-compra-completada"); SNavigation.navigate("/venta/profile2", { pk: key_compra }); }}>
                            <SText color={STheme.color.text} center>Ver compra</SText>
                        </SView>
                        <SView flex height={40} borderRadius={8} center backgroundColor={"#a046e844"}
                            style={{ borderWidth: 1, borderColor: "#a046e8" }}
                            onPress={() => { SPopup.close("popup-compra-completada"); ComprobanteCarta.imprimir(key_compra); }}>
                            <SText color={STheme.color.text} center>Imprimir PDF</SText>
                        </SView>
                    </SView>
                </SView>
            )
        });
    }
    handleSubmit = async (tipos_pago: any, key_moneda: string, saveRecurrente?: boolean) => {
        try {
            const keyPago = Object.values(tipos_pago)[0]?.tipo_pago?.key;
            const descripcionBase = this.inputDescripcionVenta?.getValue?.() || "";
            if (keyPago === "credito" && !this.proveedor) {
                this.setState({ esCredito: true });
                SelectTipoPagoCompra.closePopup();
                SNotification.send({
                    key: "compra_rapida",
                    title: "Proveedor requerido",
                    body: "Para registrar una compra a crédito, debe seleccionar un proveedor.",
                    color: STheme.color.danger,
                    time: 7000,
                });
                return;
            }
            this.setState({ esCredito: false });
            const carritoItems = MDL.carrito.carrito_compra?.items || [];
            if (carritoItems.length === 0) {
                SNotification.send({ key: "compra_rapida", title: "Carrito vacío", body: "No hay productos en el carrito.", color: STheme.color.danger, time: 3000 });
                return;
            }
            const almacen = this.state.almacen;
            const effectiveKeyMoneda = key_moneda || this.state.moneda?.key || this.props.moneda?.key;
            const keyUsuario = MDL.usuario.session?.key;
            const keyCaja = MDL.caja.activa?.key;
            const detalle = carritoItems.map((ci) => {
                const modelo = (ci?.modelo || {}) as any;
                return {
                    cantidad: ci?.cantidad || 0,
                    precio_unitario: ci?.precio ?? 0,
                    precio_unitario_base: modelo.precio_compra_moneda ?? 0,
                    detalle: "",
                    descuento: 0,
                    descripcion: modelo.descripcion || "",
                    key_modelo: modelo.key || null,
                    moneda: effectiveKeyMoneda,
                    fecha_vencimiento: modelo?.fecha_vencimiento || null,
                };
            });
            const descripcion = descripcionBase;

            const data: any = {
                descripcion: "",
                observacion: descripcion,
                key_proveedor: this.proveedor?.key || null,
                key_usuario: keyUsuario,
                facturar: this.state.factura,
                factura: this.state.factura
                    ? {
                        nro_factura: this.generateRandomCode(),
                        cuf: "212E5B3D5BBF8FB31CCF8BE464EE98640C7F9CB6615194573A17DAF74",
                        nit: this.state.nit || this.proveedor?.nit || "",
                        razon_social: this.state.razon_social || this.proveedor?.razon_social || "",
                        leyenda: "",
                    }
                    : null,
                tipo_pago: keyPago === "credito" ? "credito" : "contado",
                facturar_luego: this.state.factura,
                key_caja: keyCaja,
                key_almacen: almacen.key,
                key_moneda: effectiveKeyMoneda,
                detalle,
                tipos_pago,
            };

            SNotification.send({ key: "compra_rapida", title: "Cargando", type: "loading" });
            if (saveRecurrente) {
                await SSocket.sendPromise({
                    service: "caja",
                    component: "recurrente",
                    type: "registro",
                    estado: "cargando",
                    data: {
                        key_empresa: MDL.empresa.select?.key,
                        key_usuario: MDL.usuario.session?.key,
                        data: { service: "caja", component: "caja_detalle", type: "compra", estado: "cargando", data },
                    },
                });
                SelectTipoPagoCompra.closePopup();
                SNotification.remove("compra_rapida");
            } else {
                const compraResp = await SSocket.sendPromise({
                    service: "caja",
                    component: "caja_detalle",
                    type: "compra",
                    estado: "cargando",
                    data,
                });
                const keyCompra = (compraResp as any)?.data?.key_compra_venta;
                if (!keyCompra) throw new Error("El servidor no devolvió la clave de la compra.");
                MDL.compra_venta.dispatchEvent({ type: "venta_realizada" });
                SelectTipoPagoCompra.closePopup();
                SNotification.remove("compra_rapida");
                SPopup.close("PopupCarritoConfirmar");
                SPopup.close("PopupCarrito");
                MDL.carrito.limpiarCarritoCompras();
                this.showCompraPopup(keyCompra);
                MDL.caja.dispatchEvent({ type: "onDetalleChange" });
            }
        } catch (error: any) {
            const mensaje = error instanceof Error ? error.message : (error?.error || JSON.stringify(error));
            console.error("Error al realizar la compra:", error);
            SNotification.send({
                key: "compra_rapida",
                title: "Error al realizar la compra",
                body: mensaje,
                color: STheme.color.danger,
                time: 4000,
            });
        }
    }
    render() {
        return (
            <SView col={"xs-12"} height>
                <SView row style={{ backgroundColor: "#a046e8", paddingHorizontal: 14, paddingVertical: 8, alignItems: "center" }}>
                    <SView style={{ width: 28, height: 28, justifyContent: "center", alignItems: "center", marginRight: 8 }}
                        onPress={() => SPopup.close("PopupCarritoConfirmar")}>
                        <SIconApp name="Arrow" fill={STheme.color.text} />
                    </SView>
                    <SText fontSize={16} bold color={STheme.color.text}>{"Confirmar Compra"}</SText>
                    <SView flex />
                    <SView style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: "#dc3545", justifyContent: "center", alignItems: "center" }}
                        onPress={() => SPopup.close("PopupCarritoConfirmar")}>
                        <SText fontSize={10} bold color={STheme.color.text}>{"✕"}</SText>
                    </SView>
                </SView>
                <SView flex>
                    <SView padding={8}>
                        <SView row col={"xs-12"} style={{ alignItems: "center", marginBottom: 4 }}>
                            <SText col={"xs-6"} color={STheme.color.lightGray}>{"Datos del proveedor:"}</SText>
                            <SView col={"xs-6"} row style={{ alignItems: "center", justifyContent: "flex-end" }}>
                                <SInput height={30} style={{ marginTop: 0 }} label={"Con factura"} type="checkBox" labelStyle={{ left: 12 }} onChangeText={(val) => this.setState({ factura: val })} />
                            </SView>
                        </SView>
                        <SHr />
                        <SInput
                            ref={ref => (this.inputCliente = ref)}
                            inputStyle={this.state.factura || this.state.esCredito ? { borderColor: STheme.color.danger, borderWidth: 1 } : undefined}
                            icon={<SText color={STheme.color.lightGray} bold>{"Proveedor: "}</SText>}
                            placeholder={"Escriba el nombre del proveedor"}
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
                                                    nit: this.state.nit || "",
                                                    key_empresa: MDL.empresa.select?.key ?? "",
                                                } as any);
                                                if (!resp?.key) {
                                                    SNotification.send({ title: "Error", body: "No se pudo crear el proveedor.", color: STheme.color.danger, time: 3000 });
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
                                                SNotification.send({ title: "Proveedor creado", body: "Se registró correctamente.", time: 2500, color: STheme.color.success });
                                            } catch (err: any) {
                                                SNotification.send({ title: "Error", body: err?.error || "No se pudo crear el proveedor.", color: STheme.color.danger, time: 4000 });
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
                                                    this.setState((prev: any) => ({
                                                        clientes: prev.clientes.some((c: any) => c.key === cliente.key) ? prev.clientes : [...prev.clientes, cliente],
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
                                icon={<SText color={STheme.color.lightGray} bold>{"NIT:"}</SText>}
                                placeholder={"NIT"}
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
                            />
                        </>}
                    </SView>
                    <SHr />
                    <SView style={{ paddingHorizontal: 10, paddingVertical: 5 }}>
                        <SText color={STheme.color.lightGray}>{"Seleccione el almacén"}</SText>
                        <SelectorAlmacen
                            selectFirst
                            icon={<SText color={STheme.color.lightGray} bold>{"Almacén:"}</SText>}
                            placeholder={"Escriba el nombre del almacén"}
                            filterData={(e) => e.key_sucursal == MDL.caja.activa?.key_sucursal}
                            onChangeSelect={e => this.setState({ almacen: e })}
                        />
                    </SView>
                    <SView style={{ paddingHorizontal: 10, paddingVertical: 5 }}>
                        <SelectorMoneda
                            findInitialSelect={(arr) => {
                                const actual = MDL.compra_venta.getMonedaSeleccionada();
                                return actual
                                    ? arr.find((a: any) => a.key === actual.key)
                                    : arr.find((a: any) => a.tipo === "base");
                            }}
                            icon={<SText color={STheme.color.lightGray} bold>{"Moneda:"}</SText>}
                            placeholder={"Moneda"}
                            onChangeSelect={e => {
                                this.setState({ moneda: e });
                                MDL.compra_venta.setMonedaSeleccionada(e);
                                MDL.compra_venta.dispatchEvent({ type: "moneda_seleccionada" });
                                MDL.carrito.calcularValoresCarritDeCompras();
                            }}
                        />
                    </SView>
                    <SHr />
                    <SView style={{ paddingHorizontal: 10, paddingVertical: 5 }}>
                        <SText color={STheme.color.lightGray}>{"Descripción"}</SText>
                        <SInput type="textArea" ref={ref => this.inputDescripcionVenta = ref} placeholder={"Descripción de la compra"} style={{ height: 50, padding: 3, marginVertical: 4 }} />
                    </SView>
                    <SHr />
                    <SView style={{ paddingHorizontal: 10, paddingVertical: 8 }}>
                        <SView style={{ borderRadius: 8, padding: 12, borderWidth: 2, borderColor: STheme.color.card }}>
                            <SView row style={{ justifyContent: "space-between", alignItems: "center" }}>
                                <SText fontSize={18} color={STheme.color.text}>{"Total:"}</SText>
                                <SView style={{ flex: 1, alignItems: "flex-end" }}>
                                    <SText fontSize={18} bold color={STheme.color.text} numberOfLines={1} adjustsFontSizeToFit>
                                        {this.state.moneda?.observacion ?? "Bs"}{" "}{SMath.formatMoney(this.state.subtotal, 2)}
                                    </SText>
                                </SView>
                            </SView>
                        </SView>
                    </SView>
                </SView>
                <SView style={{ backgroundColor: "#1e222b", borderTopWidth: 1, borderTopColor: "#434c5d", paddingHorizontal: 14, paddingVertical: 10 }}>
                    <SView row style={{ gap: 8 }}>
                        <SView flex style={{ backgroundColor: "#3a3f4a", borderRadius: 4, paddingVertical: 8, alignItems: "center", justifyContent: "center" }}
                            onPress={() => this.handleOnPress2(true)}>
                            <SText fontSize={13} bold color={STheme.color.text}>{"Guardar Recurrente"}</SText>
                        </SView>
                        <SView flex style={{ backgroundColor: "#a046e8", borderRadius: 4, paddingVertical: 8, alignItems: "center", justifyContent: "center" }}
                            onPress={() => {
                                if (this.state.factura && this.proveedor) {
                                    const rsActual = this.state.razon_social;
                                    const nitActual = this.state.nit;
                                    if (this.proveedor.razon_social !== rsActual || this.proveedor.nit !== nitActual) {
                                        this.proveedor.razon_social = rsActual || this.proveedor.razon_social;
                                        this.proveedor.nit = nitActual || this.proveedor.nit;
                                        MDL.crm.cliente.editar(this.proveedor).catch((e: any) => {
                                            console.error("Error al guardar el proveedor:", e);
                                            SNotification.send({ title: "Error", body: "No se pudo guardar el proveedor.", time: 3000, color: STheme.color.danger });
                                        });
                                    }
                                }
                                this.handleOnPress2(false);
                            }}>
                            <SText fontSize={14} bold color={STheme.color.text}>{"Confirmar"}</SText>
                        </SView>
                    </SView>
                </SView>
            </SView>
        );
    }
}
