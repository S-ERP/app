import React from "react";
import { SHr, SInput, SNavigation, SNotification, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../MDL";
import SSocket from "servisofts-socket";
import SIconApp from "../../Assets/SIconApp";
import SelectorAlmacen from "../Selectores/SelectorAlmacen";
// import SelectTipoPago from "../../Pages/caja2/components/SelectTipoPago";
import SelectTipoPago2 from "../../Pages/caja2/components/SelectTipoPago2";
import SelectorMoneda from "../Selectores/SelectorMoneda";
import ComprobanteCarta from "../PDF/compra/ComprobanteCarta";
type PopupCarritoConfirmarProps = {
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
                height: 500,
                backgroundColor: STheme.color.background,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: STheme.color.card,
                cursor: "default",
                userSelect: "text"
            }} withoutFeedback>
                <PopupCarritoConfirmar {...props} />
            </SView>
        })
    }
    inputNombre: SInput | null = null;
    inputAlmacen: SelectorAlmacen | undefined;
    inputProveedor: SInput | null = null;
    inputRazonSocial: SInput | null = null;
    inputNit: SInput | null = null;
    inputDescripcionVenta: SInput | null = null;
    proveedor: any;
    state: {
        almacen: any,
        moneda: any,
        factura: boolean,
        esCredito: boolean,
        subtotal: any,
        proveedores: any[],
        proveedor_texto: string,
        key_proveedor: string | null,
        razon_social: string,
        nit: string,
    } = {
        almacen: null,
        moneda: MDL.compra_venta.getMonedaSeleccionada() || null,
        factura: false,
        esCredito: false, // 👈 bandera
        subtotal: null,
        proveedores: [],
        proveedor_texto: "",
        key_proveedor: null,
        razon_social: "",
        nit: "",
    }

    componentDidMount(): void {
        this.evento = MDL.compra_venta.addEventListener("moneda_seleccionada", () => { this.cargarSubtotal(); });
        this.cargarSubtotal();
        this.loadProveedores();
    }

    cargarSubtotal() {
        try {
            const monedaActual = MDL.compra_venta.getMonedaSeleccionada();
            const carritoItems = MDL.carrito.carrito_compra?.items || [];
            const subtotal = carritoItems.reduce((acc, item) => {
                const precioBase = item?.modelo?.precio_compra_moneda || 0;
                const tipoCambio = monedaActual?.tipo_cambio || 1;
                const precio = monedaActual ? precioBase / tipoCambio : precioBase;
                const cantidad = item?.cantidad || 0;
                return acc + precio * cantidad;
            }, 0);
            this.setState({ subtotal: subtotal });
        } catch (error) {
            console.error("%cError al calcular subtotal:", "color: #ff0000; font-weight: bold;", error);
            this.setState({ subtotal: 0 });
        }
    }

    async loadProveedores() {
        try {
            const proveedores = await MDL.inventario.proveedor.getAllProveedor();
            if (proveedores) {
                this.setState({ proveedores: Array.isArray(proveedores) ? proveedores : Object.values(proveedores) });
            }
        } catch (error) {
            console.error("Error cargando proveedores:", error);
        }
    }

    handleOnPress2 = async (saveRecurrente: boolean) => {
        try {
            const key_moneda = this.state.moneda?.key || this.props.moneda?.key;
            const almacen = this.state.almacen;
            const selectedMoneda = MDL.carrito.selectedMoneda || this.state.moneda || this.props.moneda;
            if (!almacen) {
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
            const subtotal = this.state.subtotal || 0;
            const total = subtotal * (selectedMoneda.tipo_cambio || 1);
            SelectTipoPago2.openPopup({
                key_punto_venta: MDL.caja.activa?.key_punto_venta as any,
                montoMaximo: total,
                key_moneda: key_moneda,
                onSelect: (tipos_pago: any) =>
                    this.handleSubmit(tipos_pago, key_moneda, saveRecurrente),
                solo_para_caja: false,
                compra: true
            });
        } catch (error: any) {
            console.error("Error al realizar la compra:", error);
            SNotification.send({
                key: "compra_rapida",
                title: "Error al realizar la compra2",
                body: error?.error || JSON.stringify(error),
                color: STheme.color.danger,
                time: 4000,
            });
        }
    };

    showCompraPopup(key_venta: String) {
        SPopup.open({
            key: "popup-venta-completada",
            content: (
                <SView col="xs-11 md-4" backgroundColor={STheme.color.background} padding={24} style={{ borderRadius: 16, maxWidth: "100%", alignItems: "center" }} >
                    <SView width={80} height={80} borderRadius={40} backgroundColor={"#a741e6"} center style={{ marginBottom: 16 }} > <SText fontSize={36} color="white">✔</SText> </SView>
                    <SText bold fontSize={20} center style={{ marginBottom: 8 }}> ¡Compra realizada con éxito! </SText>
                    <SText fontSize={14} center style={{ color: STheme.color.text, marginBottom: 24 }}> Tu transacción se ha completado correctamente. Gracias por tu compra. </SText>
                    <SView row col="xs-12 md-11" style={{ justifyContent: "space-between", gap: 16, width: "100%", flexWrap: "nowrap" }} >
                        <SView flex height={40} borderRadius={8} center backgroundColor={STheme.color.text} onPress={() => SPopup.close("popup-venta-completada")} > <SText color={STheme.color.background} center>Salir</SText> </SView>
                        <SView flex height={40} borderRadius={8} center backgroundColor={"#a741e6"} onPress={() => { SPopup.close("popup-venta-completada"); SNavigation.navigate("/venta/profile2", { pk: key_venta }); }} > <SText color={STheme.color.text} center>Ver compra</SText> </SView>
                        <SView flex height={40} borderRadius={8} center backgroundColor={"#a741e644"} border={"#a741e6"} onPress={() => {
                            SPopup.close("popup-venta-completada");
                            ComprobanteCarta.imprimir(key_venta)
                            // ComprobanteRollo.imprimir(key_venta)
                        }} > <SText color={STheme.color.text} center>Imprimir Pdf</SText> </SView>
                    </SView>
                </SView>
            )
        });
    }

    handleSubmit = async (tipos_pago: any, key_moneda: string, saveRecurrente?: boolean) => {
        try {
            const proveedor = this.proveedor;
            const keyPago = Object.values(tipos_pago)[0]?.tipo_pago?.key;
            const descripcionVenta = this.inputDescripcionVenta?.getValue?.() || "";
            if (keyPago === "credito" && !proveedor) {
                this.setState({ esCredito: true });
                SelectTipoPago2.closePopup();
                SNotification.send({
                    key: "compra_rapida",
                    title: "Proveedor requerido",
                    body: "Para registrar una compra a crédito, debe seleccionar un proveedor.",
                    color: STheme.color.danger,
                    time: 7000,
                });
                return;
            } else {
                this.setState({ esCredito: false });
            }
            const almacen = this.state.almacen;
            if (!almacen) {
                console.error("Debe seleccionar un almacen");
            }
            const effectiveKeyMoneda = key_moneda || this.state.moneda?.key || this.props.moneda?.key;
            if (!effectiveKeyMoneda) {
                console.error("Debe seleccionar una moneda válida");
            }
            const keyUsuario = MDL.usuario.session?.key;
            if (!keyUsuario) {
                console.error("Usuario no autenticado");
            }
            const keyCaja = MDL.caja.activa?.key;
            if (!keyCaja) {
                console.error("Caja no activa");
            }
            const detalle = (MDL.carrito.carrito_compra?.items || []).map((ci) => {
                const modelo = ci?.modelo || {};
                return {
                    "cantidad": ci?.cantidad || 0,
                    "precio_unitario": ci?.precio ?? 0,
                    "precio_unitario_base": modelo.precio_compra_moneda ?? 0,
                    "detalle": "",
                    "descuento": 0,
                    "descripcion": modelo.descripcion || "",
                    "key_modelo": modelo.key || null,
                    "moneda": effectiveKeyMoneda,
                    "fecha_vencimiento": modelo?.fecha_vencimiento || null,
                }
            })
            console.clear();

            const data: any = {
                "descripcion": descripcionVenta,
                "observacion": "Observacion compras",
                "key_proveedor": this.proveedor?.key || null,
                "key_usuario": keyUsuario,
                "facturar": this.state.factura,

                factura: this.state.factura
                    ? {
                        nro_factura: "f-compra-545",
                        // nro_factura: this.generateRandomCode(),
                        cuf: "212E5B3D5BBF8FB31CCF8BE464EE98640C7F9CB6615194573A17DAF74",
                        nit: this.state.nit || this.inputNit?.getValue?.() || "",
                        razon_social: this.state.razon_social || this.inputRazonSocial?.getValue?.() || "",
                        leyenda: "alvaro",
                    }
                    : null,

                tipo_pago: this.state.factura ? "credito" : "contado",



                "facturar_luego": this.state.factura,
                "key_caja": keyCaja,
                "key_almacen": almacen.key,
                "key_moneda": effectiveKeyMoneda,
                "detalle": detalle,
                tipos_pago: tipos_pago,
            }
            SNotification.send({
                key: "compra_rapida",
                title: "Cargando",
                type: "loading",
            });
            if (saveRecurrente) {
                const compraResp = await SSocket.sendPromise({
                    "service": "caja",
                    "component": "recurrente",
                    "type": "registro",
                    "estado": "cargando",
                    "data": {
                        "key_empresa": MDL.empresa.select?.key,
                        "key_usuario": MDL.usuario.session?.key,
                        "data": {
                            "service": "caja",
                            "component": "caja_detalle",
                            "type": "compra",
                            "estado": "cargando",
                            "data": data
                        }
                    }
                })
                console.log("%c" + JSON.stringify(compraResp), `color: #e9682d; font-weight: bold;`);

                // SelectTipoPago.closePopup();
                SNotification.remove("compra_rapida");
            } else {
                const compraResp = await SSocket.sendPromise({
                    "service": "caja",
                    "component": "caja_detalle",
                    "type": "compra",
                    "estado": "cargando",
                    "data": data
                })

                console.log("%c" + JSON.stringify(compraResp), `color: #d81de9; font-weight: bold;`);


                MDL.compra_venta.dispatchEvent({ type: "venta_realizada" });
                // SelectTipoPago.closePopup();
                SNotification.remove("compra_rapida");
                SPopup.close("PopupCarritoConfirmar");
                SPopup.close("PopupCarrito");
                MDL.carrito.limpiarCarritoCompras();
                this.showCompraPopup(compraResp?.data?.key_compra_venta);
                MDL.caja.dispatchEvent({ type: "onDetalleChange" });
            }
        } catch (error: any) {
            console.error("Error al realizar la compra:", error);
            SNotification.send({
                key: "compra_rapida",
                title: "Error al realizar la compra3",
                body: error?.error || JSON.stringify(error),
                color: STheme.color.danger,
                time: 4000,
            });
        }
    }

    render() {
        return <SView col={"xs-12"} height>
            < SHr />
            <SText center color={STheme.color.lightGray} bold>{"Confirmar la compra"}</SText>
            <SView style={{ padding: 4, width: 33, height: 33, position: "absolute", left: 0, top: 0, }} onPress={() => {
                SPopup.close("PopupCarritoConfirmar")
            }}>
                <SIconApp name="Arrow" fill={STheme.color.text} />
            </SView>
            <SHr />
            <SHr h={1} color={STheme.color.card} />
            <SView flex>
                <SView padding={8}>
                    <SView row col={"xs-12"}>
                        <SText col={"xs-6"} color={STheme.color.lightGray}>{"Datos del proveedor:"}</SText>
                        <SView col={"xs-6"} row style={{ alignItems: "flex-end", justifyContent: "flex-end", alignContent: "flex-start" }}>
                            <SInput height={30} style={{ marginTop: 0 }}
                                label={"Con factura"}
                                type="checkBox"
                                labelStyle={{ left: 12 }}
                                onChangeText={(val) => {
                                    this.setState({ factura: val })
                                    this.forceUpdate();
                                }}
                            />
                        </SView>
                    </SView>
                    <SHr />


                    <SView row>
                        {/* richard */}
                        {/* cuanod creo una empresa, recarga mal los permisos */}
                    <SInput
                        ref={ref => (this.inputProveedor = ref)}
                        inputStyle={this.state.esCredito ? { borderColor: STheme.color.danger, borderWidth: 1 } : undefined}
                        icon={<SText color={STheme.color.lightGray} bold>{"Proveedor: "}</SText>}
                        placeholder={"Seleccione o escriba un proveedor"}
                        height={40}
                        type="select2"
                        options={
                            (this.state.proveedores || [])
                                .map(p => (p?.razon_social || p?.nombres || "").trim())
                                .filter(a => !!a)
                        }
                        value={this.state.proveedor_texto}
                        onChangeText={(text) => {
                            const t = (text || "").trim();
                            const encontrado = (this.state.proveedores || []).find(
                                p =>
                                    ((p?.razon_social || p?.nombres || "")
                                        .trim()
                                        .toLowerCase() === t.toLowerCase())
                            );

                            if (encontrado?.key) {
                                this.proveedor = encontrado;
                                this.setState({
                                    key_proveedor: encontrado.key,
                                    proveedor_texto: t,
                                    razon_social: encontrado?.razon_social || "",
                                    nit: encontrado?.nit || "",
                                }, () => {
                                    this.inputRazonSocial?.setValue?.(
                                        encontrado?.razon_social || ""
                                    );
                                    this.inputNit?.setValue?.(
                                        encontrado?.nit || ""
                                    );
                                });
                            } else {
                                this.proveedor = null;
                                this.setState({
                                    key_proveedor: null,
                                    proveedor_texto: t,
                                });
                            }
                        }}
                        iconR={
                            (!this.state.key_proveedor && !!this.state.proveedor_texto) ? (
                                <SView
                                    center
                                    style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: 6,
                                        backgroundColor: STheme.color.card,
                                    }}
                                    onPress={async () => {
                                        const nombre = (this.state.proveedor_texto || "").trim();
                                        if (!nombre) return;

                                        try {
                                            const resp = await MDL.inventario.proveedor.registrar({
                                                razon_social: nombre,
                                                nombres: nombre,
                                                nit: this.inputNit?.getValue?.() || "",
                                                key_empresa: MDL.empresa.select?.key,
                                            });

                                            if (!resp?.key) {
                                                SNotification.send({
                                                    title: "Error",
                                                    body: "No se pudo crear el proveedor.",
                                                    color: STheme.color.danger,
                                                    time: 3000,
                                                });
                                                return;
                                            }

                                            this.proveedor = resp;
                                            const label = resp?.razon_social || resp?.nombres || nombre;
                                            this.setState(prev => ({
                                                proveedores: [
                                                    ...(prev.proveedores || []),
                                                    resp
                                                ],
                                                key_proveedor: resp.key,
                                                proveedor_texto: label,
                                                razon_social: resp?.razon_social || "",
                                                nit: resp?.nit || "",
                                            }));
                                            this.inputProveedor?.setValue?.(label);
                                            this.inputProveedor?.setSelect?.(resp);
                                            this.inputRazonSocial?.setValue?.(
                                                resp?.razon_social || ""
                                            );
                                            this.inputNit?.setValue?.(
                                                resp?.nit || ""
                                            );

                                            SNotification.send({
                                                title: "Proveedor creado",
                                                body: "Se registró correctamente.",
                                                time: 2500,
                                                color: STheme.color.success,
                                            });

                                        } catch (err: any) {
                                            console.error("Error al registrar proveedor:", err);
                                            SNotification.send({
                                                title: "Error",
                                                body:
                                                    err?.error ||
                                                    "No se pudo crear el proveedor.",
                                                color: STheme.color.danger,
                                                time: 4000,
                                            });
                                        }
                                    }}
                                >
                                    <SIconApp name="Girl" />
                                </SView>
                            ) : (
                                <SView
                                    center
                                    style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: 6,
                                        backgroundColor: STheme.color.card,
                                    }}
                                    onPress={() => {
                                        SNavigation.navigate("/proveedor", {
                                            onSelect: (proveedor: any) => {
                                                if (!proveedor?.key) return;
                                                this.proveedor = proveedor;
                                                const label = proveedor?.razon_social || proveedor?.nombres || "";
                                                this.setState(prev => ({
                                                    proveedores: prev.proveedores?.some(
                                                        p => p.key === proveedor.key
                                                    )
                                                        ? prev.proveedores
                                                        : [...(prev.proveedores || []), proveedor],
                                                    key_proveedor: proveedor.key,
                                                    proveedor_texto: label,
                                                    razon_social: proveedor?.razon_social || "",
                                                    nit: proveedor?.nit || "",
                                                }));
                                                this.inputProveedor?.setValue?.(label);
                                                this.inputProveedor?.setSelect?.(proveedor);
                                                this.inputRazonSocial?.setValue?.(
                                                    proveedor?.razon_social || ""
                                                );
                                                this.inputNit?.setValue?.(
                                                    proveedor?.nit || ""
                                                );
                                                SNavigation.goBack();
                                            }
                                        });
                                    }}
                                >
                                    <SIconApp name="Search" />
                                </SView>
                            )
                        }
                    />
                </SView>

                    {(this.state.factura) ? <>
                        <SHr h={10} />
                        <SView row>
                            <SInput
                                ref={ref => this.inputRazonSocial = ref}
                                icon={<SText color={STheme.color.lightGray} bold>{"Razón Social:"}</SText>}
                                placeholder={"Razón Social"}
                                value={this.state.razon_social}
                                onChangeText={(valor) => this.setState({ razon_social: valor || "" })}
                            />
                        </SView>
                        <SHr h={10} />
                        <SView row>
                            <SInput
                                ref={ref => this.inputNit = ref}
                                icon={<SText color={STheme.color.lightGray} bold>{"NIT:"}</SText>}
                                placeholder={"NIT"}
                                value={this.state.nit}
                                onChangeText={(valor) => this.setState({ nit: valor || "" })}
                            />
                        </SView>
                    </> : null}
                </SView>
                <SHr />
                <SView style={{ padding: 10, paddingBottom: 5, paddingTop: 5 }}>
                    <SText color={STheme.color.lightGray}>{"Seleccione el almacen"}</SText>
                    <SelectorAlmacen
                        selectFirst
                        icon={<SText color={STheme.color.lightGray} bold>{"Almacen:"}</SText>}
                        placeholder={"Escriba el nombre del almacen"}
                        filterData={(e) => {
                            if (e.key_sucursal == MDL.caja.activa?.key_sucursal) return true;
                            return false;
                        }}
                        onChangeSelect={e => {
                            this.state.almacen = e;
                        }}
                    />
                </SView>
                <SView style={{ padding: 10, paddingBottom: 5, paddingTop: 5 }}>
                    <SelectorMoneda
                        findInitialSelect={(arr) => {
                            return arr.find(a => a.tipo == "base")
                        }}
                        icon={<SText color={STheme.color.lightGray} bold>{"Moneda:"}</SText>}
                        placeholder={"Moneda"}
                        onChangeSelect={e => {
                            this.state.moneda = e;
                        }}
                    />
                </SView>
                <SHr />
                <SView style={{ padding: 10, paddingBottom: 5, paddingTop: 5 }}>
                    <SText color={STheme.color.lightGray}>{"Descripcion"}</SText>
                    <SInput
                        type="textArea"
                        ref={ref => this.inputDescripcionVenta = ref}
                        placeholder={"Descripción de la venta"}
                        style={{ minHeight: 20, height: 50, borderWidth: 1, borderColor: STheme.color.gray, marginVertical: 4 }}
                    />
                </SView>
                <SHr /></SView>
            <SHr h={1} color={STheme.color.card} />
            <SView col={"xs-12"} row center height={40}>
                <SView padding={8} card onPress={() => {
                    this.handleOnPress2(true);
                }}>
                    <SText>{"Guardar Recurrente"}</SText>
                </SView>
                <SView width={5} />
                <SView padding={8} card onPress={() => {
                    if (this.state.factura) {
                        if (this.proveedor) {
                            const razon_social = this.inputRazonSocial?.getValue?.() || this.state.razon_social || this.proveedor.razon_social;
                            const nit = this.inputNit?.getValue?.() || this.state.nit || this.proveedor.nit;
                            if ((this.proveedor.razon_social != razon_social) || (this.proveedor.nit != nit)) {
                                this.proveedor.razon_social = razon_social;
                                this.proveedor.nit = nit;
                                MDL.inventario.proveedor.editar(this.proveedor).then((resp: any) => {
                                }).catch((e: any) => {
                                    console.error("Error al guardar el proveedor:", e);
                                    SNotification.send({
                                        title: "Error",
                                        body: "No se pudo guardar el proveedor.",
                                        time: 3000,
                                        color: STheme.color.danger,
                                    });
                                })
                            }
                        }
                    }
                    this.handleOnPress2(false);
                }}>
                    <SText>{"Confirmar 2"}</SText>
                </SView>
            </SView>
        </SView >
    }
}



