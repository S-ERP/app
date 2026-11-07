import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import { SHr, SInput, SLoad, SNavigation, SNotification, SPage, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../MDL';
import SCopy from '../../Components/SCopy';
import Nav from './Nav';
import { URL, getConfigTienda, guardarConfigTienda, moneda } from './api';
import SSocket from 'servisofts-socket';
import Model from '../../Model';

const opcionesTienda = async () => (await SSocket.sendPromise({
    component: "tienda", type: "config_opciones", estado: "cargando",
    key_empresa: Model.empresa.Action.getKey(), key_usuario: Model.usuario.Action.getKey(),
}, 60000)).data ?? {};

const API_PUBLICA = "https://serp.servisofts.com/http/rest/tienda";

const Btn = ({ label, color, onPress, disabled, small }) => <SView card center onPress={disabled ? null : onPress}
    style={{ height: small ? 30 : 38, borderRadius: 8, paddingHorizontal: small ? 10 : 16, marginRight: 6, backgroundColor: color, opacity: disabled ? 0.5 : 1 }}>
    <SText color={"#fff"} bold fontSize={small ? 12 : 14}>{label}</SText>
</SView>

const Seccion = ({ titulo, children, ayuda }) => <SView col={"xs-12"} card style={{ padding: 14, borderRadius: 10, marginBottom: 12 }}>
    <SText bold fontSize={16}>{titulo}</SText>
    {ayuda ? <><SHr height={4} /><SText fontSize={12} color={STheme.color.gray}>{ayuda}</SText></> : null}
    <SHr height={8} />
    {children}
</SView>

const Campo = ({ label, children, col = "xs-12 md-6" }) => <SView col={col} style={{ padding: 4 }}>
    <SText fontSize={12} color={STheme.color.gray}>{label}</SText>
    <SHr height={4} />
    {children}
</SView>

const Select = ({ value, options, onChange, vacio = "— Elegí —" }) => <SInput type="select" key={String(value) + options.length} defaultValue={value ?? ""}
    options={[{ key: "", content: vacio }, ...options]} onChangeText={onChange} style={{ height: 38, borderRadius: 8 }} />;

const Chip = ({ label, on, onPress }) => <SView center onPress={onPress}
    style={{ height: 28, paddingHorizontal: 10, borderRadius: 14, marginRight: 6, marginBottom: 6, borderWidth: 1,
        borderColor: on ? STheme.color.text : STheme.color.card, backgroundColor: on ? STheme.color.card : "transparent" }}>
    <SText fontSize={12}>{label}</SText>
</SView>

// Configuración de la tienda web de la empresa: dónde se registran las ventas, cómo se cobran los planes en cuotas
// (reintentos) y qué productos se publican en la página.
export default class tienda extends Component {
    state = { cargando: true, guardando: false, t: {}, op: {}, productos: [] };

    componentDidMount() {
        MDL.rolesPermisos.getPermisoAsync({ url: URL, permiso: "configurar" }).then(async (e) => {
            if (!e) return SNavigation.goBack();
            try {
                const [t, op] = await Promise.all([getConfigTienda(), opcionesTienda()]);
                this.setState({ cargando: false, t: { nombre: "Tienda web", activa: true, reintento_horas: 24, reintentos: 3, ...t }, op,
                    productos: (t.productos ?? []).map(p => ({ ...p, sucursales: p.sucursales ?? [] })) });
            } catch (err) {
                this.setState({ cargando: false });
                SNotification.send({ title: "Error", body: err?.error ?? "No se pudo cargar la configuración", color: STheme.color.danger, time: 5000 });
            }
        });
    }

    set = (k, v) => this.setState({ t: { ...this.state.t, [k]: v } });
    setProd = (i, k, v) => { const productos = [...this.state.productos]; productos[i] = { ...productos[i], [k]: v }; this.setState({ productos }); };

    async guardar() {
        const t = this.state.t;
        for (const [k, l] of [["key_punto_venta", "el punto de venta"], ["key_almacen", "el almacén"], ["key_empresa_tipo_pago", "el tipo de pago con tarjeta"], ["key_usuario_venta", "el usuario de las ventas"], ["key_moneda", "la moneda"]])
            if (!t[k]) return SNotification.send({ title: "Falta " + l, color: STheme.color.warning, time: 3000 });
        if (this.state.productos.some(p => p.modalidad == "cuotas") && !t.key_empresa_tipo_pago_credito)
            return SNotification.send({ title: "Falta el tipo de pago a crédito", body: "Lo necesitan los planes en cuotas.", color: STheme.color.warning, time: 4000 });
        if (this.state.productos.some(p => !p.key_modelo)) return SNotification.send({ title: "Hay un plan sin producto", color: STheme.color.warning, time: 3000 });
        this.setState({ guardando: true });
        try {
            const data = await guardarConfigTienda({
                nombre: t.nombre, activa: t.activa !== false, key_punto_venta: t.key_punto_venta, key_almacen: t.key_almacen,
                key_empresa_tipo_pago: t.key_empresa_tipo_pago, key_empresa_tipo_pago_credito: t.key_empresa_tipo_pago_credito ?? "",
                key_usuario_venta: t.key_usuario_venta, key_moneda: t.key_moneda,
                reintento_horas: Number(t.reintento_horas), reintentos: Number(t.reintentos), origenes: t.origenes ?? [],
                productos: this.state.productos.map((p, i) => ({ key: p.key, key_modelo: p.key_modelo, nombre: p.nombre, descripcion: p.descripcion,
                    orden: i, solo_web: p.solo_web !== false, modalidad: p.modalidad ?? "unico", cuotas: Number(p.cuotas ?? 12),
                    sucursales: p.sucursales?.length ? p.sucursales : null })),
            });
            this.setState({ guardando: false, t: { ...this.state.t, ...data }, productos: (data.productos ?? []).map(p => ({ ...p, sucursales: p.sucursales ?? [] })) });
            SNotification.send({ title: "Tienda guardada", color: STheme.color.success, time: 3000 });
        } catch (e) {
            this.setState({ guardando: false });
            SNotification.send({ title: "No se pudo guardar", body: e?.error ?? "", color: STheme.color.danger, time: 6000 });
        }
    }

    renderProducto(p, i) {
        const op = this.state.op;
        const modelo = (op.modelos ?? []).find(m => m.key == p.key_modelo);
        const cuotas = p.modalidad == "cuotas";
        return <SView key={p.key ?? "n" + i} col={"xs-12"} style={{ padding: 10, borderRadius: 8, borderWidth: 1, borderColor: STheme.color.card, marginBottom: 8 }}>
            <SView row style={{ flexWrap: "wrap" }}>
                <Campo label="Producto del inventario (el precio sale de aquí)">
                    <Select value={p.key_modelo} options={(op.modelos ?? []).map(m => ({ key: m.key, content: `${m.descripcion} · ${moneda(m.precio_venta)}${m.venta_caja === false ? " · solo web" : ""}` }))}
                        onChange={(v) => this.setProd(i, "key_modelo", v)} />
                </Campo>
                <Campo label="Nombre en la página">
                    <SInput defaultValue={p.nombre ?? ""} placeholder={modelo?.descripcion ?? "Plan Mensual"} onChangeText={(v) => this.setProd(i, "nombre", v)} style={{ height: 38, borderRadius: 8 }} />
                </Campo>
                <Campo label="Modalidad" col="xs-6 md-3">
                    <SInput type="select" key={"mod" + (p.modalidad ?? "unico")} defaultValue={p.modalidad ?? "unico"} style={{ height: 38, borderRadius: 8 }}
                        options={[{ key: "unico", content: "Pago único" }, { key: "cuotas", content: "Cuotas mensuales (débito automático)" }]}
                        onChangeText={(v) => this.setProd(i, "modalidad", v || "unico")} />
                </Campo>
                {cuotas ? <Campo label="Cantidad de cuotas (meses)" col="xs-6 md-3">
                    <SInput defaultValue={String(p.cuotas ?? 12)} type="number" onChangeText={(v) => this.setProd(i, "cuotas", v)} style={{ height: 38, borderRadius: 8 }} />
                </Campo> : null}
                <Campo label="Descripción corta" col="xs-12 md-6">
                    <SInput defaultValue={p.descripcion ?? ""} onChangeText={(v) => this.setProd(i, "descripcion", v)} style={{ height: 38, borderRadius: 8 }} />
                </Campo>
            </SView>
            {modelo ? <SText fontSize={12} color={STheme.color.gray} style={{ padding: 4 }}>
                {cuotas ? `El cliente paga ${moneda(modelo.precio_venta)} por mes durante ${p.cuotas ?? 12} meses (total ${moneda(modelo.precio_venta * Number(p.cuotas ?? 12))}).` : `El cliente paga ${moneda(modelo.precio_venta)} una vez.`}
            </SText> : null}
            <SView style={{ padding: 4 }}>
                <SText fontSize={12} color={STheme.color.gray}>Sucursales donde se vende (ninguna marcada = todas)</SText>
                <SHr height={6} />
                <SView row style={{ flexWrap: "wrap" }}>
                    {(op.sucursales ?? []).map(s => {
                        const on = (p.sucursales ?? []).includes(s.key);
                        return <Chip key={s.key} label={s.nombre} on={on} onPress={() => this.setProd(i, "sucursales", on ? p.sucursales.filter(x => x != s.key) : [...(p.sucursales ?? []), s.key])} />
                    })}
                </SView>
            </SView>
            <SView row style={{ padding: 4 }}>
                <SView flex />
                {i > 0 ? <Btn small label="↑ Subir" color={STheme.color.gray} onPress={() => { const x = [...this.state.productos];[x[i - 1], x[i]] = [x[i], x[i - 1]]; this.setState({ productos: x }); }} /> : null}
                <Btn small label="Quitar" color={STheme.color.danger} onPress={() => this.setState({ productos: this.state.productos.filter((_, j) => j != i) })} />
            </SView>
        </SView>
    }

    render() {
        if (this.state.cargando) return <SPage title="Tienda web · Configuración"><Nav activo="/tienda" /><SLoad /></SPage>;
        const { t, op } = this.state;
        const tarjetas = (op.tipos_pago ?? []).filter(x => x.key_pasarela_empresa);
        const creditos = (op.tipos_pago ?? []).filter(x => x.key_tipo_pago == "credito");
        return <SPage title="Tienda web · Configuración" disableScroll>
            <Nav activo="/tienda" />
            <ScrollView><SView col={"xs-12"} center><SView col={"xs-12 lg-10 xl-8"} style={{ padding: 10 }}>

                <Seccion titulo="Tienda" ayuda="La página web lee los planes y precios de aquí. Las ventas se registran solas en la caja automática del punto de venta elegido.">
                    <SView row style={{ flexWrap: "wrap" }}>
                        <Campo label="Nombre">
                            <SInput defaultValue={t.nombre ?? ""} onChangeText={(v) => this.set("nombre", v)} style={{ height: 38, borderRadius: 8 }} />
                        </Campo>
                        <Campo label="Estado">
                            <Select value={t.activa === false ? "no" : "si"} vacio="—" options={[{ key: "si", content: "Activa (vendiendo)" }, { key: "no", content: "Pausada" }]} onChange={(v) => this.set("activa", v != "no")} />
                        </Campo>
                        {t.key ? <SView col={"xs-12"} style={{ padding: 4 }}>
                            <SText fontSize={12} color={STheme.color.gray}>Datos para la página web</SText>
                            <SHr height={4} />
                            <SView row style={{ flexWrap: "wrap", alignItems: "center" }}>
                                <SText fontSize={13} selectable>Clave de la tienda: {t.key}</SText>
                                <SView width={8} /><Btn small label="Copiar" color={STheme.color.primary} onPress={() => SCopy.copy(t.key)} />
                                <SView width={8} /><Btn small label="Copiar URL del catálogo" color={STheme.color.primary} onPress={() => SCopy.copy(`${API_PUBLICA}/catalogo/${t.key}`)} />
                            </SView>
                        </SView> : null}
                    </SView>
                </Seccion>

                <Seccion titulo="Registro de las ventas">
                    <SView row style={{ flexWrap: "wrap" }}>
                        <Campo label="Punto de venta (caja automática)">
                            <Select value={t.key_punto_venta} options={(op.puntos_venta ?? []).map(x => ({ key: x.key, content: `${x.descripcion} · ${x.sucursal ?? ""}` }))} onChange={(v) => this.set("key_punto_venta", v)} />
                        </Campo>
                        <Campo label="Almacén">
                            <Select value={t.key_almacen} options={(op.almacenes ?? []).map(x => ({ key: x.key, content: x.descripcion }))} onChange={(v) => this.set("key_almacen", v)} />
                        </Campo>
                        <Campo label="Tipo de pago con tarjeta (Cybersource)">
                            <Select value={t.key_empresa_tipo_pago} options={tarjetas.map(x => ({ key: x.key, content: x.descripcion }))} onChange={(v) => this.set("key_empresa_tipo_pago", v)} />
                        </Campo>
                        <Campo label="Tipo de pago a crédito (planes en cuotas)">
                            <Select value={t.key_empresa_tipo_pago_credito} vacio="— Sin planes en cuotas —" options={creditos.map(x => ({ key: x.key, content: x.descripcion }))} onChange={(v) => this.set("key_empresa_tipo_pago_credito", v)} />
                        </Campo>
                        <Campo label="Usuario que registra las ventas">
                            <Select value={t.key_usuario_venta} options={(op.usuarios ?? []).map(x => ({ key: x.key_usuario, content: x.alias || x.key_usuario }))} onChange={(v) => this.set("key_usuario_venta", v)} />
                        </Campo>
                        <Campo label="Moneda de la venta">
                            <Select value={t.key_moneda} options={(op.monedas ?? []).map(x => ({ key: x.key, content: `${x.descripcion ?? ""} ${x.codigo ?? ""}`.trim() }))} onChange={(v) => this.set("key_moneda", v)} />
                        </Campo>
                    </SView>
                </Seccion>

                <Seccion titulo="Cobro automático de cuotas" ayuda="Si el cobro mensual de una cuota se rechaza (y el banco permite reintentar), se vuelve a cobrar con esta frecuencia. Linkser permite como máximo 3 reintentos. Después la cuota queda en mora y se puede mandar un link al cliente.">
                    <SView row style={{ flexWrap: "wrap" }}>
                        <Campo label="Reintentar cada">
                            <Select value={String(t.reintento_horas ?? 24)} vacio="—" options={[{ key: "24", content: "24 horas" }, { key: "48", content: "48 horas" }, { key: "72", content: "72 horas" }]} onChange={(v) => this.set("reintento_horas", v || 24)} />
                        </Campo>
                        <Campo label="Cantidad de reintentos">
                            <Select value={String(t.reintentos ?? 3)} vacio="—" options={[{ key: "0", content: "Sin reintentos" }, { key: "1", content: "1 reintento" }, { key: "2", content: "2 reintentos" }, { key: "3", content: "3 reintentos" }]} onChange={(v) => this.set("reintentos", v === "" ? 3 : v)} />
                        </Campo>
                    </SView>
                    <SText fontSize={12} color={STheme.color.gray} style={{ padding: 4 }}>
                        {`Con esta configuración, una cuota rechazada se intenta ${1 + Number(t.reintentos ?? 3)} ${Number(t.reintentos ?? 3) == 0 ? "vez" : "veces"} en total${Number(t.reintentos ?? 3) > 0 ? `, una cada ${t.reintento_horas ?? 24} h` : ""}. Los cobros nuevos se hacen entre las 8:00 y las 20:00.`}
                    </SText>
                </Seccion>

                <Seccion titulo="Planes publicados en la página" ayuda="El orden es el de la página. Los planes en cuotas se cobran solos cada mes con la tarjeta que el cliente usó en el primer pago.">
                    {this.state.productos.map((p, i) => this.renderProducto(p, i))}
                    <SView row>
                        <Btn small label="+ Agregar plan" color={STheme.color.success} onPress={() => this.setState({ productos: [...this.state.productos, { modalidad: "unico", cuotas: 12, sucursales: [], solo_web: true }] })} />
                    </SView>
                </Seccion>

                <SView row style={{ marginBottom: 30 }}>
                    <Btn label={this.state.guardando ? "Guardando…" : "Guardar"} color={STheme.color.success} disabled={this.state.guardando} onPress={() => this.guardar()} />
                </SView>
            </SView></SView></ScrollView>
        </SPage>
    }
}
