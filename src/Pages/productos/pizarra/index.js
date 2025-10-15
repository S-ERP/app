import React from "react";
import { SHr, SImage, SInput, SNavigation, SNotification, SPage, SPopup, SText, STheme, SUuid, SView } from "servisofts-component";
import Pizarra from "../../../Components/Pizarra2/Pizarra";
import PizarraNodo from "../../../Components/Pizarra2/Nodo"
import Puerto from "../../../Components/Pizarra2/Puerto";
;
import MDL from "../../../MDL";
import { View, TextStyle } from "react-native";
import SSocket from "servisofts-socket";
import FloatMenu from "../../../Components/FloatMenu";
import SIconApp from "../../../Assets/SIconApp";
import FormularioModelo from "../Components/FormularioModelo";
import Recargar from "../../../Components/Recargar";
import FormularioIngrediente from "../Components/FormularioIngrediente";
import SelectMenu from "./SelectMenu";
import Elaborar from "../Components/Elaborar";

export default class pizarra extends React.Component {
    state = {
        key_sucursal: MDL.caja?.activa?.key_sucursal,
        filtro: "",
        modelos: [],
        ingredientes: [],
        initialsPositions: {}
    }
    componentDidMount() {
        this.loadData();
    }

    async loadData() {
        const modelos = await MDL.inventario.getAllModeloStockBySucursal(this.state.key_sucursal);
        const ingredientes = await MDL.inventario.getPizarraIngrediente();

        this.setState({
            ingredientes: ingredientes,
            modelos: modelos
        })
    }
    filtro_opacity(obj) {
        if (!this.state.filtro) {
            return 1;
        }
        if (JSON.stringify(obj).toLowerCase().includes(this.state.filtro.toLowerCase())) {
            return 1;
        }
        return 0.3;
    }
    renderModelos() {
        return this.state.modelos.map(modelo => {

            const modelo_ingredientes = [];
            this.state.ingredientes.map(ingrediente => {
                const arr = (ingrediente.modelo_ingrediente ?? []).filter(mi => mi.key_modelo == modelo.key);
                modelo_ingredientes.push(...arr);
            })
            const ipos = this.state.initialsPositions[modelo.key];
            const arrIngredientes = modelo_ingredientes.map(a => a.key_ingrediente);
            // console.log(arrIngredientes)
            modelo.arrIngredientes = [...arrIngredientes];
            return <PizarraNodo key={modelo.key} id={modelo.key} x={ipos?.x ?? 0} y={ipos?.y ?? 0}
                style={{
                    opacity: this.filtro_opacity(modelo)
                }}
                data={{ ...modelo }}
                onDelete={() => {
                    MDL.inventario.saveModelo({
                        key: modelo.key,
                        estado: 0
                    }).then(e => {
                        this.state.modelos = this.state.modelos.filter(a => a.key != modelo.key);
                        this.setState({
                            modelos: this.state.modelos
                        })
                    }).catch(e => {
                        console.log(e)
                    })
                }}

                onDuplicate={(nodo_) => {
                    MDL.inventario.saveModelo({
                        ...modelo,
                        key: null
                    }).then(e => {
                        this.state.modelos.push(e);
                        this.state.initialsPositions[e.key] = {
                            x: nodo_.translateX.value + 20,
                            y: nodo_.translateY.value + 20
                        }
                        this.setState({
                            modelos: this.state.modelos
                        })
                    }).catch(e => {
                        console.log(e)
                    })
                }}
                onDoublePress={e => {
                    FormularioModelo.open({
                        editObject: modelo,
                        onSuccess: (e) => {
                            const index = this.state.modelos.findIndex(a => a.key == modelo.key);
                            if (index > -1) {
                                this.state.modelos[index] = {
                                    ...this.state.modelos[index],
                                    ...e,
                                }
                                this.setState({
                                    modelos: this.state.modelos
                                })
                            }

                            console.log(e);
                        }
                    })
                    console.log(modelo)
                }}>
                <NodoModelo modelo={modelo} key_sucursal={this.state.key_sucursal} />
                <Puerto
                    id="key_ingrediente"
                    type="input"
                    lineType="line"
                    selectLineProps={{
                        strokeDasharray: "0",
                    }}
                    value={modelo.arrIngredientes}

                    onPressLine={e => {
                        e.select.value = true;
                        FloatMenu.open({
                            e: { nativeEvent: { pageX: e.absoluteX, pageY: e.absoluteY } },
                            label: "Modelo Ingrediente",
                            onClose: () => {
                                e.select.value = false;
                            },
                            options: [
                                {
                                    icon: <SIconApp name="Delete" />,
                                    label: "Eliminar Modelo ingrediente",
                                    onPress: () => {
                                        const modelo_ingrediente = (modelo_ingredientes ?? []).find(a => a.key_ingrediente == e.value);
                                        SSocket.sendPromise({
                                            service: "inventario",
                                            component: "modelo_ingrediente",
                                            type: "editar",
                                            key_usuario: MDL.usuario?.session?.key,
                                            data: {
                                                key: modelo_ingrediente.key,
                                                estado: 0,
                                            }
                                        }).then(e => {
                                            this.state.ingredientes.map(ingrediente => {
                                                ingrediente.modelo_ingrediente = (ingrediente.modelo_ingrediente ?? []).filter(mi => mi.key != modelo_ingrediente.key);
                                            })
                                            this.setState({
                                                ingredientes: this.state.ingredientes
                                            })
                                        }).catch(e => {
                                        })
                                    }
                                },
                            ]
                        })
                    }}
                    onConnect={(e) => {

                        const existe = modelo_ingredientes.find(a => a.key_ingrediente == e.value)
                        if (existe) {
                            SNotification.send({
                                title: "Error",
                                body: "Ingrediente ya agregado",
                                color: STheme.color.warning,
                                time: 3000,
                            })
                            return;
                        }

                        SSocket.sendPromise({
                            service: "inventario",
                            component: "modelo_ingrediente",
                            type: "registro",
                            key_usuario: MDL.usuario?.session?.key,
                            data: {
                                key_modelo: modelo.key,
                                key_ingrediente: e.value,
                            }
                        }).then(resp => {
                            this.state.ingredientes.map(ingrediente => {
                                if (ingrediente.key == e.value) {
                                    if (!ingrediente.modelo_ingrediente) {
                                        ingrediente.modelo_ingrediente = []
                                    }
                                    ingrediente.modelo_ingrediente = [
                                        ...ingrediente.modelo_ingrediente,
                                        resp.data
                                    ]
                                }
                            })
                            this.setState({
                                ingredientes: this.state.ingredientes
                            })
                        }).catch(e => {


                        })
                        console.log(e)
                    }}
                    style={{
                        // top: 24,
                        position: "absolute",
                        height: 40,
                        width: 5,
                        borderRadius: 2,
                        left: 0,
                        top: 9,
                        backgroundColor: STheme.color.text
                        // bottom: 0
                    }} />
                <Puerto
                    id="key_modelo"
                    type="output"
                    selectLineProps={{
                        strokeDasharray: "0",
                    }}
                    value={modelo?.key}
                    style={{
                        // top: 36,
                        position: "absolute",
                        width: 20,
                        height: 20,
                        borderRadius: 100,
                        right: -12,
                        top: 18,
                        backgroundColor: STheme.color.text
                        // bottom: 0
                    }} />
            </PizarraNodo>
        })
    }
    renderIngredientes() {
        return this.state.ingredientes.map(ingrediente => {
            const ipos = this.state.initialsPositions[ingrediente.key];
            const kr = (ingrediente.receta ?? []).map(a => a.key_modelo)
            ingrediente.kr = kr;
            return <PizarraNodo key={ingrediente.key} id={ingrediente.key} x={ipos?.x ?? 0} y={ipos?.y ?? 0}
                style={{
                    opacity: this.filtro_opacity(ingrediente)
                }}
                data={{ ...ingrediente }}
                onDelete={() => {
                    MDL.inventario.saveIngrediente({
                        key: ingrediente.key,
                        estado: 0
                    }).then(e => {
                        this.state.ingredientes = this.state.ingredientes.filter(a => a.key != ingrediente.key);
                        this.setState({
                            ingredientes: this.state.ingredientes
                        })
                    }).catch(e => {
                        console.log(e)
                    })
                }}
                onDoublePress={e => {
                    FormularioIngrediente.open({
                        editObject: ingrediente,
                        onSuccess: (e) => {
                            const index = this.state.ingredientes.findIndex(a => a.key == ingrediente.key);
                            if (index > -1) {
                                this.state.ingredientes[index] = {
                                    ...this.state.ingredientes[index],
                                    ...e,
                                }
                                this.setState({
                                    ingredientes: this.state.ingredientes
                                })
                            }
                        }
                    })
                }}>
                <NodoIngrediente ingrediente={ingrediente} />
                <Puerto
                    id="key_modelo"
                    type="input"
                    value={kr}
                    selectLineProps={{
                        strokeDasharray: "0",
                    }}
                    style={{
                        position: "absolute",
                        // top: 15,
                        height: 21,
                        width: 6,
                        borderRadius: 2,
                        left: 7 + 4,
                        top: 7 + 4,
                        backgroundColor: STheme.color.text
                        // bottom: 0
                    }}
                    onPressLine={e => {
                        e.select.value = true;
                        FloatMenu.open({
                            e: { nativeEvent: { pageX: e.absoluteX, pageY: e.absoluteY } },
                            label: "Receta",
                            onClose: () => {
                                e.select.value = false;
                            },
                            options: [
                                {
                                    icon: <SIconApp name="Delete" />,
                                    label: "Eliminar receta",
                                    onPress: () => {
                                        const receta = (ingrediente.receta ?? []).find(a => a.key_modelo == e.value);
                                        MDL.inventario.deleteReceta(receta.key).then(e => {
                                            ingrediente.receta = (ingrediente.receta ?? []).filter(a => a.key != receta.key);
                                            this.setState({
                                                ingredientes: this.state.ingredientes
                                            })
                                        }).catch(e => {

                                        })
                                    }
                                },
                            ]
                        })
                    }}
                    onConnect={(e) => {
                        MDL.inventario.saveReceta({
                            key_modelo: e.value,
                            key_ingrediente: ingrediente.key
                        }).then(resp => {
                            if (!ingrediente.receta) {
                                ingrediente.receta = []
                            }
                            ingrediente.receta = [
                                ...ingrediente.receta,
                                resp
                            ]
                            this.setState({
                                ingredientes: this.state.ingredientes
                            })
                        }).catch(e => {

                        })
                    }}
                />
                <Puerto
                    id="key_ingrediente"
                    type="output"
                    value={ingrediente?.key}
                    selectLineProps={{
                        strokeDasharray: "0",
                    }}
                    style={{
                        position: "absolute",
                        // top: 18,
                        width: 20,
                        height: 20,
                        borderRadius: 100,
                        right: 4,
                        top: 7 + 4,
                        backgroundColor: STheme.color.text
                        // bottom: 0
                    }} />
            </PizarraNodo>
        })
    }

