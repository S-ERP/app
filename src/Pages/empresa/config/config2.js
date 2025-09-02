import React from "react";
import { SHr, SImage, SNavigation, SPage, SText, STheme, SView } from "servisofts-component";
import MDL from "../../../MDL";
import SSocket from "servisofts-socket";
import FloatButtom from "../../../Components/FloatButtom";
import SIconApp from "../../../Assets/SIconApp";
import PopupCrearSucursal from "./Components/PopupCrearSucursal";
import Pizarra from "../../../Components/Pizarra/Pizarra";
import PizarraNodo from "../../../Components/Pizarra/PizarraNodo";
import Puerto from "../../../Components/Pizarra/Puerto";

export default class config2 extends React.Component {

    componentDidMount() {
        this.loadData();
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
        const empresa = this.empresa ?? {};
        const space = 300;
        return <SPage title={"config2"} disableScroll>
            <Pizarra>
                <PizarraNodo key={empresa?.key} x={0} y={-200} style={{
                    alignItems: "center",
                    justifyContent: "center"
                }}>

                    <SView style={{
                        width: 200,
                        height: 80,
                        borderRadius: 100,
                        borderWidth: 1,
                        borderColor: STheme.color.text,
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
                            <SText flex center bold>{empresa?.razon_social}</SText>
                            <SText flex center fontSize={12} color={STheme.color.lightGray} >{empresa?.nit}</SText>
                        </SView>
                    </SView>
                    <Puerto style={{
                        position: "absolute",
                        // top: 0,
                        left: 0
                    }} />
                </PizarraNodo>
                {(empresa.sucursales ?? []).map((sucursal, i) => {
                    return <>
                        <PizarraNodo key={sucursal.key} x={i * space} y={0} style={{
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <SView style={{
                                width: 120,
                                height: 60,
                                borderRadius: 4,
                                borderWidth: 1,
                                borderColor: STheme.color.text,
                                backgroundColor: STheme.color.card,
                                alignItems: "center",
                                justifyContent: "center",
                            }} row>
                                <SView width={30} height={30} padding={4} >
                                    <SIconApp name="Marker" fill={STheme.color.text} />
                                </SView>
                                <SText flex>{sucursal.descripcion}</SText>
                            </SView>

                        </PizarraNodo >
                        {
                            (sucursal.almacenes ?? []).map((almacen, j) => {
                                return <PizarraNodo key={almacen.key} x={i * space + j * 80} y={100} style={{
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <SView style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 100,
                                        padding: 15,
                                        borderColor: STheme.color.text,
                                        borderWidth: 1,
                                        overflow: "hidden",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}>
                                        <SIconApp name="productos" fill={STheme.color.text} />
                                    </SView>
                                    <SText>{almacen.descripcion}</SText>
                                </PizarraNodo>
                            })
                        }
                    </>
                })}
            </Pizarra>
        </SPage >
    }
}