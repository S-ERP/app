import React, { Component } from 'react';
import { SHr, SInput, SNotification, SPopup, SText, STheme, SView } from 'servisofts-component';
import SCopy from '../../../Components/SCopy';
import { crearToken } from './api';

const KEY = "PopupNuevoToken";
const ALCANCES = [
    { key: "lectura", label: "Solo lectura", detalle: "Consultar datos y reportes" },
    { key: "escritura", label: "Lectura y escritura", detalle: "También registrar y editar (con confirmación)" },
];

const Btn = ({ label, color, onPress, disabled }) => <SView card center onPress={disabled ? null : onPress}
    style={{ height: 38, borderRadius: 8, paddingHorizontal: 16, backgroundColor: color + (disabled ? "33" : ""), opacity: disabled ? 0.6 : 1 }}>
    <SText color={"#fff"} bold>{label}</SText>
</SView>

// Crea un token y lo muestra UNA sola vez: en la base solo queda su hash.
export default class PopupNuevoToken extends Component {
    static open(props) {
        SPopup.open({
            key: KEY,
            content: <SView style={{
                width: "100%", maxWidth: 520, borderRadius: 12, padding: 16,
                borderColor: STheme.color.card, borderWidth: 1, backgroundColor: STheme.color.background,
            }} withoutFeedback>
                <PopupNuevoToken {...props} />
            </SView>
        });
    }

    state = { descripcion: "", alcance: "lectura", vencimiento: "", guardando: false, token: null };

    async crear() {
        const descripcion = this.state.descripcion.trim();
        if (!descripcion) return SNotification.send({ title: "Falta la descripción", body: "Ej: Claude de contabilidad", color: STheme.color.warning, time: 3000 });
        if (this.state.vencimiento && !/^\d{4}-\d{2}-\d{2}$/.test(this.state.vencimiento)) {
            return SNotification.send({ title: "Fecha inválida", body: "Use AAAA-MM-DD", color: STheme.color.warning, time: 3000 });
        }
        this.setState({ guardando: true });
        try {
            const t = await crearToken({
                descripcion,
                alcance: this.state.alcance,
                ...(this.state.vencimiento && { fecha_vencimiento: this.state.vencimiento + "T23:59:59" }),
            });
            this.setState({ token: t.token, guardando: false });
            this.props.onCreate?.();
        } catch (e) {
            this.setState({ guardando: false });
            SNotification.send({ title: "No se pudo crear el token", body: e?.error ?? "", color: STheme.color.danger, time: 5000 });
        }
    }

    renderToken() {
        return <SView col={"xs-12"}>
            <SText fontSize={16} bold>Token creado</SText>
            <SHr height={8} />
            <SText color={STheme.color.warning}>Cópielo ahora: no se volverá a mostrar.</SText>
            <SHr height={12} />
            <SView card style={{ padding: 12, borderRadius: 8 }} onPress={() => SCopy.copy(this.state.token)}>
                <SText fontSize={13} style={{ fontFamily: "monospace" }}>{this.state.token}</SText>
            </SView>
            <SHr height={6} />
            <SText fontSize={11} color={STheme.color.gray}>Toque el token para copiarlo.</SText>
            <SHr height={16} />
            <SView row style={{ justifyContent: "flex-end" }}>
                <Btn label="Listo" color={STheme.color.primary ?? STheme.color.success} onPress={() => SPopup.close(KEY)} />
            </SView>
        </SView>
    }

    render() {
        if (this.state.token) return this.renderToken();
        return <SView col={"xs-12"}>
            <SView row center>
                <SText fontSize={16} bold flex>Nuevo token MCP</SText>
                <SView width={32} height={32} center onPress={() => SPopup.close(KEY)}>
                    <SText fontSize={18} color={STheme.color.gray}>✕</SText>
                </SView>
            </SView>
            <SHr height={4} />
            <SText fontSize={12} color={STheme.color.gray}>Permite que un asistente (Claude) trabaje con los datos de esta empresa, con tus permisos.</SText>
            <SHr height={16} />
            <SInput placeholder="Descripción (ej: Claude de contabilidad)" value={this.state.descripcion}
                style={{ height: 38, borderRadius: 8 }} onChangeText={descripcion => this.setState({ descripcion })} />
            <SHr height={12} />
            {ALCANCES.map(a => <SView key={a.key} card row center onPress={() => this.setState({ alcance: a.key })}
                style={{ padding: 10, borderRadius: 8, marginBottom: 6, borderWidth: 1, borderColor: this.state.alcance == a.key ? STheme.color.success : "transparent" }}>
                <SView width={14} height={14} style={{ borderRadius: 7, borderWidth: 2, borderColor: STheme.color.text, backgroundColor: this.state.alcance == a.key ? STheme.color.success : "transparent" }} />
                <SView width={10} />
                <SView flex>
                    <SText bold>{a.label}</SText>
                    <SText fontSize={11} color={STheme.color.gray}>{a.detalle}</SText>
                </SView>
            </SView>)}
            <SHr height={8} />
            <SInput placeholder="Vence el (AAAA-MM-DD, opcional)" value={this.state.vencimiento}
                style={{ height: 38, borderRadius: 8 }} onChangeText={vencimiento => this.setState({ vencimiento })} />
            <SHr height={16} />
            <SView row style={{ justifyContent: "flex-end" }}>
                <Btn label={this.state.guardando ? "Creando..." : "Crear token"} color={STheme.color.success} disabled={this.state.guardando} onPress={() => this.crear()} />
            </SView>
        </SView>
    }
}