    renderFiltros() {
        return <SView style={{ position: "absolute", top: 10, left: 10, flexDirection: "row" }} >
            {/* <SView width={50} >
                <SInput type="select2" options={["1", "2"]} label={"version"} placeholder={"1"} customStyle={"erp"}
                    onChangeText={e => {
                        this.setState({
                            version: e
                        })
                    }} />
            </SView> */}
            <SView width={8} />
            <SView width={100}>
                <SInput style={{ width: 100 }} label={"Buscar"} customStyle={"erp"}
                    onChangeText={e => {
                        this.setState({
                            filtro: e
                        })
                    }} />
            </SView>
            <SView width={8} />
            <SView width={100}>
                <SInput style={{ width: 100 }} label={"Sucursal"} customStyle={"erp"}
                    defaultValue={MDL.caja?.activa?.key_sucursal}
                    onChangeText={e => {
                        this.state.key_sucursal = e;
                        // this.setState({
                        //     filtro: e
                        // })
                    }} />
            </SView>
        </SView>
    }
    render() {
        return <SPage title={"pizarra"} disableScroll>
            <Pizarra id={"productos_pizarra"} scale={0.5} exponentDeRedondeoDeMovimiento={10}
                onSelectChange={e => {
                    console.log(e)
                    if (this.selectMenu) {
                        this.selectMenu.onChangeSelect(e);
                    }
                }}
                onDoublePress={e => {
                    FloatMenu.open({
                        e: { nativeEvent: { pageX: e.absoluteX, pageY: e.absoluteY } },
                        label: "Agregar nodo",
                        options: [
                            {
                                icon: <SIconApp name="Money" />,
                                label: "Modelo",
                                onPress: () => {
                                    FormularioModelo.open({
                                        onSuccess: (modelo) => {
                                            console.log(modelo, e)
                                            this.state.initialsPositions[modelo.key] = {
                                                x: e.pizarraX,
                                                y: e.pizarraY,

                                            }
                                            this.loadData();
                                        }
                                    })
                                }
                            },
                            {
                                icon: <SIconApp name="Money" />,
                                label: "Ingrediente",
                                onPress: () => {
                                    FormularioIngrediente.open({
                                        onSuccess: (resp) => {
                                            this.state.initialsPositions[resp.key] = {
                                                x: e.pizarraX,
                                                y: e.pizarraY,

                                            }
                                            this.state.ingredientes.push(resp);
                                            this.setState({
                                                ingredientes: this.state.ingredientes
                                            })
                                        }
                                    })

                                }
                            },
                        ]
                    })
                    console.log(e)

                }}>
                {this.renderModelos()}
                {this.renderIngredientes()}
            </Pizarra>
            <SView style={{ position: "absolute", left: 10, bottom: 10, }} >
                <Recargar onFinish={() => {
                    this.loadData();
                }} />
            </SView>
            <SelectMenu ref={ref => this.selectMenu = ref} />
            {this.renderFiltros()}
        </SPage >
    }
}


