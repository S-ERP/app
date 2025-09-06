import React from "react";
import { SHr, SImage, SLoad, SNavigation, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../../MDL";
import SSocket from "servisofts-socket";
import FloatButtom from "../../../Components/FloatButtom";
import SIconApp from "../../../Assets/SIconApp";
import PopupCrearSucursal from "./Components/PopupCrearSucursal";
import Pizarra from "../../../Components/Pizarra/Pizarra";
import PizarraNodo from "../../../Components/Pizarra/PizarraNodo";
import Puerto from "../../../Components/Pizarra/Puerto";
import Recargar from "../../../Components/Recargar";
import PopupCrearPuntoVenta from "./Components/PopupCrearPuntoVenta";
import PopupCrearAlmacen from "../../inventario/almacen/Components/PopupCrearAlmacen";

export default class config2 extends React.Component {

    componentDidMount() {
        this.loadData();
        MDL.erp.addServerListener({
            key: "config_2_almacen_editar",
            component: "almacen",
            type: "editar",
            key_empresa: MDL.empresa.select?.key,
            callback: (data) => {
                this.loadData();
            }
        })
    }
    componentWillUnmount() {
        MDL.erp.removeServerListener({
            key: "config_2_almacen",
        })
    }
    loadData = async () => {
        MDL.empresa._full = null;
        this.empresa = await MDL.empresa.getFull();
        this.almancenes = await MDL.inventario.getAllAlmacen();
        this.empresa.sucursales.map(e => {
            e.almacenes = this.almancenes.filter(almacen => almacen.key_sucursal == e.key);
        })
        this.forceUpdate();
    }
    render() {
        const empresa = this.empresa;
        if (!empresa) return <SLoad />
        const space = 300;
        return <SPage title={"config2"} disableScroll>

            <Pizarra id={"config_empresa"} scale={0.4}>
                <PizarraNodo
                    id={empresa?.key}
                    key={empresa?.key}
                    y={0} x={-200} style={{
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                    onDoublePress={e => {
                        console.log("Doble click en empresa");
                    }}
                >
                    <SView style={{
                        width: 350,
                        height: 100,
                        borderRadius: 100,
                        borderWidth: 1,
                        borderColor: STheme.color.text,
                        backgroundColor: STheme.color.background,
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 12
                    }} row  >

                        <SView width={50} height={50} style={{
                            borderRadius: 100,
                            overflow: "hidden"
                        }}>
                            <SImage src={SSocket.api.empresa + "empresa/" + empresa?.key} />
                        </SView>
                        <SView flex>
                            <SText flex center bold fontSize={29}>{empresa?.razon_social}</SText>
                            <SText flex center fontSize={12} color={STheme.color.lightGray} >{empresa?.nit}</SText>
                        </SView>
                    </SView>
                    <Puerto
                        id="key_empresa"
                        type="output"
                        value={empresa?.key}
                        style={{
                            // top: 0,
                            borderRadius: 100,
                            right: 0,
                            // bottom: 0
                        }} />
                    <SView style={{
                        width: 25,
                        height: 25,
                        position: "absolute",
                        right: -40,
                    }}>
                        <SIconApp name="Add"/>
                    </SView>
                </PizarraNodo>
                {(empresa.sucursales ?? []).map((sucursal, i) => {
                    return <>
                        <PizarraNodo
                            key={sucursal.key}
                            id={sucursal.key}
                            y={i * space} x={100} style={{
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                            onDoublePress={e => {
                                PopupCrearSucursal.open({
                                    key_empresa: empresa.key,
                                    editObject: sucursal,
                                    onSuccess: () => this.loadData(),
                                })
                            }}
                        >
                            <SView style={{
                                width: 200,
                                height: 80,
                                borderRadius: 4,
                                borderWidth: 1,
                                borderColor: STheme.color.text,
                                backgroundColor: STheme.color.background,
                                alignItems: "center",
                                justifyContent: "center",
                            }} row>
                                <SView width={30} height={30} padding={4} >
                                    <SIconApp name="Marker" fill={STheme.color.text} />
                                </SView>
                                <SText flex fontSize={20}>{sucursal.descripcion}</SText>
                            </SView>
                            <Puerto id="key_empresa"
                                type="input"
                                value={sucursal.key_empresa}
                                style={{
                                    width: 8,
                                    height: 20,
                                    left: 4
                                }} />
                            <Puerto id="key_sucursal"
                                value={sucursal.key}
                                type="output"
                                style={{
                                    right: 0,
                                    borderRadius: 100,
                                    // bottom: 0
                                }} />
                        </PizarraNodo >
                        {
                            (sucursal.almacenes ?? []).map((almacen, j) => {
                                return <PizarraNodo
                                    key={almacen.key}
                                    id={almacen.key}
                                    y={i * space + j * 80}
                                    x={300} style={{
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}
                                    onDoublePress={e => {
                                        PopupCrearAlmacen.open({
                                            key_empresa: empresa.key,
                                            editObject: almacen,
                                            onSuccess: () => this.loadData(),

                                        })
                                    }}
                                >
                                    <SView style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: 100,
                                        padding: 24,
                                        borderColor: STheme.color.text,
                                        backgroundColor: STheme.color.background,
                                        borderWidth: 1,
                                        overflow: "hidden",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}>
                                        <SIconApp name="productos" fill={STheme.color.text} />

                                    </SView>
                                    <SText style={{
                                        maxWidth: 80,
                                    }} numberOfLines={1}>{almacen.descripcion}</SText>
                                    <Puerto id="key_sucursal"
                                        value={almacen.key_sucursal}
                                        type="input"
                                        onConnect={e => {
                                            if (e.value == almacen.key_sucursal) return;
                                            MDL.inventario.saveAlmacen({
                                                data: {
                                                    key: almacen.key,
                                                    key_sucursal: e.value
                                                }
                                            }).then(e => {
                                                this.loadData();
                                            }).catch(e => {
                                                console.log(e)
                                            })
                                            console.log("onConnect", e)
                                        }}
                                        style={{
                                            width: 8,
                                            top: 40,
                                            left: 4,
                                        }} />
                                </PizarraNodo>
                            })
                        }
                        {
                            (sucursal.puntos_venta ?? []).map((punto_venta, j) => {
                                return <PizarraNodo
                                    id={punto_venta.key}
                                    key={punto_venta.key}
                                    y={i * space + 10 + j * 110} x={320} style={{
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}
                                    onDoublePress={e => {
                                        PopupCrearPuntoVenta.open({
                                            key_sucursal: sucursal.key,
                                            editObject: punto_venta,
                                            onSuccess: () => this.loadData(),
                                        })
                                    }}
                                >
                                    <SView style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: 10,
                                        padding: 24,
                                        borderColor: STheme.color.text,
                                        backgroundColor: STheme.color.background,
                                        borderWidth: 1,
                                        overflow: "hidden",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}>
                                        <SIconApp name="Caja" fill={STheme.color.text} />
                                    </SView>
                                    <SText fontSize={12} numberOfLines={1}>{punto_venta.descripcion}</SText>
                                    <Puerto id="key_sucursal"
                                        value={punto_venta.key_sucursal}
                                        type="input"
                                        style={{
                                            width: 8,
                                            top: 40,
                                            left: 4
                                        }} />
                                </PizarraNodo>
                            })
                        }
                    </>
                })}
            </Pizarra>
            <SView style={{
                position: "absolute",
                left: 10,
                bottom: 10,
            }} >
                <Recargar onFinish={() => {
                    this.loadData();
                }} />
            </SView>
        </SPage >
    }
}