import React, { useState } from "react";
import { View, Text } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, useDerivedValue, useAnimatedReaction, runOnJS, clamp } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const CELL_SIZE = 50;
const TOTAL_ROWS = 100;
const TOTAL_COLS = 100;
const TOTAL_WIDTH = TOTAL_COLS * CELL_SIZE;
const TOTAL_HEIGHT = TOTAL_ROWS * CELL_SIZE;

const ExcelTable = () => {
    const scrollX = useSharedValue(0);
    const scrollY = useSharedValue(0);
    const startX = useSharedValue(0);
    const startY = useSharedValue(0);
    const [visibleWidth, setVisibleWidth] = useState(0);
    const [visibleHeight, setVisibleHeight] = useState(0);
    const [visibleCells, setVisibleCells] = useState<{row: number, col: number}[]>([]);

    useAnimatedReaction(() => ({ scrollX: scrollX.value, scrollY: scrollY.value, visibleWidth, visibleHeight }), (current, previous) => {
        if (current.visibleWidth === 0 || current.visibleHeight === 0) return;
        const startCol = Math.floor(current.scrollX / CELL_SIZE);
        const endCol = Math.min(TOTAL_COLS, startCol + Math.ceil(current.visibleWidth / CELL_SIZE) + 1);
        const startRow = Math.floor(current.scrollY / CELL_SIZE);
        const endRow = Math.min(TOTAL_ROWS, startRow + Math.ceil(current.visibleHeight / CELL_SIZE) + 1);
        const cells = [];
        for (let row = startRow; row < endRow; row++) {
            for (let col = startCol; col < endCol; col++) {
                cells.push({ row, col });
            }
        }
        runOnJS(setVisibleCells)(cells);
    });

    const panGesture = Gesture.Pan()
        .onStart(() => {
            startX.value = scrollX.value;
            startY.value = scrollY.value;
        })
        .onUpdate((e) => {
            scrollX.value = clamp(startX.value + e.translationX, 0, Math.max(0, TOTAL_WIDTH - visibleWidth));
            scrollY.value = clamp(startY.value + e.translationY, 0, Math.max(0, TOTAL_HEIGHT - visibleHeight));
        });

    const animatedContentStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: -scrollX.value }, { translateY: -scrollY.value }],
    }));

    return (
        <View
            style={{
                width: "100%",
                flex: 1,
            }}
            onLayout={(e) => {
                setVisibleWidth(e.nativeEvent.layout.width);
                setVisibleHeight(e.nativeEvent.layout.height);
            }}
        >
            <GestureDetector gesture={panGesture}>
                <Animated.View
                    style={[
                        {
                            width: TOTAL_WIDTH,
                            height: TOTAL_HEIGHT,
                            backgroundColor: "#f0f",
                        },
                        animatedContentStyle,
                    ]}
                >
                    {visibleCells.map(({ row, col }) => (
                        <View
                            key={`${row}-${col}`}
                            style={{
                                position: "absolute",
                                left: col * CELL_SIZE,
                                top: row * CELL_SIZE,
                                width: CELL_SIZE,
                                height: CELL_SIZE,
                                borderWidth: 1,
                                borderColor: "#000",
                                backgroundColor: (row + col) % 2 === 0 ? "#fff" : "#eee",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <Text>{row},{col}</Text>
                        </View>
                    ))}
                </Animated.View>
            </GestureDetector>
            <ScrollBar
                horizontal
                total={TOTAL_WIDTH}
                visible={visibleWidth}
                scroll={scrollX}
                barLength={visibleWidth}
            />
            <ScrollBar
                total={TOTAL_HEIGHT}
                visible={visibleHeight}
                scroll={scrollY}
                barLength={visibleHeight}
            />
        </View>
    );
};

export default ExcelTable;

const ScrollBar = ({ horizontal = false, total, visible, scroll, barLength }: { horizontal?: boolean, total: number, visible: number, scroll: Animated.SharedValue<number>, barLength: number }) => {
    const thumbSize = useDerivedValue(() => {
        if (visible === 0 || total === 0) return 0;
        return Math.max(10, (visible / total) * barLength); // minimum size
    });

    const thumbPosition = useDerivedValue(() => {
        if (visible === 0 || total <= visible) return 0;
        return (scroll.value / (total - visible)) * (barLength - thumbSize.value);
    });

    const thumbStyle = useAnimatedStyle(() => ({
        [horizontal ? "width" : "height"]: thumbSize.value,
        [horizontal ? "left" : "top"]: thumbPosition.value,
    }));

    const prevTranslation = useSharedValue(0);

    const thumbGesture = Gesture.Pan()
        .onStart(() => {
            prevTranslation.value = 0;
        })
        .onUpdate((e) => {
            const currentTranslation = horizontal ? e.translationX : e.translationY;
            const delta = currentTranslation - prevTranslation.value;
            prevTranslation.value = currentTranslation;
            const currentPosition = thumbPosition.value;
            const newPosition = clamp(currentPosition + delta, 0, barLength - thumbSize.value);
            const newScroll = (newPosition / (barLength - thumbSize.value)) * (total - visible);
            scroll.value = clamp(newScroll, 0, total - visible);
        });

    return (
        <View
            style={{
                position: "absolute",
                bottom: horizontal ? 0 : undefined,
                right: horizontal ? undefined : 0,
                top: horizontal ? undefined : 0,
                left: horizontal ? 0 : undefined,
                width: horizontal ? "100%" : 10,
                height: horizontal ? 10 : "100%",
                backgroundColor: "#ccc",
            }}
        >
            <GestureDetector gesture={thumbGesture}>
                <Animated.View
                    style={[
                        {
                            width: horizontal ? undefined : "100%",
                            height: horizontal ? "100%" : undefined,
                            backgroundColor: "#999",
                        },
                        thumbStyle,
                    ]}
                />
            </GestureDetector>
        </View>
    );
};
