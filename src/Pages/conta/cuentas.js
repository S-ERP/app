import React from "react";
import { SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import { DinamicTable } from "servisofts-table";
import MDL from "../../MDL";
import Config from "../../Config";
import FloatMenu from "../../Components/FloatMenu";
import SIconApp from "../../Assets/SIconApp";
import InformacionDeAjustes from "./Components/InformacionDeAjustes";
import AjusteTag from "./Components/AjusteTag";
import AjusteTagInfoPopup from "./Components/AjusteInfoPopup";
import AjusteTagDropBox from "./Components/AjusteTagDropBox";
import ajustes from "../ajustes";
import CuentaContableForm from "./Components/CuentaContableForm";
import FiltroNiveles from "./Components/FiltroNiveles"; export default class cuentas extends React.Component {

    componentDidMount() {
        MDL.rolesPermisos.getPermisoAsync({ url: "/conta/cuentas", permiso: "ver" }).then((permit) => {
            if (!permit) {
                SNavigation.goBack();
                return;
            }
        }).catch(e => {
            console.error(e);
        })
    }

    len = 1;
    eq = "Desde";
    state = {
        ajustes: []
    }

    loadData() {
        if (!this.DinamicTable) return null;
        this.DinamicTable.loadData();
    }

    handleSelect(e) {
        FloatMenu.open({
            e: e.evt,
            label: e.row.codigo + "" + e.row.descripcion,
            style: { maxWidth: 200},
            onClose: () => {
                e.dinamicTable.clearSelect()
            },
            options: [
                ... (MDL.rolesPermisos.getPermiso({ url: "/conta/cuentas", permiso: 'new' }) ? [
                    {
                        label: "Agregar Sub Cuenta", icon: <SIconApp name="Add" />, onPress: () => {
                            const grafo = MDL.contabilidad.getCuentasGrafo(e.dinamicTable.data);
                            const cuenta = grafo.find(n => n.codigo === e.row.codigo);
                            const hijos = cuenta.childrens || [];
                            let index = "01";
                            let childSize = 0;
                            if (hijos.length > 0) {
                                index = hijos.length + 1
                                if (index.length < 2) {
                                    index = "0" + index
                                }
                                childSize = hijos[0].codigo.length
                            } else {
                                const niveles = MDL.contabilidad.armarNiveles(e.dinamicTable.data);
                                const lvlPadre = e.row.codigo.length;
                                const indexLvl = niveles.findIndex(n => n == lvlPadre) + 1;
                                if (indexLvl > 0 && niveles[indexLvl]) {
                                    childSize = niveles[indexLvl];
                                }
                            }
                            let codigo = e.row.codigo + "." + index
                            if (codigo.length < childSize) {
                                codigo = e.row.codigo + "." + "0".repeat(childSize - codigo.length) + index;
                            }
                            let key_moneda = cuenta.key_moneda;
                            if (!key_moneda) {
                                let cc = cuenta;
                                while (cc.parent) {
                                    cc = cc.parent;
                                    key_moneda = cc.key_moneda;
                                    if (key_moneda) break;
                                }
                            }
                            CuentaContableForm.open({
                                cuenta_contable: {
                                    tipo: e.row.tipo,
                                    codigo: codigo,
                                    descripcion: "",
                                    key_moneda: key_moneda,
                                },
                                onChange: (e) => {
                                    this.loadData();
                                }
                            })
                        }
                    }
                ] : []), ...(MDL.rolesPermisos.getPermiso({ url: "/conta/cuentas", permiso: 'edit' }) ? [{
                    label: "Editar", icon: <SIconApp name="Edit" />, onPress: () => {
                        CuentaContableForm.open({
                            cuenta_contable: e.row,
                            onChange: (e) => {
                                this.loadData();
                            }
                        })
                    }
                }
                ] : []),
                ...(MDL.rolesPermisos.getPermiso({ url: "/conta/cuentas", permiso: 'delete' }) ? [
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
                    }
                ] : []),
            ]
        })
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
                keyExtractor={(e) => e.key}
                loadData={async () => {
                    const resp = await MDL.contabilidad.getCuentas();
                    const arr = Object.values(resp);
                    const ajustes = await MDL.contabilidad.getAjustes();
                    const empresa = await MDL.empresa.getFull();
                    this.setState({ ajustes: ajustes });
                    arr.map((cuenta) => {
                        if (cuenta.key_moneda) {
                            cuenta.moneda = empresa.monedas.find((m) => m.key == cuenta.key_moneda);
                        }
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
                }} loadInitialState={async () => {
                    return {
                        sorters: [
                            { key: "codigo_s", order: "asc", type: "number" },
                            { key: "codigo", order: "asc", type: "string" },
                        ]
                    }
                }}
                selectType="single"
                onSelect={(e) => {
                    this.handleSelect(e);
                }}
            >
                <DinamicTable.Col key={"tipo"} label="Tipo" width={80} data={e => e.row.tipo} cellStyle={{ alignItems: "center", justifyContent: "center"}} textStyle={{ fontSize: 7 }}
                    customComponent={e => {
                        const aditionalStyle = { borderWidth: 1, borderColor: MDL.contabilidad.color_tipo[e.row.tipo], backgroundColor: MDL.contabilidad.color_tipo[e.row.tipo] + "55", padding: 3, borderRadius: 4};
                        return <SText clean style={{ ...e.textStyle, ...aditionalStyle }}>{e.data}</SText>
                    }}
                />
                <DinamicTable.Col key={"key_moneda"} label="Moneda" width={60} data={e => e.row?.moneda?.descripcion} cellStyle={{ alignItems: "center", justifyContent: "center"}} textStyle={{ fontSize: 10 }} />
                <DinamicTable.Col key={"codigo_s"} label="Código Start" width={30}
                    data={e => parseFloat((e.row?.codigo ?? "").split(".")?.[0])}
                    dataType="number"
                />
                <DinamicTable.Col key={"codigo"} label="Código" width={120} data={e => e.row.codigo}
                    textStyle={{ fontWeight: "bold", letterSpacing: 1.1 }} />
                <DinamicTable.Col key={"descripcion"} label="Descripción" width={350}
                    data={e => e.row.descripcion}
                    customComponent={(e) => {
                        const space = (e?.row?.codigo || "").length * 2;
                        const aditionalStyle = {};
                        if (e?.row?.codigo?.length == 1) {
                            aditionalStyle.fontWeight = "bold";
                        }
                        return <SText style={{ ...e.textStyle, paddingStart: space, ...aditionalStyle, textTransform: "uppercase" }}>{e.data}</SText>
                    }}
                />
                <DinamicTable.Col key={"ajuste"} label="Tipo"
                    width={200}
                    data={e => (e.row.ajustes ?? []).map(r => r.key_ajuste)}
                    cellStyle={{ padding: 0}}
                    customComponent={e => {
                        return <AjusteTagDropBox onDrop={dropTag => {
                            if (dropTag?.ajuste_empresa?.key) {
                                if (dropTag?.ajuste_empresa?.key_cuenta_contable == e.row.key) return;
                            }
                            if (dropTag?.grupo_sugerido != e?.row?.tipo) {
                                SNotification.send({
                                    title: "Error",
                                    body: "No se puede asignar un ajuste de tipo " + dropTag?.grupo_sugerido + " a una cuenta de tipo " + e?.row?.tipo,
                                    color: STheme.color.warning,
                                    time: 3000,
                                })
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
            </DinamicTable>
            <SView style={{ position: "absolute", top: 8, right: 8}}>
                <InformacionDeAjustes ajustes={this.state.ajustes} />
            </SView>
        </SPage>
    }
}