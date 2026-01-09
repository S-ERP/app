import React, { Component, createRef, useState } from 'react';
import { UIManager, findNodeHandle } from 'react-native';
import { SHr, SInput, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import { FlatList, ScrollView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from 'react-native-reanimated';
import MDL from '../../MDL';
import Etiqueta from './Components/Etiqueta';
import DashboardCard from './Components/DashboardCard';
import FormRegistroTipoCliente from '../crm/Components/FormRegistroTipoCliente';
import SIconApp from '../../Assets/SIconApp';
import FloatMenu from '../../Components/FloatMenu';
import FloatButtom from '../../Components/FloatButtom';
import all from '../usuario/all';

// ✅ STAGE CONVERTIDO A CLASE CON CALLBACK PARA PADRE
class Stage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedStageKey: null,
            mostrar: false,
            clientes: [],
        };
    }

    handleStageSelect = (e) => {
        const { stage, onStageSelect } = this.props;
        this.setState({ selectedStageKey: stage.key });
        // ✅ NOTIFICAR AL PADRE PARA CAMBIAR EL BORDER
        onStageSelect(stage.key);

        // ✅ ARRAY DE OPCIONES CORREGIDO
        const menuOptions = [
            {
                label: 'Editar Tipo',
                icon: <SIconApp name="Pencil" fill="#e4e4e4ff" width={16} />,
                onPress: () => {
                    FormRegistroTipoCliente.open({
                        defaultData: stage,
                        onRegister: () => this.props.onLoadData(),
                        onActualizar: () => this.props.onLoadData()
                    })
                }
            },

            {
                label: 'Agregar Contacto',
                icon: <SIconApp name="tareaUser" fill="#e4e4e4ff" width={16} />,
                onPress: () => {
                    SNavigation.navigate("/crm/cliente", {
                        onSelect: (e) => {
                            MDL.crm.tipoCliente.addToCliente({
                                key_cliente: e.key,
                                key_tipo_cliente: stage.key
                            }).then((response) => {
                                this.props.onAddCliente(stage.key, e.key);
                                SNotification.send({
                                    title: "✅ Cliente agregado",
                                    color: STheme.color.success,
                                    time: 1500
                                });
                            }).catch(err => {
                                SNotification.send({
                                    title: "❌ Error",
                                    body: err,
                                    color: STheme.color.danger
                                });
                            });
                        }
                    })
                },
            },

            {
                label: 'Eliminar Tipo',
                icon: <SIconApp name="crmeliminar" fill={STheme.color.danger} height={16} />,
                onPress: () => {
                    SPopup.confirm({
                        title: (<SView center style={{ textAlign: 'center', gap: 16, paddingTop: 18, paddingBottom: 14, paddingHorizontal: 20 }}>
                            <SView col="xs-12" row style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                <SView flex>
                                    <SText style={{ fontSize: 18, fontWeight: 'bold', color: STheme.color.text }}> Eliminar tipo contacto</SText>
                                </SView>
                                <SView>
                                    <SIconApp name="Cerrar" width={10} fill="#9ca3af" onPress={() => SPopup.close('confirm')} />
                                </SView>
                            </SView>

                            <SView style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(220, 38, 38, 0.2)', alignItems: 'center', justifyContent: 'center' }}>
                                <SIconApp name="crmeliminar" height={20} fill="#dc2626" />
                            </SView>

                            <SView style={{ marginBottom: 4 }}>
                                <SText style={{ fontSize: 16, color: STheme.color.text, textAlign: 'center' }}> ¿Estás seguro de que deseas eliminar la categoría</SText>
                            </SView>

                            <SView style={{ marginBottom: 8 }}>
                                <SText style={{ fontSize: 18, fontWeight: 'bold', color: STheme.color.text, textAlign: 'center' }}> {stage.titulo} </SText>
                            </SView>

                            <SText style={{ fontSize: 12, color: '#737373', textAlign: 'center' }}> Todos los contactos de esta categoría permanecerán sin categoría. </SText>
                        </SView>),
                        onPress: () => {
                            MDL.crm.tipoCliente.eliminar(stage.key).then(() => {
                                this.props.onDeleteStage(stage.key);
                                SNotification.send({
                                    title: `✅ "${stage.titulo}" eliminado`,
                                    color: STheme.color.success,
                                    time: 2000
                                });
                            }).catch(err => {
                                SNotification.send({
                                    title: "❌ Error al eliminar",
                                    body: err,
                                    color: STheme.color.danger
                                });
                            });
                        }
                    });
                },
            },

        ];

        FloatMenu.open({
            e: e,
            label: 'Opciones del tipo - ' + stage?.titulo,
            options: menuOptions,
        });
    };

    render() {
        const { stage, cards, onCardDrop, onDragStart, onDragMove, draggingCard, cardRefs, onDeleteStage, onAddCliente, onRemoveCliente, onLoadData, allClientes } = this.props;
        console.log("sddd", this.props)
        const isSelected = this.state.selectedStageKey === stage.key;
        console.log("ALL", allClientes)
        const clientesFiltrados = allClientes.filter(
            c => !cards.some(cardItem => cardItem.key === c.key)
        );
        // allClientes = clientesFiltrados;
        return (
            <SView
                style={{
                    backgroundColor: STheme.color.text + "11",
                    borderColor: STheme.color.card,
                    borderWidth: 1,
                    borderRadius: 8,
                    height: "100%",
                }}
            >
                <SView
                    col={"xs-12"}
                    padding={8}
                    center
                    onPress={(e) => {
                        this.handleStageSelect(e)
                    }}
                >
                    <SView row col={"xs-12"} center>
                        <SView style={{ backgroundColor: stage.color, width: 20, height: 20, borderRadius: 20 }} />
                        <SView width={8} />
                        <SText bold>{stage.titulo}</SText>
                        <SView flex />
                        <SText bold card fontSize={10} padding={4}>{cards?.length}</SText>
                    </SView>
                    <SText col={"xs-12"} fontSize={10} color={STheme.color.lightGray}>Descripción: {stage.descripcion}</SText>
                    <SView row col={"xs-12"}>
                        {stage?.states?.map((state, index) =>
                            <Etiqueta key={index} tipo_leads={state} size={8} style={{ marginRight: 4, marginTop: 4 }} />
                        )}
                        {!this.state.mostrar ? <SView style={{ alignItems: "flex-end" }} col={"xs-12"} marginTop={8} >
                            <SView center style={{ width: 100, height: 20, borderRadius: 4, backgroundColor: STheme.color.card }} onPress={(e) => {
                                this.setState({ mostrar: !this.state.mostrar })
                            }} row>
                                <SIconApp name="Muser" width={10} height={10} fill={STheme.color.text} />
                                <SView width={4} />
                                <SText fontSize={10}>Agregar contacto</SText>
                            </SView>
                        </SView> : <SView style={{ alignItems: "flex-end" }} col={"xs-12"} marginTop={8} >
                            <SView center style={{ width: 100, height: 20, borderRadius: 4, backgroundColor: STheme.color.card }} onPress={(e) => {
                                this.setState({ mostrar: !this.state.mostrar })
                            }} row>
                                <SIconApp name="Cerrar" width={10} height={10} fill={STheme.color.text} />
                                <SView width={4} />
                                <SText fontSize={10}>Cerrar contacto</SText>
                            </SView>
                        </SView>}
                        
                        <AgregarContacto estado={this.state.mostrar} clientes={clientesFiltrados} stage={stage} onAddCliente={onAddCliente} />
                    </SView>

                </SView>

                {/* <SView width={10} height={4}  ></SView> */}

                <FlatList
                    contentContainerStyle={{ padding: 4 }}
                    data={cards}
                    renderItem={({ item }) => (
                        <DraggableCarta
                            key={item.key}
                            card={item}
                            stage={stage}
                            onDrop={onCardDrop}
                            onDragStart={onDragStart}
                            onDragMove={onDragMove}
                            onRemoveCliente={onRemoveCliente}
                            onLoadData={onLoadData} // ✅ PROP NUEVA PARA RECARGAR
                            ref={cardRefs[item.key]}
                        />
                    )}
                />
            </SView>
        );
    }
}

