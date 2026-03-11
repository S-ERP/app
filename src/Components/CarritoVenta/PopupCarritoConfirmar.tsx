import React from "react";
import { SHr, SImage, SInput, SMath, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../MDL";
import SSocket from "servisofts-socket";
import SIconApp from "../../Assets/SIconApp";
import SelectorAlmacen from "../Selectores/SelectorAlmacen";
import PopupCarritoConfirmarResumen from "./PopupCarritoConfirmarResumen";
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
                maxHeight: "100%",
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
    proveedor: any;
    inputCliente = null;
    descuentoSeleccionado = null;
    state: { almacen: any, moneda: any, factura: boolean, razon_social: string, nit: string, clientes: any[], key_cliente: string | null, cliente_texto: string, descuentos: any[], esCredito: boolean, } = {
        almacen: null,
        moneda: null,
        factura: false,
        razon_social: "",
        nit: "",
        clientes: [],
        key_cliente: null,
        cliente_texto: "",
        descuentos: [],
        esCredito: false,
    }
    onTipoPagoChange = (esCredito: boolean) => {
        this.setState({ esCredito });
    };




    componentDidMount() {
        this.evento = MDL.compra_venta.addEventListener(
            "moneda_seleccionada",
            this.cargarMonedaSeleccionada
        );

        // Cargar moneda actual
        this.cargarMonedaSeleccionada();

        // Cargar datos iniciales
        this.cargarClientes();
        this.cargarDescuentos();
    }

    componentWillUnmount(): void {
        if (this.evento) {
            MDL.compra_venta.removeEventListener(this.evento);
        }
    }

    cargarMonedaSeleccionada = () => {
        const moneda = MDL.compra_venta.getMonedaSeleccionada();

        this.setState({
            moneda: moneda || null
        });
    };

    async cargarClientes() {
        try {
            const clientes = await MDL.crm.cliente.getAll();
            this.setState({ clientes: clientes || [] });
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
                    title: "Moneda requerida",
                    body: "Debe seleccionar una moneda antes de continuar.",
                    color: STheme.color.danger,
                });
                // return;
            }

            if (!almacen) {
                SNotification.send({
                    title: "Almacén requerido",
                    body: "Debe seleccionar un almacén.",
                    color: STheme.color.danger,
                });
                // return;
            }

            let subtotal = MDL.carrito.carrito_venta?.monto_total || 0;
            subtotal = parseFloat(Number(subtotal).toFixed(2));

            let porcentajeDescuento = 0;
            let montoFinal = subtotal;
            let descuentos = [];

            if (descuentoSeleccionado?.porcentaje) {
                porcentajeDescuento = descuentoSeleccionado.porcentaje;

                const descuentoMonto =
                    Math.round((montoFinal * porcentajeDescuento) * 100) / 100;

                montoFinal = parseFloat(
                    (montoFinal - descuentoMonto).toFixed(2)
                );

                descuentos = [descuentoSeleccionado];
            }

            const descripcionVenta = this.inputDescripcionVenta?.getValue?.() || "";

            PopupCarritoConfirmarResumen.open({
                subtotal,
                montoMaximo: montoFinal,
                key_moneda: moneda?.key,
                porcentajeDescuento,
                descuentoSeleccionado: descuentos,
                solo_para_caja: false,
                cliente: this.proveedor,
                factura: !!factura,
                moneda,
                almacen,
                descripcion: descripcionVenta, // 👈 AQUI
                onTipoPagoChange: this.onTipoPagoChange
            })
        } catch (error: any) {
            console.error("Error al realizar la compra:", error);
            SNotification.send({
                key: "venta_rapida",
                title: "Error al realizar la compra",
                body: error?.error || JSON.stringify(error),
                color: STheme.color.danger,
                time: 4000,
            });
        }
    }
    render() {
        return <SView col={"xs-12"} height>
            < SHr />
            <SText center color={STheme.color.lightGray} bold>{"Confirmar la venta"}</SText>
            <SView style={{
                padding: 4,
                width: 33, height: 33,
                position: "absolute",
                left: 0,
                top: 0,
            }} onPress={() => {
                SPopup.close("PopupCarritoConfirmar")
            }}>
                <SIconApp name="Arrow" fill={STheme.color.text} />
            </SView>
            <SHr />
            <SHr h={1} color={STheme.color.card} />
            <SHr />
            <SView flex>
                <SView padding={8}>
                    <SView row col={"xs-12"}>
                        <SText col={"xs-6"} color={STheme.color.lightGray}>{"Datos del Cliente:"}</SText>
                        <SView col={"xs-6"} row style={{ alignItems: "flex-end", justifyContent: "flex-end", alignContent: "flex-start" }}>
                            <SInput height={20} style={{ marginTop: 0 }} labelStyle={{ left: 12 }}
                                label={"Con factura"}
                                type="checkBox"
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
                        <SHr />
                    </SView>
                    <SView row>
                        <SInput
                            ref={ref => (this.inputCliente = ref)}
                            inputStyle={
                                this.state.factura || this.state.esCredito
                                    ? { borderColor: STheme.color.danger, borderWidth: 1 }
                                    : undefined
                            }
                            icon={<SText color={STheme.color.lightGray} bold>{"Cliente: "}</SText>}
                            placeholder={"Escriba el nombre del cliente"}
                            height={40}
                            type="select2"
                            options={
                                (this.state.clientes || [])
                                    .map(c => (c?.razon_social || c?.nombres || "").trim())
                                    .filter(a => !!a)
                            }
                            onChangeText={(text) => {
                                const t = (text || "").trim();
                                const encontrado = (this.state.clientes || []).find(c =>
                                ((c?.razon_social || c?.nombres || "")
                                    .trim()
                                    .toLowerCase() === t.toLowerCase())
                                );
                                if (encontrado && encontrado.key) {
                                    this.proveedor = encontrado;
                                    this.setState({
                                        key_cliente: encontrado.key,
                                        cliente_texto: t,
                                    });

                                    this.inputRazonSocial?.setValue?.(
                                        encontrado?.razon_social || encontrado?.nombres || ""
                                    );
                                    this.inputNit?.setValue?.(
                                        encontrado?.nit || ""
                                    );

                                } else {
                                    this.proveedor = null;

                                    this.setState({
                                        key_cliente: null,
                                        cliente_texto: t,
                                    });
                                }
                            }}
                            iconR={
                                (!this.state.key_cliente && !!this.state.cliente_texto) ? (
                                    <SView
                                        center
                                        style={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: 6,
                                            backgroundColor: STheme.color.card,
                                        }}
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
                                                if (!resp || !resp.key) {
                                                    SNotification.send({
                                                        title: "Error",
                                                        body: "No se pudo crear el cliente.",
                                                        color: STheme.color.danger,
                                                        time: 3000,
                                                    });
                                                    return;
                                                }
                                                this.proveedor = resp;

                                                this.setState(prev => ({
                                                    clientes: [
                                                        ...(prev.clientes || []),
                                                        resp
                                                    ],
                                                    key_cliente: resp.key,
                                                    cliente_texto: resp?.razon_social || resp?.nombres || nombre,
                                                }));
                                                this.inputCliente?.setSelect?.(resp);
                                                this.inputRazonSocial?.setValue?.(
                                                    resp?.razon_social || resp?.nombres || ""
                                                );
                                                this.inputNit?.setValue?.(
                                                    resp?.nit || ""
                                                );

                                                SNotification.send({
                                                    title: "Cliente creado",
                                                    body: "Se registró correctamente.",
                                                    time: 2500,
                                                    color: STheme.color.success,
                                                });

                                            } catch (err: any) {

                                                console.error("Error al registrar cliente:", err);

                                                SNotification.send({
                                                    title: "Error",
                                                    body: err?.error || "No se pudo crear el cliente.",
                                                    color: STheme.color.danger,
                                                    time: 4000,
                                                });
                                            }
                                        }}
                                    >
                                        <SIconApp name="Add" />
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

                                            SNavigation.navigate("/cliente", {

                                                onSelect: (cliente: any) => {

                                                    if (!cliente || !cliente.key) return;

                                                    this.proveedor = cliente;

                                                    this.setState(prev => ({
                                                        clientes: prev.clientes.some(c => c.key === cliente.key)
                                                            ? prev.clientes
                                                            : [...prev.clientes, cliente],
                                                        key_cliente: cliente.key,
                                                        cliente_texto:
                                                            cliente?.razon_social ||
                                                            cliente?.nombres ||
                                                            "",
                                                    }));

                                                    this.inputCliente?.setSelect?.(cliente);
                                                    this.inputRazonSocial?.setValue?.(
                                                        cliente?.razon_social || cliente?.nombres || ""
                                                    );
                                                    this.inputNit?.setValue?.(
                                                        cliente?.nit || ""
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
                                inputStyle={this.state.factura ? { borderColor: STheme.color.danger, borderWidth: 1 } : undefined}

                                ref={ref => this.inputRazonSocial = ref} icon={<SText color={STheme.color.lightGray} bold>{"Razón Social:"}</SText>} placeholder={"Razón Social"} />
                        </SView>
                        <SHr h={10} />
                        <SView row><SInput
                            icon={<SText color={STheme.color.lightGray} bold>{"# NIT:"}</SText>}
                            placeholder={"Escriba el nit"}
                            inputStyle={
                                this.state.factura
                                    ? { borderColor: STheme.color.danger, borderWidth: 1 }
                                    : undefined
                            }
                            ref={ref => (this.inputNit = ref)}
                            onChangeText={(e) => {

                                const nit = (e || "").trim();
                                if (nit.length < 6) {
                                    this.proveedor = null;
                                    return;
                                }

                                MDL.crm.cliente.buscar_nit(nit)
                                    .then(proveedor => {
                                        if (!proveedor) {
                                            this.proveedor = null;
                                            return;
                                        }
                                        this.proveedor = proveedor;
                                        this.inputCliente?.setSelect?.(proveedor);
                                        this.inputRazonSocial?.setValue?.(
                                            proveedor?.razon_social || proveedor?.nombres || ""
                                        );

                                    })
                                    .catch(error => {
                                        console.error("Error buscando NIT:", error);
                                    });
                            }}
                            onSubmitEditing={() => {
                            }}
                            iconR={
                                <SView
                                    card
                                    style={{ width: 40, height: 40 }}
                                    onPress={() => {
                                        SNavigation.navigate("/cliente", {
                                            onSelect: (proveedor: any) => {

                                                if (!proveedor) return;

                                                this.proveedor = proveedor;

                                                this.inputCliente?.setSelect?.(proveedor);
                                                this.inputRazonSocial?.setValue?.(
                                                    proveedor?.razon_social || proveedor?.nombres || ""
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
                            }
                        />
                        </SView>
                        <SHr h={4} />
                    </> : null}
                    <SHr height={20} />
                    <SView row col={"xs-12"}>
                        <SText col={"xs-12"} color={STheme.color.lightGray}>{"Seleccione si hay descuento:"}</SText>
                        <SView col={"xs-12"} row style={{ alignItems: "flex-end", justifyContent: "flex-end", alignContent: "flex-start" }}>
                            <SInput
                                ref={ref => this.inputDescuento = ref}
                                icon={<SText color={STheme.color.lightGray} bold>{"Descuento:"}</SText>}
                                placeholder={"Seleccione descuento"}
                                height={40}
                                type="select2"
                                options={this.state.descuentos.map(c => `${(c?.descripcion || "").trim()} - ${c?.porcentaje ?? 0}%`).filter(a => !!a)}
                                onChangeText={(text) => {
                                    const t = (text || "").trim();
                                    const encontradoD = (this.state.descuentos || []).find(c =>
                                        ((`${(c?.descripcion || "").trim()} - ${c?.porcentaje ?? 0}%`).trim().toLowerCase() === t.toLowerCase())
                                    );
                                    if (encontradoD) {
                                        this.descuentoSeleccionado = encontradoD;
                                    } else {
                                        this.descuentoSeleccionado = null;
                                    }
                                }}
                            />
                        </SView>
                    </SView>
                </SView>
                <SHr />
                <SView style={{ padding: 10, paddingBottom: 5, paddingTop: 5 }}>
                    <SText color={STheme.color.lightGray}>{"Seleccione el almacén"}</SText>
                    <SelectorAlmacen
                        selectFirst
                        icon={<SText color={STheme.color.lightGray} bold>{"Almacén:"}</SText>}
                        placeholder={"Escriba el nombre del almacén"}
                        filterData={(e) => {
                            if (e.key_sucursal == MDL.caja.activa?.key_sucursal) return true;
                            return false;
                        }}
                        onChangeSelect={e => {
                            this.setState({ almacen: e }); // ✅ correcto
                        }} />
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
                <SHr />
            </SView>
            <SHr h={1} color={STheme.color.card} />
            <SView col={"xs-12"} row center height={40}>
                <SView padding={8} card onPress={() => {

                    this.handleOnPress();
                }}>
                    <SText>{"Confirmar la venta"}</SText>
                </SView>
            </SView>
        </SView >
    }
}
