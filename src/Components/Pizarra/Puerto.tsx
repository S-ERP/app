import React, { Children } from "react";
import { View, ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { usePizarra } from "./Pizarra";
import { STheme } from "servisofts-component";

export type PuertoProps = {
    style?: ViewStyle,
    children?: React.ReactNode,
}
export default function Puerto(props: PuertoProps) {

    const context = useSharedValue({ startX: 0, startY: 0 });
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const pizarra = usePizarra();

    const panGesture = Gesture.Pan().minDistance(5)
        .onBegin(e => {
            context.value = {
                startX: e.translationX,
                startY: e.translationY,
            };
        })
        .onUpdate(e => {
            translateX.value = context.value.startX + (e.translationX/pizarra.scale.value);
            translateY.value = context.value.startY + (e.translationY/pizarra.scale.value);
            console.log("Pan update", e)
        }).onEnd(e => {
            translateX.value = 0
            translateY.value = 0
        })

    const styleAnimated = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
            ]
        };
    });

    return <GestureDetector gesture={panGesture} >
        <Animated.View style={[{
            // @ts-ignore
            cursor: "crosshair",
            width: 18,
            height: 18,
            backgroundColor: STheme.color.text,
            borderRadius: 100,
        }, props.style, styleAnimated]}>
        </Animated.View>
    </GestureDetector>
}