const AgregarContacto = ({ estado, clientes, stage, onAddCliente }) => {
    console.log("clientes", clientes)
    // let proveedor = null;
    // let verBoton = false;
    const [verBoton, setVerBoton] = useState(false);
    const [proveedor, setProveedor] = useState(null);
    if (estado) {
        return (
            <SView row col={"xs-12"} style={{
                marginTop: 5,
                padding: 5,
                borderWidth: 1,
                borderColor: STheme.color.card,
                backgroundColor: STheme.color.card,
                marginBottom: 5,
                borderRadius: 4,
            }} >
                <SInput
                    // ref={ref => this.inputCliente = ref}
                    icon={<SText color={STheme.color.lightGray} bold>{"Contacto:"}</SText>}
                    placeholder={"Escriba el nombre del contacto"}
                    height={30}
                    type="select2"
                    options={clientes.map(c => (c?.nombres || "").trim()).filter(a => !!a)}
                    onChangeText={(text) => {
                        const t = (text || "").trim();
                        // buscar match exacto (case-insensitive)
                        const encontrado = (clientes || []).find(c =>
                            ((c?.nombres || "").trim().toLowerCase() === t.toLowerCase())
                        );

                        if (encontrado) {
                            // ✅ existe: setea proveedor y limpia "nuevo"
                            setProveedor(encontrado);
                            setVerBoton(true);
                        } else {
                            // ✅ no existe: habilita +
                            proveedor = null;
                        }
                    }}

                />

          
                {verBoton && (<SView col={"xs-12"} style={{ alignItems: "flex-end" }}>
                    <SHr h={8} />
                    <SView height={20} width={100} center style={{
                        borderRadius: 4,
                        backgroundColor: STheme.color.primary,
                    }} onPress={() => {
                        if (proveedor) {
                             MDL.crm.tipoCliente.addToCliente({
                                key_cliente: proveedor.key,
                                key_tipo_cliente: stage.key
                            }).then((response) => {
                                onAddCliente(stage.key, proveedor.key);
                                SNotification.send({
                                    title: "✅ Cliente agregado",
                                    color: STheme.color.success,
                                    time: 1500
                                });
                            }).catch(err => {
                                SNotification.send({
                                    title: "❌ Error",
                                    body: err,
                                    color: STheme.color.danger
                                });
                            });
                        }
                    }}>
                        <SText fontSize={10} color={STheme.color.text} >Aceptar</SText>
                    </SView>
                </SView>)}

            </SView>
        );
    } else {
        return null
    }
}

