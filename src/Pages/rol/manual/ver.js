import React, { Component } from 'react';
import { SHr, SLoad, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import Model from '../../../Model';
import SMD from '../../../SMD';
import { loadManuales } from './data';

// Muestra un manual de procedimientos renderizado en markdown y los roles a los que está asignado.
export default class ver extends Component {
    state = { manual: null };

    componentDidMount() {
        this.pk = SNavigation.getParam("pk");
        this.load();
    }

    async load() {
        const { manuales } = await loadManuales();
        this.setState({ manual: manuales.find(m => m.key == this.pk) ?? {} });
    }

    eliminar() {
        SPopup.confirm({
            title: "Eliminar manual",
            message: "¿Estás seguro de eliminar este manual? Se quitará de todos sus roles.",
            onPress: () => {
                MDL.rolesPermisos.editarManual({ key: this.pk, estado: 0 }).then(() => {
                    SNotification.send({ title: "Manual eliminado", time: 3000, color: STheme.color.success });
                    SNavigation.goBack();
                }).catch(e => {
                    console.error(e);
                    SNotification.send({ title: "Error", body: "No se pudo eliminar el manual.", time: 3000, color: STheme.color.danger });
                });
            }
        })
    }

    boton(label, onPress) {
        return <SView card padding={8} style={{ paddingLeft: 14, paddingRight: 14, marginLeft: 8 }} onPress={onPress}>
            <SText bold>{label}</SText>
        </SView>
    }

    render() {
        const manual = this.state.manual;
        const allowEdit = Model.usuarioPage.Action.getPermiso({ url: "/rol", permiso: "edit" });
        const contenido = (manual?.contenido ?? "").trim();
        return <SPage title={manual?.descripcion ?? "Manual"} onRefresh={() => this.load()}>
            <SView col={"xs-12"} center>
                <SView col={"xs-11 sm-11 md-10 lg-8 xl-7"}>
                    <SHr />
                    {!manual ? <SLoad type='skeleton' height={300} /> : <>
                        <SView col={"xs-12"} row style={{ alignItems: "center" }}>
                            <SView flex>
                                <SText fontSize={12} color={STheme.color.lightGray}>Manual de procedimientos</SText>
                                <SText fontSize={20} bold>{manual.descripcion}</SText>
                            </SView>
                            {allowEdit && manual.key ? this.boton("Editar", () => SNavigation.navigate("/rol/manual/editar", { pk: this.pk })) : null}
                            {allowEdit && manual.key ? this.boton("Eliminar", () => this.eliminar()) : null}
                        </SView>
                        <SHr h={4} />
                        <SText fontSize={12} color={STheme.color.lightGray}>
                            {"Roles: " + ((manual.roles ?? []).map(r => r.descripcion).join(", ") || "ninguno")}
                        </SText>
                        <SHr />
                        <SHr h={1} color={STheme.color.card} />
                        <SHr />
                        {contenido
                            ? <SMD textColor={STheme.color.text} colorCard={STheme.color.card}>{contenido}</SMD>
                            : <SView col={"xs-12"} center padding={40}>
                                <SText color={STheme.color.lightGray}>Este manual aún no tiene contenido.</SText>
                            </SView>}
                    </>}
                    <SHr h={40} />
                </SView>
            </SView>
        </SPage>
    }
}
