import React, { Component, createRef } from 'react';
import { Dimensions, UIManager, findNodeHandle } from 'react-native';
import { SDate, SImage, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS
} from 'react-native-reanimated';
import {
    GestureHandlerRootView,
    ScrollView,
    Gesture,
    GestureDetector
} from 'react-native-gesture-handler';
import MDL from '../../MDL';
import Recargar from '../../Components/Recargar';
import SSocket from 'servisofts-socket';

// "nuevo"
//     | "rellamada"
//     | "llamada_fallida"
//     | "en_espera"
//     | "confirmado"
//     | "cancelado"
//     | "enviado"
//     | "en_espera_pago"
//     | "en_espera_pago_sin_respuesta"
//     | "en_espera_pago_rellamada"
//     | "rechazo"
//     | "pagado"
//     | "devuelto"
//     | "spam"
//     | "double"
const stages = MDL.crm.clienteProyecto.stages;

export default class Dashboard2 extends Component {
    stageRefs = {};
    cardRefs = {};

    state = {
        cards: [],
        draggingCard: null,
        dragOffset: { x: 0, y: 0 },
        initialOffset: { x: 0, y: 0 },
    };

    componentDidMount() {
        MDL.crm.clienteProyecto.getAll().then(e => {
            this.setState({
                cards: e,
            });
        }).catch(e => {
            console.error("Error fetching projects:", e);
        })
    }

    stateCardChanged = (cardKey, newState) => {
        MDL.crm.clienteProyecto.editar({
            key: cardKey,
            state: newState,
        })
    }

    handleDrop = (cardKey, gestureEnd) => {
        this.setState({ draggingCard: null });

        for (const stageKey in this.stageRefs) {
            const ref = this.stageRefs[stageKey];
            if (!ref?.current) continue;

            const nodeHandle = findNodeHandle(ref.current);
            if (!nodeHandle) continue;

            UIManager.measure(nodeHandle, (x, y, width, height, pageX, pageY) => {
                const isInside =
                    gestureEnd.absoluteX >= pageX &&
                    gestureEnd.absoluteX <= pageX + width &&
                    gestureEnd.absoluteY >= pageY &&
                    gestureEnd.absoluteY <= pageY + height;

                if (isInside) {
                    const stage = stages.find((s) => s.key === stageKey);
                    if (stage) {
                        console.log("Card dropped in stage:", stage.name);
                        // Quiero detectar cual es el card mas cercano al drop para colocar el card que estoy soltando luego de el card mas cercano al drop
                        // Obtener las cards del stage destino
                        // const cardsInStage = this.state.cards.filter(c => c.state === stage.name && c.key !== cardKey);
                        const cardsInStage = this.state.cards.filter(c => stage.states.includes(c.state) && c.key !== cardKey);

                        let closestCardKey = null;
                        let minDistance = Infinity;
                        let dropY = gestureEnd.absoluteY;

                        // Medir cada card para encontrar la más cercana al drop
                        const measurePromises = cardsInStage.map(c => {
                            const cardRef = this.cardRefs[c.key];
                            if (!cardRef?.current) return Promise.resolve(null);
                            const node = findNodeHandle(cardRef.current);
                            if (!node) return Promise.resolve(null);

                            return new Promise(resolve => {
                                UIManager.measure(node, (x, y, width, height, pageX, pageY) => {
                                    // Centro vertical de la card
                                    const cardCenterY = pageY + height;
                                    const distance = Math.abs(dropY - cardCenterY);
                                    resolve({ key: c.key, distance, cardCenterY });
                                });
                            });
                        });

                        Promise.all(measurePromises).then(results => {
                            results.forEach(res => {
                                if (res && res.distance < minDistance) {
                                    minDistance = res.distance;
                                    closestCardKey = res.key;
                                }
                            });

                            // Aquí puedes reordenar las cards: insertar el cardKey después de closestCardKey
                            this.setState(prev => {
                                let newCards = prev.cards.filter(c => c.key !== cardKey);
                                const editCard = prev.cards.find(c => c.key === cardKey);

                                const currentStage = stages.find(s => s.states.includes(editCard.state));

                                const insertIndex = closestCardKey
                                    ? newCards.findIndex(c => c.key === closestCardKey) + 1
                                    : 0;


                                if (currentStage.key !== stage.key) {
                                    console.log("Soltaste el item con key:", editCard);
                                    newCards.splice(insertIndex, 0, { ...editCard, state: stage.states[0] });
                                    this.stateCardChanged(cardKey, stage.states[0]);
                                } else {
                                    newCards.splice(insertIndex, 0, { ...editCard, });
                                }

                                return { cards: newCards };
                            });
                        });
                        // Ya no llamar a this.updateCardStage aquí, porque el setState anterior lo hace
                        return;


                        this.updateCardStage(cardKey, stage.name);
                    }
                }
            });
        }
    };

    handleDragStart = (cardKey) => {
        const ref = this.cardRefs[cardKey]?.current;
        if (ref) {

            const card = this.state.cards.find(c => c.key === cardKey);

            const stage = stages.find(s => s.states.includes(card.state));
            const stageref = this.stageRefs[stage.key];
            const stageNode = findNodeHandle(stageref.current);

            const node = findNodeHandle(ref);
            if (node) {
                UIManager.measure(node, (x, y, width, height, pageX, pageY) => {
                    console.log("handleDragStart", stageref, stageNode);

                    UIManager.measure(stageNode, (stageX, stageY, stageWidth, stageHeight) => {

                        this.setState({
                            draggingCard: cardKey,
                            dragOffset: { x: 0, y: 0 },
                            initialOffset: { x: stageX + 5, y: pageY - 42, w: width }
                        });
                    })


                });
            }
        }
    };

