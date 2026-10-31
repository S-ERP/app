import React, { Component } from 'react';
import SSocket from 'servisofts-socket';
import { SInput, SLoad, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../MDL';
import BackgroundImage from '../../Components/BackgroundImage';
import Model from '../../Model';
import { getPersonaIngreso, getSucursalesConMolinete, suscribirIngresos } from './api';

// Pantalla de recepcion: muestra en grande a quien acaba de pasar por un molinete de la sucursal,
// con su suscripcion, y los ultimos ingresos. Pensada para un monitor fijo (sin menu) en web.
// El server serp avisa cada marcacion con zkteco/ingreso (ver ZKTecoIngresos en el server).
// Diseño: plantilla "Pantalla de bienvenida" (cotizacion 2 de Calistenia) con los colores del theme de la empresa.

const URL = "/molinete";
const STORAGE_KEY = "molinete_pantalla_sucursal";
const MAX_ULTIMOS = 10;
const SEGUNDOS_EN_PANTALLA = 10;
const RESUSCRIBIR_MS = 30000;
const DIAS_AVISO = 7;

// Colores del theme de la empresa: al elegir la empresa su theme se mezcla en STheme.color (ver Model/empresa Action.setEmpresa).
// Se leen en cada render para tomar el theme vigente.
const tc = () => STheme.color;
const VERDE = () => tc().success, AMARILLO = () => tc().warning, ROJO = () => tc().danger;
const FONDO = () => tc().background, TEXTO = () => tc().text, LINEA = () => tc().card;
const MUTED = () => tc().lightGray ?? tc().gray, ACENTO = () => tc().primary == tc().background ? tc().secondary : tc().primary;
const FUENTE_TITULO = '"Arial Black", "Helvetica Neue", Impact, sans-serif';

const leerSucursal = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) { return null; } };
const guardarSucursal = (s) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) { } };