// cliente en compra

// permiso para editar ventas

// De estas notas, yo las convertiría en issues así:

// ### 🔴 Alta prioridad

// **1. Crear empresa de prueba para capacitación de cajeros**

// * Descripción: Crear un entorno aislado para entrenar a Pedro sin afectar datos productivos.
// * Criterios de aceptación:

//   * Existe una empresa de prueba.
//   * Permite crear usuarios cajeros.
//   * Permite realizar ventas y pruebas de inventario.

// ---

// **2. Dashboard de efectivo pendiente por depositar**

// * Descripción: Mostrar cuánto efectivo debería depositar cada cajero/sucursal según cierres de caja.
// * Criterios de aceptación:

//   * Vista consolidada por sucursal.
//   * Vista consolidada por cajero.
//   * Mostrar saldo pendiente de depósito.
//   * Filtrar por rango de fechas.

// ---

// **3. Impedir retiros superiores al saldo disponible**

// * Descripción: Evitar que una caja quede con saldo negativo.
// * Criterios de aceptación:

//   * Validación antes de registrar retiro.
//   * Mensaje de error cuando el retiro supera el saldo.
//   * No permitir guardar la operación.

// ---

// **4. Restringir edición de precios para cajeros**

// * Descripción: Los usuarios con rol Cajero no pueden modificar precios durante una venta.
// * Criterios de aceptación:

