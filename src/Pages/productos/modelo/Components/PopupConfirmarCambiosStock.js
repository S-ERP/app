import React from "react";
import { ScrollView } from "react-native";
import { SHr, SInput, SLoad, SNotification, SPopup, SText, STheme, SView } from "servisofts-component";
import SSocket from "servisofts-socket";
import MDL from "../../../../MDL";
import InputSelector from "../../../../Components/Selectores/InputSelector";
import SInput2 from "../../../../Components/SForm2/SInput2";
import SelectTipoPagoCompra from "../../../caja2/components/SelectTipoPagoCompra";

export default class PopupConfirmarCambiosStock extends React.Component {
    state = {
        almacenes: [],
        key_almacen: null,
        monedas: [],
        key_moneda: null,
        clientes: [],
        key_proveedor: null,
        descripcion: "",
        guardando: false,
    }
    proveedor = null;
    preciosCompra = {};
    _posibleDuplicado = false;

    static open(props) {
        return new Promise((resolve) => {
            SPopup.open({
                key: "PopupConfirmarCambiosStock",
                content: <SView style={{
                    width: "100%",
                    maxWidth: 620,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: STheme.color.card,
                    backgroundColor: STheme.color.background,
                    overflow: "hidden",
                }} withoutFeedback>
                    <PopupConfirmarCambiosStock {...props}
                        onSuccess={() => {
                            SPopup.close("PopupConfirmarCambiosStock");
                            resolve({ confirmed: true });
                        }}
                        onCancel={() => {
                            SPopup.close("PopupConfirmarCambiosStock");
                            resolve({ confirmed: false });
                        }}
                    />
                </SView>
            });
        });
    }

    async componentDidMount() {
        const [almacenes, empresa, clientes] = await Promise.all([
            MDL.inventario.getAllAlmacen(),
            MDL.empresa.getFull(),
            MDL.crm.cliente.getAll().catch(() => []),
        ]);
        const monedas = empresa?.monedas || [];
        const monedaBase = monedas.find(m => m.tipo === "base");
        const clientesArr = Array.isArray(clientes) ? clientes : Object.values(clientes || {});

        const initPrecios = {};
        this.compras.forEach(({ row }) => {
            initPrecios[row.key] = parseFloat(row.precio_compra ?? 0);
        });
        this.preciosCompra = initPrecios;

        this.setState({
            almacenes,
            key_almacen: almacenes[0]?.key ?? null,
            monedas,
            key_moneda: monedaBase?.key ?? monedas[0]?.key ?? null,
            clientes: clientesArr.filter(Boolean),
        });
    }

    get compras() {
        return this.props.stockChanges.filter(({ row, orig }) =>
            parseFloat(row.stock ?? 0) > parseFloat(orig.stock ?? 0)
        );
    }

    get perdidas() {
        return this.props.stockChanges.filter(({ row, orig }) =>
            parseFloat(row.stock ?? 0) < parseFloat(orig.stock ?? 0)
        );
    }

    getSubtotal() {
        return this.compras.reduce((acc, { row, orig }) => {
            const cantidad = parseFloat(row.stock ?? 0) - parseFloat(orig.stock ?? 0);
            const precio = this.preciosCompra[row.key] ?? parseFloat(row.precio_compra ?? 0);
            return acc + cantidad * precio;
        }, 0);
    }

    async handleConfirmar() {
        const { key_almacen, key_moneda } = this.state;
        if (!key_almacen) {
            SNotification.send({ title: "Seleccione un almacén", color: STheme.color.danger, time: 3000 });
            return;
        }
        const compras = this.compras;
        const perdidas = this.perdidas;

        if (compras.length > 0) {
            const total = this.getSubtotal();
            SelectTipoPagoCompra.openPopup({
                key_punto_venta: MDL.caja.activa?.key_punto_venta,
                montoMaximo: total,
                key_moneda,
                solo_para_caja: false,
                compra: true,
                onSelect: (tipos_pago) => this.handleSubmitCompra(tipos_pago, compras, perdidas),
            });
        } else {
            this.setState({ guardando: true });
            try {
                await this.savePerdidas(perdidas, key_almacen);
                this.props.onSuccess?.();
            } catch (err) {
                console.error(err);
                const msg = err instanceof Error ? err.message : (err?.error || String(err));
                SNotification.send({ title: msg, color: STheme.color.danger, time: 5000 });
                this.setState({ guardando: false });
            }
        }
    }

