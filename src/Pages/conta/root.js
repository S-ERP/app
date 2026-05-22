import React from "react";
import { SNavigation, SPage, SHr, SText, STheme, SView } from "servisofts-component";
import SIconApp from "../../Assets/SIconApp";

export default class conta extends React.Component {
    accesos = [
        {
            title: "Plan de cuentas",
            code: "PDC",
            route: "/conta/cuentas",
        },
        {
            title: "Centros de costos",
            code: "CDC",
            route: "/conta/centro_costo",
        },
        {
            title: "Diarios",
            code: "D",
            route: "/conta/diario",
        },
        {
            title: "Crear asiento",
            code: "CA",
            route: "/conta/diario",
        },
        {
            title: "Balance general",
            code: "BG",
            route: "/conta/balance",
        },
        {
            title: "Libro diario",
            code: "LD",
            route: "/conta/libro_diario",
        },
        {
            title: "Cuentas T",
            code: "CT",
            route: "/conta/cuentas_t",
        },
        {
            title: "Sistema antiguo",
            code: "SA",
            route: "/conta/gestion",
        },
        {
            title: "Plan de cuentas anidados",
            code: "PDCA",
            route: "/conta/cuentas_anidadas",
        },
    ];

    renderAcceso = (item, index) => {
        return (
            <SView
                key={item.route + index}
                style={{
                    width: "33.3333%",
                    maxWidth: "33.3333%",
                    minWidth: 230,
                    padding: 6,
                    flexGrow: 1,
                }}
            >
                <SView
                    card
                    onPress={() => SNavigation.navigate(item.route)}
                    style={{
                        minHeight: 72,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: STheme.color.card,
                        backgroundColor: STheme.color.background,
                        paddingHorizontal: 10,
                        paddingVertical: 12,
                        justifyContent: "center",
                    }}
                >
                    <SView row style={{ alignItems: "center" }}>
                        <SView
                            style={{
                                width: 30,
                                height: 24,
                                borderRadius: 6,
                                backgroundColor: STheme.color.card,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <SText style={{ fontSize: 10, fontWeight: "700", color: STheme.color.lightGray }}>
                                {item.code}
                            </SText>
                        </SView>
                        <SView width={8} />
                        <SText style={{ fontSize: 14, fontWeight: "700", flex: 1 }}>{item.title}</SText>
                    </SView>
                </SView>
            </SView>
        );
    };

    render() {
        return (
            <SPage title={"Contabilidad"}>
                <SView col={"xs-12"} style={{ flex: 1 }} padding={14}>
                    <SView
                        card
                        style={{
                            borderRadius: 14,
                            borderWidth: 1,
                            borderColor: STheme.color.card,
                            backgroundColor: STheme.color.background,
                            padding: 16,
                        }}
                    >
                        <SView row style={{ alignItems: "center", justifyContent: "space-between" }}>
                            <SView style={{ flex: 1, paddingRight: 10 }}>
                                <SText style={{ fontSize: 20, fontWeight: "800" }}>
                                    Panel Contable
                                </SText>
                                <SHr height={6} />
                                <SText style={{ color: STheme.color.lightGray }}>
                                    Accede rapidamente a los modulos clave para revisar, registrar y controlar la informacion financiera.
                                </SText>
                            </SView>
                            <SIconApp name={"dashboard"} width={64} height={64} fill={STheme.color.text} />
                        </SView>
                    </SView>

                    <SHr height={12} />
                    <SView row style={{ flexWrap: "wrap" }}>
                        {this.accesos.map(this.renderAcceso)}
                    </SView>
                </SView>
            </SPage>
        );
    }
}