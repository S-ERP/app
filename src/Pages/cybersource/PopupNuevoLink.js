import React, { Component } from 'react';
import { Linking } from 'react-native';
import { SHr, SInput, SNotification, SPopup, SText, STheme, SView } from 'servisofts-component';
import SCopy from '../../Components/SCopy';
import { crearLink, moneda } from './api';

const KEY = "PopupNuevoLinkPago";

const Btn = ({ label, color, onPress, disabled }) => <SView card center onPress={disabled ? null : onPress}
    style={{ height: 38, borderRadius: 8, paddingHorizontal: 16, backgroundColor: color, opacity: disabled ? 0.6 : 1 }}>
    <SText color={"#fff"} bold>{label}</SText>
</SView>

const Campo = ({ label, ...props }) => <SView col={"xs-12"}>
    <SHr height={8} />
    <SText fontSize={12} color={STheme.color.gray}>{label}</SText>
    <SHr height={4} />
    <SInput style={{ height: 38, borderRadius: 8 }} {...props} />
</SView>

// Crea un link de pago con tarjeta y lo deja listo para copiar o mandar por WhatsApp.
export default class PopupNuevoLink extends Component {
    static open(props) {
        SPopup.open({
            key: KEY,
            content: <SView style={{
                width: "100%", maxWidth: 520, borderRadius: 12, padding: 16,
                borderColor: STheme.color.card, borderWidth: 1, backgroundColor: STheme.color.background,
            }} withoutFeedback>
                <PopupNuevoLink {...props} />
            </SView>
        });
    }

    state = { monto: "", descripcion: "", nombre: "", apellido: "", email: "", telefono: "", guardando: false, link: null };

    async crear() {
        const monto = Number(String(this.state.monto).replace(",", "."));
        const descripcion = this.state.descripcion.trim();
        if (!(monto > 0)) return SNotification.send({ title: "Monto inválido", body: "Ej: 150 o 99.90", color: STheme.color.warning, time: 3000 });
        if (!descripcion) return SNotification.send({ title: "Falta el concepto", body: "Ej: Mensualidad noviembre", color: STheme.color.warning, time: 3000 });
        const cliente = Object.fromEntries(["nombre", "apellido", "email", "telefono"].map(k => [k, this.state[k].trim()]).filter(([, v]) => v));
        this.setState({ guardando: true });
        try {
            const link = await crearLink({ monto, descripcion, cliente });
            this.setState({ link, guardando: false });
            this.props.onCreate?.();
        } catch (e) {
            this.setState({ guardando: false });
            SNotification.send({ title: "No se pudo crear el link", body: e?.error ?? "", color: STheme.color.danger, time: 5000 });
        }
    }

    renderLink() {
        const { link } = this.state;
        const texto = `Hola${this.state.nombre ? " " + this.state.nombre.trim() : ""}, este es tu link para pagar ${moneda(link.monto, link.moneda)} (${link.descripcion}) con tarjeta: ${link.url}`;
        const tel = this.state.telefono.replace(/\D/g, "");
        return <SView col={"xs-12"}>
            <SText fontSize={16} bold>Link de pago creado</SText>
            <SHr height={6} />
            <SText color={STheme.color.gray}>{moneda(link.monto, link.moneda)} · {link.descripcion}</SText>
            <SHr height={12} />
            <SView card style={{ padding: 12, borderRadius: 8 }} onPress={() => SCopy.copy(link.url)}>
                <SText fontSize={13} style={{ fontFamily: "monospace" }}>{link.url}</SText>
            </SView>
            <SHr height={6} />
            <SText fontSize={11} color={STheme.color.gray}>Toque el link para copiarlo. Se puede pagar una sola vez.</SText>
            <SHr height={16} />
            <SView row style={{ justifyContent: "flex-end", gap: 8 }}>
                <Btn label="WhatsApp" color={"#25D366"} onPress={() => Linking.openURL(`https://wa.me/${tel}?text=${encodeURIComponent(texto)}`)} />
                <Btn label="Abrir" color={STheme.color.gray} onPress={() => Linking.openURL(link.url)} />
                <Btn label="Listo" color={STheme.color.success} onPress={() => SPopup.close(KEY)} />
            </SView>
        </SView>
    }

    render() {
        if (this.state.link) return this.renderLink();
        const set = (k) => (v) => this.setState({ [k]: v });
        return <SView col={"xs-12"}>
            <SText fontSize={16} bold>Nuevo link de pago</SText>
            <SHr height={4} />
            <SText fontSize={12} color={STheme.color.gray}>El cliente paga con tarjeta desde su celular o computadora.</SText>
            <SView row style={{ gap: 10 }}>
                <SView flex><Campo label="Monto (Bs)" placeholder="150.00" value={this.state.monto} onChangeText={set("monto")} /></SView>
                <SView flex style={{ flex: 2 }}><Campo label="Concepto" placeholder="Mensualidad noviembre" value={this.state.descripcion} onChangeText={set("descripcion")} /></SView>
            </SView>
            <SHr height={10} />
            <SText fontSize={12} color={STheme.color.gray}>Datos del cliente (opcional, se precargan en la página de pago)</SText>
            <SView row style={{ gap: 10 }}>
                <SView flex><Campo label="Nombre" value={this.state.nombre} onChangeText={set("nombre")} /></SView>
                <SView flex><Campo label="Apellido" value={this.state.apellido} onChangeText={set("apellido")} /></SView>
            </SView>
            <SView row style={{ gap: 10 }}>
                <SView flex><Campo label="Email" value={this.state.email} onChangeText={set("email")} /></SView>
                <SView flex><Campo label="Celular (WhatsApp)" placeholder="59170000000" value={this.state.telefono} onChangeText={set("telefono")} /></SView>
            </SView>
            <SHr height={18} />
            <SView row style={{ justifyContent: "flex-end", gap: 8 }}>
                <Btn label="Cancelar" color={STheme.color.gray} onPress={() => SPopup.close(KEY)} />
                <Btn label={this.state.guardando ? "Creando..." : "Crear link"} color={STheme.color.success} disabled={this.state.guardando} onPress={() => this.crear()} />
            </SView>
        </SView>
    }
}