    confirmarSiPosibleDuplicado() {
        if (!this._posibleDuplicado) return Promise.resolve(true);
        return new Promise((resolve) => {
            SPopup.confirm({
                title: "¿Reintentar la compra?",
                message: "El intento anterior demoró demasiado y es posible que la compra ya se haya registrado en el servidor. ¿Está seguro de que desea reintentar? Esto podría generar una compra duplicada.",
                onPress: () => resolve(true),
                onClose: () => resolve(false),
            });
        });
    }

    async handleSubmitCompra(tipos_pago, compras, perdidas) {
        if (!(await this.confirmarSiPosibleDuplicado())) return;
        const { key_almacen, key_moneda, descripcion } = this.state;
        this.setState({ guardando: true });
        try {
            const keyPago = Object.values(tipos_pago)[0]?.tipo_pago?.key;
            const detalle = compras.map(({ row, orig }) => {
                const cantidad = parseFloat(row.stock ?? 0) - parseFloat(orig.stock ?? 0);
                const precio = this.preciosCompra[row.key] ?? parseFloat(row.precio_compra ?? 0);
                return {
                    cantidad,
                    precio_unitario: precio,
                    precio_unitario_base: parseFloat(row.precio_compra ?? 0),
                    detalle: "",
                    descuento: 0,
                    descripcion: row.descripcion || "",
                    key_modelo: row.key,
                    moneda: key_moneda,
                    fecha_vencimiento: null,
                };
            });

            const compraResp = await SSocket.sendPromise({
                service: "caja",
                component: "caja_detalle",
                type: "compra",
                estado: "cargando",
                data: {
                    descripcion,
                    observacion: "",
                    key_proveedor: this.proveedor?.key || null,
                    key_usuario: MDL.usuario?.session?.key,
                    facturar: false,
                    factura: null,
                    tipo_pago: keyPago === "credito" ? "credito" : "contado",
                    key_caja: MDL.caja.activa?.key ?? null,
                    key_almacen,
                    key_moneda,
                    detalle,
                    tipos_pago,
                },
            });

            if (!compraResp?.data?.key_compra_venta) {
                throw new Error("El servidor no devolvió la clave de la compra.");
            }
            SelectTipoPagoCompra.closePopup();
            MDL.compra_venta.dispatchEvent({ type: "venta_realizada" });

            if (perdidas.length > 0) {
                await this.savePerdidas(perdidas, key_almacen);
            }

            this.props.onSuccess?.();
        } catch (err) {
            const esTimeout = err?.error === "timeOut";
            this._posibleDuplicado = esTimeout;
            console.error(err);
            SelectTipoPagoCompra.closePopup();
            if (esTimeout) {
                SNotification.send({
                    title: "La compra tardó demasiado en responder",
                    body: "No se pudo confirmar si la compra se registró. Verifique el historial de compras antes de reintentar.",
                    color: STheme.color.danger,
                    time: 7000,
                });
            } else {
                const msg = err instanceof Error ? err.message : (err?.error || String(err));
                SNotification.send({ title: msg, color: STheme.color.danger, time: 5000 });
            }
            this.setState({ guardando: false });
        }
    }

    async savePerdidas(perdidas, key_almacen) {
        const conteo = await MDL.inventario.saveConteoManualInventario({
            key_almacen,
            data: perdidas.map(({ row, orig }) => {
                const stockActual = parseFloat(orig.stock ?? 0);
                const stockNuevo = parseFloat(row.stock ?? 0);
                const diff = Math.abs(stockNuevo - stockActual);
                return {
                    key_modelo: row.key,
                    stock: stockActual,
                    cantidad_real: stockActual,
                    cantidad_baja: diff,
                    explicacion: "Pérdida declarada desde tabla de modelos",
                };
            }),
        });
        await MDL.inventario.aplicar_cardex(conteo.key);
    }

