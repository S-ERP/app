import React from "react";
import { SInput, SMath, SPage, SText, STheme, SView } from "servisofts-component";
import SSocket from "servisofts-socket";
import { DinamicTable } from "servisofts-table";
import MDL from "../../../MDL";

export default class FiltroNiveles extends React.Component<{
    onChange: (nivelLen: number, nivelEQ: string) => void,
    defaultLen?: number,
    defaultEQ?: "Hasta" | "Desde" | "Como"
}> {
    // dinamicTable: DinamicTable<any> | null = null;
    nivelLen = this.props.defaultLen || 1;
    nivelEQ = this.props.defaultEQ || "Hasta";
    niveles = null;

    componentDidMount(): void {
        MDL.contabilidad.getNivelesPlanCuentas().then((niveles) => {
            this.niveles = niveles;
            this.nivelLen = niveles[0].len ?? 1;
            this.forceUpdate();
        })
    }
    handleChange() {
        const nivelLen = this.niveles?.[this.nivelLen - 1]?.len || "1"
        if (this.props.onChange) {
            this.props.onChange(parseFloat(nivelLen), this.nivelEQ);
        }
    }
    render() {
        return <SView row col={"xs-12"} style={{ alignItems: "center" }}>
            {this.niveles && <SView width={60}><SInput type="select2"
                style={{
                    padding: 2,
                    height: 30,
                    textAlign: "center"
                }}
                defaultValue={this.nivelEQ + ""}
                options={["Hasta", "Desde", "Como"]} onChangeText={e => {
                    this.nivelEQ = e;
                    this.handleChange();
                    // if (this.dinamicTable) this.dinamicTable.loadData();
                }} /></SView>}
            <SView width={2} />
            <SText>{"el nivel"}</SText>
            <SView width={2} />
            {this.niveles && <SView width={70}><SInput type="select2"
                width={70}
                style={{
                    padding: 2,
                    height: 30,
                    textAlign: "center"
                }}
                defaultValue={this.nivelLen + ""}
                options={this.niveles.map((a, i) => (i + 1) + "")} onChangeText={e => {
                    this.nivelLen = parseFloat(e || "1");
                    this.handleChange();
                    // if (this.dinamicTable) this.dinamicTable.loadData();
                }} /></SView>}
        </SView>

    }
}