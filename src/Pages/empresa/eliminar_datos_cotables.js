import React from "react";
import { SButtom, SHr, SNavigation, SNotification, SPage, SPopup, SText, STheme } from "servisofts-component";
import SSocket from "servisofts-socket";
import MDL from "../../MDL";
import { Container } from "../../Components";

export default class index extends React.Component {


    handleOnPress() {
        const url = "https://n8n.servisofts.com/webhook/f55e365d-039d-45cf-b6c1-e0bfab7b88c5";
        // const url = "https://n8n.servisofts.com/webhook-test/f55e365d-039d-45cf-b6c1-e0bfab7b88c5";
        // Datos que quieres enviar
        const data = {
            key_empresa: MDL.empresa.select.key,
        };

        SNotification.send({
            key: "eliminar_datos_contables",
            title: "Eliminando datos contables",
            body: "Esto puede tardar unos minutos...",
            type: "loading",
        });

        // Enviar el POST
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
                return response.json(); // o response.text() si el webhook no devuelve JSON
            })
            .then(result => {
                SNotification.remove("eliminar_datos_contables");
                SNavigation.reset();
                console.log("Respuesta del webhook:", result);
            })
            .catch(error => {
                SNotification.remove("eliminar_datos_contables");
                SNotification.send({
                    title: "Error",
                    body: "Error al eliminar los datos contables.",
                    type: "danger",
                    time: 4000,
                });

                console.error("Error al enviar el webhook:", error);
            });
    }

    render() {
        return <SPage title={"Eliminar datos"} >
            <Container>
                <SHr />
                <SText fontSize={30} bold color={STheme.color.warning}>CUIDADO</SText>
                <SHr />
                <SText col={"xs-12"} fontSize={18} color={STheme.color.text}>{`
Al eliminar los datos de la empresa, se eliminara:
    -   Asientos contables.
    -   Stock en el inventario.
    -   Historial de Compras
    -   Historial de Ventas
    -   Historial de Cajas
    -   Cajas abiertas.

No Elimina Configuraciones:
    - Sucursales, puntos de ventas.
    - Almacenes.
    - Tipos de pagos.
    - Gestiones.
    - Modelos y tipos de productos

            `}</SText>

                <SButtom type="danger" onPress={() => {
                    SPopup.confirm({
                        title: "Seguro que desea eliminar?",
                        message: "Esta accion no se puede deshacer.",
                        onPress: () => {
                            this.handleOnPress()
                        }
                    })
                }}>{"ELIMINAR"}</SButtom>
            </Container>
        </SPage>
    }
}