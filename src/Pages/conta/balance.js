import React from "react";
import { SInput, SMath, SPage, SText, STheme, SView, SNavigation } from "servisofts-component";
import SPageConta from "./Components/SPageConta";
import SSocket from "servisofts-socket";
import MDL from "../../MDL";
import { DinamicTable } from "servisofts-table";
import Config from "../../Config";

export default class conta extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    dinamicTable: DinamicTable<any>;
    nivelLen = 1;
    nivelEQ = "Hasta";
    nivelTipoComprobante = "Todos";

    componentDidMount() {
        MDL.rolesPermisos.getPermisoAsync({ url: "/conta/balance", permiso: "ver" }).then((permit) => {
            if (!permit) {
                SNavigation.goBack();
                return;
            }
        })
        MDL.contabilidad.getNivelesPlanCuentas().then((niveles) => {
            this.niveles = niveles;
            this.nivelLen = niveles[0].len ?? 1;
            this.dinamicTable.loadData();
            this.forceUpdate();
        })
    }

    async loadData() {
        try {
            const todasCuentas = await MDL.contabilidad.reporte_balance_general();
            const cuentas = this.nivelTipoComprobante === "Todos" ? todasCuentas : await MDL.contabilidad.reporte_balance_general_tipo_comprobante();
            const nivelLen = this.niveles?.[this.nivelLen - 1]?.len || "1"
            const codigosNivel = todasCuentas.filter(e => {
                if (!e.codigo) return false;
                let pasaNivel = false;
                if (this.nivelEQ === "Hasta") {
                    pasaNivel = e.codigo.length <= nivelLen;
                } else if (this.nivelEQ === "Desde") {
                    pasaNivel = e.codigo.length >= nivelLen;
                } else if (this.nivelEQ === "Como") {
                    pasaNivel = e.codigo.length == nivelLen;
                }
                return pasaNivel;
            }).map(e => e.codigo);
            if (this.nivelTipoComprobante === "Todos") {
                return cuentas.filter(e => codigosNivel.includes(e.codigo));
            }
            const cuentasPorCodigo = {};
            cuentas.forEach(e => {
                if (!e.codigo) return;
                const tipoComprobante = (e.tipo_comprobante || "").toLowerCase();
                cuentasPorCodigo[e.codigo + "__" + tipoComprobante] = e;
            });
            return codigosNivel.map(codigo => {
                const key = codigo + "__" + this.nivelTipoComprobante.toLowerCase();
                const found = cuentasPorCodigo[key];
                if (found) return found;
                const base = todasCuentas.find(e => e.codigo === codigo) || {};
                return {
                    ...base,
                    tipo_comprobante: this.nivelTipoComprobante,
                    debe: 0,
                    haber: 0,
                    debe_me: 0,
                    haber_me: 0,
                };
            });
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
        return <SPage title={"Balance general"} center disableScroll>
            <SView row col={"xs-12"} style={{ alignItems: "center" }}>

                <SView width={"100%"} height={80} />

                {this.niveles && <SView width={60}><SInput type="select2"
                    style={{ padding: 2, height: 30, textAlign: "center" }}
                    defaultValue={this.nivelEQ + ""}
                    options={["Hasta", "Desde", "Como"]} onChangeText={e => {
                        this.nivelEQ = e;
                        if (this.dinamicTable) this.dinamicTable.loadData();
                    }} /></SView>}
                <SView width={2} />
                <SText>{"el nivel"}</SText>
                <SView width={2} />
                {this.niveles && <SView width={70}><SInput type="select2"
                    width={70}
                    style={{ padding: 2, height: 30, textAlign: "center" }}
                    defaultValue={this.nivelLen + ""}
                    options={this.niveles.map((a, i) => (i + 1) + "")} onChangeText={e => {
                        this.nivelLen = parseFloat(e || "1");
                        if (this.dinamicTable) this.dinamicTable.loadData();
                    }} /></SView>}
                <SView width={20} />
                {this.niveles && <SView width={60}><SInput type="select2"
                    label={"Tipo comprobante"}

                    customStyle={"erp"}


                    style={{ padding: 2, height: 30, textAlign: "center", width: 110 }}
                    defaultValue={this.nivelTipoComprobante}
                    options={["Todos", "Fiscal", "Interno", "Mixto"]} onChangeText={e => {
                        this.nivelTipoComprobante = e;
                        if (this.dinamicTable) this.dinamicTable.loadData();
                    }} /></SView>}
            </SView>
            <SView col={"xs-12"} flex>
                <DinamicTable
                    ref={(e) => this.dinamicTable = e}
                    {...Config.table.applyTheme()}
                    loadData={this.loadData.bind(this)}
                    loadInitialState={async () => {
                        return {
                            sorters: [
                                { key: "codigo", order: "asc", type: "string" }
                            ]
                        }
                    }}
                    selectType="multiple"
                >

                    <DinamicTable.Col key={"tipo"} label="Tipo" width={80} data={e => e.row.tipo} cellStyle={{ alignItems: "center", justifyContent: "center", }} textStyle={{ fontSize: 7 }}
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
                    />

                    <DinamicTable.Col key={"tipo_comprobante"} label="Tipo Comprobante" width={100} data={e => e.row.tipo_comprobante || "-"} cellStyle={{ alignItems: "center", justifyContent: "center", }} textStyle={{ fontSize: 7 }}
                        customComponent={e => {
                            return <SText style={{ ...e.textStyle }}>{e.data ? e.data.toUpperCase() : "-"}</SText>
                        }}
                    />

                    <DinamicTable.Col key="codigo" label="Código" data={e => e.row.codigo} />
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
                            return <SText style={{ ...e.textStyle, paddingStart: space, color: this.numberColor(e.data || "0") }}>{SMath.formatMoney(e.data || "0")}</SText>
                        }}
                    />
                    <DinamicTable.Col key="haber" label="Haber" data={e => e.row.haber}
                        customComponent={(e) => {
                            const space = (e?.row?.codigo || "").length * 2;
                            const val = e.data || "0"
                            return <SText style={{ ...e.textStyle, paddingStart: space, color: this.numberColor(val) }}>{SMath.formatMoney(val)}</SText>
                        }} />
                    <DinamicTable.Col key="saldo" label="Saldo"
                        data={e => ["ACTIVO", "GASTO"].includes(e.row.tipo) ? ((e.row.debe || 0) - (e.row.haber || 0)) : ((e.row.haber || 0) - (e.row.debe || 0))}
                        customComponent={(e) => {
                            const space = (e?.row?.codigo || "").length * 2;
                            return <SText style={{ ...e.textStyle, paddingStart: space, color: this.numberColor(e.data || "0") }}>{SMath.formatMoney(e.data || "0")}</SText>
                        }}
                    />
                </DinamicTable>
            </SView>
        </SPage >
    }
}