export default class root extends Component {
    stageRefs = {};
    cardRefs = {};

    constructor(props) {
        super(props);
        this.state = {
            cards: [],
            draggingCard: null,
            dragOffset: { x: 0, y: 0 },
            initialOffset: { x: 0, y: 0 },
            dpto: "all",
            tipo_cliente: [],
            clientes: [],
            selectedStageKey: null, // ✅ ESTADO CENTRALIZADO
            allClientes: [],
        };

        // 🚨 ✅ BIND TODO AQUÍ - ESTO SOLUCIONA EL ERROR
        this.handleStageSelect = this.handleStageSelect.bind(this);
        this.loadData = this.loadData.bind(this);
        this.handleRemoveCliente = this.handleRemoveCliente.bind(this);
        this.handleAddCliente = this.handleAddCliente.bind(this);
        this.handleDeleteStage = this.handleDeleteStage.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDragMove = this.handleDragMove.bind(this);
        this.handleAllCliente = this.handleAllCliente.bind(this);
    }

    componentDidMount() {
        this.loadData();
        MDL.rolesPermisos.loadPermissions().then(() => {
            this.forceUpdate();
        });
    }

    // ✅ MÉTODO PARA MANEJAR SELECCIÓN DESDE STAGE
    handleStageSelect(stageKey) {
        this.setState({ selectedStageKey: stageKey });
    }

    async loadData() {
        const [clientes, tipos, allClientes] = await Promise.all([
            MDL.crm.cliente.getAll(),
            MDL.crm.tipoCliente.getAll(),
            MDL.crm.cliente.getAll(),
        ]);
        const habilidad = await MDL.habilidad.getAllWithUsuarios();
        clientes.forEach(cliente => {
            cliente.habilidades = (habilidad ?? []).filter(h => h.key_usuarios?.includes(cliente.key)) ?? [];
        });
        this.setState({
            tipo_cliente: tipos,
            clientes,
            allClientes
        });
    }
    handleAllCliente() {
        return this.state.allClientes;
    }


    handleRemoveCliente(keyClienteTipo) {
        if (!keyClienteTipo) return;

        this.setState(prev => ({
            clientes: prev.clientes.map(cliente => {
                if (!cliente?.tipo_cliente) return cliente;

                cliente.tipo_cliente = cliente.tipo_cliente.filter(tc =>
                    tc?.key_cliente_tipo_cliente !== keyClienteTipo
                );

                return cliente;
            })
        }));
    }

    handleAddCliente(stageKey, clienteKey) {
        if (!stageKey || !clienteKey) return;

        this.setState(prev => ({
            clientes: prev.clientes.map(cliente => {
                if (cliente.key === clienteKey) {
                    const tipoCliente = prev.tipo_cliente.find(tc => tc.key === stageKey);
                    if (tipoCliente) {
                        const existe = cliente.tipo_cliente?.some(tc => tc?.key === stageKey);
                        if (!existe) {
                            cliente.tipo_cliente = [...(cliente.tipo_cliente || []), {
                                key: stageKey,
                                key_cliente_tipo_cliente: `${clienteKey}_${stageKey}`,
                                titulo: tipoCliente.titulo
                            }];
                        }
                    }
                }
                return cliente;
            })
        }));
    }

