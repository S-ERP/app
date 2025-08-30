import React, { Children } from "react";
import { StyleSheet, ViewStyle } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
} from "react-native-reanimated";
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from "react-native-gesture-handler";
import { usePizarra } from "./Pizarra";
import { SText } from "servisofts-component";

type PizarraNodoProps = {
    children: React.ReactNode,
    style?: ViewStyle,
    x: number, y: number,
    onChangePosition: (e: { x: number, y: number }) => void
}
export default function PizarraNodo({ children, style, x = 0, y = 0, onChangePosition }: PizarraNodoProps) {

    const layout = useSharedValue({ width: 0, height: 0 });
    // Posiciones acumuladas
    const pizarra = usePizarra();
    const translateX = useSharedValue(x);
    const translateY = useSharedValue(y);

    const onDrag = useSharedValue(false);



    // si se actualiza el translateX o el translateY, llamamos a onChangePosition
    translateX.addListener(1, (value: any) => {
        if (onChangePosition) onChangePosition({ x: value, y: translateY.value });
    });
    translateY.addListener(1, (value: any) => {
        if (onChangePosition) onChangePosition({ x: translateX.value, y: value });
    });
    // Pan gesture
    const panGesture: any = Gesture.Pan()
        .onBegin(() => {
            // Guardamos la posición anterior
            panGesture.context = {
                startX: translateX.value,
                startY: translateY.value,
            };
            onDrag.value = true;
        })
        .onUpdate((event) => {
            translateX.value = panGesture.context.startX + (event.translationX / pizarra.scale.value);
            translateY.value = panGesture.context.startY + (event.translationY / pizarra.scale.value);
        }).onEnd(() => {
            onDrag.value = false;
        }).onFinalize(() => {
            onDrag.value = false;
        });


    const animatedStyleSelect = useAnimatedStyle(() => {

        if (!pizarra.selectStartX.value) {
            return {
                backgroundColor: "transparent"
            }
        }

        let enabled = false;
        let selected = false;
        const select = {
            startX: (pizarra.selectStartX.value / pizarra.scale.value) - (pizarra.width / 2),
            endX: pizarra.selectEndX.value / pizarra.scale.value - (pizarra.width / 2),
            startY: pizarra.selectStartY.value / pizarra.scale.value - (pizarra.width / 2),
            endY: pizarra.selectEndY.value / pizarra.scale.value - (pizarra.width / 2),
        }

        const selectPosition = {
            width: Math.abs(select.endX - select.startX),
            height: Math.abs(select.endY - select.startY),
            x: select.startX < select.endX ? select.startX : select.endX,
            y: select.startY < select.endY ? select.startY : select.endY,
        }
        if (layout.value.width && layout.value.height) {
            if (selectPosition.width && selectPosition.height) {
                if (
                    selectPosition.x < translateX.value - (layout.value.width / 2)
                    && (selectPosition.x+selectPosition.width) > (translateX.value + (layout.value.width / 2))
                    && selectPosition.y < translateY.value - (layout.value.height / 2)
                    && (selectPosition.y + selectPosition.height) > (translateY.value + (layout.value.height / 2))
                ) {
                    console.log("Dentro de la selección");
                    return {
                        backgroundColor: "#f0f"
                    }
                }
            }
        }
        return {
            backgroundColor: "transparent"
            // opacity: onDrag.value ? 0.5 : 1,
            // opacity: !selected ? 0.5 : 1,
        }
    });
    const animatedStyle = useAnimatedStyle(() => {
        return {
            // opacity: onDrag.value ? 0.5 : 1,
            // opacity: !selected ? 0.5 : 1,
            cursor: onDrag.value ? "grabbing" : "grab",
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
            ],
        }
    });




    return (<GestureDetector gesture={panGesture}>
        <Animated.View style={[{
            position: "absolute",
        }, style, animatedStyle, animatedStyleSelect]} onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            layout.value = { width, height };
            // translateX.value = (width / 2);
            // translateY.value = (height / 2);
        }}>
            {children}
        </Animated.View>
    </GestureDetector>
    );
}

