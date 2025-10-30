import React from "react";
import { SHr, SImage, SLoad, SNavigation, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../../MDL";
import SSocket from "servisofts-socket";
import FloatButtom from "../../../Components/FloatButtom";
import SIconApp from "../../../Assets/SIconApp";
import PopupCrearSucursal from "./Components/PopupCrearSucursal";
import { Pizarra, Nodo, Puerto } from "../../../Components/Pizarra2";
import Recargar from "../../../Components/Recargar";
import PopupCrearPuntoVenta from "./Components/PopupCrearPuntoVenta";
import PopupCrearAlmacen from "../../inventario/almacen/Components/PopupCrearAlmacen";
import FloatMenu from "../../../Components/FloatMenu";

export default class config2 extends React.Component {

    save_locations = {};
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
        MDL.empresa._getFullCache.key_empresa = "";
        this.empresa = await MDL.empresa.getFull();
        this.almancenes = await MDL.inventario.getAllAlmacen();
        this.empresa.sucursales.map(e => {
            e.almacenes = this.almancenes.filter(almacen => almacen.key_sucursal == e.key);
        })
        this.forceUpdate();
    }
    reload() {
        this.loadData();
    }
    render() {
        const empresa = this.empresa;
        if (!empresa) return <SLoad />
        const space = 300;
        return <SPage title={"config2"} disableScroll>

            <Pizarra id={"config_empresa"} scale={0.4}
                onDoublePress={e => {
                    console.log(e);
                    FloatMenu.open({
                        e: { nativeEvent: { pageX: e.absoluteX, pageY: e.absoluteY } },
                        label: "Agregar nodo",
                        options: [
                            {
                                icon: <SIconApp name="Marker" fill={STheme.color.text} />,
                                label: "Crear Sucursal",
                                onPress: () => {
                                    PopupCrearSucursal.open({
                                        key_empresa: empresa.key,
                                        // editObject: sucursal,
                                        onSuccess: (resp) => {
                                            this.save_locations[resp.data.key] = e;
                                            this.reload()
                                            // const nuevaSucursal = e.data;
                                            // const index = empresa.sucursales.findIndex(o => o.key == nuevaSucursal.key)
                                            // empresa.sucursales[index] = nuevaSucursal;
                                            // this.forceUpdate();

                                        },
                                    })
                                }
                            },
                            {
                                icon: <SIconApp name="Caja" fill={STheme.color.text} />,
                                label: "Crear Punto de Venta",
                                onPress: () => {
                                    PopupCrearPuntoVenta.open({
                                        key_empresa: empresa.key,
                                        // editObject: sucursal,
                                        onSuccess: (e) => {
                                            this.save_locations[resp.data.key] = e;
                                            this.reload()
                                            // const nuevaSucursal = e.data;
                                            // const index = empresa.sucursales.findIndex(o => o.key == nuevaSucursal.key)
                                            // empresa.sucursales[index] = nuevaSucursal;
                                            // this.forceUpdate();

                                        },
                                    })
                                }
                            },
                            {
                                icon: <SIconApp name="productos" fill={STheme.color.text} />,
                                label: "Crear Almacen",
                                onPress: () => {
                                    PopupCrearAlmacen.open({
                                        key_empresa: empresa.key,
                                        // editObject: almacen,
                                        onSuccess: (e) => {
                                            this.save_locations[resp.data.key] = e;
                                            this.reload()
                                            // this.loadData()
                                        },

                                    })
                                }
                            }
                        ]
                    })
                }}
            >
                {/* <EmpresaNodo empresa={empresa} /> */}
                {(empresa.sucursales ?? []).map((sucursal, i) => {
                    return <>
                        <SucursalNodo empresa={empresa} sucursal={sucursal} reload={this.reload.bind(this)} save_locations={this.save_locations} />
                        {
                            (sucursal.almacenes ?? []).map((almacen, j) => {
                                return <AlmacenNodo empresa={empresa} sucursal={sucursal} almacen={almacen} reload={this.reload.bind(this)} save_locations={this.save_locations} />
                            })
                        }
                        {
                            (sucursal.puntos_venta ?? []).map((punto_venta, j) => {
                                return <PuntoVentaNodo empresa={empresa} sucursal={sucursal} punto_venta={punto_venta} reload={this.reload.bind(this)} save_locations={this.save_locations} />
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


const EmpresaNodo = ({ empresa }) => {
    return <Nodo
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
                position: "absolute",
                borderRadius: 100,
                right: 0,
                width: 20,
                height: 20,
                backgroundColor: "#fff"
                // bottom: 0
            }} />
        {/* <SView style={{
            width: 25,
            height: 25,
            position: "absolute",
            right: -40,
        }}>
            <SIconApp name="Add" />
        </SView> */}
    </Nodo>
}

const AlmacenNodo = ({ sucursal, almacen, empresa, save_locations }) => {
    return <Nodo
        key={almacen.key}
        id={almacen.key}
        y={save_locations[almacen.key]?.pizarraY ?? 0}
        x={save_locations[almacen.key]?.pizarraX ?? 0}

        style={{
            alignItems: "center",
            justifyContent: "center"
        }}
        onDoublePress={e => {
            PopupCrearAlmacen.open({
                key_empresa: empresa.key,
                editObject: almacen,
                onSuccess: () => {
                    if (reload) reload()
                    // this.loadData()
                },

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
        }} numberOfLines={2} center>{almacen.descripcion}</SText>
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
                    if (reload) reload()
                    // this.loadData();
                }).catch(e => {
                    console.log(e)
                })
                console.log("onConnect", e)
            }}
            style={{
                width: 8,
                top: 36,
                left: 0,
                position: "absolute",
                borderRadius: 100,
                height: 20,
                backgroundColor: STheme.color.text,
            }} />
    </Nodo>
}

const SucursalNodo = ({ sucursal, empresa, save_locations }) => {
    return <Nodo
        key={sucursal.key}
        id={sucursal.key}
        data={sucursal}
        y={save_locations[sucursal.key]?.pizarraY ?? 0}
        x={save_locations[sucursal.key]?.pizarraX ?? 0}
        style={{
            alignItems: "center",
            justifyContent: "center"
        }}
        onDoublePress={e => {
            PopupCrearSucursal.open({
                key_empresa: empresa.key,
                editObject: sucursal,
                onSuccess: (e) => {
                    const nuevaSucursal = e.data;
                    const index = empresa.sucursales.findIndex(o => o.key == nuevaSucursal.key)
                    empresa.sucursales[index] = nuevaSucursal;
                    // this.forceUpdate();

                },
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
        {/* <Puerto id="key_empresa"
            type="input"
            value={sucursal.key_empresa}
            style={{
                position: "absolute",
                width: 8,
                height: 20,
                backgroundColor: STheme.color.text,
                left: -4
            }} /> */}
        <Puerto id="key_sucursal"
            value={sucursal.key}
            type="output"
            style={{
                position: "absolute",
                right: -8,
                borderRadius: 100,
                width: 20,
                height: 20,
                backgroundColor: STheme.color.text,
                // bottom: 0
            }} />
    </Nodo >
}

const PuntoVentaNodo = ({ sucursal, empresa, punto_venta, reload, save_locations }) => {
    return <Nodo
        id={punto_venta.key}
        key={punto_venta.key}
        y={save_locations[punto_venta.key]?.pizarraY ?? 0}
        x={save_locations[punto_venta.key]?.pizarraX ?? 0}
        style={{
            alignItems: "center",
            justifyContent: "center"
        }}
        onDoublePress={e => {
            PopupCrearPuntoVenta.open({
                key_sucursal: sucursal.key,
                editObject: punto_venta,
                onSuccess: () => {
                    if (reload) reload()
                    // this.loadData()
                },
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
            onConnect={e => {
                if (e.value == punto_venta.key_sucursal) return;
                MDL.punto_venta.save({
                    key: punto_venta.key,
                    key_sucursal: e.value
                }).then(e => {
                    if (reload) reload()
                    // this.loadData();
                }).catch(e => {
                    console.log(e)
                })
                console.log("onConnect", e)
            }}
            style={{
                position: "absolute",
                backgroundColor: STheme.color.text,
                width: 8,
                height: 20,
                top: 35,
                left: 0
            }} />
    </Nodo>
}