//   * Campo de precio bloqueado para cajeros.
//   * Administradores mantienen acceso.

// ---

// **5. Restringir eliminación de ventas a administradores**

// * Descripción: Solo administradores pueden eliminar ventas registradas.
// * Criterios de aceptación:

//   * Cajeros no visualizan acción de eliminar.
//   * Validación backend para evitar bypass.

// ---

// **6. Ocultar productos no SNAP para cajeros**

// * Descripción: Determinados productos (ej. Paquete de Calistenia) no deben aparecer en el POS para cajeros.
// * Criterios de aceptación:

//   * Configuración por producto.
//   * Cajeros solo ven productos permitidos.
//   * Administradores siguen viendo todo el catálogo.

// ---

// ### 🟡 Prioridad media

// **7. Mejorar pagos mixtos en ventas**

// * Descripción: Facilitar el registro de ventas con múltiples métodos de pago.
// * Problema actual:

//   * No existe botón de completar.
//   * No se muestra monto acumulado.
// * Criterios de aceptación:

//   * Mostrar total pagado acumulado.
//   * Mostrar saldo restante.
//   * Botón "Completar pago" cuando se alcance el total.

// ---

// **8. Agregar detalle de productos en reporte de ventas**

// * Descripción: Incluir productos vendidos en reportes para conciliación.
// * Criterios de aceptación:

