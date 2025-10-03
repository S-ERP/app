import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SInput, SNavigation, SNotification, SPage, SSwitch, SText, STheme, SThread, SView } from 'servisofts-component';
import { Container } from '../../../Components';
import SSocket from 'servisofts-socket';
import MDL from '../../../MDL';
import FloatMenu from '../../../Components/FloatMenu';
import SIconApp from '../../../Assets/SIconApp';
import FloatButtom from '../../../Components/FloatButtom';
import PopupDetalleModelo from '../Components/PopupDetalleModelo';

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
        SSocket.sendPromise({
            service: "inventario",
            component: "ingrediente",
            type: "registro",
            key_usuario: MDL.usuario?.session?.key,
            data: {
                key_modelo: this.key_modelo,
                descripcion: ingrediente,
                cantidad: 1
            }
        }).then(e => {
            this.loadIngredientes();
        })
    }

    handleProducir() {
        const newIng = {};
        Object.values(this.state.ingrendientes).map(ing => {
            newIng[ing.key] = {
                ...ing,
                modelo_ingrediente: ing.modelo_ingrediente.filter(a => !!a.cantidad)
            }
        })
        SSocket.sendPromise({
            service: "inventario",
            component: "modelo",
            type: "producir",
            key_usuario: MDL.usuario?.session?.key,
            key_sucursal: MDL.caja.activa.key_sucursal,
            key_modelo: this.key_modelo,
            data: newIng
        }).then(e => {
            console.log(e);

            // this.loadIngredientes();
        }).catch(e => {
            console.error(e);
            SNotification.send({
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
                <SHr />
                <SText bold fontSize={16}>{this.state?.modelo?.descripcion}</SText>
                <SHr />
                <SInput ref={ref => this.input_ingrediente = ref} label={"ingrediente"} customStyle={"erp"} iconR={<SText onPress={this.handleAddIngrediente.bind(this)}>{"SAVE"}</SText>} />
                <SHr />
                <SView col={"xs-12"}>
                    {Object.values(this.state.ingrendientes).map(ing => {
                        return <Ingrediente ingrediente={ing} modelos={this.state.modelos} instance={this} />
                    })}
                </SView>
                <SText onPress={this.handleProducir.bind(this)}>{"PRODUCIR"}</SText>
            </Container>
            <FloatButtom onPress={() => {
                PopupDetalleModelo.open({
                    key_modelo: null,
                    editObject: null,
                    onSuccess: () => {
                        this.loadIngredientes();
                        // this.state.time = new Date().getTime();
                    }
                });
            }} />
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
            <SText onPress={handleOnPress}>- {ingrediente.descripcion}</SText>
            <SView width={8} />
            <SView row style={{
                alignItems: "center"
            }}>
                <SText fontSize={10}>{"Requerido?"}</SText>
                <SView width={4} />
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
                <SView width={4} />
                <InputCantidad  label={"cantidad"}
                    defaultValue={ingrediente.cantidad}
                    onChangeText={e => {
                        ingrediente.cantidad = parseFloat(e ?? "0");
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
            </SView>
        </SView>
        <SHr />
        <SView style={{
            paddingStart: 16
        }}>
            {(ingrediente?.modelo_ingrediente || []).map((opcion) => {
                return <SView row padding={2}>
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
                                            // ingrediente.modelo_ingrediente.push({
                                            //     key_ingrediente: ingrediente.key,
                                            //     key_modelo: "ricky"
                                            // })
                                            // setState({ ...state })
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
            <SInput style={{
                height: 24,
                width: 200,
            }} label={"modelo"}
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
                }} >{"SAVE"}</SText>} />
        </SView>
        <SHr />
    </SView>
}


const InputCantidad = (props) => {
    return <SView row center style={{
        width: 80,
        height: 20,
        borderWidth: 1,
        borderColor: STheme.color.card,
        borderRadius: 4,
    }}>
        <SText card style={{ width: 20, height: 20 }} center>{"-"}</SText>
        <SView style={{
            flex: 1,
            height: 20,
        }}>
            <SInput
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
        <SText card style={{ width: 20, height: 20 }} center>{"+"}</SText>
    </SView >
}