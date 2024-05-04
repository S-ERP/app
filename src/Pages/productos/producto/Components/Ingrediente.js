import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SButtom, SDate, SHr, SIcon, SInput, SList, SNavigation, SPopup, SText, STheme, SThread, SUuid, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../../../Model';

export default class Ingrediente extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {

            }
        };
    }
    componentDidMount() {
        SSocket.sendPromise({
            service: "inventario",
            component: "producto_ingrediente",
            type: "getAll",
            key_producto: this.props.key_producto,
            key_usuario: Model.usuario.Action.getKey(),
        }).then(e => {
            if (!e.data) return;
            this.setState({ data: e.data })
        }).catch(e => {

        })

    }

    item(obj) {
        return <SView col={"xs-12"} center>
            <SView col={"xs-12"} row center>
                <SView width={40} padding={4}>{obj.tipo == "ingreso" ? <SIcon name='Ingreso' /> : <SIcon name='Egreso' />}</SView>
                <SView flex padding={4}>
                    {/* <SInput type='text'
                    placeholder={"Seleccionar ingrediente"}
                    value={this.state?.data[obj.key]?.producto?.descripcion}
                    onPress={() => {
                        SNavigation.navigate("/productos/producto/profile2", { pk: this.state?.data[obj.key]?.producto?.key })
                    }}
                    editable={false}
                /> */}
                    <SText bold>{this.state?.data[obj.key]?.producto?.descripcion}</SText>
                </SView>
                <SView col={"xs-2.5"} padding={4}>
                    <SText>x {parseFloat(this.state?.data[obj.key]?.cantidad ?? 0).toFixed(1)}</SText>
                    {/* <SInput type='money' icon={<SText>Can.</SText>} defaultValue={parseFloat(this.state?.data[obj.key]?.cantidad ?? 0).toFixed(2)} placeholder={"0.00"} /> */}
                </SView>
                <SView col={"xs-2.5"} padding={4} style={{
                    alignItems: "flex-end"
                }}>
                    <SText style={{
                        textAlign: "right"
                    }}>Bs. {parseFloat(this.state?.data[obj.key]?.precio_compra ?? 0).toFixed(2)}</SText>
                    {/* <SInput type='money' icon={<SText>Total</SText>} defaultValue={parseFloat(this.state?.data[obj.key]?.precio_compra ?? 0).toFixed(2)} placeholder={"0.00"} /> */}
                </SView>
            </SView>
            <SText underLine color={this.state?.data[obj.key]?.key_asiento ? STheme.color.link : STheme.color.warning} onPress={() => {
                if (this.state.loading) return;
                if (this.state?.data[obj.key]?.key_asiento) {
                    SNavigation.navigate("/contabilidad/asiento_contable/profile", { pk: this.state?.data[obj.key]?.key_asiento })
                } else {
                    this.state.loading = true;
                    SSocket.sendPromise({
                        service: "inventario",
                        component: "producto_ingrediente",
                        type: "generar_asiento",
                        key_producto_ingrediente: obj.key,
                        key_empresa: Model.empresa.Action.getKey(),
                    }).then(e => {
                        this.state.loading = false;
                        console.log(e);
                        if (this.state?.data[obj.key]) {
                            this.state.data[obj.key].key_asiento = e.key_asiento;
                            this.setState({ ...this.state })

                        }
                    }).catch(e => {
                        this.state.loading = false;
                    })
                }

            }}>{this.state?.data[obj.key]?.key_asiento ? "Ver asiento contable" : "Generar asiento contable."}</SText>
            <SHr />
            <SText col={"xs-12"} style={{
                textAlign: "right"
            }} fontSize={10} color={STheme.color.gray}>{new SDate(this.state?.data[obj.key]?.fecha_on, "yyyy-MM-ddThh:mm:ss").toString("dd de MONTH del yyyy a las hh:mm")}</SText>
            <SHr />
            <SHr h={1} color={STheme.color.card} />
        </SView>
    }

    save(data, modelo) {
        SSocket.sendPromise({
            service: "inventario",
            component: "producto_ingrediente",
            type: "registro",
            data: data,
            key_usuario: Model.usuario.Action.getKey(),
        }).then(e => {
            this.state.data[e.data.key] = e.data;
            this.state.data[e.data.key].modelo = modelo;
            this.setState({ ...this.state })
        }).catch(e => {
            console.log(e);
        })
    }
    render() {
        return <SView col={"xs-12"} row>
            <SHr />
            <SText bold>Ingredientes</SText>
            <SView width={20} onPress={() => {

                SNavigation.navigate("/productos/modelo", {
                    onSelect: (modelo) => {
                        if (this.state.data[modelo.key]) {
                            SPopup.alert("El ingrediente ya existe");
                            return;
                        }

                        SPopup.open({
                            key: "popup_cantidad",
                            content: <SView padding={16} backgroundColor={STheme.color.background} withoutFeedback center>
                                <SHr />
                                <SText bold fontSize={18}>{modelo.descripcion}</SText>
                                <SHr />
                                <SInput ref={ref => this.inpref = ref} label={"cantidad"} defaultValue={1} />
                                <SHr />
                                <SInput type='money' ref={ref => this.inpref_preciocompra = ref} label={"precio_compra"} defaultValue={1} />
                                <SHr />
                                <SButtom type='danger' onPress={() => {
                                    SPopup.close("popup_cantidad");
                                    this.save({
                                        key_producto: this.props.key_producto,
                                        key_modelo: modelo.key,
                                        cantidad: this.inpref.getValue() ?? 1,
                                        precio_compra: this.inpref_preciocompra.getValue() ?? 0,
                                    }, modelo)
                                }}>ACEPTAR</SButtom>
                            </SView>
                        })
                        // this.state.data[e.key] = {
                        //     ...e,
                        //     cantidad: "1.00"
                        // };




                    }
                })
            }}><SIcon name='Add' /></SView>
            <SView col={"xs-12"}>
                <SList
                    data={this.state.data}
                    initSpace={20}
                    space={18}
                    order={[{ key: "fecha_on", order: "asc" }]}
                    render={this.item.bind(this)}
                />
            </SView>
            <SHr />
        </SView>
    }
}