//   * Mostrar nombre de producto.
//   * Mostrar cantidad.
//   * Mostrar subtotal por producto.

// ---

// **9. Agregar método de pago en detalle de reportes**

// * Descripción: Mostrar cómo fue pagado cada ítem o venta.
// * Ejemplo:

//   * 1 Agua - QR
//   * 2 Gatorade - Efectivo
// * Criterios de aceptación:

//   * Método de pago visible en exportaciones y vistas.

// ---

// ### 🟢 Inventario

// **10. Documentar flujo de inventario central → sucursal**

// * Descripción: Crear guía operativa del proceso:

//   * Compra central.
//   * Traspaso entre almacenes.
//   * Conteo físico.
//   * Ajustes por baja.

// ---

// **11. Revisar flujo de conteo y ajuste de inventario**

// * Descripción: Validar que los conteos físicos permitan ajustar correctamente sobrantes y faltantes.
// * Criterios de aceptación:

//   * Ajustes positivos funcionan.
//   * Ajustes negativos funcionan.
//   * Registro de motivo de baja.

// ---

// ### 📋 Tareas operativas (no desarrollo)

// **12. Conciliar inventario físico de todas las sucursales**

// * Responsable: Pedro

// **13. Programar sesión de sincronización de inventarios**

// * Responsable: Pedro + Ricky

// **14. Sincronizar stock real con sistema**

// * Responsable: Ricky + Pedro

// Si usan Jira/Trello, recomiendo etiquetarlas como:

// * `POS`
// * `Caja`
// * `Permisos`
// * `Inventario`
// * `Reportes`
// * `Capacitación`

// y priorizar en este orden: **Dashboard de depósitos → Permisos de cajero → Validación de retiros → Pagos mixtos → Reportes detallados**. Estos son los puntos que afectan directamente el control operativo y financiero.