    renderCompraItem({ row, orig }) {
        const stockActual = parseFloat(orig.stock ?? 0);
        const stockNuevo = parseFloat(row.stock ?? 0);
        const cantidad = stockNuevo - stockActual;
        const precio = this.preciosCompra[row.key] ?? parseFloat(row.precio_compra ?? 0);
        const subtotal = cantidad * precio;
        return <SView key={row.key} row style={{ alignItems: "center", paddingVertical: 5, borderBottomWidth: 1, borderColor: STheme.color.card, gap: 6 }}>
            <SText fontSize={12} style={{ flex: 1 }}>{row.descripcion}</SText>
            <SText fontSize={11} style={{ color: STheme.color.success, width: 46, textAlign: "center" }}>+{cantidad}</SText>
            <SView style={{ width: 90 }}>
                <SInput2
                    type="money"
                    defaultValue={precio ? String(precio) : undefined}
                    placeholder="0"
                    onChangeText={val => {
                        this.preciosCompra[row.key] = parseFloat(val.replace(/\./g, "").replace(",", ".")) || 0;
                    }}
                    onBlur={() => this.forceUpdate()}
                    style={{ height: 22, textAlign: "right" }}
                />
            </SView>
            <SText fontSize={11} style={{ width: 76, textAlign: "right" }}>
                {subtotal.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </SText>
        </SView>;
    }

    renderPerdidaItem({ row, orig }) {
        const stockActual = parseFloat(orig.stock ?? 0);
        const stockNuevo = parseFloat(row.stock ?? 0);
        const diff = Math.abs(stockNuevo - stockActual);
        return <SView key={row.key} row style={{ justifyContent: "space-between", alignItems: "center", paddingVertical: 5, borderBottomWidth: 1, borderColor: STheme.color.card }}>
            <SText fontSize={12} style={{ flex: 1 }}>{row.descripcion}</SText>
            <SText fontSize={11} style={{ color: STheme.color.lightGray, marginHorizontal: 12 }}>{stockActual} → {stockNuevo}</SText>
            <SText fontSize={12} bold style={{ color: STheme.color.danger, minWidth: 40, textAlign: "right" }}>-{diff}</SText>
        </SView>;
    }

    render() {
        const { almacenes, key_almacen, monedas, key_moneda, clientes, guardando } = this.state;
        const compras = this.compras;
        const perdidas = this.perdidas;
        const subtotal = this.getSubtotal();
        const monedaSeleccionada = monedas.find(m => m.key === key_moneda);
        const simbolo = monedaSeleccionada?.observacion ?? "Bs";

        return <SView>
            <SView style={{ padding: 16, borderBottomWidth: 1, borderColor: STheme.color.card }}>
                <SText fontSize={14} bold>Confirmar cambios de stock</SText>
            </SView>

            <ScrollView style={{ maxHeight: 520 }}>
                <SView padding={16}>

                    {/* Almacén */}
                    <SText fontSize={11} style={{ color: STheme.color.lightGray, marginBottom: 4 }}>Almacén</SText>
                    {!almacenes.length
                        ? <SLoad size="small" />
                        : <InputSelector
                            defaultValue={key_almacen}
                            options={almacenes.map(a => ({ label: a.descripcion, value: a.key }))}
                            onSelect={opt => this.setState({ key_almacen: opt.value })}
                            autoSelectOnBlur
                        />
                    }
                    <SHr h={16} />

                    {/* ─── COMPRAS ─── */}
                    {compras.length > 0 && <>
                        <SText fontSize={11} bold style={{ color: STheme.color.success, marginBottom: 8 }}>
                            COMPRAS ({compras.length})
                        </SText>
                        <SView row style={{ paddingBottom: 4, borderBottomWidth: 1, borderColor: STheme.color.card, gap: 6 }}>
                            <SText fontSize={10} style={{ flex: 1, color: STheme.color.lightGray }}>Producto</SText>
                            <SText fontSize={10} style={{ width: 46, textAlign: "center", color: STheme.color.lightGray }}>Cant.</SText>
                            <SText fontSize={10} style={{ width: 90, textAlign: "right", color: STheme.color.lightGray }}>Precio unit.</SText>
                            <SText fontSize={10} style={{ width: 76, textAlign: "right", color: STheme.color.lightGray }}>Subtotal</SText>
                        </SView>
                        {compras.map(item => this.renderCompraItem(item))}
                        <SView row style={{ justifyContent: "flex-end", alignItems: "center", paddingTop: 8, gap: 8 }}>
                            <SText fontSize={12} style={{ color: STheme.color.lightGray }}>Total compras:</SText>
                            <SText fontSize={14} bold style={{ color: STheme.color.success }}>
                                {simbolo} {subtotal.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </SText>
                        </SView>
                        <SHr h={16} />

                        {/* Moneda */}
                        <SText fontSize={11} style={{ color: STheme.color.lightGray, marginBottom: 4 }}>Moneda</SText>
                        {!monedas.length
                            ? <SLoad size="small" />
                            : <InputSelector
                                defaultValue={key_moneda}
                                options={monedas.map(m => ({ label: m.observacion || m.descripcion || m.key, value: m.key }))}
                                onSelect={opt => this.setState({ key_moneda: opt.value })}
                                autoSelectOnBlur
                            />
                        }
                        <SHr h={12} />

                        {/* Proveedor */}
                        <SText fontSize={11} style={{ color: STheme.color.lightGray, marginBottom: 4 }}>Proveedor</SText>
                        <InputSelector
                            options={(clientes || [])
                                .filter(c => c?.razon_social || c?.nombres)
                                .map(c => ({ label: c?.razon_social || c?.nombres || "", value: c?.key }))
                            }
                            onSelect={opt => {
                                this.proveedor = clientes.find(c => c.key === opt.value) || null;
                                this.setState({ key_proveedor: opt.value });
                            }}
                            autoSelectOnBlur
                        />
                        <SHr h={12} />

                        {/* Descripción */}
                        <SText fontSize={11} style={{ color: STheme.color.lightGray, marginBottom: 4 }}>Descripción</SText>
                        <SInput
                            type="textArea"
                            placeholder="Descripción de la compra"
                            style={{ height: 56, borderWidth: 1, borderColor: STheme.color.card, borderRadius: 4, marginVertical: 0 }}
                            onChangeText={val => this.setState({ descripcion: val || "" })}
                        />
                        <SHr h={16} />
                    </>}

                    {/* ─── PÉRDIDAS ─── */}
                    {perdidas.length > 0 && <>
                        <SText fontSize={11} bold style={{ color: STheme.color.danger, marginBottom: 8 }}>
                            PÉRDIDAS ({perdidas.length})
                        </SText>
                        {perdidas.map(item => this.renderPerdidaItem(item))}
                        <SHr h={16} />
                    </>}

                </SView>
            </ScrollView>

            {/* Footer */}
            <SView row style={{ justifyContent: "flex-end", gap: 8, padding: 16, borderTopWidth: 1, borderColor: STheme.color.card }}>
                <SView
                    onPress={guardando ? null : () => this.props.onCancel?.()}
                    style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4, backgroundColor: STheme.color.card }}
                >
                    <SText fontSize={12}>Cancelar</SText>
                </SView>
                <SView
                    onPress={guardando ? null : this.handleConfirmar.bind(this)}
                    style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 4, backgroundColor: STheme.color.success + "44" }}
                >
                    {guardando
                        ? <SLoad size="small" />
                        : <SText fontSize={12} bold style={{ color: STheme.color.success }}>
                            {compras.length > 0 ? "Confirmar y Generar Compra" : "Confirmar"}
                        </SText>
                    }
                </SView>
            </SView>
        </SView>;
    }
}
