import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SIcon, SImage, SNavigation, SPage, SText, STheme, SUtil, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../../Model';
import { Container } from '../../../Components';
import SIconApp from '../../../Assets/SIconApp';
import PopupCrearSucursal from './Components/PopupCrearSucursal';
import PopupCrearPuntoVenta from './Components/PopupCrearPuntoVenta';
import PopupCrearMoneda from './Components/PopupCrearMoneda';
import MDL from '../../../MDL';

export default class config extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: {}
        };
    }
    key_empresa = Model.empresa.Action.getKey()

    componentDidMount() {
        SSocket.sendPromise({
            service: "empresa",
            component: "empresa",
            type: "getByKeyFull",
            key: Model.empresa.Action.getKey()
        }).then(e => {
            if (e.data.sucursales) {
                e.data.sucursales.map((sucursal) => {
                    sucursal._color = STheme.colorFromText(sucursal.key)
                    if (sucursal.puntos_venta) {
                        sucursal.puntos_venta.map((punto_venta) => {
                            punto_venta._color = STheme.colorFromText(punto_venta.key)
                        })
                    }

                })
            }

            if (e.data.monedas) {
                e.data.monedas.map((moneda) => {
                    moneda._color = STheme.colorFromText(moneda.key)
                })
            }


            SSocket.sendPromise({
                "service": "inventario",
                "component": "almacen",
                "type": "getAll",
                "key_usuario": Model.usuario.Action.getKey(),
            }).then(alm => {
                if (e.data.sucursales) {
                    e.data.sucursales.map((sucursal) => {
                        sucursal.almacenes = Object.values(alm.data).filter((almacen) => {
                            return almacen.key_sucursal == sucursal.key
                        });
                        sucursal.almacenes.map((almacen) => {
                            almacen._color = STheme.colorFromText(almacen.key)
                        })

                    })
                    this.setState({
                        data: e.data
                    })
                }
            }).catch(alm => {

            })

            // SSocket.sendPromise({
            //     "component": "banco",
            //     "type": "getAllFull",
            //     "key_usuario": Model.usuario.Action.getKey(),
            //     "key_empresa": MDL.empresa?.select?.key,
            // }).then(resp => {
            //     e.data.bancos = resp.data;
            //     e.data.bancos.map((banco) => {
            //         if(banco.cuentas) {
            //             banco.cuentas.map((cuenta) => {
            //                 cuenta._color = STheme.colorFromText(cuenta.key)
            //             })
            //         }
            //         banco._color = STheme.colorFromText(banco.key)
            //     })
            //     this.forceUpdate();
            // }).catch(alm => {

            // })

            this.setState({ data: e.data })
        }).catch(e => {
            console.log(e);
        })
    }


    renderSucursales() {
        const sucursales = this.state?.data?.sucursales ?? [];

        return <SView col={"xs-12"} style={{
            borderLeftWidth: 2,
            borderColor: STheme.color.card,
            paddingLeft: 4
        }}>
            <SubTitle label={"Sucursales"} length={sucursales.length}
            // onAdd={() => {
            //     PopupCrearSucursal.open({
            //         key_empresa: this.key_empresa,
            //         onSuccess: (e) => {
            //             this.componentDidMount();
            //         }
            //     })
            // }}
            />
            <SHr h={8} />
            <SView style={{
                paddingStart: 8
            }}>
                {sucursales.map((sucursal, i) => {
                    return <SView key={sucursal.key} style={{
                        marginBottom: 16,
                        borderLeftWidth: 4,
                        borderColor: sucursal._color,
                        // backgroundColor: sucursal._color + "22"
                        // borderTopWidth: 1

                    }}>
                        <Item key={sucursal.key} label={sucursal.descripcion} index={i + 1}
                            color={sucursal._color}
                            code="Sucursal:"
                            imageSrc={SSocket.api.empresa + "sucursal/" + sucursal.key}
                            onPress={() => {
                                this.setState({
                                    open: {
                                        ...this.state.open,
                                        [sucursal.key]: !this.state.open[sucursal.key]
                                    }
                                })
                            }}

                            onAjuste={() => {
                                PopupCrearSucursal.open({
                                    editObject: sucursal,
                                    key_empresa: this.key_empresa,
                                    onSuccess: (e) => {
                                        this.componentDidMount();
                                    }
                                })
                            }}
                        />
                        {!!this.state.open[sucursal.key] && <SView col={"xs-12"} style={{
                            paddingStart: 24,
                        }}>
                            <SHr h={8} />
                            {this.renderPuntosDeVentas(sucursal)}
                            <SHr h={32} />
                            {this.renderAlmacenes(sucursal)}
                            <SHr h={8} />
                        </SView>
                        }
                    </SView>
                })}
                <SView key={"add"} style={{
                    marginBottom: 16,
                    borderLeftWidth: 4,
                    borderColor: STheme.color.lightGray,

                    // borderTopWidth: 1

                }}>
                    <Item index={"+"}
                        color={STheme.color.lightGray}
                        code="Agregar nueva sucursal"
                        onPress={() => {
                            PopupCrearSucursal.open({
                                key_empresa: this.key_empresa,
                                onSuccess: (e) => {
                                    this.componentDidMount();
                                }
                            })
                        }}
                    />
                </SView>
            </SView>
        </SView>
    }
    renderPuntosDeVentas(sucursal) {
        const puntos_de_ventas = sucursal.puntos_venta ?? []
        const scale = 1;
        return <SView col={"xs-12"} style={{
            borderLeftWidth: 2,
            borderColor: STheme.color.success,
            paddingLeft: 4
        }}>
            <SubTitle label={"Puntos de ventas"} length={puntos_de_ventas.length} scale={scale}
            // onAdd={() => {
            //     PopupCrearPuntoVenta.open({
            //         key_sucursal: sucursal.key,
            //         onSuccess: (e) => {
            //             this.componentDidMount();
            //         }
            //     })
            // }}
            />
            <SView style={{
                paddingTop: 8,
                paddingStart: 16
            }}>
                {puntos_de_ventas.map((punto_venta, i) => {
                    return <Item key={punto_venta.key} label={punto_venta.descripcion}
                        index={i + 1}
                        code={"P.V."}
                        color={punto_venta._color}
                        scale={scale}

                        style={{
                            marginBottom: 12,
                            borderLeftWidth: 2,
                            borderLeftColor: punto_venta._color,
                        }}

                        onPress={() => {
                            SNavigation.navigate("/empresa/punto_venta/profile", {
                                pk: punto_venta.key,
                                key_sucursal: sucursal.key
                            })
                        }}
                        onAjuste={() => {
                            PopupCrearPuntoVenta.open({
                                editObject: punto_venta,
                                key_sucursal: sucursal.key,
                                onSuccess: (e) => {
                                    this.componentDidMount();
                                }
                            })
                        }} />
                })}

                <Item index={"+"}
                    scale={scale}
                    color={STheme.color.lightGray}
                    code="Agregar nuevo punto de venta"
                    style={{
                        marginBottom: 6,
                        borderLeftWidth: 2,
                        borderLeftColor: STheme.color.lightGray,
                    }}
                    onPress={() => {
                        PopupCrearPuntoVenta.open({
                            key_sucursal: sucursal.key,
                            onSuccess: (e) => {
                                this.componentDidMount();
                            }
                        })
                    }}

                />
            </SView>
        </SView>
    }

    renderAlmacenes(sucursal) {
        const almacenes = sucursal.almacenes ?? []
        const scale = 1;
        return <SView col={"xs-12"} style={{
            borderLeftWidth: 2,
            borderColor: STheme.color.warning,
            paddingLeft: 4
        }}>
            <SubTitle label={"Almacenes"} length={almacenes.length} scale={scale}
            // color={}
            // onAdd={() => {
            //     PopupCrearPuntoVenta.open({
            //         key_sucursal: sucursal.key,
            //         onSuccess: (e) => {
            //             this.componentDidMount();
            //         }
            //     })
            // }}
            />
            <SView style={{
                paddingTop: 8,
                paddingStart: 16
            }}>
                {almacenes.map((almacen, i) => {
                    return <Item key={almacen.key} label={almacen.descripcion}
                        index={i + 1}
                        code={"Almacen:"}
                        color={almacen._color}
                        scale={scale}

                        style={{
                            marginBottom: 12,
                            borderLeftWidth: 2,
                            borderLeftColor: almacen._color,
                        }}

                        onPress={() => {
                            SNavigation.navigate("/inventario/almacen/profile", { pk: almacen.key })
                        }}
                        onAjuste={() => {
                            // PopupCrearPuntoVenta.open({
                            //     editObject: punto_venta,
                            //     key_sucursal: sucursal.key,
                            //     onSuccess: (e) => {
                            //         this.componentDidMount();
                            //     }
                            // })
                        }} />
                })}

                <Item index={"+"}
                    scale={scale}
                    color={STheme.color.lightGray}
                    code="Agregar nuevo almacen"
                    style={{
                        marginBottom: 6,
                        borderLeftWidth: 2,
                        borderLeftColor: STheme.color.lightGray,
                    }}
                    onPress={() => {
                        // PopupCrearPuntoVenta.open({
                        //     key_sucursal: sucursal.key,
                        //     onSuccess: (e) => {
                        //         this.componentDidMount();
                        //     }
                        // })
                    }}

                />
            </SView>
        </SView>
    }
    renderModenas() {
        const monedas = this.state?.data?.monedas ?? [];
        return <SView col={"xs-12"} style={{
            borderLeftWidth: 2,
            borderColor: STheme.color.card,
            paddingLeft: 4
        }} >
            <SubTitle label={"Monedas"} length={monedas.length}
            // onAdd={() => {
            //     PopupCrearMoneda.open({
            //         key_empresa: this.key_empresa,
            //         onSuccess: (e) => {
            //             this.componentDidMount();
            //         }
            //     })
            // }}
            />
            <SHr h={8} />

            <SView style={{
                paddingStart: 8
            }}>
                {monedas.map((moneda, i) => {
                    return <SView key={moneda.key} style={{
                        marginBottom: 16,
                        // paddingTop: 4,
                        borderLeftWidth: 4,
                        borderColor: moneda._color,

                    }}>
                        <Item key={moneda.key}
                            label={`${moneda.descripcion}  ( ${moneda.observacion} )`}
                            index={i + 1} code={"Moneda:"}
                            color={moneda._color} style={{}}
                            onAjuste={(e) => {
                                PopupCrearMoneda.open({
                                    editObject: moneda,
                                    key_empresa: this.key_empresa,
                                    onSuccess: (e) => {
                                        this.componentDidMount();
                                    }
                                })
                            }}

                            onPress={() => {
                                this.setState({
                                    open: {
                                        ...this.state.open,
                                        [moneda.key]: !this.state.open[moneda.key]
                                    }
                                })
                            }}
                        />
                        {!!this.state.open[moneda.key] && <SView col={"xs-12"} style={{
                            paddingStart: 70,
                        }}>
                            <SHr h={8} />
                            <SView row >
                                <SText fontSize={12} color={STheme.color.lightGray}>{"Tipo de cambio: "}</SText>
                                <SText>{moneda.tipo_cambio}</SText>
                            </SView>
                        </SView>
                        }
                    </SView>
                })}
                <SView key={"add"} style={{
                    marginBottom: 16,
                    borderLeftWidth: 4,
                    borderColor: STheme.color.lightGray,
                    // borderTopWidth: 1

                }}>
                    <Item index={"+"}
                        color={STheme.color.lightGray}
                        code="Agregar nueva moneda"
                        onPress={() => {
                            PopupCrearMoneda.open({
                                key_empresa: this.key_empresa,
                                onSuccess: (e) => {
                                    this.componentDidMount();
                                }
                            })
                        }}


                    />
                </SView>
            </SView>

        </SView>
    }
    renderBancos() {
        const bancos = this.state?.data?.bancos ?? [];
        return <SView col={"xs-12"} style={{
            borderLeftWidth: 2,
            borderColor: STheme.color.card,
            paddingLeft: 4
        }} >
            <SubTitle label={"Bancos"} length={bancos.length}
            />
            <SHr h={8} />

            <SView style={{
                paddingStart: 8
            }}>
                {bancos.map((banco, i) => {
                    return <SView key={banco.key} style={{
                        marginBottom: 16,
                        // paddingTop: 4,
                        borderLeftWidth: 4,
                        borderColor: banco._color,

                    }}>
                        <Item key={banco.key}
                            label={`${banco.descripcion}`}
                            index={i + 1} code={"Banco:"}
                            color={banco._color} style={{}}
                            imageSrc={SSocket.api.root + "banco/" + banco.key}
                            onAjuste={(e) => {
                                // PopupCrearMoneda.open({
                                //     editObject: moneda,
                                //     key_empresa: this.key_empresa,
                                //     onSuccess: (e) => {
                                //         this.componentDidMount();
                                //     }
                                // })
                            }}

                            onPress={() => {
                                this.setState({
                                    open: {
                                        ...this.state.open,
                                        [banco.key]: !this.state.open[banco.key]
                                    }
                                })
                            }}
                        />
                        {!!this.state.open[banco.key] && <SView col={"xs-12"} style={{
                            paddingStart: 70,
                        }}>
                            <SHr h={8} />
                            {this.renderCuentasDeBanco(banco)}
                        </SView>
                        }
                    </SView>
                })}
                <SView key={"add"} style={{
                    marginBottom: 16,
                    borderLeftWidth: 4,
                    borderColor: STheme.color.lightGray,
                    // borderTopWidth: 1

                }}>
                    <Item index={"+"}
                        color={STheme.color.lightGray}
                        code="Agregar nuevo banco"
                        onPress={() => {
                            // PopupCrearMoneda.open({
                            //     key_empresa: this.key_empresa,
                            //     onSuccess: (e) => {
                            //         this.componentDidMount();
                            //     }
                            // })
                        }}


                    />
                </SView>
            </SView>

        </SView>
    }
    renderCuentasDeBanco(banco) {
        const cuentas = banco.cuentas ?? []
        const scale = 1;
        return <SView col={"xs-12"} style={{
            borderLeftWidth: 2,
            borderColor: STheme.color.success,
            paddingLeft: 4
        }}>
            <SubTitle label={"Cuentas"} length={cuentas.length} scale={scale}
            // onAdd={() => {
            //     PopupCrearPuntoVenta.open({
            //         key_sucursal: sucursal.key,
            //         onSuccess: (e) => {
            //             this.componentDidMount();
            //         }
            //     })
            // }}
            />
            <SView style={{
                paddingTop: 8,
                paddingStart: 16
            }}>
                {cuentas.map((cuenta, i) => {
                    return <Item key={cuenta.key} label={cuenta.descripcion}
                        index={i + 1}
                        code={"P.V."}
                        color={cuenta._color}
                        scale={scale}

                        style={{
                            marginBottom: 12,
                            borderLeftWidth: 2,
                            borderLeftColor: cuenta._color,
                        }}

                        onPress={() => {
                            // SNavigation.navigate("/empresa/punto_venta/profile", {
                            //     pk: punto_venta.key,
                            //     key_sucursal: sucursal.key
                            // })
                        }}
                        onAjuste={() => {
                            // PopupCrearPuntoVenta.open({
                            //     editObject: punto_venta,
                            //     key_sucursal: sucursal.key,
                            //     onSuccess: (e) => {
                            //         this.componentDidMount();
                            //     }
                            // })
                        }} />
                })}

                <Item index={"+"}
                    scale={scale}
                    color={STheme.color.lightGray}
                    code="Agregar nueva cuenta"
                    style={{
                        marginBottom: 6,
                        borderLeftWidth: 2,
                        borderLeftColor: STheme.color.lightGray,
                    }}
                    onPress={() => {
                        // PopupCrearPuntoVenta.open({
                        //     key_sucursal: sucursal.key,
                        //     onSuccess: (e) => {
                        //         this.componentDidMount();
                        //     }
                        // })
                    }}

                />
            </SView>
        </SView>
    }
    render() {
        const empresa = this.state.data;
        return <SPage title={"Mi Empresa"}>
            <Container loading={!this.state.data} >
                <SView col={"xs-12"}>
                    <SHr h={16} />
                    <SView row>
                        <SView width={40} height={40} style={{
                            borderRadius: 100,
                            overflow: "hidden",
                            backgroundColor: STheme.color.card,
                        }} center>
                            <SImage src={SSocket.api.empresa + "empresa/" + empresa?.key} />

                        </SView>
                        <SView width={8} />
                        <SView>
                            <SText bold fontSize={20}>{empresa?.razon_social}</SText>
                            <SText fontSize={14} color={STheme.color.lightGray}>NIT: {empresa?.nit}</SText>
                        </SView>
                    </SView>
                    <SHr h={16} />
                    {this.renderSucursales()}
                    {/* <SHr h={32} /> */}
                    {/* {this.renderBancos()} */}
                    <SHr h={32} />
                    {this.renderModenas()}


                </SView>
            </Container>
        </SPage>
    }
}


