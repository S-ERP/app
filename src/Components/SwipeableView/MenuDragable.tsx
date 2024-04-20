import React, { useRef, useState } from "react";
import { Text, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView, LongPressGestureHandler, PanGestureHandler, State } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { STheme } from "servisofts-component";


const MenuItem = ({ ri, ci }) => {
    const context = useSharedValue({ x: 0, y: 0 });
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const zIndex = useSharedValue(1);
    const scale = useSharedValue(1);
    const panRef = useRef<PanGestureHandler>(null);

    const panGesture = Gesture.Pan()
        .activateAfterLongPress(800)
        .onStart(() => {
            context.value = { x: translateX.value, y: translateY.value };
        })
        .onUpdate((evt) => {
            translateX.value = context.value.x + evt.translationX;
            translateY.value = context.value.y + evt.translationY;
        })
        .onEnd(() => {
            translateX.value = withSpring(context.value.x);
            translateY.value = withSpring(context.value.y);
            scale.value = withSpring(1);
        });

    const longPressGesture = Gesture.LongPress()
        .minDuration(800)
        .onStart(() => {
            zIndex.value = 999;
            scale.value = withSpring(1.3);
        })
        .onEnd(() => {
            // panRef.current?.setNativeProps({ enabled: false });
        });
    const composed = Gesture.Simultaneous(panGesture, longPressGesture);
    return (
        <Animated.View style={[{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        }]}>
            <GestureDetector gesture={composed}>
                <Animated.View style={[
                    { width: 50, height: 50, borderRadius: 4, borderWidth: 1, borderColor: "#f0f", backgroundColor: STheme.colorRandom(), },
                    { transform: [{ translateX }, { translateY }, { scale }], zIndex: zIndex }

                ]}>
                    <Text style={{ color: "#fff" }}>{ri} {ci}</Text>
                </Animated.View>
            </GestureDetector>
        </Animated.View>
    );
}
const MenuDragable = () => {
    const ncol = 4;
    const nrow = 6;
    // const [layout, setLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [row, setRow] = useState(new Array(nrow).fill(0));
    const [col, setCol] = useState(new Array(ncol).fill(0));

    return <View style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    }}>
        <View style={{
            flex: 1,
            width: "90%",
        }}>
            {/* <MenuItem ri={0} ci={0} /> */}
            {row.map((r, ri) => {
                return <View style={{
                    flexDirection: "row",
                    flex: 1,
                    width: "100%"
                }}>
                    {col.map((c, ci) => {
                        return <MenuItem ri={ri} ci={ci} />
                    })}
                </View>
            })}
            <View style={{
                flex: 1,
                width: "100%"
            }}>

            </View>
        </View>
    </View>
}
export default MenuDragable;