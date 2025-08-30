import React, { Children } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
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
import { SText, STheme } from "servisofts-component";

export default function PizarraMiniMapa({ children, style }: { children?: React.ReactNode, style?: ViewStyle, }) {

    const size = 120;

    // Posiciones acumuladas
    const pizarra = usePizarra();
    const onDrag = useSharedValue(false);



    const panGesture: any = Gesture.Pan().minVelocity(0.1)
        .onBegin((event) => {
            const scale1 = size / pizarra.width;
            const positionPizarrax = (pizarra.width / 2) - (event.x / scale1)
            const positionPizarray = (pizarra.width / 2) - (event.y / scale1)
            console.log(event)
            pizarra.translateX.value = positionPizarrax
            pizarra.translateY.value = positionPizarray
            // onDrag.value = false;
        })
        .onUpdate((event) => {
            const scale1 = size / pizarra.width;
            const positionPizarrax = (pizarra.width / 2) - (event.x / scale1);
            const positionPizarray = (pizarra.width / 2) - (event.y / scale1);
            pizarra.translateX.value = positionPizarrax;
            pizarra.translateY.value = positionPizarray;
        })
        .onEnd(() => {
            // onDrag.value = false;
        });



    const animatedStyle = useAnimatedStyle(() => {
        const scale1 = size / pizarra.width
        const mipmapscale = scale1 / pizarra.scale.value;
        return {
            width: pizarra.layoutWidth.value * mipmapscale,
            height: pizarra.layoutHeight.value * mipmapscale,
            transform: [
                { translateX: -pizarra.translateX.value * mipmapscale },
                { translateY: -pizarra.translateY.value * mipmapscale },
            ],
        }
    });




    return (<GestureDetector gesture={panGesture}>
        <View style={{
            position: "absolute",
            top: 4, right: 4,
            borderRadius:4,
            width: size, height: size,
            backgroundColor: STheme.color.background+"CC", 
            borderWidth: 1, borderColor: STheme.color.card,
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
        }}>
            <View style={{ position: "absolute", width: "100%", height: 1, backgroundColor: STheme.color.card }} />
            <View style={{ position: "absolute", width: 1, height: "100%", backgroundColor: STheme.color.card }} />
            <Animated.View style={[{
                position: "absolute",
                backgroundColor: STheme.color.card,
                //  borderWidth: 1, borderColor: STheme.color.card,
            }, style, animatedStyle]} >
                {children}
            </Animated.View>

        </View>
    </GestureDetector>
    );
}

