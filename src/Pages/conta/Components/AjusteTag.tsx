import React from "react";
import { TextStyle, ViewStyle } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    runOnJS,
} from "react-native-reanimated";
import {
    GestureDetector,
    Gesture,
} from "react-native-gesture-handler";
import { SText, STheme, SView } from "servisofts-component";
import MDL from "../../../MDL";

type Props = {
    ajuste: any;
    onPress?: () => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
    allowDrag?: boolean; // Nueva propiedad para permitir arrastrar
};

export default function AjusteTag({ ajuste, onPress, style, textStyle, allowDrag }: Props) {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);
    const moved = useSharedValue(false);
    const panGesture = Gesture.Pan()
        .activeOffsetX([-1, 1]) // Permite el movimiento horizontal
        .activeOffsetY([-1, 1]) // Permite el movimiento vertical
        .onStart((e) => {
            // No-op por ahora
            offsetX.value = translateX.value;
            offsetY.value = translateY.value;
            moved.value = false;
        })
        .onUpdate((e) => {
            translateX.value = offsetX.value + e.translationX;
            translateY.value = offsetY.value + e.translationY;
            if (Math.abs(e.translationX) > 5 || Math.abs(e.translationY) > 5) {
                moved.value = true;
            }
        })
        .onEnd((e) => {
            runOnJS(() => {
                MDL.contabilidad.dispatchEvent({
                    type: "handleDropAjuste",
                    ajuste: ajuste,
                    event: e,
                })
            })(); // Llama a la función onPress al soltar
            translateX.value = 0; // Resetea la posición al soltar
            translateY.value = 0; // Resetea la posición al soltar
            // Podrías usar withSpring para soltar el item si quieres
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value }
        ]
    }));

    const handlePress = () => {
        if (!moved.value && onPress) {
            onPress();
        }
    };

    return (
        <GestureDetector gesture={allowDrag ? panGesture : Gesture.Tap()}>
            <Animated.View
                style={[
                    {
                        padding: 1,
                        paddingHorizontal: 4,
                        borderRadius: 4,
                        backgroundColor: STheme.colorFromText(ajuste?.key) + "66",
                        borderColor: STheme.colorFromText(ajuste?.key),
                        borderWidth: 1,
                        margin: 1,
                        height: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "row",
                    },
                    animatedStyle,
                    style,
                ]}
            >
                <SView style={{
                    backgroundColor: MDL.contabilidad.color_tipo[ajuste?.grupo_sugerido],
                    borderRadius: 100,
                    width: 8,
                    height: 8,
                }}>

                </SView>
                <SView width={4}/>
                <SText style={{ fontSize: 10, textAlign: "center", ...textStyle }}
                    activeOpacity={1}
                    onPress={handlePress}>
                    {ajuste?.descripcion}
                </SText>
            </Animated.View>
        </GestureDetector>
    );
}
