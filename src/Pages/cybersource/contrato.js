import React, { Component } from 'react';
import { Linking } from 'react-native';
import { SHr, SInput, SLoad, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../MDL';
import SCopy from '../../Components/SCopy';
import Nav from './Nav';
import PopupAnularCompra from './PopupAnularCompra';
import { ESTADOS_CONTRATO, ESTADOS_COBRO, URL, cancelarContrato, cobrarCuota, dia, est, fecha, getContrato, linkCuota, moneda, nombreCliente } from './api';

const puede = (permiso) => !!MDL.rolesPermisos.getPermiso({ url: URL, permiso });
const hoy = () => new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);

const Btn = ({ label, color, onPress, disabled, small }) => <SView card center onPress={disabled ? null : onPress}
    style={{ height: small ? 28 : 36, borderRadius: 8, paddingHorizontal: small ? 10 : 14, marginRight: 6, marginBottom: 4, backgroundColor: color, opacity: disabled ? 0.5 : 1 }}>
    <SText color={"#fff"} fontSize={small ? 12 : 14} bold>{label}</SText>
</SView>

const Dato = ({ label, valor, color }) => <SView style={{ minWidth: 170, marginRight: 16, marginBottom: 10 }}>
    <SText fontSize={12} color={STheme.color.gray}>{label}</SText>
    <SText fontSize={15} color={color}>{valor || "—"}</SText>
</SView>

// Contrato en cuotas: datos, tarjeta guardada y las cuotas con sus cobros. Acciones del personal: cobrar ahora,
// mandar link de pago (cuota en mora o cambio de tarjeta) y cancelar el contrato.
export default class contrato extends Component {
    state = { data: null, ocupado: "" };
    pk = SNavigation.getParam("pk");

    componentDidMount() {
        MDL.rolesPermisos.getPermisoAsync({ url: URL, permiso: "ver" }).then(e => { if (!e) return SNavigation.goBack(); this.cargar(); });
    }

    cargar = () => getContrato(this.pk).then(data => this.setState({ data }))
        .catch(e => SNotification.send({ title: "Error", body: e?.error ?? "No se pudo cargar el contrato", color: STheme.color.danger, time: 4000 }));

    async accion(key, fn, ok) {
        this.setState({ ocupado: key });
        try {
            const r = await fn();
            ok?.(r);
        } catch (e) {
            SNotification.send({ title: "No se pudo", body: e?.error ?? "", color: STheme.color.danger, time: 6000 });
        }
        this.setState({ ocupado: "" });
        this.cargar();
    }

    cobrar(cb) {
        SPopup.confirm({
            title: `Cobrar la cuota ${cb.numero} ahora`,
            message: `Se cobrarán ${moneda(cb.monto)} a la tarjeta guardada ${this.state.data.contrato.tarjeta ?? ""}.`,
            onPress: () => this.accion(cb.key, () => cobrarCuota(cb.key), (r) => {
                const s = est(ESTADOS_COBRO, r?.state);
                SNotification.send({ title: r?.state == "PAGADO" ? "Cuota cobrada" : "Cobro " + s.label.toLowerCase(), body: r?.error ?? "",
                    color: r?.state == "PAGADO" ? STheme.color.success : STheme.color.warning, time: 6000 });
            })
        });
    }

    link(cb) {
        const k = this.state.data.contrato;
        this.accion(cb.key, () => linkCuota(cb.key), (l) => {
            const texto = `Hola ${k.cliente?.nombres ?? ""}, este es tu link para pagar la cuota ${cb.numero}/${k.cuotas} de tu ${k.descripcion} (${moneda(cb.monto)}). Si pagás con otra tarjeta, quedará para los próximos meses: ${l.url}`;
            const tel = String(k.cliente?.celular ?? "").replace(/\D/g, "");
            SPopup.alert(<SView col={"xs-12"} style={{ padding: 8 }}>
                <SText bold fontSize={16}>Link de pago de la cuota {cb.numero}</SText>
                <SHr height={8} />
                <SText fontSize={13} selectable>{l.url}</SText>
                <SHr height={12} />
                <SView row style={{ flexWrap: "wrap" }}>
                    <Btn small label="Copiar mensaje" color={STheme.color.primary} onPress={() => SCopy.copy(texto)} />
                    {tel ? <Btn small label="Enviar por WhatsApp" color={"#25D366"} onPress={() => Linking.openURL(`https://wa.me/${tel}?text=${encodeURIComponent(texto)}`)} /> : null}
                </SView>
            </SView>);
        });
    }

