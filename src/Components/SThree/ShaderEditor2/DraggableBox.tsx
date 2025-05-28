import React, { useRef } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { PanGestureHandler, GestureHandlerRootView, State } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, SharedValue } from 'react-native-reanimated';
import { SText } from 'servisofts-component';
type DraggableBoxProps = {
    x?: number;
    y?: number;
    boxWidth?: number;
    boxHeight?: number;
    scale: SharedValue<number>;
    color?: string;
    border?: string;
    children?: React.ReactNode;
    style?: ViewStyle | ViewStyle[],
    onChange?: (e: any) => void
};
const DraggableBox = ({ x = 0, y = 0, scale, children, style, onChange }: DraggableBoxProps) => {

    const itemRef = useRef(null);
    // Valores compartidos para el desplazamiento
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const currentX = useSharedValue(x);
    const currentY = useSharedValue(y);


    // Estilo animado que aplica las transformaciones
    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value + currentX.value },
                { translateY: translateY.value + currentY.value },
            ],
        };
    });

    // Limitar los valores dentro de los límites de width y height
    const limitWithinBounds = (value: any, min: any, max: any) => {
        return Math.max(min, Math.min(value, max));
    };

    // Función que se ejecuta al finalizar el gesto
    const onHandlerStateChange = (event: any) => {
        if (event.nativeEvent.state === State.END || event.nativeEvent.state === State.CANCELLED) {
            // Calcular los nuevos valores, aplicando los límites
            const newX = currentX.value + translateX.value;
            const newY = currentY.value + translateY.value;
            // Limitar para que no se pase de los bordes del área
            // currentX.value = withSpring(limitWithinBounds(newX, 0, width - boxSize));
            // currentY.value = withSpring(limitWithinBounds(newY, 0, height - boxSize));
            // currentX.value = limitWithinBounds(newX, 0, boxWidth)
            // currentY.value = limitWithinBounds(newY, 0, boxHeight)
            currentX.value = newX
            currentY.value = newY

            if (onChange) onChange({ x: currentX.value, y: currentY.value });
            // Resetear las traducciones temporales
            translateX.value = 0;
            translateY.value = 0;
        }
    };

    return (
        <PanGestureHandler
            onGestureEvent={(event) => {
                translateX.value = event.nativeEvent.translationX * (1 / scale.value);
                translateY.value = event.nativeEvent.translationY * (1 / scale.value);
            }}
            onHandlerStateChange={onHandlerStateChange}
        >
            <Animated.View ref={itemRef} style={[styles.box, animatedStyle, ...(Array.isArray(style) ? style : [style])]} >
                {children}
            </Animated.View>
        </PanGestureHandler>
    );
};

export default DraggableBox;

const styles = StyleSheet.create({
    box: {
        width: 100,
        position: "absolute",
    },
});
