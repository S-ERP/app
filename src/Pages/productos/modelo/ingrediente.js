import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SImage, SInput, SNavigation, SNotification, SPage, SSwitch, SText, STheme, SThread, SView } from 'servisofts-component';
import { Container } from '../../../Components';
import SSocket from 'servisofts-socket';
import MDL from '../../../MDL';
import FloatMenu from '../../../Components/FloatMenu';
import SIconApp from '../../../Assets/SIconApp';
import FloatButtom from '../../../Components/FloatButtom';
import PopupDetalleModelo from '../Components/PopupDetalleModelo';
import FormularioModelo from '../Components/FormularioModelo';
import Recargar from '../../../Components/Recargar';

export default class ingrediente extends Component {
    key_modelo = SNavigation.getParam("key_modelo");

    state = {
        ingrendientes: {},
        modelo: {},
        modelos: {}
    }
    componentDidMount() {
        this.loadIngredientes();
    }
    async loadIngredientes() {
        const respModelos = await SSocket.sendPromise({
            service: "inventario",
            component: "modelo",
            type: "getAll",
            key_empresa: MDL.empresa.select.key,
        })
        const modelo = respModelos.data[this.key_modelo]
        this.setState({ modelo: modelo, modelos: respModelos.data })
        const resp = await SSocket.sendPromise({
            service: "inventario",
            component: "ingrediente",
            type: "getAll",
            key_modelo: this.key_modelo,
        })
        const data = resp.data; // obj
        this.setState({
            ingrendientes: data
        });
    }

    handleAddIngrediente() {
        const ingrediente = this.input_ingrediente.getValue();
        if (!ingrediente) return;
        SSocket.sendPromise({
            service: "inventario",
            component: "ingrediente",
            type: "registro",
            key_usuario: MDL.usuario?.session?.key,
            key_empresa: MDL.empresa?.select?.key,
            data: {
                key_modelo: this.key_modelo,
                descripcion: ingrediente,
                cantidad: 1
            }
        }).then(e => {
            this.input_ingrediente.setValue("");
            this.loadIngredientes();
        })
    }

    handleProducir() {

        const key_almacen = this.getAlmacenKey()
        const newIng = {};
        Object.values(this.state.ingrendientes).map(ing => {
            newIng[ing.key] = {
                ...ing,
                modelo_ingrediente: ing.modelo_ingrediente.filter(a => !!a.cantidad)
            }
        })
        SNotification.send({
            key: "producir_modelo",
            title: "Produciendo...",
            type: "loading",
        })
        const cantidad = this.cantidad_input.getValue() ?? 1
        SSocket.sendPromise({
            service: "inventario",
            component: "modelo",
            type: "producir",
            key_usuario: MDL.usuario?.session?.key,
            key_sucursal: MDL.caja.activa.key_sucursal,
            key_almacen: key_almacen,
            key_modelo: this.key_modelo,
            cantidad: cantidad,
            data: newIng
        }).then(e => {
            SNotification.remove("producir_modelo");
            console.log(e);

            // this.loadIngredientes();
        }).catch(e => {
            console.error(e);
            SNotification.send({
                key: "producir_modelo",
                title: "Error",
                body: e.error,
                color: STheme.color.danger,
                time: 5000,
            })
        })
    }
    render() {
        return <SPage title={"Ingredientes"}>
            <Container>
                <Recargar onFinish={() => {
                    this.loadIngredientes();
                }} />
                <SHr />
                <SView style={{
                    width: 50, height: 50,
                    borderRadius: 4, overflow: "hidden",
                    backgroundColor: STheme.color.card
                }}>
                    <SImage src={SSocket.api.inventario + "/modelo/.512_" + this.key_modelo}
                        enablePreview
                        srcPreview={SSocket.api.inventario + "/modelo/" + this.key_modelo}
                        style={{ resizeMode: "cover" }} />
                </SView>
                <SHr />
                <SText bold fontSize={16}>{this.state?.modelo?.descripcion}</SText>
                {/* <SHr /> */}
                {/* <SInput ref={ref => this.input_ingrediente = ref} label={"Agregar Ingrediente"} customStyle={"erp"} iconR={<SText onPress={this.handleAddIngrediente.bind(this)}>{"SAVE"}</SText>} /> */}
                <SHr />
                <SView col={"xs-12"}>
                    {Object.values(this.state.ingrendientes).map(ing => {
                        return <Ingrediente ingrediente={ing} modelos={this.state.modelos} instance={this} />
                    })}
                </SView>
                <SHr h={50} />
                <SelectAlmacen instance={this} />
                <SHr />
                <SInput type='money2' icon={" "} defaultValue={"1"} label={"Cantidad"}  customStyle={"erp"} ref={ref => this.cantidad_input = ref} />
                <SHr />
                <SText onPress={this.handleProducir.bind(this)} card padding={16}>{"PRODUCIR"}</SText>
                <SHr h={50} />
            </Container>
            {/* <FloatButtom onPress={() => {
                PopupDetalleModelo.open({
                    key_modelo: null,
                    editObject: null,
                    onSuccess: () => {
                        this.loadIngredientes();
                        // this.state.time = new Date().getTime();
                    }
                });
            }} /> */}


        </SPage>
    }
}


