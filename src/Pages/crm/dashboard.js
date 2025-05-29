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

const stages = [
    { key: '1', name: 'Prospecto' },
    { key: '2', name: 'Calificado' },
    { key: '3', name: 'Propuesta' },
    { key: '4', name: 'Negociación' },
    { key: '5', name: 'Cerrado' },
];

const initialCards = [
    { key: '1a', name: 'Cliente A', stage: 'Prospecto' },
    { key: '1b', name: 'Cliente AA', stage: 'Prospecto' },
    { key: '1c', name: 'Cliente ABC', stage: 'Prospecto' },
    { key: '2', name: 'Cliente B', stage: 'Calificado' },
    { key: '3', name: 'Cliente C', stage: 'Propuesta' },
    { key: '4', name: 'Cliente D', stage: 'Negociación' },
    { key: '5', name: 'Cliente E', stage: 'Cerrado' },
];

export default class Dashboard extends Component {
    stageRefs = {};

    state = {
        cards: initialCards,
    };

    updateCardStage = (cardKey, newStage) => {
        this.setState((prev) => ({
            cards: prev.cards.map((c) =>
                c.key === cardKey ? { ...c, stage: newStage } : c
            ),
        }));
    };

    handleDrop = (cardKey, gestureEnd) => {
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
                                        cards={this.state.cards.filter((c) => c.stage === stage.name)}
                                        onCardDrop={this.handleDrop}
                                    />
                                </SView>
                            );
                        })}
                    </ScrollView>
                </SPage>
            </GestureHandlerRootView>
        );
    }
}

const Stage = ({ stage, cards, onCardDrop }) => {
    return (
        <SView
            style={{
                padding: 8,
                backgroundColor: STheme.color.card,
                borderRadius: 8,
                height: "100%",
                // height: Dimensions.get('window').height * 0.7,
            }}
        >
            <SText bold>{stage.name}</SText>
            <SView height={8} />
            {cards.map((card) => (
                <DraggableCarta key={card.key} card={card} onDrop={onCardDrop} />
            ))}
        </SView>
    );
};

const DraggableCarta = ({ card, onDrop }) => {
    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            offsetX.value = e.translationX;
            offsetY.value = e.translationY;
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
                style={[{
                    backgroundColor: STheme.color.danger,
                    minHeight: 70,
                    padding: 8,
                    borderRadius: 8,
                    marginVertical: 4,
                }, animatedStyle]}
            >
                <SText>{card.name}</SText>
            </Animated.View>
        </GestureDetector>
    );
};
