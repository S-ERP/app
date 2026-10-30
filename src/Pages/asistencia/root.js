import React from "react";
import { SHr, SIcon, SImage, SInput, SLoad, SNavigation, SNotification, SPage, SText, STheme, SView } from "servisofts-component";
import SSocket from "servisofts-socket";
import MDL from "../../MDL";

const DIA_MS = 24 * 60 * 60 * 1000;
const pad = (n) => n.toString().padStart(2, "0");
const formatFecha = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const formatHora = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const inicioDelDia = (value) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0);
    return d;
};

// Vigente / Próximo / Vencido según las fechas de la suscripción (por día calendario).
const estadoPaquete = (item, hoy = inicioDelDia(new Date())) => {
    if ((item?.estado ?? 1) <= 0) return "anulado";
    const inicio = inicioDelDia(item.fecha_inicio);
    const fin = item.fecha_fin ? inicioDelDia(item.fecha_fin) : null;
    if (inicio && inicio > hoy) return "proximo";
    if (fin && fin < hoy) return "vencido";
    return "vigente";
};

const ESTADOS = {
    vigente: { label: "Vigente", color: () => STheme.color.success },
    proximo: { label: "Próximo", color: () => STheme.color.warning },
    vencido: { label: "Vencido", color: () => STheme.color.danger },
    anulado: { label: "Anulado", color: () => STheme.color.lightGray },
};

export default class Root extends React.Component {
    state = {
        clientes: [],
        sucursales: [],
        busqueda: "",
        resultado: null,
        suscripciones: null,
        asistencias: null,
        selectedSucursal: null,
        panel: null,
        registrando: false,
        // fecha/hora del registro; siguen al reloj hasta que el usuario las edita
        fecha: formatFecha(new Date()),
        hora: formatHora(new Date()),
        manual: false,
    };

    componentDidMount() {
        this._mounted = true;
        this.reloj = setInterval(this.sincronizarReloj, 15000);
        this.loadDataSucursales().then((sucursales) => {
            if (!this._mounted) return;
            const keyCaja = MDL?.caja?.activa?.key_sucursal;
            const porDefecto = sucursales.find(s => s.key === keyCaja) || (sucursales.length === 1 ? sucursales[0] : null);
            this.setState({ sucursales, selectedSucursal: this.state.selectedSucursal || porDefecto });
        }).catch(console.error);
        this.loadData().then((clientes) => {
            if (this._mounted) this.setState({ clientes: clientes || [] });
        }).catch(console.error);
    }

    componentWillUnmount() {
        this._mounted = false;
        clearInterval(this.reloj);
    }

    sincronizarReloj = () => {
        if (!this._mounted || this.state.manual) return;
        this.usarHoraActual();
    };

    // Vuelve a "ahora": los inputs se reponen por ref porque SInput no es controlado.
    usarHoraActual = () => {
        const ahora = new Date();
        this.setState({ manual: false, fecha: formatFecha(ahora), hora: formatHora(ahora) }, () => {
            this._sincronizandoInputs = true;
            this.inputFecha?.setValue?.(this.state.fecha);
            this.inputHora?.setValue?.(this.state.hora);
            this._sincronizandoInputs = false;
        });
    };

    onChangeFechaHora = (campo, valor) => {
        if (this._sincronizandoInputs) return;
        this.setState({ [campo]: valor || "", manual: true });
    };