    handleDeleteStage(deletedKey) {
        this.setState(prev => ({
            tipo_cliente: prev.tipo_cliente.filter(t => t.key !== deletedKey)
        }));
    }

    handleDrop(cardKey, gestureEnd, prevenChange) {
        if (prevenChange) return;

        for (const stageKey in this.stageRefs) {
            const ref = this.stageRefs[stageKey];
            if (!ref?.current) continue;
            const nodeHandle = findNodeHandle(ref.current);
            if (!nodeHandle) continue;

            UIManager.measure(nodeHandle, (x, y, width, height, pageX, pageY) => {
                const isInside = gestureEnd.absoluteX >= pageX &&
                    gestureEnd.absoluteX <= pageX + width &&
                    gestureEnd.absoluteY >= pageY &&
                    gestureEnd.absoluteY <= pageY + height;

                if (isInside) {
                    const stage = this.state.tipo_cliente.find(s => s.key === stageKey);
                    if (stage) {
                        this.setState(prev => {
                            let newCards = prev.clientes.filter(c => c.key !== cardKey);
                            const editCard = prev.clientes.find(c => c.key === cardKey);
                            newCards.splice(0, 0, { ...editCard });
                            return { clientes: newCards };
                        });
                        return;
                    }
                }
            });
        }
    }

    handleDragStart(cardKey) {
        console.log("Drag start:", cardKey);
    }

    handleDragMove(x, y) {
        // Lógica de drag
    }

    render() {
        console.log("CLIENTES: ", this.state.allClientes)
        return (
            <SPage title={'Agenda de contactos'}>
                <SHr h={12} />
                <ScrollView horizontal>
                    {this.state.tipo_cliente.map((stage) => (
                        <SView
                            key={stage.key}
                            ref={el => this.stageRefs[stage.key] = el}
                            style={{
                                width: 320,
                                margin: 6,
                                borderColor: this.state.selectedStageKey === stage.key ? STheme.color.card : "transparent",
                                backgroundColor: this.state.selectedStageKey === stage.key ? STheme.color.card : "transparent",
                                borderWidth: 2,
                                borderRadius: 12
                            }}
                        >
                            <Stage
                                stage={stage}
                                draggingCard={this.state.draggingCard}
                                cards={this.state.clientes.filter((c) => {
                                    if (!c?.tipo_cliente) return false;
                                    return c.tipo_cliente.some(tc => tc?.key == stage.key);
                                })}
                                onCardDrop={this.handleDrop}
                                onDragStart={this.handleDragStart}
                                onDragMove={this.handleDragMove}
                                cardRefs={this.cardRefs}
                                onDeleteStage={this.handleDeleteStage}
                                onAddCliente={this.handleAddCliente}
                                onRemoveCliente={this.handleRemoveCliente}
                                onStageSelect={this.handleStageSelect}
                                onLoadData={this.loadData} // ✅ PROP NUEVA PARA RECARGAR
                                allClientes={this.state.allClientes}
                            />
                        </SView>
                    ))}
                </ScrollView>

                <FloatButtom onPress={() => {
                    FormRegistroTipoCliente.open({
                        onRegister: () => this.loadData(),
                        onActualizar: () => this.loadData()
                    })
                }} />

            </SPage>
        );
    }
}

const DraggableCarta = React.forwardRef(({ stage, card, onDrop, onDragStart, onDragMove, onRemoveCliente, onLoadData }, ref) => {
    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);

    const panGesture = Gesture.Pan()
        .onBegin(() => runOnJS(onDragStart)(card.key))
        .onUpdate((e) => {
            offsetX.value = e.translationX;
            offsetY.value = e.translationY;
            runOnJS(onDragMove)(e.translationX, e.translationY);
        })
        .onFinalize(() => runOnJS(onDrop)(card.key, null, true))
        .onEnd((e) => {
            runOnJS(onDrop)(card.key, e);
            offsetX.value = 0;
            offsetY.value = 0;
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: offsetX.value },
            { translateY: offsetY.value },
        ],
        zIndex: offsetY.value !== 0 ? 100 : 1,
    }));

    return (
        <GestureDetector gesture={panGesture}>
            <Animated.View ref={ref} style={[{ paddingBottom: 8 }, animatedStyle]}>
                <DashboardCard
                    data={card}
                    data_stage={stage}
                    onRemoveCliente={onRemoveCliente}
                    onLoadData={onLoadData} // ✅ PROP NUEVA PARA RECARGAR
                    refresh={onLoadData}
                />
            </Animated.View>
        </GestureDetector>
    );
});