import React, { Component } from 'react';
import { ScrollView, TextInput } from 'react-native';
import { SHr, SLoad, SNavigation, SNotification, SPage, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import Model from '../../../Model';
import SMD from '../../../SMD';
import { loadManuales } from './data';

const PLANTILLA = `# Manual de procedimientos

## Objetivo
Describe el propósito de este manual.

## Responsabilidades
- Responsabilidad 1
- Responsabilidad 2

## Procedimientos
### 1. Nombre del procedimiento
1. Paso uno
2. Paso dos

## Observaciones
`;

// Crea o edita un manual: nombre, roles asignados y contenido markdown con vista previa.
// Params: pk (manual a editar, si no viene se crea uno nuevo), key_rol (rol preseleccionado al crear).
export default class editar extends Component {
    state = { loading: true, descripcion: "", contenido: "", seleccion: {}, roles: [], preview: false, guardando: false };

    componentDidMount() {
        this.pk = SNavigation.getParam("pk");
        const key_rol = SNavigation.getParam("key_rol");
        loadManuales().then(({ manuales, roles }) => {
            const manual = manuales.find(m => m.key == this.pk);
            this.asignaciones = manual?.asignaciones ?? [];
            const seleccion = {};
            this.asignaciones.forEach(a => seleccion[a.key_rol] = true);
            if (!manual && key_rol) seleccion[key_rol] = true;
            this.setState({
                loading: false,
                descripcion: manual?.descripcion ?? "",
                contenido: manual?.contenido ?? "",
                seleccion,
                roles: Object.values(roles).sort((a, b) => (a.descripcion ?? "").localeCompare(b.descripcion ?? "")),
            });
        });
    }

    async guardar() {
        if (this.state.guardando) return;
        const descripcion = this.state.descripcion.trim();
        if (!descripcion) {
            SNotification.send({ title: "Falta el nombre", body: "Ingresa el nombre del manual.", time: 3000, color: STheme.color.warning });
            return;
        }
        this.setState({ guardando: true });
        try {
            let key_manual = this.pk;
            if (key_manual) {
                await MDL.rolesPermisos.editarManual({ key: key_manual, descripcion, contenido: this.state.contenido });
            } else {
                const resp = await MDL.rolesPermisos.registrarManual({ descripcion, contenido: this.state.contenido });
                key_manual = resp.key;
            }
            // Sincroniza las asignaciones a roles
            const seleccion = this.state.seleccion;
            const actuales = {};
            for (const a of this.asignaciones) {
                actuales[a.key_rol] = true;
                if (!seleccion[a.key_rol]) await MDL.rolesPermisos.editarManualRol({ key: a.key, estado: 0 });
            }
            for (const key_rol of Object.keys(seleccion)) {
                if (seleccion[key_rol] && !actuales[key_rol]) await MDL.rolesPermisos.registrarManualRol(key_manual, key_rol);
            }
            SNotification.send({ title: "Manual guardado", body: "El manual se guardó correctamente.", time: 3000, color: STheme.color.success });
            if (this.pk) SNavigation.goBack();
            else SNavigation.replace("/rol/manual/ver", { pk: key_manual });
        } catch (e) {
            console.error(e);
            this.setState({ guardando: false });
            SNotification.send({ title: "Error", body: "No se pudo guardar el manual.", time: 3000, color: STheme.color.danger });
        }
    }

    renderRoles() {
        return <SView col={"xs-12"} row>
            {this.state.roles.map(r => {
                const active = !!this.state.seleccion[r.key];
                return <SView key={r.key} padding={6} style={{
                    borderRadius: 16, paddingLeft: 12, paddingRight: 12, marginRight: 6, marginBottom: 6,
                    borderWidth: 1,
                    borderColor: active ? STheme.color.success : STheme.color.card,
                    backgroundColor: active ? STheme.color.success + "44" : STheme.color.card,
                }} onPress={() => this.setState({ seleccion: { ...this.state.seleccion, [r.key]: !active } })}>
                    <SText fontSize={12} bold={active}>{(active ? "✓ " : "") + r.descripcion}</SText>
                </SView>
            })}
        </SView>
    }

    renderEditor() {
        return <SView col={"xs-12"} flex card style={{ minHeight: 400 }}>
            <TextInput
                multiline
                value={this.state.contenido}
                onChangeText={(contenido) => this.setState({ contenido })}
                placeholder={"Escribe el manual en formato markdown..."}
                placeholderTextColor={STheme.color.lightGray}
                textAlignVertical="top"
                style={{
                    flex: 1,
                    minHeight: 400,
                    padding: 12,
                    color: STheme.color.text,
                    fontSize: 14,
                    fontFamily: "monospace",
                    outlineStyle: "none",
                }}
            />
        </SView>
    }

    renderPreview() {
        return <SView col={"xs-12"} flex card padding={12} style={{ minHeight: 400 }}>
            <ScrollView>
                {this.state.contenido.trim()
                    ? <SMD textColor={STheme.color.text} colorCard={STheme.color.background}>{this.state.contenido}</SMD>
                    : <SText color={STheme.color.lightGray}>Sin contenido</SText>}
            </ScrollView>
        </SView>
    }

    boton(label, onPress, color) {
        return <SView card padding={8} style={{ paddingLeft: 14, paddingRight: 14, marginLeft: 8, backgroundColor: color }} onPress={onPress}>
            <SText bold>{label}</SText>
        </SView>
    }

    render() {
        if (!Model.usuarioPage.Action.getPermiso({ url: "/rol", permiso: "edit" })) {
            return <SPage title={"Editar manual"}><SLoad /></SPage>
        }
        return <SPage title={this.pk ? "Editar manual" : "Nuevo manual"} disableScroll>
            {this.state.loading ? <SLoad /> : <SView col={"xs-12"} flex padding={12}>
                <SView col={"xs-12"} row style={{ alignItems: "center", flexWrap: "wrap" }}>
                    <SView flex card style={{ minWidth: 200 }}>
                        <TextInput
                            value={this.state.descripcion}
                            onChangeText={(descripcion) => this.setState({ descripcion })}
                            placeholder={"Nombre del manual *"}
                            placeholderTextColor={STheme.color.lightGray}
                            style={{ padding: 10, color: STheme.color.text, fontSize: 16, fontWeight: "bold", outlineStyle: "none" }}
                        />
                    </SView>
                    {!this.state.contenido.trim() ? this.boton("Usar plantilla", () => this.setState({ contenido: PLANTILLA })) : null}
                    {this.boton(this.state.preview ? "Editar" : "Vista previa", () => this.setState({ preview: !this.state.preview }))}
                    {this.boton(this.state.guardando ? "Guardando..." : "Guardar", () => this.guardar(), STheme.color.success + "88")}
                </SView>
                <SHr />
                <SText fontSize={12} color={STheme.color.lightGray}>Roles que verán este manual:</SText>
                <SHr h={6} />
                {this.renderRoles()}
                <SHr />
                {/* En pantallas grandes se muestra editor y vista previa lado a lado */}
                <SView col={"xs-12"} flex row colHidden="xs sm" style={{ alignItems: "stretch" }}>
                    <SView flex>{this.renderEditor()}</SView>
                    <SView width={12} />
                    <SView flex>{this.renderPreview()}</SView>
                </SView>
                <SView col={"xs-12"} flex colHidden="md lg xl xxl">
                    {this.state.preview ? this.renderPreview() : this.renderEditor()}
                </SView>
            </SView>}
        </SPage>
    }
}