const NodoModelo = (props) => {
    const { modelo } = props;
    const height = 100;
    return <View style={{
        backgroundColor: STheme.color.background,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: STheme.color.card,
        width: 250,
        // height: height,

        overflow: "hidden"
    }}>
        <SView col={"xs-12"} row>
            <View style={{ width: 50, height: 50 - 2, padding: 4, }}>
                <View style={{ width: "100%", height: "100%", borderRadius: 4, overflow: 'hidden', borderWidth: 1, borderColor: STheme.color.card, }}>
                    <SImage style={{ resizeMode: "cover" }} src={SSocket.api.inventario + "/modelo/.512_" + modelo.key}
                    // enablePreview 
                    // srcPreview={SSocket.api.inventario + "/modelo/" + modelo.key}
                    />
                </View>
            </View>
            <SView flex style={{ padding: 4, }}>
                <SText bold fontSize={12} clean>{modelo.descripcion}</SText>
                <SText fontSize={10} color={STheme.color.lightGray} clean>{modelo.observacion}</SText>
                <SText flex>
                    <Tag>{modelo?.tipo_producto?.tipo}</Tag>
                    <SText clean>{" "}</SText>
                    <Tag>{modelo?.tipo_producto?.descripcion}</Tag>
                    <SText clean>{" "}</SText>
                    <Tag>{modelo?.marca?.descripcion}</Tag>
                    <SText clean>{" "}</SText>
                    <Tag style={{ backgroundColor: !modelo.stock ? STheme.color.danger : STheme.color.success }} >{!modelo?.stock ? "Agotado" : `${modelo.stock} und.`}</Tag>
                    <SText clean>{" "}</SText>
                    {!!modelo.stock_padres && <Tag style={{ backgroundColor: STheme.color.warning }} >{`${modelo.stock_padres} und.`}</Tag>}
                    <SText clean>{" "}</SText>
                    <SText card padding={2} fontSize={8} onPress={() => {
                        SNavigation.navigate("/productos/modelo/ingrediente", { key_modelo: modelo.key })
                    }}>{"Elaborar"}</SText>
                    <SText clean>{" "}</SText>
                    <SText card padding={2} fontSize={8} onPress={() => {
                        Elaborar.open({
                            modelo: modelo,
                            key_sucursal: props.key_sucursal,
                        })
                        // SNavigation.navigate("/productos/modelo/ingrediente", {key_modelo: modelo.key })
                    }}>{"Descomponer"}</SText>
                </SText>

            </SView>
        </SView>
        <SView col={"xs-12"} row style={{
            paddingHorizontal: 4
        }}>
            {modelo?.precio_compra && <SText bold style={{
                fontSize: 12,
                color: STheme.color.danger
            }}>BOB {modelo?.precio_compra}</SText>}
            <SView flex />
            {modelo?.precio_venta && <SText bold style={{
                fontSize: 12,
                color: STheme.color.success
            }}>BOB {modelo?.precio_venta}</SText>}
        </SView>
    </View >
}
const NodoIngrediente = (props) => {
    const { ingrediente } = props;
    const height = 70;
    return <View style={{
        width: height + 20,
        alignItems: "center"
    }}>
        <View style={{
            backgroundColor: STheme.color.background,
            borderTopLeftRadius: 12,
            borderBottomLeftRadius: 12,
            borderTopRightRadius: 100,
            borderBottomRightRadius: 100,
            borderWidth: 1,
            borderColor: STheme.color.card,
            width: height,
            height: height * 0.50,
            paddingRight: 8,
            // flexDirection: "row",
            overflow: "hidden",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <SText fontSize={12} clean>{ingrediente.cantidad}</SText>
            {ingrediente.is_required && <SText color={STheme.color.warning} fontSize={7} clean>{"Requerido"}</SText>}
            {/* <SView flex style={{ padding: 4, }}>

            </SView> */}
        </View>
        <SText bold fontSize={12} clean>{ingrediente.descripcion}</SText>
    </View>
}

const Tag = (props: { style: TextStyle }) => {
    return <SText style={{
        fontSize: 8,
        // backgroundColor: STheme.color.card,
        borderWidth: 1,
        padding: 2,
        borderRadius: 4,
        borderColor: STheme.color.card,
        ...(props.style ?? {})
    }} clean numberOfLines={1}>
        {props.children}
    </SText>
}