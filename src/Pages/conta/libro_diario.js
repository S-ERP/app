import React from "react";
import { SInput, SPage, SText, STheme, SView } from "servisofts-component";
import SSocket from "servisofts-socket";
import MDL from "../../MDL";
import { DinamicTable } from "servisofts-table";
import Config from "../../Config";

export default class libro_diario extends React.Component {
    // static HIDDEN= true;
    dinamicTable: DinamicTable<any>;
    componentDidMount() {
       
    }
    async loadData() {
        try {
            const data = await MDL.contabilidad.reporte_libro_diario();
            return data;
        } catch (error) {
            console.log(error);
            throw error
        }
    }

    numberColor(val) {
        val = parseFloat(val || "0");
        if (val > 0) return STheme.color.text;
        if (val < 0) return STheme.color.danger;
        return STheme.color.card;
    }
    render() {
        return <SPage title={"Libro Diario"} center disableScroll>
            <SView col={"xs-12"} flex>
                <DinamicTable
                    ref={(e) => this.dinamicTable = e}
                    {...Config.table.applyTheme()}
                    loadData={this.loadData.bind(this)}
                    keyExtractor={(e) => e.key}
                    selectType="multiple"
                >
                    <DinamicTable.Col key="tipo" label="Tipo" data={e => e.row?.asiento_contable?.tipo} />
                    <DinamicTable.Col key="codigo" label="Código" data={e => e.row?.asiento_contable?.codigo} />
                    {/* <DinamicTable.Col key={"tipo"} label="Tipo" width={80} data={e => e.row.tipo} cellStyle={{
                        alignItems: "center",
                        justifyContent: "center",
                    }} textStyle={{
                        fontSize: 7
                    }}
                        customComponent={e => {
                            const aditionalStyle = {
                                borderWidth: 1,
                                borderColor: MDL.contabilidad.color_tipo[e.row.tipo],
                                backgroundColor: MDL.contabilidad.color_tipo[e.row.tipo] + "55",
                                padding: 3,
                                borderRadius: 4,
                            };
                            return <SText clean style={{ ...e.textStyle, ...aditionalStyle }}>{e.data}</SText>
                        }}
                    /> */}
                    {/* <DinamicTable.Col key="codigo" label="Código" data={e => e.row.codigo} /> */}
                    <DinamicTable.Col key={"descripcion"} label="descripcion" width={350}
                        data={e => e.row.descripcion}
                        customComponent={(e) => {
                            const space = (e?.row?.codigo || "").length * 2;
                            const aditionalStyle = {}

                            if (e?.row?.codigo?.length == 1) {
                                aditionalStyle.fontWeight = "bold";
                            }
                            return <SText style={{ ...e.textStyle, paddingStart: space, ...aditionalStyle }}>{e.data}</SText>
                        }}
                    />
                    <DinamicTable.Col key="debe" label="Debe"
                        data={e => e.row.debe}
                        customComponent={(e) => {
                            const space = (e?.row?.codigo || "").length * 2;
                            return <SText style={{ ...e.textStyle, paddingStart: space, color: this.numberColor(e.data || "0") }}>{e.data || "0"}</SText>
                        }}
                    />
                    <DinamicTable.Col key="haber" label="Haber" data={e => e.row.haber}
                        customComponent={(e) => {
                            const space = (e?.row?.codigo || "").length * 2;
                            const val = e.data || "0"
                            return <SText style={{ ...e.textStyle, paddingStart: space, color: this.numberColor(val) }}>{val}</SText>
                        }} />
                    {/* <DinamicTable.Col key="saldo" label="Saldo"
                        data={e => ["ACTIVO", "GASTO"].includes(e.row.tipo) ? ((e.row.debe || 0) - (e.row.haber || 0)) : ((e.row.haber || 0) - (e.row.debe || 0))}
                        customComponent={(e) => {
                            const space = (e?.row?.codigo || "").length * 2;
                            return <SText style={{ ...e.textStyle, paddingStart: space, color: this.numberColor(e.data || "0") }}>{e.data || "0"}</SText>
                        }}
                    /> */}
                </DinamicTable>
            </SView>
        </SPage >
    }
}