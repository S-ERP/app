import React from "react";
import { Linking } from "react-native";
import { SHr, SImage, SLoad, SMath, SNotification, SText, STheme, SView } from "servisofts-component";
import SSocket from "servisofts-socket";
import { TipoPasarelaProps } from "./index"
import MDL from "../../../../MDL";
import SCopy from "../../../../Components/SCopy";

type Props = TipoPasarelaProps & { onSuccess?: (e: any) => void, onCancel?: () => void };

// Cobro con tarjeta (Cybersource / Linkser): crea un link de pago por el monto, lo muestra como QR para que el
// cliente pague desde su celular y espera la confirmación. Al aprobarse devuelve la referencia a la caja.
const cs = (type: string, extra: any = {}) => SSocket.sendPromise({
    component: "cybersource", type, estado: "cargando",
    key_empresa: MDL.empresa.select?.key,
    key_usuario: MDL.usuario.session?.key,
    ...extra,
}, 60 * 1000);

const ESPERANDO = ["CREADA", "SETUP", "PENDING_AUTHENTICATION"];

export default class cybersource extends React.Component<Props> {
    state: any = { link: null, error: null, estado: null, mensaje: null }
    timer: any = null;
    activo = true;

    componentDidMount(): void {
        this.crear();
    }
    componentWillUnmount(): void {
        this.activo = false;
        clearTimeout(this.timer);
    }

    async crear() {
        this.setState({ link: null, error: null, estado: null, mensaje: null });
        try {
            const r: any = await cs("caja_cobrar", { data: { monto: this.props.monto, descripcion: this.props.descripcion || "Venta" } });
            if (!this.activo) return;
            this.setState({ link: r.data, estado: r.data?.state });
            this.consultar();
        } catch (e: any) {
            this.setState({ error: e?.error ?? "No se pudo generar el cobro con tarjeta" });
        }
    }

    consultar() {
        this.timer = setTimeout(async () => {
            if (!this.activo || !this.state.link) return;
            try {
                const r: any = await cs("caja_estado", { key: this.state.link.key });
                const t = r.data ?? {};
                if (!this.activo) return;
                if (t.state == "AUTHORIZED") return this.aprobado(t);
                if (t.state == "ANULADA") return this.setState({ estado: t.state });
                this.setState({ estado: t.state, mensaje: ESPERANDO.includes(t.state) ? null : t.mensaje });
            } catch (e) { }
            this.consultar();
        }, 3000);
    }

    aprobado(t: any) {
        this.setState({ estado: "AUTHORIZED", link: { ...this.state.link, ...t } });
        SNotification.send({ title: "Pago con tarjeta aprobado", body: `Autorización ${t.aprobacion ?? ""}`, color: STheme.color.success, time: 4000 });
        const referencia = ["Cybersource " + (t.cybs_id ?? ""), t.aprobacion ? "Aut " + t.aprobacion : "", t.tarjeta ?? ""].filter(Boolean).join(" · ");
        setTimeout(() => this.props.onSuccess?.({
            referencia,
            monto: Number(t.monto),
            cybersource: { key: t.key, cybs_id: t.cybs_id, aprobacion: t.aprobacion, tarjeta: t.tarjeta, fecha_pago: t.fecha_pago },
        }), 1200);
    }

    async cancelar() {
        clearTimeout(this.timer);
        this.activo = false;
        const l = this.state.link;
        if (l && this.state.estado != "AUTHORIZED") await cs("caja_anular", { key: l.key }).catch(() => { });
        this.props.onCancel?.();
    }

    boton(label: string, color: string, onPress: () => void) {
        return <SView flex card center height={36} style={{ borderRadius: 6, backgroundColor: color, marginHorizontal: 3 }} onPress={onPress}>
            <SText color={"#fff"} bold fontSize={12}>{label}</SText>
        </SView>
    }

    render() {
        const { link, error, estado, mensaje } = this.state;
        const ok = estado == "AUTHORIZED";
        return <SView col={"xs-12"} center padding={16}>
            <SText fontSize={16} bold>Cobro con tarjeta</SText>
            <SText fontSize={22} bold color={STheme.color.success}>Bs {SMath.formatMoney(this.props.monto)}</SText>
            <SHr h={10} />
            {error ? <>
                <SText color={STheme.color.danger} center>{error}</SText>
                <SHr h={12} />
                <SView row col={"xs-12"}>
                    {this.boton("Cerrar", STheme.color.gray, () => this.props.onCancel?.())}
                    {this.boton("Reintentar", STheme.color.primary, () => this.crear())}
                </SView>
            </> : !link ? <SView height={260} center><SLoad /><SText fontSize={12} color={STheme.color.gray}>Generando cobro…</SText></SView> : <>
                <SView style={{ width: 240, height: 240, backgroundColor: "#fff", borderRadius: 10, padding: 8, opacity: ok ? 0.25 : 1 }} center>
                    <SImage src={link.qr} style={{ width: "100%", height: "100%", resizeMode: "contain" }} />
                </SView>
                <SHr h={8} />
                {ok ? <SText bold fontSize={16} color={STheme.color.success}>✓ Pago aprobado {link.tarjeta ?? ""}</SText>
                    : estado == "ANULADA" ? <SText color={STheme.color.danger}>Cobro anulado</SText>
                        : <>
                            <SView row center>
                                <SLoad />
                                <SText fontSize={13} color={STheme.color.gray}>{"  "}{estado == "PENDING_AUTHENTICATION" ? "El banco está verificando al cliente…" : estado == "SETUP" ? "El cliente está pagando…" : "Esperando que el cliente pague"}</SText>
                            </SView>
                            <SText fontSize={12} color={STheme.color.gray} center>El cliente escanea el QR con su celular y paga con su tarjeta.</SText>
                        </>}
                {mensaje ? <><SHr h={6} /><SText fontSize={12} color={STheme.color.danger} center>Intento rechazado: {mensaje}. El cliente puede volver a intentar con otra tarjeta.</SText></> : null}
                <SHr h={14} />
                {ok ? null : <>
                    <SView row col={"xs-12"}>
                        {this.boton("Copiar link", STheme.color.gray, () => SCopy.copy(link.url))}
                        {this.boton("WhatsApp", "#25D366", () => Linking.openURL(`https://wa.me/?text=${encodeURIComponent(`Paga Bs ${SMath.formatMoney(this.props.monto)} con tarjeta aquí: ${link.url}`)}`))}
                        {this.boton("Abrir aquí", STheme.color.primary, () => Linking.openURL(link.url))}
                    </SView>
                    <SHr h={8} />
                    <SView row col={"xs-12"}>
                        {this.boton("Cancelar cobro", STheme.color.danger, () => this.cancelar())}
                    </SView>
                </>}
            </>}
        </SView>
    }
}
