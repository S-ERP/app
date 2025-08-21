import React from "react";
import { SDate, SHr, SNotification, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import SSocket from "servisofts-socket";
import { DinamicTable } from "servisofts-table";
import MDL from "../../MDL";
import Config from "../../Config";
import FloatMenu from "../../Components/FloatMenu";
import SIconApp from "../../Assets/SIconApp";
import SPageConta from "./Components/SPageConta";
import InformacionDeAjustes from "./Components/InformacionDeAjustes";
import AjusteTag from "./Components/AjusteTag";
import AjusteTagInfoPopup from "./Components/AjusteInfoPopup";
import AjusteTagDropBox from "./Components/AjusteTagDropBox";
import ajustes from "../ajustes";
import CuentaContableForm from "./Components/CuentaContableForm";
import tipo from "../whatsapp/tipo";
import { Text } from "react-native";
import FiltroNiveles from "./Components/FiltroNiveles";



export default class cuentas extends React.Component {


    len = 1;
    eq = "Desde";

    state = {
        ajustes: []
    }
    loadData() {
        if (!this.DinamicTable) return null;
        this.DinamicTable.loadData();
    }
    render() {
        return <SPage title={"Plan de cuentas"} disableScroll>
            <FiltroNiveles
                defaultLen={this.len}
                defaultEQ={this.eq}
                onChange={(len, eq) => {
                    this.len = len;
                    this.eq = eq;
                    if (this.DinamicTable) {
                        this.DinamicTable.loadData();
                    }
                }} />
            <DinamicTable {...Config.table.applyTheme()}
                ref={ref => this.DinamicTable = ref}
                selectType="multiple"
                keyExtractor={(e) => e.key}
                loadData={async () => {
                    const resp = await MDL.contabilidad.getCuentas();
                    const arr = Object.values(resp);
                    // console.log("cuentas_agrupadas", MDL.contabilidad.agruparCuentas(arr));
                    const ajustes = await MDL.contabilidad.getAjustes();
                    this.setState({ ajustes: ajustes });
                    arr.map((cuenta) => {
                        cuenta.ajustes = ajustes.filter((ajuste) => ajuste?.ajuste_empresa?.key_cuenta_contable == cuenta.key);
                    })
                    return arr.filter(e => {
                        if (!e.codigo) return false;
                        if (this.eq === "Hasta") {
                            return e.codigo.length <= this.len;
                        } else if (this.eq === "Desde") {
                            return e.codigo.length >= this.len;
                        } else if (this.eq === "Como") {
                            return e.codigo.length == this.len;
                        }
                        return false;
                    });
                    // return MDL.contabilidad.agruparCuentas(arr)
                }}


                loadInitialState={async () => {
                    return {
                        sorters: [
                            { key: "codigo", order: "asc", type: "string" }
                        ]
                    }
                }}
                onSelect={(e) => {

                }}
            >
                {/* <DinamicTable.Col key={"key"} label="Key" width={50}
                    textStyle={{ fontSize: 8, color: STheme.color.lightGray }}
                    data={e => {
                        return e.row.key
                    }}
                    customComponent={(e)=>{
                        return <SText fontSize={10}>{"open"}</SText>
                    }}
                /> */}
                <DinamicTable.Col key={"ajustes"} label="Ajustes" width={50}
                    data={e => ""}
                    customComponent={(e) => {
                        return <SView style={{
                            height: 16,
                        }} center onPress={(evt) => {
                            FloatMenu.open({
                                e: evt,
                                label: e.row.codigo + "  " + e.row.descripcion,
                                options: [

                                    {
                                        label: "Agregar Sub Cuenta", icon: <SIconApp name="Add" />, onPress: () => {
                                            console.log(e.dinamicTable.data);
                                            const agrupadas = MDL.contabilidad.agruparCuentas(e.dinamicTable.data);
                                            console.log("agrupadas", agrupadas, e.row);
                                            const hijos = e.row.hijos || [];
                                            let index = "01";
                                            let childSize = 0;
                                            if (hijos.length > 0) {
                                                index = hijos.length + 1
                                                if (index.length < 2) {
                                                    index = "0" + index
                                                }
                                                childSize = hijos[0].codigo.length
                                            }
                                            let codigo = e.row.codigo + "." + index

                                            if (codigo.length < childSize) {
                                                codigo = e.row.codigo + "." + "0".repeat(childSize - codigo.length) + index;
                                            }

                                            // const hermanas = e.dinamicTable.data.filter(r => r.codigo.startsWith(e.row.codigo + "."));
                                            CuentaContableForm.open({
                                                cuenta_contable: {
                                                    tipo: e.row.tipo,
                                                    codigo: codigo,
                                                    descripcion: "",
                                                },
                                                onChange: (e) => {
                                                    this.loadData();
                                                    // this.loadData();
                                                }
                                            })
                                        }
                                    },
                                    {
                                        label: "Editar", icon: <SIconApp name="Edit" />, onPress: () => {

                                            CuentaContableForm.open({
                                                cuenta_contable: e.row,
                                                onChange: (e) => {
                                                    this.loadData();
                                                    // this.loadData();
                                                }
                                            })
                                        }
                                    },
                                    {
                                        label: "Eliminar", icon: <SIconApp name="Delete" />, onPress: () => {
                                            SPopup.confirm({
                                                title: "Eliminar Cuenta Contable",
                                                message: "¿Estás seguro de eliminar la cuenta contable?",
                                                onPress: () => {
                                                    MDL.contabilidad.cuenta_contable.save({
                                                        key: e.row.key,
                                                        estado: 0,
                                                    }).then(e => {
                                                        this.loadData();
                                                    }).catch(error => {
                                                        console.error("Error al eliminar cuenta contable:", error);

                                                    })
                                                }
                                            })


                                        }
                                    },
                                ]
                            })
                        }}>
                            <SIconApp name="ctaAjuste2" height={10} stroke={STheme.color.lightGray} />
                        </SView>
                    }}
                />
                <DinamicTable.Col key={"tipo"} label="Tipo" width={80} data={e => e.row.tipo} cellStyle={{
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
                />
                <DinamicTable.Col key={"codigo"} label="Código" width={120} data={e => e.row.codigo} textStyle={{
                    fontWeight: "bold",
                    letterSpacing: 1.1
                }} />
                <DinamicTable.Col key={"descripcion"} label="Descripción" width={350}
                    data={e => e.row.descripcion}
                    customComponent={(e) => {
                        const space = (e?.row?.codigo || "").length * 2;
                        const aditionalStyle = {}

                        if (e?.row?.codigo?.length == 1) {
                            aditionalStyle.fontWeight = "bold";
                        }
                        return <SText style={{ ...e.textStyle, paddingStart: space, ...aditionalStyle, textTransform: "uppercase" }}>{e.data}</SText>
                    }}
                />
                <DinamicTable.Col key={"ajuste"} label="Tipo"
                    width={200}
                    data={e => (e.row.ajustes ?? []).map(r => r.key_ajuste)}
                    cellStyle={{
                        padding: 0,
                    }}
                    customComponent={e => {
                        return <AjusteTagDropBox onDrop={dropTag => {
                            if (dropTag?.ajuste_empresa?.key) {
                                // Retornamos si es el mismo ajuste
                                if (dropTag?.ajuste_empresa?.key_cuenta_contable == e.row.key) return;
                            }
                            if (dropTag?.grupo_sugerido != e?.row?.tipo) {
                                SNotification.send({
                                    title: "Error",
                                    body: "No se puede asignar un ajuste de tipo " + dropTag?.grupo_sugerido + " a una cuenta de tipo " + e?.row?.tipo,
                                    color: STheme.color.warning,
                                    time: 3000,
                                })
                                console.log("No se puede asignar un ajuste de tipo " + dropTag?.grupo_sugerido + " a una cuenta de tipo " + e?.row?.tipo);
                                return;
                            }
                            if (dropTag?.ajuste_empresa?.key) {

                                MDL.contabilidad.saveAjusteEmpresa({
                                    key: dropTag.ajuste_empresa.key,
                                    key_cuenta_contable: e.row.key,
                                }).then(() => {
                                    dropTag.ajuste_empresa.key_cuenta_contable = e.row.key;
                                    this.loadData()
                                })
                            } else {
                                MDL.contabilidad.saveAjusteEmpresa({
                                    key_empresa: MDL.empresa.select.key,
                                    key_cuenta_contable: e.row.key,
                                    key_ajuste: dropTag.key,
                                }).then((resp) => {
                                    dropTag.ajuste_empresa = resp
                                    this.loadData()
                                })
                            }

                        }}>
                            <SView col={"xs-12"} row style={{ paddingTop: 2 }}>
                                {e.row.ajustes.map((ajuste, index) => {
                                    return <AjusteTag allowDrag ajuste={ajuste} onPress={() => {
                                        AjusteTagInfoPopup.open({
                                            ajuste: ajuste,
                                            onPress: () => {
                                                this.loadData();
                                            }

                                        })
                                    }} />
                                })}
                            </SView>
                        </AjusteTagDropBox>
                    }}
                />

                {/* <DinamicTable.Col key={"fecha_on"} label="fecha_on"
                    dataType="date"
                    data={e => new SDate(e.row.fecha_on, "yyyy-MM-ddThh:mm:ss").date}
                    textStyle={{ fontSize: 10, color: STheme.color.lightGray }}
                    dateFormat="yyyy-MM-dd hh:mm"
                /> */}
            </DinamicTable>

            <SView style={{
                position: "absolute",
                top: 8,
                right: 8,
            }}>
                <InformacionDeAjustes ajustes={this.state.ajustes} />
            </SView>
        </SPage >
    }
}
