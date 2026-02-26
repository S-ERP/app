import React from "react";
import { SHr, SInput, SNavigation, SNotification, SPage, SPopup, SText, STheme, SUuid, SView } from "servisofts-component";
import MDL from "../../MDL";
import FloatMenu from "../../Components/FloatMenu";
import SIconApp from "../../Assets/SIconApp";
import { Container } from "../../Components";
import FormCentroCostoTipo from "./Components/FormCentroCostoTipo";
import FormCentroCosto from "./Components/FormCentroCosto";

export default class centro_costo extends React.Component {

    onSelect = SNavigation.getParam("onSelect")

    centro_costo_tipo = [];

    componentDidMount() {
        this.loadData();
    }
    async loadData() {
        this.centro_costo_tipo = await MDL.contabilidad.centro_costo_tipo.getAll();
        this.centro_costo = await MDL.contabilidad.centro_costo.getAll();
        this.centro_costo_tipo.map(cct => {
            cct.centros = this.centro_costo.filter(a => a.key_centro_costo_tipo == cct.key);
        })
        this.forceUpdate();
        return this.centro_costo_tipo;
    }
    _ref = {}
    render() {
        return <SPage title={"centro_costo"} >
            <SHr />
            <Container >
                <SView padding={16} card col={"xs-12"}>
                    <SInput
                        required={"true"}
                        ref={ref => this.ref_tipo = ref}
                        style={{ maxWidth: 500 }}
                        col={"xs-12"}
                        customStyle={"erp"}
                        label={"Crear tipo"}
                        placeholder={"Escribe el tipo"}
                        iconR={<SView flex center onPress={() => {
                            const value = this.ref_tipo.getValue();
                            if (!value) return SNotification.send({
                                key: "centro_costo_tipo_error",
                                title: "El nombre del tipo de centro de costo es requerido",
                                color: STheme.color.danger,
                                time: 5000,
                            });
                            console.log(value);

                            MDL.contabilidad.centro_costo_tipo.registrar({
                                descripcion: value,
                            }).then(e => {
                                this.loadData();
                                this.ref_tipo.setValue("");
                            }).catch(e => {
                                console.log("error", e)
                            })

                        }}><SText card style={{
                            backgroundColor: STheme.color.primary,
                            fontSize: 11,
                            padding: 5
                        }}>{"CREAR"}</SText></SView>} />
                </SView>
                <SHr h={8} />
                <SView col={"xs-12"} card height={3} />
                <SHr h={8} />
                {this.centro_costo_tipo.map((tipo) => {
                    return <SView col={"xs-12"} padding={4} card style={{
                        marginBottom: 8,
                    }}>
                        <SView col={"xs-12"} flex style={{ alignItems: "flex-end" }}>
                            <SView row onPress={() => {
                                // this.ref_tipo.setValue(tipo.descripcion);
                                // this.ref_tipo.focus();
                                FormCentroCostoTipo.open({
                                    defaultData: tipo,
                                    onActualizar: (nuevoDato) => {
                                        this.loadData();
                                        console.log("Centro de costo actualizado:", nuevoDato);
                                    }
                                });
                            }}>
                                <SView>
                                    <SIconApp name="Edit" width={25} />
                                </SView>
                                <SView width={8} />
                                <SView onPress={() => {
                                    SPopup.confirm({
                                        title: "¿Eliminar tipo de centro de costo?",
                                        message: "Se eliminarán todos los centros de costo relacionados a este tipo",
                                        onPress: () => {

                                            MDL.contabilidad.centro_costo_tipo.eliminar({
                                                key: tipo.key
                                            }).then(e => {
                                                SNotification.send({
                                                    key: "centro_costo_tipo_eliminado",
                                                    title: "Tipo de centro de costo eliminado",
                                                    color: STheme.color.success,
                                                    time: 5000,
                                                })
                                                this.loadData();
                                            }).catch(e => {
                                                SNotification.send({
                                                    key: "centro_costo_tipo_error",
                                                    title: "Error al eliminar tipo de centro de costo",
                                                    color: STheme.color.danger,
                                                    time: 5000,
                                                })

                                            })
                                        }
                                    })

                                }}>
                                    <SIconApp name="Delete" width={25} />
                                </SView>

                            </SView>

                        </SView>
                        <SHr />
                        <SView col={"xs-12"} row padding={10} style={{
                            backgroundColor: STheme.color.gray + "60"
                        }} >
                            {/* <SText fontSize={17}>{"-"}</SText> */}
                            <SView width={8} height={8} center style={{ backgroundColor: STheme.color.lightGray, borderRadius: 50, top: 8 }} />
                            <SView width={8} />
                            <SText bold fontSize={18}
                            // onPress={(e) => {
                            //     FloatMenu.open({
                            //         e: e,
                            //         options: [
                            //             {
                            //                 icon: <SIconApp name="Delete" />,
                            //                 label: "Eliminar",
                            //                 onPress: () => {
                            //                     SPopup.confirm({
                            //                         title: "¿Eliminar el centro de costo?",
                            //                         message: "Se eliminará el centro de costo seleccionado",
                            //                         onPress: () => {

                            //                             MDL.contabilidad.centro_costo_tipo.eliminar({
                            //                                 key: tipo.key
                            //                             }).then(e => {
                            //                                 SNotification.send({
                            //                                     key: "centro_costo_tipo_eliminado",
                            //                                     title: "Tipo de centro de costo eliminado",
                            //                                     color: STheme.color.success,
                            //                                     time: 5000,
                            //                                 })
                            //                                 this.loadData();
                            //                             }).catch(e => {
                            //                                 SNotification.send({
                            //                                     key: "centro_costo_tipo_error",
                            //                                     title: "Error al eliminar el centro de costo",
                            //                                     color: STheme.color.danger,
                            //                                     time: 5000,
                            //                                 })

                            //                             })
                            //                         }
                            //                     })
                            //                     // MDL.contabilidad.centro_costo_tipo.eliminar({
                            //                     //     key: tipo.key
                            //                     // }).then(e => {
                            //                     //     this.loadData();
                            //                     // }).catch(e => {
                            //                     // })
                            //                 }
                            //             }
                            //         ]
                            //     })
                            // }}
                            >{tipo.descripcion}</SText>
                        </SView>
                        <SHr />
                        <SView style={{
                            paddingHorizontal: 20,
                            marginBottom: 10,
                        }}>
                            {tipo.centros.map(cc => {
                                return <SView col={"xs-12"} row style={{
                                    borderBottomWidth: 0.5,
                                    borderBottomColor: STheme.color.lightGray + "50",
                                    padding: 8
                                }}>
                                    <SIconApp name="vineta1" width={14} height={12} fill={STheme.color.lightGray} style={{ marginTop: 4 }} />
                                    {/* <SText fontSize={17}>{"-"}</SText> */}
                                    <SView width={8} />
                                    <SText fontSize={16} onPress={(e) => {
                                        FloatMenu.open({
                                            e: e,
                                            options: [
                                                {
                                                    icon: <SIconApp name="Edit" />,
                                                    label: "Editar",
                                                    onPress: () => {
                                                        FormCentroCosto.open({
                                                            defaultData: cc,
                                                            onActualizar: (nuevoDato) => {
                                                                this.loadData();
                                                                console.log("Centro de costo actualizado:", nuevoDato);
                                                            }
                                                        });

                                                        // if (this.onSelect) {
                                                        //     this.onSelect(cc);
                                                        //     SNavigation.goBack();
                                                        // }
                                                    }
                                                },
                                                {
                                                    icon: <SIconApp name="Delete" />,
                                                    label: "Eliminar",
                                                    onPress: () => {
                                                        SPopup.confirm({
                                                            title: "¿Eliminar el centro de costo?",
                                                            message: "Se eliminará el centro de costo seleccionado",
                                                            onPress: () => {
                                                                MDL.contabilidad.centro_costo.eliminar({
                                                                    key: cc.key
                                                                }).then(e => {
                                                                    SNotification.send({
                                                                        key: "centro_costo_eliminado",
                                                                        title: "Centro de costo eliminado",
                                                                        color: STheme.color.success,
                                                                        time: 5000,
                                                                    })
                                                                    this.loadData();
                                                                }).catch(e => {
                                                                    SNotification.send({
                                                                        key: "centro_costo_error",
                                                                        title: "Error al eliminar el centro de costo",
                                                                        color: STheme.color.danger,
                                                                        time: 5000,
                                                                    })
                                                                })
                                                            }
                                                        })




                                                        // MDL.contabilidad.centro_costo.eliminar({
                                                        //     key: cc.key
                                                        // }).then(e => {
                                                        //     this.loadData();
                                                        // }).catch(e => {

                                                        // })
                                                    }
                                                }
                                            ]
                                        })
                                    }}
                                    >{cc?.descripcion}</SText>
                                </SView>

                            })}
                        </SView>
                        <SView style={{
                            maxWidth: 500,
                            paddingHorizontal: 16
                        }}>
                            <SInput
                                ref={ref => this._ref[tipo.key] = ref}
                                customStyle={"erp"}
                                style={{ height: 36 }}
                                // label={"Agregar centro de costo a " + tipo.descripcion}
                                placeholder={"Escribe el centro de costo"}
                                iconR={<SView flex center onPress={() => {
                                    const value = this._ref[tipo.key].getValue();
                                    if (!value) return SNotification.send({
                                        key: "centro_costo_error",
                                        title: "El nombre del centro de costo es requerido",
                                        color: STheme.color.danger,
                                        time: 5000,
                                    });
                                    // console.log(value);
                                    MDL.contabilidad.centro_costo.registrar({
                                        descripcion: value,
                                        key_centro_costo_tipo: tipo.key
                                    }).then(e => {
                                        this.loadData();
                                        this._ref[tipo.key].setValue("");
                                    }).catch(e => {
                                        console.log("error", e)
                                    })

                                }}>
                                    <SText card style={{
                                        backgroundColor: STheme.color.primary,
                                        fontSize: 11,
                                        padding: 5
                                    }} >{"GUARDAR"}</SText>
                                </SView>} />
                        </SView>
                        <SHr height={12} />
                    </SView>
                })}
            </Container>
        </SPage>
    }
}