import React from "react";
import { SHr, SImage, SInput, SNavigation, SNotification, SPage, SPopup, SText, STheme, SUuid, SView } from "servisofts-component";
import Pizarra from "../../../Components/Pizarra2/Pizarra";
import PizarraNodo from "../../../Components/Pizarra2/Nodo"
import Puerto from "../../../Components/Pizarra2/Puerto";
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
import PopupComprar from "../Components/PopupComprar";
import theme, { ColorCompraVenta } from "../../../Config/theme";
import FiltroSelector2 from "../modelo/Components/FiltroSelector2";
export default class pizarrassss extends React.Component {
    state = {
        key_sucursal: MDL.caja?.activa?.key_sucursal,
        filtro: "",
        selectedSucursal: null,
        selectedAlmacen: null,
        selectedStock: null,
        modelos: [],
        ingredientes: [],
        initialsPositions: {},
    }
    selectedMoneda: null;
    componentDidMount() {
        this.loadData();
        this.cargarMonedaSeleccionada();
        window.addEventListener("keydown", this.handleKeyDown);
    }
    componentWillUnmount() {
        window.removeEventListener("keydown", this.handleKeyDown);
    }
    handleKeyDown(e) {
        if (e.key === "Escape") {
            this.filtroSucursalRef?.reset();
            this.filtroAlmacenRef?.reset();
            this.filtroStockRef?.reset();
            this.setState({ filtro: "", selectedSucursal: null, selectedAlmacen: null, selectedStock: null }, () => {
                this.loadData();
            });
        }
    };
    async loadData() {
        const currentRequestId = Date.now();
        this._lastRequestId = currentRequestId;
        try {
            const {
                selectedAlmacen,
                selectedSucursal,
                selectedStock,
                selectedTipoCuenta,
                selectedTipoModelo
            } = this.state;
            const [
                monedas,
                clientes,
                tipo_costos,
                modelos,
                ingredientes
            ] = await Promise.all([
                MDL.empresa.getMonedas().catch(e => {
                    console.error("Error getMonedas:", e);
                    return [];
                }),
                MDL.crm.cliente.getAll().catch(e => {
                    console.error("Error getClientes:", e);
                    return [];
                }),
                MDL.inventario.getAllTipoCosto().catch(e => {
                    console.error("Error getTipoCosto:", e);
                    return [];
                }),
                MDL.inventario.getAllModeloStock(
                    selectedAlmacen?.key ?? "",
                    selectedSucursal?.key ?? ""
                ).catch(e => {
                    console.error("Error getModelos:", e);
                    return [];
                }),
                MDL.inventario.getPizarraIngrediente().catch(e => {
                    console.error("Error getIngredientes:", e);
                    return [];
                })
            ]);
            const monedasByKey = Object.fromEntries(
                (monedas ?? []).map(m => [m?.key, m])
            );
            const clientesByKey = Object.fromEntries(
                (clientes ?? []).map(c => [c?.key, c])
            );
            const tipoCostoByKey = Object.fromEntries(
                (tipo_costos ?? []).map(tc => [tc?.key, tc])
            );
            let data_mejorada = (modelos ?? []).map(e => ({
                ...e,
                compra_moneda: monedasByKey[e?.precio_compra_moneda] ?? {},
                venta_moneda: monedasByKey[e?.precio_venta_moneda] ?? {},
                contactos: (e?.contactos ?? []).map(c => ({
                    ...c,
                    cliente: clientesByKey[c?.key_cliente] ?? {},
                    tipo_costo: tipoCostoByKey[c?.key_tipo_costo] ?? {},
                })),
                proveedores: (e?.proveedores ?? []).map(p => ({
                    ...p,
                    proveedor: clientesByKey[p?.key_proveedor] ?? {},
                })),
                tipo_producto: e?.tipo_producto ?? {},
                marca: e?.marca ?? {},
                tags: e?.tags ?? [],
                stock: Number(e?.stock ?? 0),
            }));
            if (selectedStock?.key === "con_stock") {
                data_mejorada = data_mejorada.filter(m => m.stock > 0);
            } else if (selectedStock?.key === "sin_stock") {
                data_mejorada = data_mejorada.filter(m => m.stock <= 0);
            }
            if (selectedTipoCuenta?.key && selectedTipoCuenta.key !== "Todos") {
                data_mejorada = data_mejorada.filter(
                    m => m?.tipo_producto?.tipo === selectedTipoCuenta.key
                );
            }
            if (selectedTipoModelo?.key && selectedTipoModelo.key !== "Todos") {
                data_mejorada = data_mejorada.filter(
                    m => m?.tipo_producto?.descripcion === selectedTipoModelo.key
                );
            }
            if (this._lastRequestId !== currentRequestId) return [];
            this.modelos = data_mejorada;
            this.setState({
                ingredientes,
                modelos: data_mejorada
            });
            return data_mejorada;
        } catch (error) {
            console.error("Error real en loadData:", error);
            SPopup.alert(
                "Error al cargar modelos",
                error?.message || "Error desconocido"
            );
            return [];
        }
    }
    cargarMonedaSeleccionada = async () => {
        try {
            const empresa_srl = await MDL.empresa.getFull();
            if (!empresa_srl) {
                console.error("No se cargó la empresa");
                return;
            }
            const base = empresa_srl.monedas.find(a => a.tipo == "base");
            const monedas = empresa_srl.monedas;
            this.selectedMoneda = base;
            this.monedas = monedas;
        } catch (error) {
            console.error("Error cargando moneda seleccionada:", error);
        }
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
            modelo.compra_moneda = this.monedas.find(m => m.key === modelo.precio_compra_moneda) || this.monedas.find(m => m.tipo === "base") || {};
            modelo.venta_moneda = this.monedas.find(m => m.key === modelo.precio_venta_moneda) || this.monedas.find(m => m.tipo === "base") || {}; const modelo_ingredientes = [];
            this.state.ingredientes.map(ingrediente => {
                const arr = (ingrediente.modelo_ingrediente ?? []).filter(mi => mi.key_modelo == modelo.key);
                modelo_ingredientes.push(...arr);
            })
            const ipos = this.state.initialsPositions[modelo.key];
            const arrIngredientes = modelo_ingredientes.map(a => a.key_ingrediente);
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
                        console.error(e)
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
                        }
                    })
                }}>
                <NodoModelo modelo={modelo} key_sucursal={this.state.key_sucursal} moneda_base={this.selectedMoneda} />
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
                        }).catch(e => { })
                    }}
                    style={{
                        position: "absolute",
                        height: 40,
                        width: 5,
                        borderRadius: 2,
                        left: 0,
                        top: 9,
                        backgroundColor: STheme.color.text
                    }} />
                <Puerto
                    id="key_modelo"
                    type="output"
                    selectLineProps={{ strokeDasharray: "0" }}
                    value={modelo?.key}
                    style={{
                        position: "absolute",
                        width: 20,
                        height: 20,
                        borderRadius: 100,
                        right: -12,
                        top: 18,
                        backgroundColor: STheme.color.text
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
                        height: 21,
                        width: 6,
                        borderRadius: 2,
                        left: 7 + 4,
                        top: 7 + 4,
                        backgroundColor: STheme.color.text
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
                                            console.error(e)
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
                            console.error(e)
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
                        width: 20,
                        height: 20,
                        borderRadius: 100,
                        right: 4,
                        top: 7 + 4,
                        backgroundColor: STheme.color.text
                    }} />
            </PizarraNodo>
        })
    }
    renderFiltros() {
        return <SView style={{ position: "absolute", top: 10, left: 10, flexDirection: "row" }} >
            <SView width={8} />
            <SView width={200}>
                <SInput
                    ref={ref => this.buscarRef = ref}
                    label={"Buscar"} customStyle={"erp"}
                    style={{ width: "100%", height: 30, fontSize: 11, color: STheme.color.text, backgroundColor: STheme.color.card, opacity: 1 }}
                    onChangeText={e => {
                        this.setState({ filtro: e })
                        this.loadData()
                    }} />
            </SView>
            <SView width={8} />
            <SView width={150}>
                <FiltroSelector2
                    ref={ref => this.filtroSucursalRef = ref}
                    label="Sucursal"
                    loadData={MDL.empresa.getAllSucursales}
                    mapOption={a => ({ key: a.key, nombre: a.descripcion })}
                    onSelect={item => {
                        this.filtroAlmacenRef?.reset(false);
                        this.setState({ selectedSucursal: item }, () => {
                            this.loadData();
                        });
                    }}
                />
            </SView>
            <SView width={8} />
            <SView width={185}>
                <FiltroSelector2
                    ref={ref => this.filtroAlmacenRef = ref}
                    label="Almacén"
                    loadData={MDL.inventario.getAllAlmacen}
                    mapOption={a => ({ key: a.key, nombre: a.descripcion })}
                    onSelect={item => {
                        this.filtroSucursalRef?.reset(false);
                        this.setState({ selectedAlmacen: item, }, () => {
                            this.loadData();
                        });
                    }}
                />
            </SView>
            <SView width={8} />
            <SView width={150}>
                <FiltroSelector2
                    ref={ref => this.filtroStockRef = ref}
                    label="Stock"
                    loadData={async () => [
                        { key: "con_stock", nombre: "Con stock" },
                        { key: "sin_stock", nombre: "Sin stock" },
                    ]}
                    mapOption={a => ({ key: a.key, nombre: a.nombre })}
                    onSelect={item => this.setState({ selectedStock: item }, () => this.loadData())}
                />
            </SView>
        </SView>
    }
    render() {
        return <SPage title={"pizarrasss"} disableScroll>
            <Pizarra id={"productos_pizarra"} scale={0.5} exponentDeRedondeoDeMovimiento={10}
                onSelectChange={e => {
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
    const { modelo, moneda_base } = props;
    const height = 100;
    const tipoCambioProducto = modelo.venta_moneda?.tipo_cambio || 1;
    const tipoCambioSeleccionada = moneda_base?.tipo_cambio || 1;
    const precioConvertido_compra = modelo.precio_compra * (tipoCambioProducto / tipoCambioSeleccionada);
    const precioFormateado_compra = Number.isInteger(precioConvertido_compra) ? precioConvertido_compra.toString() : precioConvertido_compra.toFixed(2);// const precioConvertido_venta = modelo.precio_venta * (tipoCambioProducto / tipoCambioSeleccionada);
    const latencia = {
        "descripcion": "Simba 2Ltrs",
        "estado": 1,
        "key_usuario": "1e4b2e09-94f1-4f9e-9d58-80d4d2f9ab3b",
        "fecha_edit": null,
        "unidad_medida": null,
        "fecha_on": "2025-08-30T03:53:34.298",
        "precio_compra": 10,
        "key_tipo_producto": "d1803e0d-3fdc-4edb-9a23-f5ae0920c05d",
        "precio_venta": 12,
        "precio_compra_moneda": null,
        "codigo_ref": null,
        "key_marca": "8bd09dad-9edd-49d7-a5f9-98b70c17688f",
        "marca": {
            "descripcion": "Servisofts",
            "estado": 1,
            "key_usuario": "b2aa9d81-5f63-40ce-ae35-31fbb1417745",
            "key_empresa": "f894ea35-5ad1-4b61-a2d0-9294965be169",
            "fecha_on": "2025-08-27T01:04:09.702",
            "key_servicio": "1427e867-c4f7-4602-a1aa-5deabf2d0372",
            "key": "8bd09dad-9edd-49d7-a5f9-98b70c17688f",
            "observacion": null
        },
        "duracion_medida": null,
        "precio_venta_moneda": "12",
        "tipo_producto": {
            "descripcion": "Bebidas",
            "estado": 1,
            "tipo": "inventario",
            "key_cuenta_contable_ganancia": "fefe197b-e828-4218-b9e2-ac87cec6e025",
            "key_usuario": "b2aa9d81-5f63-40ce-ae35-31fbb1417745",
            "key_cuenta_contable_depreciacion_gasto": null,
            "unidad_medida_facturacion": "1",
            "color": "",
            "key_empresa": "f894ea35-5ad1-4b61-a2d0-9294965be169",
            "fecha_on": "2025-08-13T00:32:14.894",
            "codigo_facturacion": "62162",
            "key_cuenta_contable": "9b125901-3aea-4506-bd42-d168c90996fa",
            "key_cuenta_contable_depreciacion_activo": null,
            "vida_util": null,
            "key_servicio": "1427e867-c4f7-4602-a1aa-5deabf2d0372",
            "key": "d1803e0d-3fdc-4edb-9a23-f5ae0920c05d",
            "observacion": "",
            "key_cuenta_contable_costo": "246780ef-16d1-4b45-96ea-724a8a7e6615"
        },
        "duracion": null,
        "stock_padres": 0,
        "cantidad_suscriptores": null,
        "stock": 2,
        "barcode": "6456546456456",
        "key": "a6c5ae70-8d57-47a5-abf5-69222d7f9f60",
        "observacion": null,
        "compra_moneda": {},
        "venta_moneda": {
            "descripcion": "Boliviano",
            "estado": 1,
            "tipo": "base",
            "key_usuario": "b2aa9d81-5f63-40ce-ae35-31fbb1417745",
            "key_empresa": "f894ea35-5ad1-4b61-a2d0-9294965be169",
            "fecha_on": "2025-09-05T23:19:05.000589",
            "tipo_cambio": 1,
            "key": "2f6b73df-8004-41c1-aa5f-1a81d79d1a8f",
            "observacion": "BOB"
        },
        "monedaSymbol": "BOB",
        "tipoCostos": [],
        "tipo_cambio": 1
    };
    return <View style={{
        backgroundColor: STheme.color.background,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: STheme.color.card,
        width: 250,
        overflow: "hidden"
    }}>
        <SView col={"xs-12"} row>
            <View style={{ width: 50, height: 50 - 2, padding: 4, }}>
                <View style={{ width: "100%", height: "100%", borderRadius: 4, overflow: 'hidden', borderWidth: 1, borderColor: STheme.color.card, }}>
                    <SImage style={{ resizeMode: "cover" }} src={SSocket.api.inventario + "/modelo/.512_" + modelo.key} />
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
                    }}>{"Descomponer"}</SText>
                    <SText clean>{" "}</SText>
                    <SText card padding={2} fontSize={8} onPress={() => {
                        PopupComprar.open({
                            modelo: modelo,
                            cantidad: 1,
                            precio: modelo.precio_compra
                        })
                    }}>{"Agregar al carrito"}</SText>
                </SText>
            </SView>
        </SView>
        <SView col={"xs-12"} row style={{ paddingHorizontal: 4 }}>
            {modelo?.precio_compra &&
                <SText bold style={{
                    fontSize: 12,
                    color: ColorCompraVenta.compra
                }}>BOB {modelo?.precio_compra}</SText>
            }<SView flex />
            {modelo?.precio_venta &&
                <SView style={{ alignItems: "flex-end" }}>
                    <SText bold style={{
                        fontSize: 12,
                        color: ColorCompraVenta.venta,
                        alignContent: "flex-end"
                    }}>BOB {modelo?.precio_venta}</SText>
                </SView>
            }
        </SView>
        <SView flex />
        <SView col={"xs-12"} row style={{
            paddingHorizontal: 4
        }}>
            <SView card padding={3} row center width={70} onPress={() => {
                const productoAjustado = {
                    ...modelo,
                    precio_compra: modelo.precio_compra,
                    precio_compra_moneda: precioFormateado_compra,
                    monedaSymbol: moneda_base.observacion,
                };
                MDL.carrito.agregarItemAlCarritoDeCompras({
                    modelo: productoAjustado,
                    cantidad: 1,
                    precio: productoAjustado.precio_compra
                })
            }}>
                <SView height={15} width={15}>
                    <SIconApp name="compraCarro" fill={STheme.color.text} />
                </SView>
                <SView width={3} />
                <SText fontSize={8} center>COMPRAR</SText>
            </SView>
            <SView flex />
            <SView card padding={3} row width={65} center style={{ alignItems: "flex-end" }} onPress={() => {
                MDL.carrito.agregarItemAlCarritoDeVentas({
                    modelo: latencia,
                    cantidad: 1,
                    precio: latencia.precio_venta
                })
            }}>
                <SView height={15} width={15}>
                    <SIconApp name="ventaCarro" fill={STheme.color.text} />
                </SView>
                <SView width={3} />
                <SText fontSize={8} center height={15} >VENDER</SText>
            </SView>
            <SHr height={5} />
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
            overflow: "hidden",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <SText fontSize={12} clean>{ingrediente.cantidad}</SText>
            {ingrediente.is_required && <SText color={STheme.color.warning} fontSize={7} clean>{"Requerido"}</SText>}
        </View>
        <SText bold fontSize={12} clean>{ingrediente.descripcion}</SText>
    </View>
}
const Tag = (props: { style: TextStyle }) => {
    return <SText style={{
        fontSize: 8,
        borderWidth: 1,
        padding: 2,
        borderRadius: 4,
        borderColor: STheme.color.card,
        ...(props.style ?? {})
    }} clean numberOfLines={1}>
        {props.children}
    </SText>
}