import React from "react";
import { SInput, SMath, SNavigation, SPage, SText, STheme, SView } from "servisofts-component";
import SSocket from "servisofts-socket";
import MDL from "../../MDL";
import { DinamicTable } from "servisofts-table";
import Config from "../../Config";

export default class libro_diario extends React.Component {
    // static HIDDEN= true;
    dinamicTable: DinamicTable<any>;
    componentDidMount() {

        MDL.rolesPermisos.getPermisoAsync({ url: "/conta/libro_diario", permiso: "ver" }).then((permit) => {
            if (!permit) {
                SNavigation.goBack();
                return;
            }
        }).catch(e => {
            console.error(e);
        })

    }
    async loadData() {
        try {
            const empresa = await MDL.empresa.getFull();
            const data = await MDL.contabilidad.reporte_libro_diario();
            const monedabase = empresa.monedas.find(b => b.tipo == "base")
            let tagsKeys = {};
            data.map(a => {
                a.moneda = empresa.monedas.find(b => b.key == a.key_moneda)
                a.moneda_base = monedabase
                if (a.tags) {
                    tagsKeys = { ...tagsKeys, ...a.tags }
                }
            })

            console.log(Object.keys(tagsKeys))

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
                    loadInitialState={async () => {
                        return {
                            cols: {
                                debe_sin_format: {
                                    hidden: true,
                                },
                                haber_sin_format: {
                                    hidden: true,
                                },
                                debe_me_sin_format: {
                                    hidden: true,
                                },
                                haber_me_sin_format: {
                                    hidden: true,
                                },
                            }
                        }
                    }}
                    keyExtractor={(e) => e.key}
                    selectType="multiple"
                >
                    <DinamicTable.Col key="tipo" label="Tipo" data={e => e.row?.asiento_contable?.tipo} width={60}
                        customComponent={e => {
                            let color = STheme.color.lightGray;
                            if (e.data == "ingreso") {
                                color = STheme.color.success
                            }
                            if (e.data == "egreso") {
                                color = STheme.color.danger
                            }

                            return <SView
                                style={{
                                    ...e.textStyle,
                                    backgroundColor: color + "66",
                                    padding: 2,
                                    borderRadius: 4,
                                }}><SText
                                    center
                                    style={{
                                        ...e.textStyle,
                                        fontSize: 8
                                    }}
                                >{e.data.toUpperCase()}</SText>
                            </SView>
                        }
                        }
                    />
                    <DinamicTable.Col key="codigo" label="Código" data={e => e.row?.asiento_contable?.codigo} width={80} customComponent={e => <SText
                        style={{
                            ...e.textStyle,
                            color: STheme.colorFromText(e.row.fecha_on)

                        }}
                        numberOfLines={e.colData.wrap ? 0 : 1}
                        bold
                        onPress={() => {
                            // contabilidad/asiento_contable/profile?pk=5b8b2f0f-54f5-4cb0-9118-87bd0d91d459
                            SNavigation.navigate("/contabilidad/asiento_contable/profile", { pk: e.row.asiento_contable.key })
                        }}
                    >{e.data}</SText>}

                    />
                    <DinamicTable.Col key="cuenta_codigo" label="Código Cuenta" data={e => e.row?.cuenta_contable?.codigo}
                        width={70}
                        textStyle={{
                            textAlign: "right",
                            color: STheme.color.lightGray,
                        }}
                    />
                    <DinamicTable.Col key="cuenta_nombre" label="Nombre Cuenta" data={e => e.row?.cuenta_contable?.descripcion} width={150}
                        textStyle={{
                            color: STheme.color.lightGray,
                        }} />
                    <DinamicTable.Col key="diario" label="Diario" data={e => e.row?.diario?.descripcion} width={150}
                        textStyle={{
                            color: STheme.color.lightGray,
                        }} />
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
                    <DinamicTable.Col key={"descripcion"} label="descripcion" width={200}
                        data={e => e.row.descripcion}
                        customComponent={(e) => {
                            const space = (e?.row?.codigo || "").length * 2;
                            const aditionalStyle = {}

                            if (e?.row?.codigo?.length == 1) {
                                aditionalStyle.fontWeight = "bold";
                            }
                            return <SText numberOfLines={e.colData.wrap ? 0 : 1} style={{ ...e.textStyle, paddingStart: space, ...aditionalStyle }}>{e.data}</SText>
                        }}
                    />
                    <DinamicTable.Col key="moneda" label="Moneda" data={e => e.row.moneda?.descripcion}
                        cellStyle={{
                            // backgroundColor: STheme.color.danger + "33"
                            alignItems: "center"
                        }}
                        textStyle={{
                            fontWeight: "bold"
                        }}
                    />
                    <DinamicTable.Col key="debe" label="Debe"
                        data={e => e.row.debe}
                        cellStyle={{
                            backgroundColor: STheme.color.success + "33",
                            alignItems: "flex-end"
                        }}
                        textStyle={{
                            fontWeight: "bold"
                        }}
                        customComponent={(e) => {
                            const space = (e?.row?.codigo || "").length * 2;
                            return <SText numberOfLines={e.colData.wrap ? 0 : 1} style={{ ...e.textStyle, paddingStart: space, color: this.numberColor(e.data || "0") }}>{e.row.moneda_base?.observacion} {SMath.formatMoney(e.data || "0")}</SText>
                            // return <SText style={{ ...e.textStyle, paddingStart: space, color: this.numberColor(e.data || "0") }}>{e.data || "0"}</SText>
                        }}
                    />

                    <DinamicTable.Col key="haber" label="Haber" data={e => e.row.haber}
                        cellStyle={{
                            backgroundColor: STheme.color.danger + "33",
                            alignItems: "flex-end"
                        }}
                        textStyle={{
                            fontWeight: "bold"
                        }}
                        customComponent={(e) => {
                            const space = (e?.row?.codigo || "").length * 2;
                            const val = e.data || "0"
                            return <SText numberOfLines={e.colData.wrap ? 0 : 1} style={{ ...e.textStyle, paddingStart: space, color: this.numberColor(val) }}>{e.row.moneda_base?.observacion} {SMath.formatMoney(val)}</SText>
                            // return <SText style={{ ...e.textStyle, paddingStart: space, color: this.numberColor(val) }}>{val}</SText>
                        }} />



                    <DinamicTable.Col key="debe_me" label="Debe M/E"
                        data={e => e.row.debe_me}
                        cellStyle={{
                            backgroundColor: STheme.color.success + "33",
                            alignItems: "flex-end"
                        }}
                        customComponent={(e) => {
                            const space = (e?.row?.codigo || "").length * 2;
                            return <SText numberOfLines={e.colData.wrap ? 0 : 1} style={{ ...e.textStyle, paddingStart: space, color: this.numberColor(e.data || "0") }}>{e.row.moneda?.observacion} {SMath.formatMoney(e.data || "0")}</SText>
                            // return <SText style={{ ...e.textStyle, paddingStart: space, color: this.numberColor(e.data || "0") }}>{e.data || "0"}</SText>
                        }}
                    />
                    <DinamicTable.Col key="haber_me" label="Haber M/E" data={e => e.row.haber_me}
                        cellStyle={{
                            backgroundColor: STheme.color.danger + "33",
                            alignItems: "flex-end"
                        }}
                        customComponent={(e) => {
                            const space = (e?.row?.codigo || "").length * 2;
                            const val = e.data || "0"
                            return <SText numberOfLines={e.colData.wrap ? 0 : 1} style={{ ...e.textStyle, paddingStart: space, color: this.numberColor(val) }}>{e.row.moneda?.observacion} {SMath.formatMoney(val)}</SText>
                            // return <SText style={{ ...e.textStyle, paddingStart: space, color: this.numberColor(val) }}>{val}</SText>
                        }} />

                    <DinamicTable.Col key="debe_sin_format" wrap label="Debe Sin Formato"
                        data={e => e.row.debe}
                        cellStyle={{
                            alignItems: "flex-end"
                        }}
                    />
                    <DinamicTable.Col key="haber_sin_format" wrap label="Haber Sin Formato" data={e => e.row.haber}
                        cellStyle={{
                            alignItems: "flex-end"
                        }}

                    />
                    <DinamicTable.Col key="debe_me_sin_format" wrap label="Debe Moneda Extranjera Sin Formato"
                        data={e => e.row.debe_me}
                        cellStyle={{
                            alignItems: "flex-end"
                        }}
                    />
                    <DinamicTable.Col key="haber_me_sin_format" wrap label="Haber Moneda Extranjera Sin Formato"
                        data={e => e.row.haber_me}
                        cellStyle={{
                            alignItems: "flex-end"
                        }}

                    />
                    <DinamicTable.Col key="tags"
                        wrap
                        label="Tags"
                        width={500}
                        data={e => JSON.stringify(e.row?.tags, "\n", "\t")}
                        cellStyle={{
                            // alignItems: "flex-end"
                        }}

                    />
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