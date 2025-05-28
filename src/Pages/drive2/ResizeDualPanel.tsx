import React from "react";
import { StyleSheet } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedGestureHandler,
} from "react-native-reanimated";
import { GestureHandlerRootView, PanGestureHandler } from "react-native-gesture-handler";
import { STheme, SView } from "servisofts-component";

export default ({ content1, content2, startX = 100 }: { content1: any, content2: any, startX?: number }) => {
    const context = useSharedValue({ startX: 0 }); // Valor inicial del separador (en el centro)
    const dividerX = useSharedValue(startX); // Valor inicial del separador (en el centro)

    // Manejo de gestos
    // const gestureHandler = useAnimatedGestureHandler({
    //     onStart: (_, context) => {
    //         console.log("sadasdas")
    //         context.startX = dividerX.value; // Guardar la posición inicial del gesto
    //     },
    //     onActive: (event, context) => {
    //         dividerX.value = context.startX + event.translationX / 300; // Ajustar el movimiento
    //         // Restringir valores para que el separador no salga de los límites
    //         dividerX.value = Math.min(Math.max(dividerX.value, -0.5), 0.5);
    //     },
    // });

    // Estilo animado del panel izquierdo
    const leftPanelStyle = useAnimatedStyle(() => ({
        width: dividerX.value

    }));

    // Estilo animado del panel derecho
    const rightPanelStyle = useAnimatedStyle(() => ({
        flex: 1
    }));

    return (
        <SView col={"xs-12"} flex row>
            <Animated.View style={[styles.panel, leftPanelStyle]}>
                {content1}
            </Animated.View>
            <PanGestureHandler onActivated={e => {
                context.value.startX = dividerX.value
                // context.startX = dividerX.value;
                // console.log("on activated")
            }} onGestureEvent={(evt) => {
                console.log(evt.nativeEvent.translationX)
                dividerX.value = context.value.startX + evt.nativeEvent.translationX; // Ajustar el movimiento
                //         // Restringir valores para que el separador no salga de los límites
                //         dividerX.value = Math.min(Math.max(dividerX.value, -0.5), 0.5);
            }}>
                <Animated.View style={[styles.divider, { backgroundColor: STheme.color.primary, }]} />
            </PanGestureHandler>
            <Animated.View style={[styles.panel, rightPanelStyle]}>
                {content2}
            </Animated.View>
        </SView>
    );
};

const styles = StyleSheet.create({
    panel: {
        height: "100%",
        // borderWidth: 1,
        // borderColor: "#000",
    },
    divider: {
        width: 6,
        cursor: "col-resize", // Indicador de deslizamiento
    },
});
