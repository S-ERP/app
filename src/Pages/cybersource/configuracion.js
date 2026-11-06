import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import { SHr, SInput, SNavigation, SNotification, SPage, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../MDL';
import { URL, getConfig, guardarConfig, probarConfig } from './api';

const Btn = ({ label, color, onPress, disabled }) => <SView card center onPress={disabled ? null : onPress}
    style={{ height: 38, borderRadius: 8, paddingHorizontal: 16, backgroundColor: color, opacity: disabled ? 0.6 : 1 }}>
    <SText color={"#fff"} bold>{label}</SText>
</SView>

const Campo = ({ label, ayuda, ...props }) => <SView col={"xs-12"}>
    <SHr height={12} />
    <SText fontSize={12} color={STheme.color.gray}>{label}</SText>
    <SHr height={4} />
    <SInput style={{ height: 38, borderRadius: 8 }} {...props} />
    {ayuda ? <><SHr height={3} /><SText fontSize={11} color={STheme.color.lightGray}>{ayuda}</SText></> : null}
</SView>

const Opcion = ({ label, detalle, active, onPress }) => <SView card flex onPress={onPress}
    style={{ padding: 10, borderRadius: 8, borderWidth: 1, borderColor: active ? STheme.color.primary : "transparent" }}>
    <SText bold color={active ? STheme.color.primary : STheme.color.text}>{label}</SText>
    <SText fontSize={11} color={STheme.color.gray}>{detalle}</SText>
</SView>

const Seccion = ({ titulo, children }) => <SView card col={"xs-12"} style={{ padding: 16, borderRadius: 12, marginBottom: 12 }}>
    <SText fontSize={15} bold>{titulo}</SText>
    {children}
</SView>

// Configuración de la integración con Cybersource (Linkser) de la empresa.
// El Shared Secret nunca vuelve del servidor: solo se puede reemplazar.
export default class configuracion extends Component {
    state = {
        cargando: true, guardando: false, probando: false, prueba: null, config: null,
        descripcion: "", merchant_id: "", ambiente: "test", cybs_key: "", cybs_secret: "", razon_social: "", rubro: "", activo: true,
    };

    componentDidMount() {
        MDL.rolesPermisos.getPermisoAsync({ url: URL, permiso: "configurar" }).then(e => {
            if (!e) return SNavigation.goBack();
            this.cargar();
        })
    }

    async cargar() {
        try {
            const c = await getConfig();
            this.setState({
                cargando: false, config: c,
                ...(c.configurado ? {
                    descripcion: c.descripcion ?? "", merchant_id: c.merchant_id ?? "", ambiente: c.ambiente ?? "test", cybs_key: c.cybs_key ?? "",
                    razon_social: c.razon_social ?? "", rubro: c.rubro ?? "", activo: !!c.activo, cybs_secret: "",
                } : {}),
            });
        } catch (e) {
            this.setState({ cargando: false });
            SNotification.send({ title: "Error", body: e?.error ?? "No se pudo cargar la configuración.", color: STheme.color.danger, time: 4000 });
        }
    }

    async guardar() {
        const s = this.state;
        this.setState({ guardando: true });
        try {
            const config = await guardarConfig({
                descripcion: s.descripcion.trim(), merchant_id: s.merchant_id.trim(), ambiente: s.ambiente, cybs_key: s.cybs_key.trim(),
                cybs_secret: s.cybs_secret.trim(), razon_social: s.razon_social.trim(), rubro: s.rubro.trim(), activo: s.activo, moneda: "BOB",
            });
            this.setState({ guardando: false, config, cybs_secret: "", prueba: null });
            SNotification.send({ title: "Configuración guardada", body: "Prueba la conexión para confirmar las llaves.", color: STheme.color.success, time: 3000 });
        } catch (e) {
            this.setState({ guardando: false });
            SNotification.send({ title: "No se pudo guardar", body: e?.error ?? "", color: STheme.color.danger, time: 5000 });
        }
    }

    async probar() {
        this.setState({ probando: true, prueba: null });
        try {
            this.setState({ probando: false, prueba: await probarConfig() });
        } catch (e) {
            this.setState({ probando: false, prueba: { ok: false, mensaje: e?.error ?? "No se pudo probar" } });
        }
    }

    render() {
        const s = this.state, set = (k) => (v) => this.setState({ [k]: v });
        if (s.cargando) return <SPage title={"Cybersource · Configuración"}><SText center>Cargando…</SText></SPage>;
        return <SPage title={"Cybersource · Configuración"} disableScroll>
            <ScrollView><SView col={"xs-12"} center><SView col={"xs-12 md-10 lg-8 xl-6"} style={{ padding: 12 }}>

                <SView row style={{ alignItems: "center", marginBottom: 12 }}>
                    <SView flex>
                        <SText fontSize={13} color={STheme.color.gray}>
                            {s.config?.configurado ? `Configurado${s.config?.activo ? "" : " (desactivado)"} · ${s.config?.ambiente == "produccion" ? "Producción" : "Pruebas"}` : "Sin configurar"}
                        </SText>
                    </SView>
                    <SText fontSize={13} color={STheme.color.primary} onPress={() => SNavigation.navigate(URL)}>Ver pagos →</SText>
                </SView>

                <Seccion titulo="Comercio">
                    <Campo label="Nombre que ve el cliente en la página de pago" placeholder="Calistenia Bolivia" value={s.descripcion} onChangeText={set("descripcion")} />
                    <Campo label="Razón social (MDD 7)" placeholder="CALISTENIA BOLIVIA SRL" value={s.razon_social} onChangeText={set("razon_social")} />
                    <Campo label="Rubro (MDD 14)" placeholder="Gimnasio" value={s.rubro} onChangeText={set("rubro")}
                        ayuda="Datos que Linkser pide para el antifraude (Decision Manager)." />
                </Seccion>

                <Seccion titulo="Credenciales de Cybersource">
                    <SHr height={12} />
                    <SText fontSize={12} color={STheme.color.gray}>Ambiente</SText>
                    <SHr height={4} />
                    <SView row style={{ gap: 8 }}>
                        <Opcion label="Pruebas" detalle="apitest.cybersource.com · tarjetas de prueba" active={s.ambiente == "test"} onPress={() => this.setState({ ambiente: "test" })} />
                        <Opcion label="Producción" detalle="api.cybersource.com · cobros reales" active={s.ambiente == "produccion"} onPress={() => this.setState({ ambiente: "produccion" })} />
                    </SView>
                    <Campo label="Organization ID (Merchant ID)" placeholder="linkser_s_XXXXXXX" value={s.merchant_id} onChangeText={set("merchant_id")}
                        ayuda="Lo entrega Linkser. Es el mismo con el que se entra al EBC." />
                    <Campo label="Key" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" value={s.cybs_key} onChangeText={set("cybs_key")}
                        ayuda="EBC → Payment Configuration → Key Management → REST – Shared Secret." />
                    <Campo label="Shared Secret" type="password" placeholder={s.config?.tiene_secret ? "•••••••• (guardado — escribe uno nuevo solo para cambiarlo)" : "Pega el Shared Secret"}
                        value={s.cybs_secret} onChangeText={set("cybs_secret")} ayuda="Por seguridad no se vuelve a mostrar después de guardarlo." />
                </Seccion>

                <Seccion titulo="Estado">
                    <SHr height={12} />
                    <SView row style={{ gap: 8 }}>
                        <Opcion label="Activo" detalle="Se pueden crear y pagar links" active={s.activo} onPress={() => this.setState({ activo: true })} />
                        <Opcion label="Desactivado" detalle="No se pueden crear links nuevos" active={!s.activo} onPress={() => this.setState({ activo: false })} />
                    </SView>
                </Seccion>

                {!s.prueba ? null : <SView style={{ padding: 12, borderRadius: 8, marginBottom: 12, backgroundColor: (s.prueba.ok ? STheme.color.success : STheme.color.danger) + "22" }}>
                    <SText color={s.prueba.ok ? STheme.color.success : STheme.color.danger}>{s.prueba.ok ? "✓ " : "✕ "}{s.prueba.mensaje}</SText>
                </SView>}

                <SView row style={{ justifyContent: "flex-end", gap: 8, marginBottom: 24 }}>
                    {!s.config?.configurado ? null : <Btn label={s.probando ? "Probando..." : "Probar conexión"} color={STheme.color.gray} disabled={s.probando} onPress={() => this.probar()} />}
                    <Btn label={s.guardando ? "Guardando..." : "Guardar"} color={STheme.color.success} disabled={s.guardando} onPress={() => this.guardar()} />
                </SView>

            </SView></SView></ScrollView>
        </SPage>
    }
}
