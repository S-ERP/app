import React, { Component } from 'react';
import { SHr, SLoad, SPage, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import SMD from '../../../SMD';
import { loadManuales } from './data';

const PALETA = ["#4F8EF7", "#9B5DE5", "#F15BB5", "#00BBF9", "#00C49A", "#F9A826", "#EF476F", "#06D6A0"];

// Usa el color del registro si es un hex válido, si no uno de la paleta.
const colorDe = (obj, i) => /^#[0-9a-fA-F]{6}$/.test(obj?.color ?? "") ? obj.color : PALETA[i % PALETA.length];

// Manuales de procedimientos asignados a los roles del usuario en sesión (empresa actual).
export default class mios extends Component {
    state = { manuales: null, select: null };

    componentDidMount() {
        this.load().catch(e => {
            console.error(e);
            this.setState({ manuales: [] });
        });
    }

    async load() {
        const key_usuario = MDL.usuario.session?.key;
        const [userRoles, { manuales }] = await Promise.all([
            MDL.rolesPermisos.getAllUserRolesByKeyUser([key_usuario]),
            loadManuales(),
        ]);
        const misRoles = {};
        (userRoles?.[key_usuario] ?? [])
            .filter(ur => ur.estado != 0)
            .forEach(ur => misRoles[ur.key_rol ?? ur.rol?.key] = true);
        const mios = manuales.filter(m => m.roles.find(r => misRoles[r.key]));
        this.setState({ manuales: mios, select: mios[0]?.key });
    }

    renderTabs() {
        if (this.state.manuales.length <= 1) return null;
        return <SView col={"xs-12"} row>
            {this.state.manuales.map((m, i) => {
                const active = m.key == this.state.select;
                const color = colorDe(m, i);
                return <SView key={m.key} row padding={6} style={{
                    alignItems: "center",
                    paddingRight: 16, marginRight: 10, marginBottom: 10,
                    borderRadius: 24,
                    borderWidth: 2,
                    borderColor: color,
                    backgroundColor: active ? color : color + "22",
                    shadowColor: color,
                    shadowOpacity: active ? 0.5 : 0,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: active ? 4 : 0,
                }} onPress={() => this.setState({ select: m.key })}>
                    <SView width={28} height={28} center style={{
                        borderRadius: 14,
                        backgroundColor: active ? "#ffffff44" : color,
                    }}>
                        <SText bold fontSize={13} color={"#fff"}>{(m.descripcion ?? "?").trim().charAt(0).toUpperCase()}</SText>
                    </SView>
                    <SView width={8} />
                    <SView>
                        <SText bold fontSize={14} color={active ? "#fff" : STheme.color.text}>{m.descripcion}</SText>
                        <SText fontSize={10} color={active ? "#ffffffcc" : STheme.color.lightGray}>{m.roles.length + (m.roles.length == 1 ? " rol" : " roles")}</SText>
                    </SView>
                </SView>
            })}
        </SView>
    }

    renderRoles(roles) {
        return <SView col={"xs-12"} row style={{ alignItems: "center" }}>
            <SText fontSize={12} color={STheme.color.lightGray}>{"Roles: "}</SText>
            {roles.map((r, i) => {
                const color = colorDe(r, i);
                return <SView key={r.key} row style={{
                    alignItems: "center",
                    borderRadius: 14, paddingLeft: 10, paddingRight: 10, paddingTop: 4, paddingBottom: 4,
                    marginRight: 6, marginTop: 4,
                    borderWidth: 1, borderColor: color,
                    backgroundColor: color + "33",
                }}>
                    <SView width={8} height={8} style={{ borderRadius: 4, backgroundColor: color }} />
                    <SView width={6} />
                    <SText fontSize={12} bold>{r.descripcion}</SText>
                </SView>
            })}
        </SView>
    }

    renderContent() {
        const { manuales, select } = this.state;
        if (!manuales) return <SLoad type='skeleton' height={300} />
        if (!manuales.length) return <SView col={"xs-12"} center padding={40}>
            <SText color={STheme.color.lightGray}>No tienes manuales asignados a tus roles.</SText>
        </SView>
        const manual = manuales.find(m => m.key == select) ?? manuales[0];
        const contenido = (manual.contenido ?? "").trim();
        return <>
            {this.renderTabs()}
            <SHr />
            <SText fontSize={20} bold>{manual.descripcion}</SText>
            <SHr h={4} />
            {this.renderRoles(manual.roles)}
            <SHr />
            <SHr h={1} color={STheme.color.card} />
            <SHr />
            {contenido
                ? <SMD textColor={STheme.color.text} colorCard={STheme.color.card}>{contenido}</SMD>
                : <SView col={"xs-12"} center padding={40}>
                    <SText color={STheme.color.lightGray}>Este manual aún no tiene contenido.</SText>
                </SView>}
        </>
    }

    render() {
        return <SPage title={"Mis manuales"}>
            <SView col={"xs-12"} center>
                <SView col={"xs-11 sm-11 md-10 lg-8 xl-7"}>
                    <SHr />
                    {this.renderContent()}
                    <SHr h={40} />
                </SView>
            </SView>
        </SPage>
    }
}