    // Date local a partir de los inputs, o null si no es válida.
    getFechaRegistro() {
        const { fecha, hora } = this.state;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha || "") || !/^\d{2}:\d{2}$/.test(hora || "")) return null;
        const d = new Date(`${fecha}T${hora}:00`);
        return Number.isNaN(d.getTime()) ? null : d;
    }

    // Paquete vigente en la fecha del registro (no necesariamente hoy). Si hay varios, el que vence más tarde.
    getPaquete() {
        const fecha = this.getFechaRegistro();
        if (!fecha || !this.state.suscripciones) return null;
        const dia = inicioDelDia(fecha);
        return this.state.suscripciones
            .filter(item => estadoPaquete(item, dia) === "vigente")
            .sort((a, b) => new Date(b.fecha_fin || 8.64e15) - new Date(a.fecha_fin || 8.64e15))[0] || null;
    }

    loadDataSucursales = async () => {
        MDL.empresa._full = null;
        const empresa = await MDL.empresa.getFull();
        return empresa?.sucursales ? Object.values(empresa.sucursales) : [];
    };

    async loadData() {
        return await MDL.crm.cliente.getAll();
    }

    loadAsistencias = async (keyCliente) => {
        this.setState({ asistencias: null });
        try {
            const todas = await MDL.inventario.asistencia.getAll();
            const delCliente = (todas || [])
                .filter(a => a.key_cliente === keyCliente && (a.estado ?? 1) > 0)
                .sort((a, b) => new Date(b.fecha_on) - new Date(a.fecha_on));
            if (this._mounted && this.state.resultado?.key === keyCliente) this.setState({ asistencias: delCliente });
        } catch (e) {
            console.error(e);
            if (this._mounted) this.setState({ asistencias: [] });
        }
    };

    // SInput ignora value="" en render, hay que limpiarlo por ref.
    limpiarBusqueda = () => {
        this.inputBusqueda?.setValue?.("");
        this.setState({ busqueda: "" });
    };

    setResultado = (data) => {
        this.limpiarBusqueda();
        this.setState({ resultado: data, suscripciones: null, asistencias: null, panel: null });
        if (!data) return;

        SSocket.sendPromise({
            service: "inventario",
            component: "suscripcion",
            estado: "cargando",
            type: "getByKeyCliente",
            key_cliente: data.key
        }).then(e => {
            if (this.state.resultado?.key !== data.key) return;
            const suscripciones = Object.values(e.data || {})
                .sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio));
            this.setState({ suscripciones });
        }).catch(err => {
            console.error(err);
            this.setState({ suscripciones: [] });
        });

        this.loadAsistencias(data.key);
    };

    getClientesFiltrados() {
        const t = this.state.busqueda.trim().toLowerCase();
        if (!t) return [];
        return (this.state.clientes || []).filter(c =>
            [c?.nombres, c?.apellidos, c?.nit, c?.telefono, c?.correo]
                .some(v => v && String(v).toLowerCase().includes(t))
        ).slice(0, 8);
    }

    // ------------------------------------------------------------------ UI helpers

    renderIconCircle(name, { size = 44, color = STheme.color.secondary, solid = false } = {}) {
        return (
            <SView width={size} height={size} center style={{ borderRadius: size / 2, backgroundColor: solid ? color : color + "22" }}>
                <SIcon name={name} width={size * 0.5} height={size * 0.5} fill={solid ? STheme.color.white : color} />
            </SView>
        );
    }

    renderCard(children, { col = "xs-12", flex, style } = {}) {
        return (
            <SView col={col} padding={6} flex={flex}>
                <SView col={"xs-12"} flex={flex} padding={18} style={{
                    borderRadius: 14,
                    backgroundColor: STheme.color.card,
                    borderWidth: 1,
                    borderColor: STheme.color.lightGray + "33",
                    ...style,
                }}>
                    {children}
                </SView>
            </SView>
        );
    }

    renderHeader(icon, title, subtitle) {
        return (
            <SView col={"xs-12"} row style={{ alignItems: "center" }}>
                {this.renderIconCircle(icon)}
                <SView width={12} />
                <SView flex>
                    <SText fontSize={18} bold>{title}</SText>
                    {subtitle ? <SText fontSize={12} color={STheme.color.lightGray}>{subtitle}</SText> : null}
                </SView>
            </SView>
        );
    }

    // ------------------------------------------------------------------ Bloques

    renderBuscador() {
        const filtrados = this.getClientesFiltrados();
        const hayBusqueda = !!this.state.busqueda.trim();
        return this.renderCard(<>
            {this.renderHeader("Search", "Buscar Cliente", `${(this.state.clientes || []).length} clientes registrados`)}
            <SHr height={14} />
            <SView col={"xs-12"} row style={{
                alignItems: "center",
                borderRadius: 10,
                borderWidth: 1,
                borderColor: hayBusqueda ? STheme.color.success : STheme.color.lightGray + "55",
                backgroundColor: STheme.color.card,
                paddingLeft: 12,
            }}>
                <SIcon name="Search" width={16} height={16} fill={STheme.color.white} />
                <SView flex>
                    <SInput
                        ref={ref => this.inputBusqueda = ref}
                        placeholder={"Ingrese nombre, NIT o teléfono del cliente..."}
                        onChangeText={(text) => this.setState({ busqueda: text || "" })}
                        style={{ borderWidth: 0, backgroundColor: "transparent", height: 42, placeholderTextColor: STheme.color.white, fontSize: 14, fontWeight: "bold" }}
                    />
                </SView>
                {hayBusqueda ? (
                    <SView width={42} height={42} center onPress={this.limpiarBusqueda}>
                        <SIcon name="Close" width={14} height={14} fill={STheme.color.lightGray} />
                    </SView>
                ) : null}
            </SView>
            {hayBusqueda ? (
                <SView col={"xs-12"} style={{
                    marginTop: 6,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: STheme.color.lightGray + "33",
                    backgroundColor: STheme.color.background,
                    overflow: "hidden",
                }}>
                    {filtrados.length === 0 ? (
                        <SView padding={12}><SText fontSize={12} color={STheme.color.lightGray}>Sin coincidencias para "{this.state.busqueda}"</SText></SView>
                    ) : filtrados.map((c, i) => (
                        <SView key={c.key} col={"xs-12"} row padding={10} onPress={() => this.setResultado(c)} style={{
                            alignItems: "center",
                            borderTopWidth: i === 0 ? 0 : 1,
                            borderColor: STheme.color.lightGray + "22",
                        }}>
                            {this.renderAvatar(c, 32)}
                            <SView width={10} />
                            <SView flex>
                                <SText fontSize={13} bold>{this.nombreCliente(c)}</SText>
                                <SText fontSize={11} color={STheme.color.lightGray}>
                                    {[c.nit && `NIT: ${c.nit}`, c.telefono && `Tel: ${c.telefono}`].filter(Boolean).join("  ·  ") || "Sin datos de contacto"}
                                </SText>
                            </SView>
                        </SView>
                    ))}
                </SView>
            ) : null}
        </>, { col: "xs-12 md-6", flex: true });
    }

    nombreCliente(c) {
        return [c?.nombres, c?.apellidos].filter(Boolean).join(" ").trim() || "Sin nombre";
    }

    renderAvatar(cliente, size) {
        return (
            <SView width={size} height={size} center style={{ overflow: "hidden", borderRadius: size / 2, backgroundColor: STheme.color.success + "22" }}>
                <SIcon name="Muser" width={size * 0.55} height={size * 0.55} fill={STheme.color.success} style={{ position: "absolute" }} />
                <SImage src={SSocket.api.root + "usuario/" + cliente.key} style={{ width: "100%", height: "100%", resizeMode: "cover" }} />
            </SView>
        );
    }

    renderClienteSeleccionado() {
        const c = this.state.resultado;
        if (!c) {
            return this.renderCard(
                <SView col={"xs-12"} flex center>
                    {this.renderIconCircle("addUser", { color: STheme.color.lightGray })}
                    <SHr height={10} />
                    <SText bold color={STheme.color.lightGray}>Ningún cliente seleccionado</SText>
                    <SText fontSize={12} color={STheme.color.lightGray} center>Busca un cliente para registrar su asistencia.</SText>
                </SView>,
                { col: "xs-12 md-6", flex: true, style: { borderStyle: "dashed" } }
            );
        }
        const dato = (icon, label, value) => (
            <SView row style={{ alignItems: "center", marginTop: 4 }}>
                <SIcon name={icon} width={13} height={13} fill={STheme.color.lightGray} />
                <SView width={8} />
                <SText fontSize={12} color={STheme.color.lightGray}>{label}: </SText>
                <SText fontSize={12}>{value || "-"}</SText>
            </SView>
        );
        return this.renderCard(
            <SView col={"xs-12"} row style={{ alignItems: "center" }}>
                {this.renderAvatar(c, 64)}
                <SView width={14} />
                <SView flex>
                    <SView row style={{ alignItems: "center" }}>
                        <SView width={8} height={8} style={{ borderRadius: 4, backgroundColor: STheme.color.success }} />
                        <SView width={6} />
                        <SText fontSize={11} bold color={STheme.color.success}>Cliente seleccionado</SText>
                    </SView>
                    <SText fontSize={17} bold>{this.nombreCliente(c)}</SText>
                    {dato("iconLista", "NIT", c.nit)}
                    {dato("iconCall", "Teléfono", c.telefono)}
                    {dato("iconMail", "Correo", c.correo)}
                </SView>
                <SView width={36} height={36} center onPress={() => this.setResultado(null)} style={{ borderRadius: 18 }}>
                    <SIcon name="Close" width={14} height={14} fill={STheme.color.lightGray} />
                </SView>
            </SView>,
            { col: "xs-12 md-6", flex: true, style: { borderColor: STheme.color.success + "88", backgroundColor: STheme.color.success + "14" } }
        );
    }

    renderEstadoPaquete() {
        const { suscripciones } = this.state;
        if (suscripciones === null) {
            return <SView col={"xs-12"} height={90} center><SLoad /></SView>;
        }
        const paquete = this.getPaquete();
        const fechaRegistro = this.getFechaRegistro();
        const esHoy = fechaRegistro && formatFecha(fechaRegistro) === formatFecha(new Date());
        const activo = !!paquete;
        const color = activo ? STheme.color.success : STheme.color.danger;
        let detalle = esHoy || !fechaRegistro
            ? "El cliente no tiene un paquete de asistencia vigente."
            : `El cliente no tenía un paquete vigente el ${formatFecha(fechaRegistro)}.`;
        if (activo) {
            const fin = paquete.fecha_fin ? inicioDelDia(paquete.fecha_fin) : null;
            const dias = fin ? Math.round((fin - inicioDelDia(new Date())) / DIA_MS) : null;
            const restante = dias === null ? "" : dias < 0 ? " · ya vencido" : dias === 0 ? " · vence hoy" : ` · ${dias} día${dias === 1 ? "" : "s"} restante${dias === 1 ? "" : "s"}`;
            detalle = fin
                ? `Vigente hasta ${formatFecha(fin)}${restante}`
                : "El cliente tiene un paquete de asistencia vigente.";
            if (!esHoy) detalle = `Vigente el ${formatFecha(fechaRegistro)} · ${detalle}`;
        }
        return (
            <SView col={"xs-12"} row padding={16} style={{ alignItems: "center", borderRadius: 12, backgroundColor: STheme.color.background + "70", borderWidth: 1, borderColor: color + "55" }}>
                {this.renderIconCircle(activo ? "Check" : "Close", { color, solid: true, size: 48 })}
                <SView width={14} />
                <SView flex>
                    <SText fontSize={20} bold color={color}>{activo ? "Paquete activo" : "Sin paquete activo"}</SText>
                    <SText fontSize={12} color={STheme.color.lightGray}>{detalle}</SText>
                </SView>
                <SView padding={8} style={{ borderRadius: 20, backgroundColor: color, paddingHorizontal: 14 }}>
                    <SText fontSize={11} bold color={STheme.color.white}>{activo ? "PAQUETE ACTIVO" : "PAQUETE INACTIVO"}</SText>
                </SView>
            </SView>
        );
    }

    renderDatoTiempo(campo, icon, label, type, invalido) {
        const { manual } = this.state;
        const color = invalido ? STheme.color.danger : manual ? STheme.color.warning : STheme.color.lightGray + "33";
        return (
            <SView col={"xs-12 sm-6"} padding={6}>
                <SView col={"xs-12"} row padding={10} style={{ alignItems: "center", borderRadius: 12, borderWidth: 1, borderColor: color, backgroundColor: STheme.color.card }}>
                    {this.renderIconCircle(icon, { size: 40 })}
                    <SView width={12} />
                    <SView flex>
                        <SText fontSize={11} color={STheme.color.lightGray}>{label}</SText>
                        <SInput
                            ref={ref => campo === "fecha" ? this.inputFecha = ref : this.inputHora = ref}
                            type={type}
                            defaultValue={this.state[campo]}
                            onChangeText={(v) => this.onChangeFechaHora(campo, v)}
                            style={{ borderWidth: 0, backgroundColor: "transparent", height: 34, fontSize: 18, fontWeight: "bold" }}
                        />
                    </SView>
                    <SIcon name="Pencil" width={14} height={14} fill={STheme.color.lightGray} />
                </SView>
            </SView>
        );
    }

    renderSucursales() {
        const { sucursales, selectedSucursal } = this.state;
        return (
            <SView col={"xs-12"}>
                <SView row style={{ alignItems: "center" }}>
                    <SIcon name="iconEdifcio" width={16} height={16} fill={STheme.color.success} />
                    <SView width={8} />
                    <SText bold>Sucursal</SText>
                    {!selectedSucursal ? <SText fontSize={11} color={STheme.color.warning}>{"   · Seleccione una sucursal"}</SText> : null}
                </SView>
                <SHr height={10} />
                <SView col={"xs-12"} row style={{ flexWrap: "wrap", gap: 8 }}>
                    {(sucursales || []).length === 0 ? <SText fontSize={12} color={STheme.color.lightGray}>Cargando sucursales...</SText> : null}
                    {(sucursales || []).map(s => {
                        const activa = selectedSucursal?.key === s.key;
                        return (
                            <SView key={s.key} row padding={10} onPress={() => this.setState({ selectedSucursal: s })} style={{
                                alignItems: "center",
                                paddingHorizontal: 14,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: activa ? STheme.color.success : STheme.color.lightGray + "44",
                                backgroundColor: activa ? STheme.color.success + "22" : STheme.color.background,
                            }}>
                                {activa ? <><SIcon name="Check" width={12} height={12} fill={STheme.color.success} /><SView width={6} /></> : null}
                                <SText fontSize={13} bold={activa} color={activa ? STheme.color.success : STheme.color.text}>{(s.descripcion || "").trim()}</SText>
                            </SView>
                        );
                    })}
                </SView>
            </SView>
        );
    }

    renderRegistro() {
        const { resultado, selectedSucursal, registrando, asistencias, manual } = this.state;
        const paquete = this.getPaquete();
        const fechaRegistro = this.getFechaRegistro();
        const esFutura = fechaRegistro && fechaRegistro.getTime() > Date.now() + 60000;
        const dia = fechaRegistro ? formatFecha(fechaRegistro) : null;
        const esHoy = dia === formatFecha(new Date());
        const asistioHoy = dia && (asistencias || []).find(a => a.fecha_on && formatFecha(new Date(a.fecha_on)) === dia);
        const puedeRegistrar = !!(resultado && paquete && selectedSucursal && fechaRegistro && !esFutura && !registrando);
        let motivo = null;
        if (!fechaRegistro) motivo = "Ingrese una fecha y hora válidas";
        else if (esFutura) motivo = "La fecha y hora no pueden ser futuras";
        else if (!resultado) motivo = "Seleccione un cliente";
        else if (this.state.suscripciones !== null && !paquete) motivo = esHoy ? "El cliente no tiene un paquete vigente" : `El cliente no tenía un paquete vigente el ${dia}`;
        else if (!selectedSucursal) motivo = "Seleccione una sucursal";

        return this.renderCard(<>
            {this.renderHeader("Evento", "Registro de Asistencia", "Controle la asistencia de sus clientes de forma rápida y sencilla.")}
            <SHr height={18} />
            {resultado ? this.renderEstadoPaquete() : (
                <SView col={"xs-12"} padding={16} center style={{ borderRadius: 12, borderWidth: 1, borderStyle: "dashed", borderColor: STheme.color.lightGray + "55" }}>
                    <SText fontSize={13} color={STheme.color.lightGray}>Busque y seleccione un cliente para ver el estado de su paquete.</SText>
                </SView>
            )}
            {asistioHoy ? (
                <SView col={"xs-12"} row padding={10} style={{ marginTop: 10, alignItems: "center", borderRadius: 10, backgroundColor: STheme.color.warning + "22" }}>
                    <SIcon name="Alert" width={14} height={14} fill={STheme.color.warning} />
                    <SView width={8} />
                    <SText fontSize={12} color={STheme.color.warning}>
                        Este cliente ya tiene una asistencia {esHoy ? "hoy" : `el ${dia}`} a las {formatHora(new Date(asistioHoy.fecha_on))}.
                    </SText>
                </SView>
            ) : null}
            <SHr height={10} />
            <SView col={"xs-12"} row style={{ marginHorizontal: -6 }}>
                {this.renderDatoTiempo("fecha", "Evento", "Fecha de ingreso", "fecha", !fechaRegistro || esFutura)}
                {this.renderDatoTiempo("hora", "clock", "Hora", "hour", !fechaRegistro || esFutura)}
            </SView>
            <SView col={"xs-12"} row style={{ alignItems: "center", justifyContent: "space-between" }}>
                <SText fontSize={11} color={manual ? STheme.color.warning : STheme.color.lightGray}>
                    {manual ? "Registro manual: se guardará con la fecha y hora ingresadas." : "Se usa la fecha y hora actual. Puede editarlas para cargar registros anteriores."}
                </SText>
                {manual ? (
                    <SView row padding={6} onPress={this.usarHoraActual} style={{ alignItems: "center" }}>
                        <SIcon name="Reload" width={12} height={12} fill={STheme.color.success} />
                        <SView width={4} />
                        <SText fontSize={12} bold color={STheme.color.success}>Usar hora actual</SText>
                    </SView>
                ) : null}
            </SView>
            <SHr height={14} />
            {this.renderSucursales()}
            <SHr height={20} />
            <SView col={"xs-12"} height={52} row center onPress={puedeRegistrar ? this.registrarAsistencia : null} style={{
                borderRadius: 12,
                backgroundColor: puedeRegistrar ? STheme.color.success : STheme.color.lightGray + "44",
                opacity: registrando ? 0.7 : 1,
            }}>
                {registrando ? <SLoad /> : <SIcon name="addUser" width={20} height={20} fill={STheme.color.white} />}
                <SView width={10} />
                <SText fontSize={15} bold color={STheme.color.white}>{registrando ? "Registrando..." : "Registrar asistencia"}</SText>
            </SView>
            {motivo && !registrando ? <><SHr height={6} /><SText col={"xs-12"} center fontSize={11} color={STheme.color.lightGray}>{motivo}</SText></> : null}
        </>, { col: "xs-12 md-8" });
    }

    renderAccesoRapido(key, icon, label, badge, onPress) {
        const abierto = this.state.panel === key;
        const deshabilitado = !this.state.resultado;
        return (
            <SView col={"xs-12"} row padding={12} onPress={deshabilitado ? null : onPress} style={{
                alignItems: "center",
                marginTop: 8,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: abierto ? STheme.color.success : STheme.color.lightGray + "33",
                backgroundColor: abierto ? STheme.color.success + "14" : STheme.color.background,
                opacity: deshabilitado ? 0.5 : 1,
            }}>
                <SIcon name={icon} width={18} height={18} fill={abierto ? STheme.color.success : STheme.color.text} />
                <SView width={12} />
                <SText flex fontSize={13}>{label}</SText>
                {badge != null ? (
                    <SView style={{ borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: STheme.color.success + "33", marginRight: 8 }}>
                        <SText fontSize={11} bold color={STheme.color.success}>{badge}</SText>
                    </SView>
                ) : null}
                <SView style={{ transform: [{ rotate: abierto ? "90deg" : "0deg" }] }}>
                    <SIcon name="arrowRight" width={12} height={12} fill={STheme.color.lightGray} />
                </SView>
            </SView>
        );
    }

    togglePanel = (panel) => this.setState({ panel: this.state.panel === panel ? null : panel });

    renderHistorial() {
        const { asistencias, sucursales } = this.state;
        if (asistencias === null) return <SView col={"xs-12"} height={60} center><SLoad /></SView>;
        if (asistencias.length === 0) return <SText fontSize={12} color={STheme.color.lightGray}>Sin asistencias registradas.</SText>;
        return <>
            {asistencias.slice(0, 10).map(a => {
                const d = new Date(a.fecha_on);
                const sucursal = (sucursales || []).find(s => s.key === a.key_sucursal);
                return (
                    <SView key={a.key} col={"xs-12"} row padding={8} style={{ alignItems: "center", borderBottomWidth: 1, borderColor: STheme.color.lightGray + "22" }}>
                        <SIcon name="clock" width={13} height={13} fill={STheme.color.lightGray} />
                        <SView width={8} />
                        <SText fontSize={12} flex>{formatFecha(d)}  {formatHora(d)}</SText>
                        <SText fontSize={11} color={STheme.color.lightGray}>{(sucursal?.descripcion || "Sin sucursal").trim()}</SText>
                    </SView>
                );
            })}
            <SView col={"xs-12"} padding={8} center onPress={() => SNavigation.navigate("/asistencias")}>
                <SText fontSize={12} bold color={STheme.color.success}>Ver reporte completo de asistencias</SText>
            </SView>
        </>;
    }

    renderPaquetes() {
        const { suscripciones } = this.state;
        if (suscripciones === null) return <SView col={"xs-12"} height={60} center><SLoad /></SView>;
        if (suscripciones.length === 0) return <SText fontSize={12} color={STheme.color.lightGray}>El cliente no tiene paquetes contratados.</SText>;
        return suscripciones.map(s => {
            const estado = ESTADOS[estadoPaquete(s)];
            const color = estado.color();
            return (
                <SView key={s.key} col={"xs-12"} row padding={8} style={{ alignItems: "center", borderBottomWidth: 1, borderColor: STheme.color.lightGray + "22" }}>
                    <SIcon name="Paquete" width={14} height={14} fill={STheme.color.lightGray} />
                    <SView width={8} />
                    <SText fontSize={12} flex>
                        {s.fecha_inicio ? formatFecha(new Date(s.fecha_inicio)) : "-"} → {s.fecha_fin ? formatFecha(new Date(s.fecha_fin)) : "sin fin"}
                    </SText>
                    <SView style={{ borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: color + "33" }}>
                        <SText fontSize={10} bold color={color}>{estado.label}</SText>
                    </SView>
                </SView>
            );
        });
    }

    renderAccesos() {
        const { resultado, asistencias, suscripciones, panel } = this.state;
        return this.renderCard(<>
            {this.renderHeader("iJump", "Accesos rápidos", "Realice acciones frecuentes de manera ágil.")}
            <SHr height={8} />
            {!resultado ? <><SHr height={6} /><SText fontSize={11} color={STheme.color.lightGray}>Seleccione un cliente para habilitar los accesos.</SText></> : null}
            {this.renderAccesoRapido("historial", "history", "Historial de asistencias", asistencias ? asistencias.length : null, () => this.togglePanel("historial"))}
            {panel === "historial" ? <SView col={"xs-12"} padding={6}>{this.renderHistorial()}</SView> : null}
            {this.renderAccesoRapido("paquetes", "Paquete", "Paquetes contratados", suscripciones ? suscripciones.length : null, () => this.togglePanel("paquetes"))}
            {panel === "paquetes" ? <SView col={"xs-12"} padding={6}>{this.renderPaquetes()}</SView> : null}
            {this.renderAccesoRapido("perfil", "toolinfo", "Ver más información", null, () => SNavigation.navigate("/cliente/perfil", { key: resultado.key, tipo: "cliente" }))}
        </>, { col: "xs-12 md-4" });
    }

    render() {
        return (
            <SPage title={"Registro de asistencia"}>
                <SView col={"xs-12"} center>
                    <SView col={"xs-12 lg-11 xl-11"} padding={8}>
                        <SHr height={10} />
                        <SView col={"xs-12"} row style={{ alignItems: "stretch" }}>
                            {this.renderBuscador()}
                            {this.renderClienteSeleccionado()}
                        </SView>
                        <SView col={"xs-12"} row style={{ alignItems: "flex-start" }}>
                            {this.renderRegistro()}
                            {this.renderAccesos()}
                        </SView>
                        <SHr height={30} />
                    </SView>
                </SView>
            </SPage>
        );
    }

    registrarAsistencia = async () => {
        const fechaRegistro = this.getFechaRegistro();
        const dataFormateada = {
            key_suscripcion: this.getPaquete()?.key ?? null,
            key_empresa: MDL.empresa.select.key,
            key_sucursal: this.state.selectedSucursal?.key,
            key_cliente: this.state?.resultado?.key ?? null
        };

        if (!dataFormateada.key_cliente || !dataFormateada.key_suscripcion || !dataFormateada.key_sucursal || !fechaRegistro) {
            SNotification.send({ key: "Asistencia", title: "Datos incompletos", body: "Faltan datos obligatorios para registrar la asistencia.", color: STheme.color.warning, time: 4000 });
            return;
        }

        const manual = this.state.manual;
        const descripcion = `${this.nombreCliente(this.state.resultado)} · ${(this.state.selectedSucursal?.descripcion || "").trim()} · ${formatFecha(fechaRegistro)} ${formatHora(fechaRegistro)}`;
        this.setState({ registrando: true });
        try {
            const creada = await MDL.inventario.asistencia.registrar(dataFormateada);
            // El servicio "registro" siempre guarda fecha_on = ahora; para cargas manuales se corrige con "editar".
            if (manual) {
                const key = (Array.isArray(creada) ? creada[0] : creada)?.key;
                if (!key) throw { error: "La asistencia se registró con la hora actual, pero no se pudo aplicar la fecha ingresada." };
                await MDL.inventario.asistencia.editar({ key, fecha_on: `${formatFecha(fechaRegistro)}T${formatHora(fechaRegistro)}:00` });
            }
            SNotification.send({ key: "Asistencia", title: "Asistencia registrada correctamente", body: descripcion, color: STheme.color.success, time: 4000 });
            if (manual) this.usarHoraActual();
            this.props.onSuccess?.();
        } catch (error) {
            SNotification.send({ key: "Asistencia", title: "Error al registrar asistencia", body: error?.error || JSON.stringify(error), color: STheme.color.danger, time: 6000 });
        } finally {
            this.loadAsistencias(dataFormateada.key_cliente);
            if (this._mounted) this.setState({ registrando: false });
        }
    }
}
