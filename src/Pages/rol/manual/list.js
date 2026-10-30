import React, { Component } from 'react';
import { SHr, SInput, SLoad, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../Model';
import FloatButtom from '../../../Components/FloatButtom';
import { loadManuales, resumen } from './data';

// Lista los manuales de procedimientos de la empresa y los roles a los que están asignados.
// Param opcional key_rol: muestra solo los manuales de ese rol.
export default class list extends Component {
    state = { data: null, buscar: "" };

    componentDidMount() {
        this.key_rol = SNavigation.getParam("key_rol");
        this.load();
    }

    load() {
        loadManuales().then(data => this.setState({ data })).catch(e => {
            console.error(e);
            this.setState({ data: { manuales: [], roles: {} } });
        });
    }

    renderRoles(roles) {
        if (!roles.length) return <SText fontSize={11} color={STheme.color.warning}>Sin roles asignados</SText>
        return <SView row>
            {roles.map(r => <SView key={r.key} style={{
                borderRadius: 12, paddingLeft: 8, paddingRight: 8, paddingTop: 2, paddingBottom: 2,
                marginRight: 4, marginTop: 4,
                backgroundColor: STheme.color.text + "22",
            }}>
                <SText fontSize={11}>{r.descripcion}</SText>
            </SView>)}
        </SView>
    }

    renderItem(manual) {
        return <SView key={manual.key} col={"xs-12"} card padding={10} style={{ marginBottom: 8 }}
            onPress={() => SNavigation.navigate("/rol/manual/ver", { pk: manual.key })}>
            <SText bold fontSize={15}>{manual.descripcion}</SText>
            <SHr h={4} />
            <SText fontSize={12} color={STheme.color.lightGray}>{resumen(manual.contenido) || "Sin contenido"}</SText>
            <SHr h={4} />
            {this.renderRoles(manual.roles)}
        </SView>
    }

    render() {
        if (!Model.usuarioPage.Action.getPermiso({ url: "/rol", permiso: "ver" })) {
            return <SPage title={"Manual de procedimientos"}><SLoad /></SPage>
        }
        const { data } = this.state;
        const buscar = this.state.buscar.toLowerCase();
        const rolFiltro = data?.roles?.[this.key_rol];
        const manuales = (data?.manuales ?? [])
            .filter(m => !this.key_rol || m.roles.find(r => r.key == this.key_rol))
            .filter(m => (m.descripcion ?? "").toLowerCase().includes(buscar)
                || m.roles.find(r => (r.descripcion ?? "").toLowerCase().includes(buscar)));
        const allowEdit = Model.usuarioPage.Action.getPermiso({ url: "/rol", permiso: "edit" });
        return <SPage title={"Manual de procedimientos"} onRefresh={() => this.load()}>
            <SView col={"xs-12"} center>
                <SView col={"xs-11 sm-10 md-8 lg-6 xl-5"}>
                    <SHr />
                    <SText fontSize={18} bold>Manuales de procedimientos</SText>
                    <SHr h={4} />
                    <SText fontSize={12} color={STheme.color.lightGray}>
                        {rolFiltro ? "Manuales asignados al rol " + rolFiltro.descripcion : "Crea manuales y asígnalos a uno o varios roles."}
                    </SText>
                    <SHr />
                    <SInput placeholder={"Buscar manual o rol..."} onChangeText={(buscar) => this.setState({ buscar })} />
                    <SHr />
                    {!data ? <SLoad type='skeleton' height={250} /> : manuales.map(m => this.renderItem(m))}
                    {data && !manuales.length ? <SText center color={STheme.color.lightGray}>No se encontraron manuales</SText> : null}
                    <SHr h={80} />
                </SView>
            </SView>
            {allowEdit ? <FloatButtom onPress={() => SNavigation.navigate("/rol/manual/editar", { key_rol: this.key_rol })} /> : null}
        </SPage>
    }
}