    handleDragMove = (x, y) => {
        this.setState({ dragOffset: { x, y } });
    };

    render() {
        return (
            <GestureHandlerRootView style={{ flex: 1 }}>
                <SPage title={'CRM Dashboard'} disableScroll>

                    <ScrollView horizontal>
                        {stages.map((stage) => {
                            if (!this.stageRefs[stage.key]) {
                                this.stageRefs[stage.key] = createRef();
                            }
                            return (
                                <SView
                                    key={stage.key}
                                    ref={this.stageRefs[stage.key]}
                                    style={{ width: 300, margin: 4 }}
                                >
                                    <Stage
                                        stage={stage}
                                        draggingCard={this.state.draggingCard}
                                        cards={this.state.cards.filter((c) => stage.states.includes(c.state))}
                                        onCardDrop={this.handleDrop}
                                        onDragStart={this.handleDragStart}
                                        onDragMove={this.handleDragMove}
                                        cardRefs={this.cardRefs}
                                    />
                                </SView>
                            );
                        })}
                        {this.state.draggingCard && (() => {
                            const card = this.state.cards.find(c => c.key === this.state.draggingCard);
                            if (!card) return null;
                            return (
                                <Animated.View style={{
                                    position: "absolute",
                                    top: this.state.dragOffset.y + this.state.initialOffset.y + 4,
                                    left: this.state.dragOffset.x + this.state.initialOffset.x + 4,
                                    width: this.state.initialOffset.w,
                                    height: 70,
                                    zIndex: 9999,
                                    pointerEvents: 'none',
                                }}>
                                    <SView
                                        style={{
                                            backgroundColor: STheme.color.card,
                                            padding: 8,
                                            borderRadius: 8,
                                            flex: 1,
                                        }}
                                    >
                                        <SText>{card.cliente.telefono}</SText>
                                        <SText>{card.cliente.nombres}</SText>
                                    </SView>
                                </Animated.View>
                            );
                        })()}
                    </ScrollView>

                    <SView style={{
                        position: "absolute",
                        right: 16,
                        bottom: 32,
                    }}>
                        <Recargar initialTime={60} onFinish={() => {
                            this.componentDidMount();
                        }} />
                    </SView>
                </SPage>
            </GestureHandlerRootView>
        );
    }
}

const Stage = ({ stage, cards, onCardDrop, onDragStart, onDragMove, draggingCard, cardRefs }) => {
    return (
        <ScrollView
            style={{
                backgroundColor: STheme.color.card,
                borderColor: STheme.color.lightGray,
                borderWidth: 1,
                borderRadius: 8,
                height: "100%",
            }}
            contentContainerStyle={{
                padding: 8,
            }}
        >
            <SView row>
                <SView style={{ backgroundColor: stage.color, padding: 8, borderRadius: 8 }} />
                <SView width={8} />
                <SText bold>{stage.name}</SText>
            </SView>
            <SText >{stage.states.join(", ")}</SText>
            <SView height={8} />
            {cards.map((card) => {
                if (!cardRefs[card.key]) {
                    cardRefs[card.key] = createRef();
                }
                return (
                    <DraggableCarta
                        key={card.key}
                        card={card}
                        onDrop={onCardDrop}
                        onDragStart={onDragStart}
                        onDragMove={onDragMove}
                        ref={cardRefs[card.key]}
                    />
                );
            })}
        </ScrollView>
    );
};

const DraggableCarta = React.forwardRef(({ card, onDrop, onDragStart, onDragMove }, ref) => {
    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);

    const panGesture = Gesture.Pan()
        .onBegin(() => {
            runOnJS(onDragStart)(card.key);
        })
        .onUpdate((e) => {
            offsetX.value = e.translationX;
            offsetY.value = e.translationY;
            runOnJS(onDragMove)(e.translationX, e.translationY);
        })
        .onEnd((e) => {
            runOnJS(onDrop)(card.key, e);
            // offsetX.value = withSpring(0);
            // offsetY.value = withSpring(0);
            offsetX.value = 0;
            offsetY.value = 0;
        });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: offsetX.value },
                { translateY: offsetY.value },
            ],
            zIndex: offsetY.value !== 0 ? 100 : 1,
        };
    });

    const fecha = card.fecha_edit ?? card.fecha_on;

    return (
        <GestureDetector gesture={panGesture}>
            <Animated.View
                ref={ref}
                style={[{
                    backgroundColor: STheme.color.background + "66",
                    borderColor: STheme.color.lightGray,
                    borderWidth: 1,
                    minHeight: 70,
                    padding: 8,
                    borderRadius: 8,
                    marginVertical: 4,
                    cursor: "grab",
                }, animatedStyle]}
            >
                <SText onPress={() => {
                    SNavigation.navigate("/crm/plantilla", { key: card.key })
                }} >{card?.cliente?.telefono}</SText>
                <SText color={STheme.color.lightGray}>{card?.cliente?.nombres}</SText>
                <SText fontSize={10} color={STheme.color.lightGray}>Hace {new SDate(fecha, "yyyy-MM-ddThh:mm:ss").timeSince(new SDate())}</SText>
                <SText fontSize={10} color={STheme.color.lightGray}>{card.state}</SText>
                <SView style={{
                    width: 24,
                    height: 24,
                    position: "absolute",
                    right: 4,
                    top: 4,
                    borderRadius: 100,
                    overflow: "hidden",
                    backgroundColor: STheme.color.card + "66",
                }}>
                    <SImage src={SSocket.api.root + "usuario/" + card.key_usuario_atiende} style={{
                        resizeMode: "cover",
                    }} />
                </SView>
                {/* <SText color={STheme.color.lightGray}>{card.key_usuario_atiende}</SText> */}
            </Animated.View>
        </GestureDetector>
    );
});