import React from "react";
import { SPage, SView, SText, SHr, STheme } from "servisofts-component";
import DinamicTable from "../../Components/DinamicTable";

export default class tabla_venta extends React.Component {
    state = {
        data: [
            { fecha: "2025-11-01", cantidad: 12, total: 5000 },
            { fecha: "2025-11-02", cantidad: 7, total: 3200 },
            { fecha: "2025-11-03", cantidad: 15, total: 8700 },
        ]
    };

    render() {
        return (
            <SPage title="Tabla de Ventas">
                <SView col={"xs-12"} padding={16}>

                    {/* TITULO */}
                    <SText fontSize={18} bold>Estadísticas de Ventas</SText>
                    <SHr />

                    {/* GRAFICOS */}
                    <SView row col={"xs-12"}>
                        <SView col={{ xs: 12, md: 6 }} card center height={250} style={{ paddingRight: 8 }}>
                            <SText>Gráfico 1</SText>
                        </SView>

                        <SView col={{ xs: 12, md: 6 }} card center height={250} style={{ paddingLeft: 8 }}>
                            <SText>Gráfico 2</SText>
                        </SView>
                    </SView>

                    <SHr />

                    {/* TABLA */}
                    <SText fontSize={16} bold>Resumen de Ventas</SText>
                    <SHr />
                    <SView col={"xs-12"}>
                        <DinamicTable
                            data={this.state.data}
                            header={[
                                { key: "fecha", label: "Fecha" },
                                { key: "cantidad", label: "Ventas" },
                                { key: "total", label: "Total (Bs.)" },
                            ]}
                        />
                    </SView>

                </SView>
            </SPage>
        );
    }
}
