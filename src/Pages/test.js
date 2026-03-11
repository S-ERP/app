import React from "react";
import { SPage, SText, SView, SPopup, STheme, SHr } from "servisofts-component";

export default class index extends React.Component {

    showVentaPopupwww() {
        SPopup.open({
            key: "popup-venta-completada",
            content: (
                <SView
                    col="xs-10 md-6"
                    backgroundColor={STheme.color.card}
                    padding={24}
                    style={{ borderRadius: 16, maxWidth: "100%", alignItems: "center" }}

                >
                    {/* Icono de éxito */}
                    <SView
                        width={80}
                        height={80}
                        borderRadius={40}
                        backgroundColor={STheme.color.success}
                        center
                        style={{ marginBottom: 16 }}
                    >
                        <SText fontSize={36} color="white">✔</SText>
                    </SView>

                    {/* Título */}
                    <SText bold fontSize={20} center style={{ marginBottom: 8 }}>¡Venta realizada con éxito!</SText>

                    {/* Subtítulo */}
                    <SText fontSize={14} center style={{ color: STheme.color.text, marginBottom: 24 }}>
                        Tu transacción se ha completado correctamente. Gracias por tu compra.
                    </SText>

                    {/* Botones */}
                    <SView row col="xs-11" style={{ justifyContent: "space-between", gap: 12 }}>
                        {/* Cancelar */}
                        <SView
                            flex
                            height={40}
                            borderRadius={8}
                            center
                            backgroundColor={STheme.color.text}
                            onPress={() => SPopup.close("popup-venta-completada")}
                        >
                            <SText color={STheme.color.background} center>Salir</SText>
                        </SView>

                        <SView style={{ width: 10, maxWidth: 80 }} />

                        {/* Ver venta */}
                        <SView
                            flex
                            height={40}
                            borderRadius={8}
                            center
                            backgroundColor={STheme.color.success}
                            onPress={() => {
                                SPopup.close("popup-venta-completada");
                                console.clear();
                                console.log("%cVer venta", "color: #2ECC40; font-weight: bold;");
                                this.verDetalleVenta();
                            }}
                        >
                            <SText color={STheme.color.text} center>Ver venta</SText>
                        </SView>

                        <SView style={{ width: 10, maxWidth: 5 }} />

                        {/* Print rollo */}
                        <SView
                            flex
                            height={40}
                            borderRadius={8}
                            center
                            backgroundColor={STheme.color.lightGray}
                            onPress={() => {
                                SPopup.close("popup-venta-completada");
                                console.clear();
                                console.log("%cImprimir rollo", "color: #2ECC40; font-weight: bold;");
                                this.printRollo();
                            }}
                        >
                            <SText color={STheme.color.text} center>Print rollo</SText>
                        </SView>
                    </SView>
                </SView>
            )
        });
    }

    showVentaPopup() {
        SPopup.open({
            key: "popup-venta-completada",
            content: (
                <SView col="xs-11 md-5" backgroundColor={STheme.color.card} padding={24} style={{ borderRadius: 16, maxWidth: "100%", alignItems: "center" }} >
                    {/* Icono de éxito */}
                    <SView width={80} height={80} borderRadius={40} backgroundColor={STheme.color.success} center style={{ marginBottom: 16 }} > <SText fontSize={36} color="white">✔</SText> </SView>

                    {/* Título */}
                    <SText bold fontSize={20} center style={{ marginBottom: 8 }}> ¡Venta realizada con éxito! </SText>

                    {/* Subtítulo */}
                    <SText fontSize={14} center style={{ color: STheme.color.text, marginBottom: 24 }}> Tu transacción se ha completado correctamente. Gracias por tu compra. </SText>

                    {/* Botones */}
                    <SView row col="xs-12" style={{ justifyContent: "space-between", gap: 16, width: "100%", flexWrap: "nowrap" }} >
                        {/* Salir */}
                        <SView flex height={40} borderRadius={8} center backgroundColor={STheme.color.text} onPress={() => SPopup.close("popup-venta-completada")} > <SText color={STheme.color.background} center>Salir</SText> </SView>

                        {/* Ver venta */}
                        <SView flex height={40} borderRadius={8} center backgroundColor={STheme.color.success} onPress={() => { SPopup.close("popup-venta-completada"); console.clear(); console.log("%cVer venta", "color: #2ECC40; font-weight: bold;"); this.verDetalleVenta(); }} > <SText color={STheme.color.text} center>Ver venta</SText> </SView>

                        {/* Imprimir rollo */}
                        <SView
                            flex
                            height={40}
                            borderRadius={8}
                            center
                            backgroundColor={STheme.color.lightGray}
                            onPress={() => {
                                SPopup.close("popup-venta-completada");
                                console.clear();
                                console.log("%cImprimir rollo", "color: #2ECC40; font-weight: bold;");
                                this.printRollo();
                            }}
                        >
                            <SText color={STheme.color.text} center>Imprimir rollo</SText>
                        </SView>
                    </SView>
                </SView>
            )
        });
    }

    verDetalleVenta() {
        console.log("Aquí iría la lógica para ver detalle de la venta");
    }

    printRollo() {
        console.log("Aquí iría la lógica para imprimir el rollo de venta");
    }

    render() {
        return (
            <SPage title={"index"} center>
                <SText onPress={() => this.showVentaPopup()} style={{ color: STheme.color.primary }}>
                    Abrir popup de venta
                </SText>
            </SPage>
        )
    }
}