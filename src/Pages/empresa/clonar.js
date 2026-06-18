import React from "react";
import { SHr, SInput, SNavigation, SNotification, SPage, SText, STheme } from "servisofts-component";
import SMD from "../../SMD";
import { Btn } from "../../Components";
import MDL from "../../MDL";
import { Container } from "../publicacion/Components";
import SSocket from "servisofts-socket";
import Model from "../../Model";

export default class clonar extends React.Component {
    handlePress() {
        SNotification.send({
            key: "notification",
            title: "cargando",
            type: "loading",
        })
        SSocket.sendHttpAsync("https://n8n.servisofts.com/webhook/clonar_empresa", {
            key_empresa: MDL.empresa?.select?.key,
            nombre: this.inp.getValue()
        }).then(e => {

            SSocket.sendPromise({
                service: "empresa",
                component: "empresa_usuario",
                type: "getAll",
                // key_empresa: MDL.empresa.select.key,
                key_usuario: MDL.usuario.session.key
            }).then(em => {

                SNotification.send({
                    key: "notification",
                    title: "Exito",
                    time: 5000,
                    color: STheme.color.success
                })
                // console.log("empresasss", em);
                const empresa_usuario = em.data
                const empresa = Object.values(empresa_usuario).find(a => a.key_empresa == e.key_empresa)
                Model.empresa.Action.setEmpresa(empresa.empresa)
                SNavigation.replace("/");

            }).catch(em => {
                SNotification.send({
                    key: "notification",
                    title: "Error",
                    time: 5000,
                    color: STheme.color.danger
                })
                console.error(em);
            })
            console.log(e)
        }).catch(e => {
            SNotification.send({
                key: "notification",
                title: "Error",
                time: 5000,
                color: STheme.color.danger
            })
            console.error(e);
        })
    }
    render() {
        return <SPage title={"Clonar"} center>
            <Container>
                <SText>{"Va a clonar la empresa"}</SText>
                <SHr />
                <SInput ref={(ref) => this.inp = ref} type="nombre" label={"Nuevo Nombre"} defaultValue={MDL.empresa.select.razon_social + " (copy)"} />
                <SHr />
                <Btn onPress={this.handlePress.bind(this)}>CLONAR</Btn>
            </Container>
        </SPage>
    }
}