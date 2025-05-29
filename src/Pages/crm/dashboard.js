import React, { Component, createRef } from 'react';
import { Dimensions, UIManager, findNodeHandle } from 'react-native';
import { SPage, SText, STheme, SView } from 'servisofts-component';
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

const stages = [
    { key: 'lead', name: 'lead', color: STheme.color.warning },
    { key: 'inscripto', name: 'inscripto', color: STheme.color.success },
    { key: 'Negociación', name: 'Negociación', color: STheme.color.lightGray },
    { key: 'cerrado', name: 'cerrado', color: STheme.color.danger },

];

export default class Dashboard extends Component {
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

    updateCardStage = (cardKey, newStage) => {
        this.setState((prev) => ({
            cards: prev.cards.map((c) =>
                c.key === cardKey ? { ...c, state: newStage } : c
            ),
        }));
    };

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
                    if (stage) this.updateCardStage(cardKey, stage.name);
                }
            });
        }
    };

    handleDragStart = (cardKey) => {
        const ref = this.cardRefs[cardKey]?.current;
        if (ref) {

            const card = this.state.cards.find(c => c.key === cardKey);

            const stageref = this.stageRefs[card.state];
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
                                        cards={this.state.cards.filter((c) => c.state === stage.name)}
                                        onCardDrop={this.handleDrop}
                                        onDragStart={this.handleDragStart}
                                        onDragMove={this.handleDragMove}
                                        cardRefs={this.cardRefs}
                                    />
                                </SView>
                            );
                        })}
                    </ScrollView>
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
            offsetX.value = withSpring(0);
            offsetY.value = withSpring(0);
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
                <SText>{card.cliente.telefono}</SText>
                <SText color={STheme.color.lightGray}>{card.cliente.nombres}</SText>
            </Animated.View>
        </GestureDetector>
    );
});