    cancelar() {
        let motivo = "", anular = true;
        const k = this.state.data.contrato;
        SPopup.open({
            key: "cancelar-contrato",
            content: <SView withoutFeedback style={{ width: "100%", maxWidth: 480, padding: 16, borderRadius: 12, backgroundColor: STheme.color.background, borderWidth: 1, borderColor: STheme.color.card }}>
                <SText bold fontSize={16}>Cancelar contrato de {nombreCliente(k.cliente)}</SText>
                <SHr height={8} />
                <SText fontSize={13} color={STheme.color.gray}>Se deja de cobrar con la tarjeta. Elegí qué pasa con las cuotas que faltan:</SText>
                <SHr height={8} />
                <SInput type="select" defaultValue="anular" options={[{ key: "anular", content: "Anular las cuotas que faltan" }, { key: "mantener", content: "Mantenerlas pendientes (cobrar con link, p. ej. penalidad)" }]}
                    onChangeText={(v) => anular = v == "anular"} style={{ height: 38, borderRadius: 8 }} />
                <SHr height={8} />
                <SInput placeholder="Motivo de la cancelación" onChangeText={(v) => motivo = v} style={{ height: 38, borderRadius: 8 }} />
                <SHr height={14} />
                <SView row>
                    <Btn label="Cancelar contrato" color={STheme.color.danger} onPress={() => {
                        if (motivo.trim().length < 3) return SNotification.send({ title: "Falta el motivo", color: STheme.color.warning, time: 3000 });
                        SPopup.close("cancelar-contrato");
                        this.accion("cancelar", () => cancelarContrato(k.key, { anular_restantes: anular, motivo }),
                            () => SNotification.send({ title: "Contrato cancelado", color: STheme.color.success, time: 3000 }));
                    }} />
                    <Btn label="Volver" color={STheme.color.gray} onPress={() => SPopup.close("cancelar-contrato")} />
                </SView>
            </SView>
        });
    }

    renderCuotas() {
        const { contrato: k, cobros } = this.state.data;
        const vigente = ["ACTIVO", "MOROSO"].includes(k.state);
        return <SView col={"xs-12"} card style={{ borderRadius: 10, padding: 8 }}>
            <SView row style={{ paddingVertical: 6, borderBottomWidth: 1, borderColor: STheme.color.card }}>
                {[["#", 30], ["Vence", 95], ["Monto", 90], ["Estado", 150], ["Intentos", 65], ["Pagado", 130], ["Detalle", 260], ["", 230]].map(([l, w]) =>
                    <SText key={l + w} fontSize={12} color={STheme.color.gray} style={{ width: w }}>{l}</SText>)}
            </SView>
            {cobros.map(cb => {
                const s = est(ESTADOS_COBRO, cb.state);
                const abierta = ["PENDIENTE", "REINTENTO", "MORA"].includes(cb.state);
                const vencida = dia(cb.fecha_vencimiento) <= hoy();
                return <SView key={cb.key} row style={{ paddingVertical: 6, alignItems: "center", borderBottomWidth: 1, borderColor: STheme.color.card + "88" }}>
                    <SText style={{ width: 30 }}>{cb.numero}</SText>
                    <SText style={{ width: 95 }}>{dia(cb.fecha_vencimiento)}</SText>
                    <SText style={{ width: 90 }}>{moneda(cb.monto)}</SText>
                    <SText style={{ width: 150 }} color={STheme.color[s.color]}>{s.label}</SText>
                    <SText style={{ width: 65 }}>{cb.intentos || ""}</SText>
                    <SText style={{ width: 130 }}>{fecha(cb.fecha_pago)}</SText>
                    <SText style={{ width: 260 }} fontSize={12} color={STheme.color.gray}>
                        {[cb.error, cb.proximo_intento && cb.state == "REINTENTO" ? "Reintento: " + fecha(cb.proximo_intento) : "", cb.url_link && abierta ? "Link enviado" : ""].filter(Boolean).join(" · ")}
                    </SText>
                    <SView row style={{ width: 230, flexWrap: "wrap" }}>
                        {this.state.ocupado == cb.key ? <SLoad /> : <>
                            {vigente && abierta && vencida && puede("configurar") ? <Btn small label="Cobrar ahora" color={STheme.color.success} onPress={() => this.cobrar(cb)} /> : null}
                            {abierta && puede("configurar") ? <Btn small label={cb.url_link ? "Ver link" : "Link de pago"} color={STheme.color.primary} onPress={() => this.link(cb)} /> : null}
                        </>}
                    </SView>
                </SView>
            })}
        </SView>
    }