const SubTitle = ({ label, length, color, onAdd, scale = 1 }) => {
    return <SView row style={{
        alignItems: "center",
        // borderBottomWidth: 1,
        // borderColor: STheme.color.card,
        paddingBottom: 4 * scale,
        paddingTop: 4 * scale
    }}>
        <SText color={color ?? STheme.color.lightGray} fontSize={16 * scale}>{`${label}`}</SText>
        <SView width={8} />
        <SText color={color ?? STheme.color.lightGray} fontSize={16 * scale}>{`(${length})`}</SText>
        {onAdd && <>
            <SView width={8} />
            <SView width={16 * scale} height={16 * scale} onPress={onAdd} padding={4 * scale} card
            // border={STheme.color.warning}
            >
                <SIconApp name='adicionar' fill={STheme.color.warning} />
            </SView>
        </>}
    </SView>
}
const Item = ({ label, index, code, style, onPress, color, scale = 1, onAjuste, imageSrc }) => {
    return <SView row style={[style, { alignItems: "center" }]} onPress={onPress}>
        <SView width={4} />
        <SView width={16 * scale} height={16 * scale} style={{ borderRadius: 100, borderWidth: 1, borderColor: color ?? STheme.color.lightGray }} center>
            <SText fontSize={10 * scale} color={color ?? STheme.color.lightGray}>{(index)}</SText>
        </SView>
        <SView width={4} />
        <SText fontSize={10 * scale} color={STheme.color.lightGray}>{code}</SText>
        <SView width={8} />
        {imageSrc && <>
            <SView width={20 * scale} height={20 * scale} style={{ borderRadius: 100, borderWidth: 1, borderColor: color ?? STheme.color.lightGray }} center>
                <SImage src={imageSrc} style={{
                    width: 20 * scale,
                    height: 20 * scale,
                    borderRadius: 100,
                }} />
            </SView>
            <SView width={8} />
        </>}
        <SText fontSize={14 * scale} >{label}</SText>

        {onAjuste && <>
            <SView width={8} />
            <SView width={16 * scale} height={16 * scale} center onPress={onAjuste} card >
                <SIconApp name='Edit' fill={STheme.color.lightGray} />
            </SView>
        </>}
    </SView>
}