import React from "react";
import { SHr, SInput, SNavigation, SPage, SText, SUuid, SView } from "servisofts-component";
import MDL from "../../MDL";
import FloatMenu from "../../Components/FloatMenu";
import SIconApp from "../../Assets/SIconApp";

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
        return <SPage title={"centro_costo"}>
            <SView padding={16} style={{ maxWidth: 500 }}>
                <SInput
                    ref={ref => this.ref_tipo = ref}
                    customStyle={"erp"}
                    label={"Crear tipo"}
                    placeholder={"Escribe el tipo"}
                    iconR={<SView flex center onPress={() => {
                        const value = this.ref_tipo.getValue();
                        console.log(value);

                        MDL.contabilidad.centro_costo_tipo.registrar({
                            descripcion: value,
                        }).then(e => {
                            this.loadData();
                            this.ref_tipo.setValue("");
                        }).catch(e => {
                            console.log("error", e)
                        })

                    }}><SText >{"SEND"}</SText></SView>} />
            </SView>
            {this.centro_costo_tipo.map((tipo) => {
                return <SView col={"xs-12"} padding={4}>
                    <SView col={"xs-12"} row>
                        <SText>{"-"}</SText>
                        <SView width={8} />
                        <SText bold fontSize={18} onPress={(e) => {
                            FloatMenu.open({
                                e: e,
                                options: [
                                    {
                                        icon: <SIconApp name="Delete" />,
                                        label: "Eliminar",
                                        onPress: () => {
                                            MDL.contabilidad.centro_costo_tipo.eliminar({
                                                key: tipo.key
                                            }).then(e => {
                                                this.loadData();
                                            }).catch(e => {

                                            })
                                        }
                                    }
                                ]
                            })
                        }}>{tipo.descripcion}</SText>
                    </SView>
                    <SHr />
                    <SView style={{
                        paddingHorizontal: 16
                    }}>
                        {tipo.centros.map(cc => {
                            return <SView>
                                <SText fontSize={16} onPress={(e) => {
                                    FloatMenu.open({
                                        e: e,
                                        options: [
                                            {
                                                icon: <SIconApp name="Eyes" />,
                                                label: "Seleccionar",
                                                onPress: () => {
                                                    if (this.onSelect) {
                                                        this.onSelect(cc);
                                                        SNavigation.goBack();
                                                    }
                                                }
                                            },
                                            {
                                                icon: <SIconApp name="Delete" />,
                                                label: "Eliminar",
                                                onPress: () => {
                                                    MDL.contabilidad.centro_costo.eliminar({
                                                        key: cc.key
                                                    }).then(e => {
                                                        this.loadData();
                                                    }).catch(e => {

                                                    })
                                                }
                                            }
                                        ]
                                    })
                                }}
                                >{cc?.descripcion}</SText>
                            </SView>

                        })}
                    </SView>
                    <SHr h={16} />
                    <SView style={{
                        maxWidth: 500,
                        paddingHorizontal: 16
                    }}>
                        <SInput
                            ref={ref => this._ref[tipo.key] = ref}
                            customStyle={"erp"}
                            label={"Agregar centro de costo a " + tipo.descripcion}
                            placeholder={"Escribe el centro de costo"}
                            iconR={<SView flex center onPress={() => {
                                const value = this._ref[tipo.key].getValue();
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
                                <SText >{"SEND"}</SText>
                            </SView>} />
                    </SView>

                </SView>
            })}

        </SPage>
    }
}