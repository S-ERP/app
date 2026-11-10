import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import { SHr, SIcon, SInput, SLoad, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import MDL from '../../MDL';
import Config from '../../Config';
import FloatMenu from '../../Components/FloatMenu';
import CuentasAnidadas from '../conta/cuentas_anidadas';
import Nav from './Nav';
import { URL, anularLiquidacion, dia, fecha, getLiquidacion, getLiquidaciones, getPendientesLiquidar, guardarConfigLiquidacion, moneda, registrarLiquidacion } from './api';

const hoy = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const num = (v) => { const n = Number(String(v ?? "").replace(",", ".")); return isFinite(n) ? n : 0; };
const r2 = (v) => Math.round(v * 100) / 100;
const origen = (t) => t.tipo == "mit" ? "Cuota automática" : (t.consumido_por ? "Venta" : "");

const Btn = ({ label, color, onPress, disabled, small }) => <SView card center onPress={disabled ? null : onPress}
    style={{ height: small ? 30 : 38, borderRadius: 8, paddingHorizontal: small ? 10 : 16, marginRight: 6, marginBottom: 6, backgroundColor: color ?? STheme.color.primary, opacity: disabled ? 0.5 : 1 }}>
    <SText color={"#fff"} bold fontSize={small ? 12 : 14}>{label}</SText>
</SView>

const Seccion = ({ titulo, children, ayuda, extra }) => <SView col={"xs-12"} card style={{ padding: 14, borderRadius: 10, marginBottom: 12 }}>
    <SView row style={{ alignItems: "center" }}><SView flex><SText bold fontSize={16}>{titulo}</SText></SView>{extra}</SView>
    {ayuda ? <><SHr height={4} /><SText fontSize={12} color={STheme.color.gray}>{ayuda}</SText></> : null}
    <SHr height={8} />
    {children}
</SView>

const Campo = ({ label, children, col = "xs-12 md-6" }) => <SView col={col} style={{ padding: 4 }}>
    <SText fontSize={12} color={STheme.color.gray}>{label}</SText>
    <SHr height={4} />
    {children}
</SView>

const Dato = ({ label, valor, color, grande }) => <SView style={{ marginRight: 18, marginBottom: 6 }}>
    <SText fontSize={11} color={STheme.color.gray}>{label}</SText>
    <SText fontSize={grande ? 18 : 14} bold color={color}>{valor}</SText>
</SView>

const Check = ({ on }) => <SView center style={{ width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: on ? STheme.color.primary : STheme.color.gray, backgroundColor: on ? STheme.color.primary : "transparent" }}>
    {on ? <SText color="#fff" fontSize={12} bold>✓</SText> : null}
</SView>

const Tab = ({ label, on, onPress }) => <SView card center onPress={onPress}
    style={{ height: 30, paddingHorizontal: 12, borderRadius: 15, marginRight: 6, backgroundColor: on ? STheme.color.primary : STheme.color.card }}>
    <SText fontSize={12} color={on ? "#fff" : STheme.color.text}>{label}</SText>
</SView>

// Fila de un cobro o refund pendiente de liquidar.
const Fila = ({ t, on, onPress, negativo, deshabilitado }) => <SView row onPress={deshabilitado ? null : onPress}
    style={{ paddingVertical: 6, paddingHorizontal: 4, alignItems: "center", borderBottomWidth: 1, borderColor: STheme.color.card, opacity: deshabilitado ? 0.6 : 1 }}>
    {deshabilitado ? <SView width={18} /> : <Check on={on} />}
    <SView width={10} />
    <SView width={120}><SText fontSize={12}>{fecha(negativo ? t.fecha_reembolso : t.fecha_pago)}</SText></SView>
    <SView flex><SText fontSize={12} numberOfLines={1}>{t.descripcion}{t.cliente?.nombre ? ` · ${t.cliente.nombre}` : ""}</SText></SView>
    <SView width={120}><SText fontSize={11} color={STheme.color.gray}>{negativo ? "Devolución" : origen(t)}</SText></SView>
    <SView width={140}><SText fontSize={11} color={STheme.color.gray}>{t.tarjeta ?? ""}{t.aprobacion ? ` · Aut ${t.aprobacion}` : ""}</SText></SView>
    <SView width={100} style={{ alignItems: "flex-end" }}><SText fontSize={12} bold color={negativo ? STheme.color.danger : STheme.color.text}>{negativo ? "−" : ""}{moneda(t.monto)}</SText></SView>
</SView>

// Liquidaciones de Linkser: se registra cada depósito marcando los cobros que cubre; el sistema calcula la comisión y genera el asiento.
export default class liquidaciones extends Component {
    state = { vista: "registrar", pend: null, sel: {}, selR: {}, f: { fecha_deposito: hoy(), monto_depositado: "", referencia: "", observacion: "" }, cfg: null, editCfg: false, enviando: false };

    componentDidMount() {
        MDL.rolesPermisos.getPermisoAsync({ url: URL, permiso: "configurar" }).then(e => { if (!e) return SNavigation.goBack(); this.cargar(); });
    }

    cargar() {
        this.setState({ pend: null });
        getPendientesLiquidar().then(pend => {
            const c = pend.config ?? {};
            this.setState({ pend, sel: {}, selR: {}, editCfg: !c.configurada, cfg: { ...c, cuentas: c.cuentas ?? {} } });
        }).catch(e => SNotification.send({ title: "Error", body: e?.error ?? "No se pudo cargar los cobros pendientes.", color: STheme.color.danger, time: 6000 }));
    }

    // ---------- configuración ----------

    elegirCuenta(campo) {
        SPopup.open({
            key: "popup-cuentas",
            content: <SView withoutFeedback style={{ width: "100%", height: 500, maxWidth: 1000, borderRadius: 8, borderWidth: 1, borderColor: STheme.color.card, backgroundColor: STheme.color.background, overflow: "hidden" }}>
                <CuentasAnidadas btnSelect={true} keyEdit={this.state.cfg?.[campo] ?? null} select={(c) => {
                    const cfg = this.state.cfg;
                    this.setState({ cfg: { ...cfg, [campo]: c.key, cuentas: { ...cfg.cuentas, [campo]: `${c.codigo} ${c.descripcion}` } } });
                    SPopup.close("popup-cuentas");
                }} />
            </SView>
        });
    }

    renderConfig() {
        const c = this.state.cfg ?? {};
        const cuenta = (campo, label) => <Campo label={label}>
            <SView card onPress={() => this.elegirCuenta(campo)} style={{ height: 38, borderRadius: 8, paddingHorizontal: 10, justifyContent: "center" }}>
                <SText fontSize={13} color={c[campo] ? STheme.color.text : STheme.color.danger}>{c[campo] ? (c.cuentas?.[campo] ?? "Cuenta elegida") : "Elegir cuenta contable"}</SText>
            </SView>
        </Campo>;
        if (!this.state.editCfg) return <Seccion titulo="Configuración" extra={<Btn small label="Cambiar" color={STheme.color.gray} onPress={() => this.setState({ editCfg: true })} />}>
            <SView row style={{ flexWrap: "wrap" }}>
                <Dato label="Sale de (por cobrar Linkser)" valor={c.cuentas?.key_cuenta_linkser ?? "—"} />
                <Dato label="Entra al banco" valor={c.cuentas?.key_cuenta_banco ?? "—"} />
                <Dato label="Comisión a" valor={c.cuentas?.key_cuenta_comision ?? "—"} />
                <Dato label="Comisión pactada" valor={`${Number(c.porcentaje_comision ?? 0)} %`} />
                <Dato label="Tolerancia" valor={moneda(c.tolerancia)} />
            </SView>
        </Seccion>;
        return <Seccion titulo="Configuración de la liquidación" ayuda="Linkser deposita neto (ya descontada su comisión). Al registrar un depósito se genera el asiento: Debe banco + Debe comisión / Haber cuenta por cobrar Linkser.">
            <SView row style={{ flexWrap: "wrap" }}>
                {cuenta("key_cuenta_linkser", "Cuenta por cobrar a Linkser (la del tipo de pago con tarjeta)")}
                {cuenta("key_cuenta_banco", "Banco donde deposita Linkser")}
                {cuenta("key_cuenta_comision", "Gasto por comisión de Linkser")}
                <Campo label="Comisión pactada (%)" col="xs-6 md-3">
                    <SInput type="number" defaultValue={String(c.porcentaje_comision ?? "")} placeholder="Ej: 3.5" onChangeText={(v) => this.state.cfg.porcentaje_comision = v} style={{ height: 38, borderRadius: 8 }} />
                </Campo>
                <Campo label="Tolerancia de diferencia (Bs)" col="xs-6 md-3">
                    <SInput type="number" defaultValue={String(c.tolerancia ?? 1)} onChangeText={(v) => this.state.cfg.tolerancia = v} style={{ height: 38, borderRadius: 8 }} />
                </Campo>
            </SView>
            <SHr height={8} />
            <SView row>
                <Btn label="Guardar" onPress={() => {
                    const x = this.state.cfg;
                    guardarConfigLiquidacion({ key_cuenta_linkser: x.key_cuenta_linkser, key_cuenta_banco: x.key_cuenta_banco, key_cuenta_comision: x.key_cuenta_comision,
                        porcentaje_comision: num(x.porcentaje_comision), tolerancia: num(x.tolerancia), cuentas: x.cuentas })
                        .then(c2 => { this.setState({ cfg: { ...c2, cuentas: c2.cuentas ?? {} }, editCfg: false }); SNotification.send({ title: "Configuración guardada", color: STheme.color.success, time: 3000 }); })
                        .catch(e => SNotification.send({ title: "No se pudo guardar", body: e?.error ?? "", color: STheme.color.danger, time: 6000 }));
                }} />
                {this.state.pend?.config?.configurada ? <Btn label="Cancelar" color={STheme.color.gray} onPress={() => this.setState({ editCfg: false, cfg: { ...this.state.pend.config, cuentas: this.state.pend.config.cuentas ?? {} } })} /> : null}
            </SView>
        </Seccion>;
    }

    // ---------- registrar depósito ----------

    calculo() {
        const p = this.state.pend ?? {}, s = this.state.sel, sr = this.state.selR, c = this.state.cfg ?? {};
        const cobrado = r2((p.cobros ?? []).filter(t => s[t.key]).reduce((a, t) => a + Number(t.monto), 0));
        const devuelto = r2((p.reembolsos ?? []).filter(t => sr[t.key]).reduce((a, t) => a + Number(t.monto), 0));
        const bruto = r2(cobrado - devuelto), depositado = r2(num(this.state.f.monto_depositado));
        const comision = r2(bruto - depositado), esperada = r2(cobrado * num(c.porcentaje_comision) / 100);
        const diferencia = r2(comision - esperada);
        return { cobrado, devuelto, bruto, depositado, comision, esperada, diferencia, fuera: Math.abs(diferencia) > num(c.tolerancia ?? 1) + 0.005, n: Object.values(s).filter(Boolean).length };
    }

    marcarHasta(fechaTope) {
        const p = this.state.pend ?? {}, sel = {}, selR = {};
        (p.cobros ?? []).forEach(t => { if (!fechaTope || dia(t.fecha_pago) <= fechaTope) sel[t.key] = true; });
        (p.reembolsos ?? []).forEach(t => { if (!fechaTope || dia(t.fecha_reembolso) <= fechaTope) selR[t.key] = true; });
        this.setState({ sel, selR });
    }

    registrar(forzar) {
        const k = this.calculo(), f = this.state.f;
        if (!k.n) return SNotification.send({ title: "Marque los cobros que cubre el depósito", color: STheme.color.warning, time: 4000 });
        if (!(k.depositado > 0)) return SNotification.send({ title: "Falta el monto depositado", color: STheme.color.warning, time: 4000 });
        if (k.comision < 0) return SNotification.send({ title: "El depósito es mayor que lo cobrado", body: "Falta marcar cobros.", color: STheme.color.warning, time: 5000 });
        if (k.fuera && !forzar) {
            return SPopup.confirm({
                title: "La comisión no coincide",
                message: `Comisión según el depósito: ${moneda(k.comision)}. Pactada: ${moneda(k.esperada)}. Diferencia: ${moneda(k.diferencia)}. ¿Registrar igual?`,
                onPress: () => this.registrar(true)
            });
        }
        this.setState({ enviando: true });
        registrarLiquidacion({
            fecha_deposito: f.fecha_deposito, monto_depositado: k.depositado, referencia: f.referencia, observacion: f.observacion, forzar: !!forzar,
            cobros: Object.keys(this.state.sel).filter(x => this.state.sel[x]), reembolsos: Object.keys(this.state.selR).filter(x => this.state.selR[x]),
        }).then(l => {
            SNotification.send({ title: "Liquidación registrada", body: `Asiento ${l.codigo_asiento ?? ""}`, color: STheme.color.success, time: 6000 });
            this.setState({ enviando: false, f: { fecha_deposito: hoy(), monto_depositado: "", referencia: "", observacion: "" }, form: Date.now() });
            this.cargar();
        }).catch(e => {
            this.setState({ enviando: false });
            SNotification.send({ title: "No se pudo registrar", body: e?.error ?? "", color: STheme.color.danger, time: 8000 });
        });
    }

    renderRegistrar() {
        const p = this.state.pend;
        if (!p) return <SLoad />;
        const k = this.calculo(), f = this.state.f, configurada = this.state.cfg?.configurada;
        const total = (p.cobros ?? []).reduce((a, t) => a + Number(t.monto), 0) - (p.reembolsos ?? []).reduce((a, t) => a + Number(t.monto), 0);
        const toggle = (campo, key) => this.setState({ [campo]: { ...this.state[campo], [key]: !this.state[campo][key] } });
        return <>
            <Seccion titulo="Pendiente de liquidar" ayuda="Cobros con tarjeta registrados en ventas o cuotas que Linkser todavía no depositó, y devoluciones (refund) que va a descontar.">
                <SView row style={{ flexWrap: "wrap" }}>
                    <Dato grande label="Por cobrar a Linkser" valor={moneda(total)} />
                    <Dato label="Cobros" valor={(p.cobros ?? []).length} />
                    <Dato label="Devoluciones" valor={(p.reembolsos ?? []).length} color={(p.reembolsos ?? []).length ? STheme.color.danger : undefined} />
                </SView>
            </Seccion>
            <Seccion titulo="Registrar depósito de Linkser" ayuda="Cargue el depósito tal como figura en el extracto del banco y marque los cobros que incluye.">
                <SView row style={{ flexWrap: "wrap" }} key={"form" + (this.state.form ?? "")}>
                    <Campo label="Fecha del depósito" col="xs-6 md-3">
                        <SInput type="date" defaultValue={f.fecha_deposito} onChangeText={(v) => this.setState({ f: { ...this.state.f, fecha_deposito: v } })} style={{ height: 38, borderRadius: 8 }} />
                    </Campo>
                    <Campo label="Monto depositado (Bs)" col="xs-6 md-3">
                        <SInput type="number" defaultValue={f.monto_depositado} placeholder="0.00" onChangeText={(v) => this.setState({ f: { ...this.state.f, monto_depositado: v } })} style={{ height: 38, borderRadius: 8 }} />
                    </Campo>
                    <Campo label="Referencia (n° de operación del banco)" col="xs-12 md-6">
                        <SInput defaultValue={f.referencia} onChangeText={(v) => this.state.f.referencia = v} style={{ height: 38, borderRadius: 8 }} />
                    </Campo>
                </SView>
                <SHr height={8} />
                <SView row style={{ flexWrap: "wrap" }}>
                    <Btn small label="Marcar todo" color={STheme.color.gray} onPress={() => this.marcarHasta(null)} />
                    <Btn small label="Marcar hasta la fecha del depósito" color={STheme.color.gray} onPress={() => this.marcarHasta(f.fecha_deposito)} />
                    <Btn small label="Desmarcar" color={STheme.color.gray} onPress={() => this.setState({ sel: {}, selR: {} })} />
                </SView>
                <SHr height={6} />
                {(p.cobros ?? []).length == 0 ? <SText color={STheme.color.gray}>No hay cobros pendientes de liquidar.</SText> : null}
                {(p.cobros ?? []).map(t => <Fila key={t.key} t={t} on={!!this.state.sel[t.key]} onPress={() => toggle("sel", t.key)} />)}
                {(p.reembolsos ?? []).map(t => <Fila key={"r" + t.key} t={t} negativo on={!!this.state.selR[t.key]} onPress={() => toggle("selR", t.key)} />)}
                <SHr height={12} />
                <SView row style={{ flexWrap: "wrap" }}>
                    <Dato label={`Cobrado (${k.n})`} valor={moneda(k.cobrado)} />
                    {k.devuelto ? <Dato label="Devoluciones" valor={"−" + moneda(k.devuelto)} color={STheme.color.danger} /> : null}
                    <Dato label="Bruto" valor={moneda(k.bruto)} />
                    <Dato label="Depositado" valor={moneda(k.depositado)} />
                    <Dato label="Comisión (bruto − depositado)" valor={moneda(k.comision)} color={k.comision < 0 ? STheme.color.danger : undefined} />
                    <Dato label={`Pactada (${Number(this.state.cfg?.porcentaje_comision ?? 0)} %)`} valor={moneda(k.esperada)} />
                    <Dato label="Diferencia" valor={moneda(k.diferencia)} color={k.n && k.depositado ? (k.fuera ? STheme.color.danger : STheme.color.success) : undefined} />
                </SView>
                <SHr height={8} />
                <Btn label={this.state.enviando ? "Registrando…" : "Registrar liquidación y generar asiento"} disabled={this.state.enviando || !configurada} onPress={() => this.registrar(false)} />
                {!configurada ? <SText fontSize={12} color={STheme.color.danger}>Configure primero las cuentas.</SText> : null}
            </Seccion>
            {(p.sin_venta ?? []).length ? <Seccion titulo="Cobros aprobados sin venta" ayuda="Linkser los deposita igual, pero no están en contabilidad porque ninguna venta los usó (venta no registrada, cobro de prueba o abandonado en caja). Revíselos en Pagos con tarjeta.">
                {(p.sin_venta ?? []).map(t => <Fila key={"s" + t.key} t={t} deshabilitado />)}
            </Seccion> : null}
        </>;
    }

    // ---------- historial ----------

    verDetalle(l) {
        getLiquidacion(l.key).then(d => {
            const it = d.items ?? {};
            SPopup.open({
                key: "popup-liq",
                content: <SView withoutFeedback style={{ width: "100%", maxWidth: 800, maxHeight: 600, padding: 16, borderRadius: 12, backgroundColor: STheme.color.background, borderWidth: 1, borderColor: STheme.color.card }}>
                    <SText bold fontSize={16}>Liquidación del {dia(d.fecha_deposito)} · Asiento {d.codigo_asiento}</SText>
                    <SHr height={6} />
                    <SView row style={{ flexWrap: "wrap" }}>
                        <Dato label="Depositado" valor={moneda(d.monto_depositado)} />
                        <Dato label="Bruto" valor={moneda(d.bruto)} />
                        <Dato label="Comisión" valor={moneda(d.comision)} />
                        <Dato label="Pactada" valor={moneda(d.comision_esperada)} />
                        {d.state == "ANULADA" ? <Dato label="Anulada" valor={`${d.codigo_asiento_anulacion ?? ""} ${d.motivo_anulacion ?? ""}`} color={STheme.color.danger} /> : null}
                    </SView>
                    <ScrollView style={{ maxHeight: 400 }}>
                        {(it.cobros ?? []).map(t => <Fila key={t.key} t={t} deshabilitado />)}
                        {(it.reembolsos ?? []).map(t => <Fila key={"r" + t.key} t={t} negativo deshabilitado />)}
                        {d.state == "ANULADA" ? <SText fontSize={12} color={STheme.color.gray}>Al anularse, sus cobros volvieron a quedar pendientes.</SText> : null}
                    </ScrollView>
                </SView>
            });
        }).catch(e => SNotification.send({ title: "Error", body: e?.error ?? "", color: STheme.color.danger, time: 5000 }));
    }

    anular(l) {
        let motivo = "";
        SPopup.open({
            key: "popup-anular-liq",
            content: <SView withoutFeedback style={{ width: "100%", maxWidth: 480, padding: 16, borderRadius: 12, backgroundColor: STheme.color.background, borderWidth: 1, borderColor: STheme.color.card }}>
                <SText bold fontSize={16}>Anular liquidación</SText>
                <SHr height={6} />
                <SText fontSize={13}>Se genera el asiento inverso de {l.codigo_asiento} ({moneda(l.monto_depositado)} depositado) y sus {l.cantidad} cobros vuelven a quedar pendientes.</SText>
                <SHr height={10} />
                <SInput placeholder="Motivo (ej: monto mal cargado)" onChangeText={(v) => motivo = v} style={{ height: 38, borderRadius: 8 }} />
                <SHr height={12} />
                <SView row>
                    <Btn label="Anular" color={STheme.color.danger} onPress={() => {
                        if (motivo.trim().length < 3) return SNotification.send({ title: "Falta el motivo", color: STheme.color.warning, time: 3000 });
                        SPopup.close("popup-anular-liq");
                        anularLiquidacion(l.key, motivo.trim()).then(a => {
                            SNotification.send({ title: "Liquidación anulada", body: `Asiento ${a.codigo_asiento_anulacion ?? ""}`, color: STheme.color.success, time: 5000 });
                            this.table?.loadData(); this.cargar();
                        }).catch(e => SNotification.send({ title: "No se pudo anular", body: e?.error ?? "", color: STheme.color.danger, time: 8000 }));
                    }} />
                    <Btn label="Volver" color={STheme.color.gray} onPress={() => SPopup.close("popup-anular-liq")} />
                </SView>
            </SView>
        });
    }

    renderHistorial() {
        return <DinamicTable
            ref={ref => this.table = ref}
            selectType="single"
            colors={Config.table.colors()}
            cellStyle={Config.table.cellStyle()}
            textStyle={Config.table.textStyle()}
            language='es'
            loadData={async () => { try { return await getLiquidaciones(); } catch (e) { SNotification.send({ title: "Error", body: e?.error ?? "", color: STheme.color.danger, time: 5000 }); return []; } }}
            onSelect={(e) => {
                const l = e.row, options = [{ label: "Ver cobros", icon: <SIcon name="Eyes" fill={STheme.color.text} />, onPress: () => this.verDetalle(l) }];
                if (l.state == "REGISTRADA") options.push({ label: "Anular liquidación", icon: <SIcon name="Delete" fill={STheme.color.text} />, onPress: () => this.anular(l) });
                FloatMenu.open({ e: e.evt, label: `Depósito ${dia(l.fecha_deposito)}`, options });
            }}
        >
            <DinamicTable.Col key='index' textStyle={{ fontSize: 10, color: STheme.color.lightGray }} data={e => e.index + 1} width={30} />
            <DinamicTable.Col key='fecha_deposito' label='Depósito' data={e => dia(e.row.fecha_deposito)} width={95} />
            <DinamicTable.Col key='referencia' label='Referencia' data={e => e.row.referencia ?? ""} width={130} />
            <DinamicTable.Col key='cantidad' label='Cobros' data={e => e.row.cantidad} width={65} />
            <DinamicTable.Col key='bruto' label='Bruto' data={e => Number(e.row.bruto)} width={100} customComponent={e => <SText>{moneda(e.row.bruto)}</SText>} />
            <DinamicTable.Col key='depositado' label='Depositado' data={e => Number(e.row.monto_depositado)} width={100} customComponent={e => <SText>{moneda(e.row.monto_depositado)}</SText>} />
            <DinamicTable.Col key='comision' label='Comisión' data={e => Number(e.row.comision)} width={90} customComponent={e => <SText>{moneda(e.row.comision)}</SText>} />
            <DinamicTable.Col key='pct' label='% real' data={e => e.row.cobrado > 0 ? (100 * e.row.comision / e.row.cobrado).toFixed(2) + " %" : ""} width={70} />
            <DinamicTable.Col key='asiento' label='Asiento' data={e => e.row.codigo_asiento ?? ""} width={110} />
            <DinamicTable.Col key='state' label='Estado' width={90} data={e => e.row.state == "ANULADA" ? "Anulada" : "Registrada"}
                customComponent={e => <SText color={e.row.state == "ANULADA" ? STheme.color.lightGray : STheme.color.success}>{e.row.state == "ANULADA" ? "Anulada" : "Registrada"}</SText>} />
            <DinamicTable.Col key='registro' label='Registrada' data={e => fecha(e.row.fecha_on)} width={130} />
        </DinamicTable>;
    }

    render() {
        const v = this.state.vista;
        return <SPage title={"Cybersource · Liquidaciones Linkser"} disableScroll>
            <Nav activo="/liquidaciones" />
            <SView row style={{ paddingHorizontal: 8, paddingTop: 8 }}>
                <Tab label="Registrar depósito" on={v == "registrar"} onPress={() => this.setState({ vista: "registrar" })} />
                <Tab label="Historial" on={v == "historial"} onPress={() => this.setState({ vista: "historial" })} />
            </SView>
            {v == "historial" ? this.renderHistorial() : <ScrollView style={{ flex: 1 }}>
                <SView col={"xs-12"} style={{ padding: 8 }}>
                    {this.state.cfg ? this.renderConfig() : null}
                    {this.renderRegistrar()}
                </SView>
            </ScrollView>}
        </SPage>
    }
}