    render() {
        const d = this.state.data;
        if (!d) return <SPage title="Contrato"><Nav activo="/contratos" /><SLoad /></SPage>;
        const k = d.contrato, s = est(ESTADOS_CONTRATO, k.state);
        const pagadas = d.cobros.filter(c => c.state == "PAGADO").length;
        return <SPage title={"Contrato · " + nombreCliente(k.cliente)}>
            <Nav activo="/contratos" />
            <SView col={"xs-12"} style={{ padding: 8 }}>
                <SView row style={{ flexWrap: "wrap", alignItems: "center" }}>
                    <SText fontSize={20} bold>{k.descripcion}</SText>
                    <SView width={12} />
                    <SView style={{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, backgroundColor: (STheme.color[s.color] ?? STheme.color.gray) + "33" }}>
                        <SText color={STheme.color[s.color]} bold>{s.label}</SText>
                    </SView>
                    <SView flex />
                    <Btn label="Ver venta" color={STheme.color.primary} onPress={() => SNavigation.navigate("/venta/profile2", { pk: k.key_compra_venta })} />
                    {k.key_orden && puede("configurar") && d.cobros.some(c => c.state == "PAGADO") ? <Btn label="Anular compra" color={STheme.color.danger}
                        onPress={() => PopupAnularCompra.open({ key: k.key_orden, state: "VENTA", modalidad: "cuotas", monto: k.monto_cuota, descripcion: k.descripcion, cliente: k.cliente }, () => this.cargar())} /> : null}
                    {["ACTIVO", "MOROSO"].includes(k.state) && puede("configurar") ? <Btn label="Cancelar contrato" color={STheme.color.danger} disabled={this.state.ocupado == "cancelar"} onPress={() => this.cancelar()} /> : null}
                </SView>
                <SHr height={12} />
                <SView row style={{ flexWrap: "wrap" }}>
                    <Dato label="Cliente" valor={nombreCliente(k.cliente)} />
                    <Dato label="CI" valor={k.cliente?.ci} />
                    <Dato label="Celular" valor={k.cliente?.celular} />
                    <Dato label="Email" valor={k.cliente?.email} />
                    <Dato label="Cuota" valor={`${moneda(k.monto_cuota)} × ${k.cuotas}`} />
                    <Dato label="Pagadas" valor={`${pagadas} de ${k.cuotas}`} />
                    <Dato label="Día de cobro" valor={`${k.dia_cobro} de cada mes`} />
                    <Dato label="Inicio" valor={dia(k.fecha_inicio)} />
                    <Dato label="Tarjeta guardada" valor={`${k.tarjeta ?? ""}  vence ${k.tarjeta_vence ?? "?"}`} />
                    <Dato label="Venta" valor={String(k.key_compra_venta ?? "").slice(0, 8).toUpperCase()} />
                    {k.state == "CANCELADO" ? <Dato label="Cancelado" valor={`${fecha(k.fecha_cancelacion)} · ${k.motivo_cancelacion ?? ""}`} color={STheme.color.danger} /> : null}
                </SView>
                <SHr height={8} />
                <SText bold fontSize={16}>Cuotas</SText>
                <SHr height={6} />
                {this.renderCuotas()}
                <SHr height={8} />
                <SText fontSize={12} color={STheme.color.gray}>Las cuotas se cobran solas el día de vencimiento (8:00 a 20:00). Si un cobro se rechaza se reintenta hasta 3 veces cada 24 h; después queda en mora y se puede mandar un link al cliente. Si paga con otra tarjeta, esa queda guardada para los meses siguientes.</SText>
            </SView>
        </SPage>
    }
}