const pad = (n) => String(n).padStart(2, "0");
const horaDe = (fecha) => {
    const m = /(\d{2}):(\d{2}):(\d{2})/.exec(fecha ?? "");
    if (m) return `${m[1]}:${m[2]}`;
    const d = new Date();
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const fecha = (f) => {
    const m = /(\d{4})-(\d{2})-(\d{2})/.exec(f ?? "");
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
};
const fechaCorta = (f) => {
    const d = fecha(f);
    return d ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}` : "";
};
// Dias de suscripcion que le quedan contando hoy (fecha_fin inclusive) y el total del plan, para la barra.
const diasSuscripcion = (susc) => {
    const ini = fecha(susc?.fecha_inicio), fin = fecha(susc?.fecha_fin);
    if (!fin) return null;
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const dias = Math.max(0, Math.round((fin - hoy) / 86400000) + 1);
    const total = ini ? Math.max(1, Math.round((fin - ini) / 86400000) + 1) : dias;
    return { dias, total };
};

const alpha = (hex, a) => {
    const m = /^#?([0-9a-f]{6})/i.exec(hex ?? "");
    if (!m) return hex;
    const n = parseInt(m[1], 16);
    return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

// Como se muestra cada ingreso: color, saludo, datos y aviso.
const estadoIngreso = (ing) => {
    const p = ing.persona;
    const puerta = ing.puerta && ing.puerta != "0" ? "Puerta " + ing.puerta : null;
    if (ing.tipo == "personal") return {
        color: VERDE(), saludo: "Bienvenido", etiqueta: "Personal",
        meta: ["Personal", ing.rol, puerta].filter(Boolean).join(" · "),
    };
    if (ing.tipo == "cliente") {
        const d = diasSuscripcion(ing.suscripcion);
        const porVencer = d && d.dias <= DIAS_AVISO;
        return {
            color: porVencer ? AMARILLO() : VERDE(), saludo: "Asistencia registrada", etiqueta: "Cliente",
            meta: [p?.plan, "Entrada", puerta].filter(Boolean).join(" · "),
            dias: d,
            aviso: porVencer ? "Tu plan vence pronto: renueva en recepción" : null,
            vence: fechaCorta(ing.suscripcion?.fecha_fin),
        };
    }
    return {
        color: ROJO(), saludo: "Sin suscripción vigente", etiqueta: "Sin acceso",
        meta: ["Entrada", puerta].filter(Boolean).join(" · "),
        dias: { dias: 0, total: 1 },
        aviso: "Acércate a recepción",
    };
};

const css = () => `
@keyframes mp-entrar { from { opacity: 0; transform: translateX(-24px); } to { opacity: 1; transform: none; } }
@keyframes mp-pulso { 0%, 100% { opacity: .35; } 50% { opacity: .8; } }
.mp-main { animation: mp-entrar .4s ease; }
.mp-espera { animation: mp-pulso 2.4s ease-in-out infinite; }
.mp-link { cursor: pointer; opacity: .55; }
.mp-link:hover { opacity: 1; }
.mp-lista::-webkit-scrollbar { width: 6px; }
.mp-lista::-webkit-scrollbar-thumb { background: ${LINEA()}; }
`;

// Foto del sistema sobre las iniciales: si no tiene foto, quedan las iniciales.
class Foto extends Component {
    state = { error: false };
    componentDidUpdate(prev) { if (prev.keyUsuario != this.props.keyUsuario && this.state.error) this.setState({ error: false }); }
    render() {
        const { keyUsuario, iniciales, size, color, borde = 5, glow = true } = this.props;
        return <div style={{
            position: "relative", flex: "0 0 auto", width: size, height: size, borderRadius: "50%",
            border: `${borde}px solid ${color}`, overflow: "hidden", boxSizing: "border-box",
            background: LINEA(),
            display: "grid", placeItems: "center",
            boxShadow: glow ? `0 0 ${size / 5}px ${alpha(color, .35)}` : "none",
            transition: "border-color .3s, box-shadow .3s",
        }}>
            <span style={{ fontFamily: FUENTE_TITULO, fontSize: size * 0.32, color: TEXTO() }}>{iniciales ?? ""}</span>
            {this.state.error ? null : <img alt="" src={SSocket.api.root + "usuario/" + keyUsuario}
                onError={() => this.setState({ error: true })}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
        </div>
    }
}

class SelectorSucursal extends Component {
    state = { sucursales: null, error: null, search: "" };
    componentDidMount() {
        getSucursalesConMolinete()
            .then(s => this.setState({ sucursales: s }))
            .catch(e => this.setState({ sucursales: [], error: e?.error ?? "No se pudo cargar las sucursales" }));
    }
    render() {
        const q = this.state.search.trim().toLowerCase();
        const lista = (this.state.sucursales ?? []).filter(s => !q || (s.descripcion ?? "").toLowerCase().includes(q));
        return <SView col={"xs-11 sm-8 md-6 lg-4"} center style={{ padding: 24 }}>
            <SText fontSize={22} bold center>Pantalla de ingresos</SText>
            <SView height={6} />
            <SText color={STheme.color.gray} center>Elige la sucursal cuyos molinetes se van a mostrar. Se recordara en este equipo.</SText>
            <SView height={16} />
            <SInput placeholder="Buscar sucursal..." value={this.state.search} style={{ height: 40, borderRadius: 8 }}
                onChangeText={t => this.setState({ search: t })} />
            <SView height={12} />
            {!this.state.sucursales ? <SLoad /> : !lista.length
                ? <SText color={STheme.color.gray} center>{this.state.error ?? "No hay sucursales con molinete"}</SText>
                : lista.map(s => <SView key={s.key} col={"xs-12"} card style={{ padding: 14, marginBottom: 8, borderRadius: 8 }}
                    onPress={() => this.props.onSelect({ key: s.key, descripcion: s.descripcion })}>
                    <SText bold fontSize={16}>{s.descripcion}</SText>
                </SView>)}
            <SView height={16} />
            <SText color={STheme.color.gray} onPress={() => SNavigation.goBack(URL)}>Volver a Molinetes</SText>
        </SView>
    }
}

export default class pantalla extends Component {
    state = { sucursal: null, conectado: false, actual: null, ultimos: [], ahora: new Date() };
    vistos = new Set();
    personas = {};

    componentDidMount() {
        MDL.rolesPermisos.getPermisoAsync({ url: URL, permiso: "ver" }).then(ok => { if (!ok) SNavigation.goBack(); });
        const key = SNavigation.getParam("key_sucursal");
        const guardada = leerSucursal();
        if (key) this.elegir({ key, descripcion: guardada?.key == key ? guardada.descripcion : null });
        else if (guardada?.key) this.elegir(guardada);

        this.onMessage = (obj) => this.onIngreso(obj);
        SSocket.addEventListener("onMessage", this.onMessage);
        this.reloj = setInterval(() => this.setState({ ahora: new Date() }), 1000);
        this.resuscribir = setInterval(() => this.suscribir(), RESUSCRIBIR_MS);
    }

    componentWillUnmount() {
        this.unmounted = true;
        SSocket.removeEventListener("onMessage", this.onMessage);
        clearInterval(this.reloj);
        clearInterval(this.resuscribir);
        clearTimeout(this.timerActual);
    }

    elegir(sucursal) {
        this.setState({ sucursal, actual: null, ultimos: [] });
        this.vistos.clear();
        this.suscribir(sucursal);
        if (!sucursal.descripcion) {
            getSucursalesConMolinete().then(l => {
                const s = l.find(x => x.key == sucursal.key);
                if (!s || this.unmounted) return;
                const completa = { key: s.key, descripcion: s.descripcion };
                guardarSucursal(completa);
                this.setState({ sucursal: completa });
            }).catch(() => { });
        } else guardarSucursal(sucursal);
    }

    // La suscripcion se pierde si el socket se reconecta (otra sesion): se repite cada RESUSCRIBIR_MS.
    suscribir(sucursal = this.state.sucursal) {
        if (!sucursal?.key) return;
        suscribirIngresos(sucursal.key)
            .then(() => !this.unmounted && this.setState({ conectado: true }))
            .catch(() => !this.unmounted && this.setState({ conectado: false }));
    }

    onIngreso(obj) {
        if (obj?.component != "zkteco" || obj?.type != "ingreso") return;
        if (obj.key_sucursal != this.state.sucursal?.key) return;
        const nuevos = (obj.data ?? []).filter(i => i?.key_usuario && !this.vistos.has(i.key));
        nuevos.forEach(i => this.vistos.add(i.key));
        nuevos.forEach(i => this.mostrar(i));
    }

    async mostrar(ingreso) {
        const ing = { ...ingreso, hora: horaDe(ingreso.fecha), persona: this.personas[ingreso.key_usuario] ?? null };
        this.ponerActual(ing);
        if (!ing.persona) {
            const persona = await getPersonaIngreso(ingreso).catch(() => null);
            if (!persona || this.unmounted) return;
            this.personas[ingreso.key_usuario] = persona;
            const conPersona = (i) => i.key_usuario == ing.key_usuario && !i.persona ? { ...i, persona } : i;
            this.setState(st => ({
                actual: st.actual ? conPersona(st.actual) : st.actual,
                ultimos: st.ultimos.map(conPersona),
            }));
        }
    }

    ponerActual(ing) {
        this.setState(st => ({ actual: ing, ultimos: [ing, ...st.ultimos].slice(0, MAX_ULTIMOS) }));
        clearTimeout(this.timerActual);
        this.timerActual = setTimeout(() => !this.unmounted && this.setState({ actual: null }), SEGUNDOS_EN_PANTALLA * 1000);
    }

    renderCabecera(acento) {
        const { sucursal, conectado, ahora } = this.state;
        const empresa = Model.empresa.Action.getSelect();
        const palabras = (empresa?.razon_social ?? "").trim().split(/\s+/);
        return <div style={{
            display: "flex", alignItems: "center", gap: 12, padding: "14px 24px", borderBottom: `1px solid ${LINEA()}`,
            fontFamily: FUENTE_TITULO, textTransform: "uppercase",
        }}>
            {empresa?.key ? <img alt="" src={SSocket.api.empresa + "empresa/" + empresa.key} style={{ height: 32, maxWidth: 80, objectFit: "contain" }} /> : null}
            <span style={{ fontSize: 18, color: TEXTO() }}>
                {palabras[0]} <span style={{ color: acento }}>{palabras.slice(1).join(" ")}</span>
            </span>
            <span style={{ fontFamily: "inherit", fontSize: 12, color: MUTED(), marginLeft: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <i style={{ width: 8, height: 8, borderRadius: 4, background: conectado ? VERDE() : ROJO(), display: "inline-block" }} />
                {sucursal?.descripcion ?? "..."}
            </span>
            <span className="mp-link" style={{ fontSize: 11, color: MUTED(), marginLeft: 12 }} onClick={() => this.setState({ sucursal: null })}>Cambiar</span>
            <span className="mp-link" style={{ fontSize: 11, color: MUTED() }} onClick={() => SNavigation.goBack(URL)}>Salir</span>
            <span style={{ marginLeft: "auto", fontSize: 22, color: MUTED() }}>{pad(ahora.getHours())}:{pad(ahora.getMinutes())}</span>
        </div>
    }

    renderEspera(acento) {
        const empresa = Model.empresa.Action.getSelect();
        return <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28 }}>
            {empresa?.key ? <img alt="" src={SSocket.api.empresa + "empresa/" + empresa.key} style={{ height: "22vh", maxWidth: "40vw", objectFit: "contain", opacity: .9 }} /> : null}
            <div className="mp-espera" style={{ fontFamily: FUENTE_TITULO, textTransform: "uppercase", letterSpacing: ".08em", fontSize: "clamp(18px, 2.6vw, 36px)", color: TEXTO() }}>
                Coloca tu dedo en el <span style={{ color: acento }}>lector</span>
            </div>
            {!this.state.conectado ? <div style={{ color: ROJO(), fontSize: 14 }}>Sin conexión con el servidor, reintentando...</div> : null}
        </div>
    }

    renderActual() {
        const ing = this.state.actual;
        const est = estadoIngreso(ing);
        const p = ing.persona;
        return <div key={ing.key} className="mp-main" style={{
            flex: 1, display: "flex", alignItems: "center", gap: "clamp(24px, 4vw, 64px)", padding: "clamp(24px, 4vw, 64px)", minWidth: 0,
        }}>
            <Foto keyUsuario={ing.key_usuario} iniciales={p?.iniciales} size={Math.min(340, Math.max(140, window.innerWidth * 0.22))} color={est.color} borde={6} />
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: est.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", fontSize: "clamp(13px, 1.5vw, 22px)" }}>{est.saludo}</div>
                <div style={{
                    fontFamily: FUENTE_TITULO, textTransform: "uppercase", color: TEXTO(), lineHeight: 1.05,
                    fontSize: "clamp(32px, 5.5vw, 88px)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{p?.corto ?? "..."}</div>
                <div style={{ color: MUTED(), fontSize: "clamp(13px, 1.4vw, 20px)", marginTop: 6 }}>{est.meta}</div>
                {est.dias ? <>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: "clamp(12px, 2.4vw, 32px)" }}>
                        <b style={{ fontFamily: FUENTE_TITULO, fontWeight: 400, fontSize: "clamp(48px, 8vw, 128px)", lineHeight: 1, color: est.color }}>{est.dias.dias}</b>
                        <span style={{ color: TEXTO(), fontSize: "clamp(14px, 1.6vw, 22px)" }}>
                            {est.dias.dias == 1 ? "día de suscripción" : "días de suscripción"}{est.vence ? ` · vence el ${est.vence}` : ""}
                        </span>
                    </div>
                    <div style={{ height: 10, marginTop: 12, background: LINEA() }}>
                        <i style={{ display: "block", height: "100%", width: Math.min(100, est.dias.dias / est.dias.total * 100) + "%", background: est.color, transition: "width .8s ease" }} />
                    </div>
                </> : null}
                <div style={{ marginTop: 12, color: est.color, fontWeight: 600, fontSize: "clamp(14px, 1.5vw, 22px)", minHeight: "1.4em" }}>{est.aviso ?? ""}</div>
                <div style={{ color: MUTED(), fontSize: 13, marginTop: 4 }}>Ingreso {ing.hora}</div>
            </div>
        </div>
    }

    renderUltimos() {
        const { ultimos } = this.state;
        return <div style={{ width: "clamp(220px, 24vw, 340px)", borderLeft: `1px solid ${LINEA()}`, display: "flex", flexDirection: "column", background: alpha(FONDO(), .35) }}>
            <div style={{ padding: "16px 18px", fontFamily: FUENTE_TITULO, textTransform: "uppercase", fontSize: 13, color: MUTED(), letterSpacing: ".08em" }}>Últimos ingresos</div>
            <div className="mp-lista" style={{ flex: 1, overflowY: "auto" }}>
                {!ultimos.length ? <div style={{ padding: "0 18px", color: MUTED(), fontSize: 13 }}>Todavía nadie ingresó desde que se abrió esta pantalla.</div>
                    : ultimos.map(ing => {
                        const est = estadoIngreso(ing);
                        return <div key={ing.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", borderTop: `1px solid ${LINEA()}` }}>
                            <Foto keyUsuario={ing.key_usuario} iniciales={ing.persona?.iniciales} size={42} color={est.color} borde={2} glow={false} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ color: TEXTO(), fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ing.persona?.corto ?? "..."}</div>
                                <div style={{ color: est.color, fontSize: 12 }}>{est.etiqueta}{est.dias && ing.tipo == "cliente" ? ` · ${est.dias.dias} días` : ""}</div>
                            </div>
                            <div style={{ color: MUTED(), fontSize: 13 }}>{ing.hora}</div>
                        </div>
                    })}
            </div>
        </div>
    }

    render() {
        if (!this.state.sucursal) return <SPage hidden disableScroll>
            <SView col={"xs-12"} flex center>
                <SelectorSucursal onSelect={s => this.elegir(s)} />
            </SView>
        </SPage>;
        const acento = ACENTO();
        return <SPage hidden disableScroll>
            <style>{css()}</style>
            <div style={{
                position: "fixed", inset: 0, display: "flex", flexDirection: "column", color: TEXTO(),
                fontFamily: '"Roboto", "Segoe UI", Arial, sans-serif', background: FONDO(),
            }}>
                {/* Mismo fondo que el resto de la app: imagen de fondo de la empresa con su backgroundOpacity. */}
                <BackgroundImage />
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(ellipse at 20% 120%, ${alpha(acento, .35)}, transparent 60%)` }} />
                <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                    {this.renderCabecera(acento)}
                    <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
                        {this.state.actual ? this.renderActual() : this.renderEspera(acento)}
                        {this.renderUltimos()}
                    </div>
                </div>
            </div>
        </SPage>
    }
}
