import React from "react";
import { SInput, SText, SView } from "servisofts-component";
import SPageConta from "./Components/SPageConta";
import SSocket from "servisofts-socket";
import MDL from "../../MDL";
import { DinamicTable } from "servisofts-table";
import Config from "../../Config";

export default class conta extends React.Component {
    dinamicTable: DinamicTable<any>;
    nivelLen = 1;
    componentDidMount() {
        MDL.contabilidad.getNivelesPlanCuentas().then((niveles) => {
            this.niveles = niveles;
            this.nivelLen = niveles[0].len ?? 1;
            this.dinamicTable.loadData();
            this.forceUpdate();
        })
    }
    async loadData() {
        const cuentas = await MDL.contabilidad.reporte_balance_general();
        return cuentas.filter(e => e.codigo.length <= this.nivelLen)
    }
    render() {
        return <SPageConta title={"Balance general"} center disableScroll>
            {this.niveles && <SInput type="select2"
                width={70}
                style={{
                    padding: 2,
                    height: 30
                }}
                defaultValue={this.nivelLen + ""}
                icon={<SText>{"Nivel: "}</SText>}
                options={this.niveles.map(a => a.len + "")} onChangeText={e => {
                    this.nivelLen = parseFloat(e || "1");
                    this.dinamicTable.loadData();
                }} />}
            <SView col={"xs-12"} flex>
                <DinamicTable
                    ref={(e) => this.dinamicTable = e}
                    {...Config.table.applyTheme()}
                    loadData={this.loadData.bind(this)}
                    selectType="multiple"
                >
                    <DinamicTable.Col key="codigo" label="Código" data={e => e.row.codigo} />
                    {/* <DinamicTable.Col key="descripcion" label="Descripcion" data={e => e.row.descripcion} /> */}
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
                    {/* <DinamicTable.Col key="debe" label="Debe" data={e => e.row.debe}/> */}
                    {/* <DinamicTable.Col key="haber" label="Haber" data={e => e.row.haber}/> */}
                    <DinamicTable.Col key="saldo" label="Saldo"
                        data={e => ["ACTIVO", "INGRESO"].includes(e.row.tipo) ? ((e.row.debe || 0) - (e.row.haber || 0)) : ((e.row.haber || 0) - (e.row.debe || 0))}
                        // data={e => ((e.row.debe || 0) - (e.row.haber || 0))}
                    />
                </DinamicTable>
            </SView>
        </SPageConta >
    }
}