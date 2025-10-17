import React, { Component, createRef } from 'react';
import { UIManager, findNodeHandle } from 'react-native';
import { SHr, SIcon, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import {
    FlatList, ScrollView, Gesture, GestureDetector
} from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    runOnJS
} from 'react-native-reanimated';
import Components from '../../Components';
import Model from '../../Model';
import MDL from '../../MDL';
import Etiqueta from './Components/Etiqueta';
import DashboardCard from './Components/DashboardCard';
import FormRegistroTipoCliente from '../crm/Components/FormRegistroTipoCliente';
import SSocket from 'servisofts-socket';

const Stage = ({ stage, cards, onCardDrop, onDragStart, onDragMove, draggingCard, cardRefs, onDeleteStage, onAddCliente, onRemoveCliente }) => {
    return (
        <SView style={{
            backgroundColor: STheme.color.text + "11",
            borderColor: STheme.color.card,
            borderWidth: 1,
            borderRadius: 8,
            height: "100%",
        }}>
            <SView col={"xs-12"} padding={8} center>
                <SView row col={"xs-12"} center>
                    <SView style={{ backgroundColor: stage.color, width: 20, height: 20, borderRadius: 20 }} />
                    <SView width={8} />
                    <SText bold onPress={() => {
                        FormRegistroTipoCliente.open({
                            defaultData: stage,
                            onRegister: () => { },
                            onActualizar: () => { },
                        })
                    }}>{stage.titulo}</SText>
                    <SView flex />
                    <SText bold card fontSize={10} padding={4}>{cards?.length}</SText>
                </SView>
                <SText col={"xs-12"} fontSize={10} color={STheme.color.lightGray}>{stage.descripcion}</SText>
                <SView row col={"xs-12"}>
                    {stage?.states?.map((state, index) => 
                        <Etiqueta key={index} tipo_leads={state} size={8} style={{ marginRight: 4, marginTop: 4 }} />
                    )}
                </SView>

                {/* ⚡ AGREGAR CLIENTE (0.1s) */}
                <SText fontSize={10} underLine onPress={() => {
                    SNavigation.navigate("/crm/cliente", {
                        onSelect: (e) => {
                            MDL.crm.tipoCliente.addToCliente({
                                key_cliente: e.key,
                                key_tipo_cliente: stage.key
                            }).then((response) => {
                                onAddCliente(stage.key, e.key);
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
                }}>Agregar Cliente</SText>

                {/* ✅ ELIMINAR GRUPO */}
                <SView style={{ 
                    padding: 6, 
                    backgroundColor: STheme.color.danger, 
                    borderRadius: 4, 
                    marginTop: 8 
                }} center row 
                onPress={() => {
                    SPopup.confirm({
                        title: `¿Eliminar "${stage.titulo}"?`,
                        body: `${cards.length} clientes se moverán a "Sin tipo"`,
                        onPress: () => {
                            MDL.crm.tipoCliente.eliminar(stage.key).then(() => {
                                onDeleteStage(stage.key);
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
                }}>
                    <SIcon name="trash" width={14} height={14} fill="white" />
                    <SView width={6} />
                    <SText fontSize={11} white bold>Eliminar ({cards.length})</SText>
                </SView>
            </SView>
            
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
                        ref={cardRefs[item.key]}
                    />
                )}
            />
        </SView>
    );
};

export default class root extends Component {
    stageRefs = {};
    cardRefs = {};
    dragginCard = null;

    constructor(props) {
        super(props);
        this.state = {
            cards: [],
            draggingCard: null,
            dragOffset: { x: 0, y: 0 },
            initialOffset: { x: 0, y: 0 },
            dpto: "all",
            tipo_cliente: [],
            clientes: []
        };
    }

    componentDidMount() {
        this.loadData();
        MDL.rolesPermisos.loadPermissions().then(() => {
            this.forceUpdate();
        });
    }

    async loadData() {
        const [clientes, tipos] = await Promise.all([
            MDL.crm.cliente.getAll(),
            MDL.crm.tipoCliente.getAll()
        ]);
        this.setState({ 
            tipo_cliente: tipos, 
            clientes 
        });
    }

    handleRemoveCliente = (keyClienteTipo) => {
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
    };

    handleAddCliente = (stageKey, clienteKey) => {
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
    };

    handleDeleteStage = (deletedKey) => {
        this.setState(prev => ({
            tipo_cliente: prev.tipo_cliente.filter(t => t.key !== deletedKey)
        }));
    };

    handleDrop = (cardKey, gestureEnd, prevenChange) => {
        if (this.dragginCard) {
            this.dragginCard.setState({ draggingCard: "" });
        }
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
    };

    handleDragStart = (cardKey) => {
        console.log("Drag start:", cardKey);
    };

    handleDragMove = (x, y) => {
        if (this.dragginCard) this.dragginCard.setState({ dragOffset: { x, y } });
    };

    render() {
        return (
            <SPage title={'Agenda de contactos'}>
                <SText onPress={() => {
                    FormRegistroTipoCliente.open({
                        onRegister: () => this.loadData(),
                        onActualizar: () => this.loadData()
                    })
                }}>Registrar nuevo tipo</SText>
                <SHr h={12} />
                <ScrollView horizontal>
                    {this.state.tipo_cliente.map((stage) => (
                        <SView
                            key={stage.key}
                            ref={el => this.stageRefs[stage.key] = el}
                            style={{ width: 320, margin: 6 }}
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
                            />
                        </SView>
                    ))}
                </ScrollView>
            </SPage>
        );
    }
}

const DraggableCarta = React.forwardRef(({ stage, card, onDrop, onDragStart, onDragMove, onRemoveCliente }, ref) => {
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
                />
            </Animated.View>
        </GestureDetector>
    );
});