const Ingrediente = (props) => {
    const [state, setState] = React.useState({});
    const inputRef = React.useRef();
    // const { ingrediente } = props;
    const ingrediente = props.ingrediente
    const handleOnPress = (evt) => {
        FloatMenu.open({
            e: evt,
            label: ingrediente.descripcion,
            options: [
                {
                    icon: <SIconApp name='Edit' />,
                    label: "Editar",
                    onPress: () => {
                        // ingrediente.modelo_ingrediente.push({
                        //     key_ingrediente: ingrediente.key,
                        //     key_modelo: "ricky"
                        // })
                        // setState({ ...state })
                    }
                },
                {
                    icon: <SIconApp name='Delete' />,
                    label: "Eliminar",
                    onPress: () => {
                        SSocket.sendPromise({
                            service: "inventario",
                            component: "ingrediente",
                            type: "editar",
                            key_usuario: MDL.usuario?.session?.key,
                            data: {
                                key: ingrediente.key,
                                estado: 0
                            }
                        }).then(e => {
                            props.instance.loadIngredientes();
                        })
                    }
                },
            ]
        })
    }

    return <SView >
        <SHr />
        <SView row style={{ alignItems: "center" }}>
            <SText bold onPress={handleOnPress}>- {ingrediente.descripcion}</SText>
            <SView width={8} />
            <InputCantidad
                value={ingrediente.cantidad}
                defaultValue={ingrediente.cantidad}
                onChangeText={e => {
                    ingrediente.cantidad = !e ? "" : parseFloat(e ?? "0");
                    setState({ ...state })
                    new SThread(100, "change_" + ingrediente.key, true).start(() => {
                        SSocket.sendPromise({
                            service: "inventario",
                            component: "ingrediente",
                            type: "editar",
                            key_usuario: MDL.usuario?.session?.key,
                            data: {
                                key: ingrediente.key,
                                cantidad: ingrediente.cantidad || 0
                            }
                        }).then(e => {
                            // props.instance.loadIngredientes();
                        })
                    })
                }} />
            <SView width={8} />

            <SView style={{
                alignItems: "center"
            }}>
                {/* <SView width={4} /> */}
                <SSwitch size={12} defaultValue={ingrediente.is_required} onChange={e => {
                    ingrediente.is_required = e;
                    new SThread(100, "change_" + ingrediente.key, true).start(() => {
                        SSocket.sendPromise({
                            service: "inventario",
                            component: "ingrediente",
                            type: "editar",
                            key_usuario: MDL.usuario?.session?.key,
                            data: {
                                key: ingrediente.key,
                                is_required: ingrediente.is_required || false
                            }
                        }).then(e => {
                            // props.instance.loadIngredientes();
                        })
                    })
                }} />
                <SText fontSize={10}>{"Requerido?"}</SText>
            </SView>
        </SView>
        <SHr />
        <SView style={{
            paddingStart: 16
        }}>
            {(ingrediente?.modelo_ingrediente || []).map((opcion) => {
                return <SView row padding={2} style={{
                    alignItems: "center"
                }}>
                    <SView style={{
                        width: 20, height: 20,
                        borderRadius: 4, overflow: "hidden",
                        backgroundColor: STheme.color.card
                    }}>
                        <SImage src={SSocket.api.inventario + "/modelo/.128_" + opcion.key_modelo + "?date=" + props.instance.state.time}
                            enablePreview
                            srcPreview={SSocket.api.inventario + "/modelo/" + opcion.key_modelo}
                            style={{ resizeMode: "cover" }} />
                    </SView>
                    <SView width={4} />
                    <SText
                        onPress={(evt) => {
                            FloatMenu.open({
                                e: evt,
                                label: props.modelos[opcion.key_modelo]?.descripcion,
                                options: [
                                    {
                                        icon: <SIconApp name='Edit' />,
                                        label: "Editar",
                                        onPress: () => {
                                            FormularioModelo.open({
                                                editObject: props.modelos[opcion.key_modelo],
                                                onSuccess: () => {
                                                    // if (this.table) {
                                                    //     this.table.loadData();
                                                    //     this.state.time = new Date().getTime();
                                                    // }
                                                }

                                            })
                                        }
                                    },
                                    {
                                        icon: <SIconApp name='Eyes' />,
                                        label: "Ver Ingredientes",
                                        onPress: () => {
                                            SNavigation.navigation.navigate({
                                                name: "/productos/modelo/ingrediente",
                                                key: opcion.key_modelo,
                                                params: {
                                                    key_modelo: opcion.key_modelo
                                                }
                                            })

                                        }
                                    },
                                    {
                                        icon: <SIconApp name='Delete' />,
                                        label: "Eliminar",
                                        onPress: () => {
                                            SSocket.sendPromise({
                                                service: "inventario",
                                                component: "modelo_ingrediente",
                                                type: "editar",
                                                key_usuario: MDL.usuario?.session?.key,
                                                data: {
                                                    key: opcion.key,
                                                    estado: 0
                                                }
                                            }).then(e => {
                                                props.instance.loadIngredientes();
                                            })
                                        }
                                    },
                                ]
                            })
                        }}>{props.modelos[opcion.key_modelo]?.descripcion}</SText>
                    <SView width={8} />
                    <InputCantidad onChangeText={e => {
                        opcion.cantidad = parseFloat(e ?? "0")
                    }} />
                </SView>
            })}
            <SHr />
            {/* <SInput style={{
                height: 24,
            }} label={"Agregar Opcion"}
                ref={inputRef}
                type='select2'
                customStyle={"erp"}
                options={Object.values(props.modelos).map(a => a.descripcion)}
                iconR={<SText onPress={() => {
                    const val = inputRef.current.getValue();
                    const modelo = Object.values(props.modelos).find(a => a.descripcion === val)

                    SSocket.sendPromise({
                        service: "inventario",
                        component: "modelo_ingrediente",
                        type: "registro",
                        key_usuario: MDL.usuario?.session?.key,
                        data: {
                            key_modelo: modelo.key,
                            key_ingrediente: ingrediente.key,
                        }
                    }).then(e => {
                        if (!ingrediente.modelo_ingrediente) {
                            ingrediente.modelo_ingrediente = []
                        }
                        ingrediente.modelo_ingrediente.push(e.data)
                        inputRef.current.setValue("")
                        setState({ ...state })
                    })
                }} >{"SAVE"}</SText>} /> */}
        </SView>
        <SHr />
    </SView>
}


