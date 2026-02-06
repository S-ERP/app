import React from "react";
import { SNavigation, SPage, SText } from "servisofts-component";
import MDL from "../../MDL";
import { DinamicTable } from "servisofts-table";
import Config from "../../Config";
import FloatMenu from "../../Components/FloatMenu";
import SIconApp from "../../Assets/SIconApp";
import SSocket from "servisofts-socket";

export default class root extends React.Component {
    async loadData() {
        let costos = await MDL.compra_venta.getAllCostos();
        return costos;
    }
    onSelect(e) {
        FloatMenu.open({
            e: e.evt,
            label: e.row.descripcion,
            options: [
                {
                    label: "Ver venta",
                    icon: <SIconApp name="Menu" />,
                    onPress: () => {
                        SNavigation.navigate("/venta/profile2", { pk: e.row.key_venta });
                    }
                },
                {
                    label: "Generar Compra",
                    icon: <SIconApp name="Menu" />,
                    onPress: () => {
                        SSocket.sendPromise({
                            service: "compra_venta",
                            component: "compra_venta_detalle_costo",
                            type: "generarCompra",
                            key_costo: e.row.key,
                        })
                    }
                }
            ]
        })
    }
    render() {
        return <SPage title={"Costos"} disableScroll>
            <SText>{JSON.stringify(this.state?.costos)}</SText>
            <DinamicTable
                {...Config.table.applyTheme()}
                loadData={this.loadData}
                onSelect={this.onSelect.bind(this)}
                loadInitialState={async () => {
                    return {
                        cols: {
                            "key_compra_venta_detalle": { hidden: true },
                            "key_costo": { hidden: true }
                        }
                    }
                }}
            >
                <DinamicTable.Col key={"key"} label="key" data={e => e.row.key} />
                <DinamicTable.Col key={"descripcion"} label="descripcion" data={e => e.row.descripcion} width={300} />
                <DinamicTable.Col key={"monto"} label="monto" data={e => e.row.monto} />
                <DinamicTable.Col key={"fecha_on"} label="fecha_on" data={e => e.row.fecha_on} />
                <DinamicTable.Col key={"key_asiento_contable"} label="key_asiento_contable" data={e => e.row.key_asiento_contable} />
                <DinamicTable.Col key={"key_compra"} label="key_compra" data={e => e.row.key_compra} />
                <DinamicTable.Col key={"key_compra_venta_detalle"} label="key_compra_venta" data={e => e.row.key_compra_venta_detalle} />
                <DinamicTable.Col key={"key_costo"} label="key_costo" data={e => e.row.key_costo} />
            </DinamicTable>
        </SPage>
    }
}