const InputCantidad = (props) => {
    const input = React.useRef();
    return <SView row center style={{
        width: 80,
        height: 20,
        borderWidth: 1,
        borderColor: STheme.color.card,
        borderRadius: 4,
    }}>
        <SText card style={{ width: 20, height: 20 }} center

            onPress={() => {
                const val = parseFloat(input.current.getValue() ?? 0) - 1
                if (val <= 0) {
                    input.current.setValue("");
                    return;
                }
                input.current.setValue(val);
            }}

        >{"-"}</SText>
        <SView style={{
            flex: 1,
            height: 20,
        }}>
            <SInput
                ref={input}
                style={{
                    height: 20,
                    fontSize: 12,
                    backgroundColor: "transparent",
                    paddingLeft: 2,
                    paddingRight: 2,
                }}

                icon={<SView />}
                iconR={<SView />}
                customStyle={"erp"}
                type='money2'
                {...props}
            />
        </SView>
        <SText card style={{ width: 20, height: 20 }} center onPress={() => {
            input.current.setValue(parseFloat(input.current.getValue() || "0") + 1);
        }}>{"+"}</SText>
    </SView >
}


const SelectAlmacen = (props) => {
    const [almacenes, setAlmacenes] = React.useState([]);
    const input = React.useRef();

    React.useEffect(() => {
        loadData();
    }, [])

    const loadData = () => {
        MDL.inventario.getAllAlmacen().then(almacenes => {
            const arr = almacenes.filter(a => a.key_sucursal == MDL.caja?.activa?.key_sucursal);
            // if (this.inputs["almacen"]) this.inputs["almacen"].setValue(arr[0]?.descripcion)
            if (input.current) input.current.setValue(arr[0]?.descripcion)
            setAlmacenes(arr)
        });
    }
    props.instance.getAlmacenKey = () => {
        const alm = input.current.getValue();
        return almacenes.find(a => a.descripcion === alm)?.key;
    }
    return <SInput
        ref={input}
        type='select2'
        label={"almacen destino"}
        customStyle={"erp"}
        options={almacenes.map(a => a.descripcion)}
    />
}