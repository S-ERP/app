import * as React from 'react';
import { useRef, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SImage, SInput, SSwitch, SText, STheme, SView } from 'servisofts-component';
import * as THREE from 'three';
import DraggableBox from './DraggableBox';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Nodos from './Nodos';
import { Svg } from 'react-native-svg';
import SvgView from './SvgView';

interface ShaderEditorProps {
    material: THREE.Material
}

const ShaderEditor = (props: ShaderEditorProps) => {
    const { material } = props;
    const windowDimensions = Dimensions.get('window');
    const scale = useSharedValue(1);
    const VentanaPadre = useRef(null);
    const screenWidth = useSharedValue(0);
    const screenHeight = useSharedValue(0);
    const auxiliar = useSharedValue({ center: { x: 0, y: 0 } });
    const width = useSharedValue(1024 * 5);
    const height = useSharedValue(1024 * 5);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const isDragging = useSharedValue(false);

    const [state, setState] = useState({ center: false });
    const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
    // const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = (e: any) => {
        if (e.button === 1) { // Solo el botón central del mouse
            isDragging.value = true;
            startPosition.x = e.clientX;
            startPosition.y = e.clientY;
            console.log("sadasdsa")
            // setStartPosition({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseUp = (e: any) => {
        if (e.button === 1) {
            isDragging.value = false;
        }
    };

    const handleMouseMove = (e: any) => {
        if (isDragging.value) {
            const deltaX = e.clientX - startPosition.x;
            const deltaY = e.clientY - startPosition.y;

            translateX.value += deltaX;
            translateY.value += deltaY;

            startPosition.x = e.clientX;
            startPosition.y = e.clientY;
            // setStartPosition({ x: e.clientX, y: e.clientY });
        }
    };
    const handleWheel = (e: any) => {
        e.preventDefault();
        const zoomSpeed = 0.05;
        const newScale = scale.value + (e.deltaY < 0 ? zoomSpeed : -zoomSpeed);

        // Limitar el zoom
        if (newScale >= 0.2 && newScale <= 3) {


            const finalw = ((width.value * newScale) / (width.value))
            const finalh = ((height.value * newScale) / (height.value))
            console.log("newScale", newScale)
            const desplaze = {
                x: translateX.value - auxiliar.value.center.x,
                y: translateY.value - auxiliar.value.center.y
            }
            const affectx = (desplaze.x) / (width.value)
            const affecty = (desplaze.y) / (height.value)

            console.log(desplaze)
            console.log(finalw, finalh)
            console.log(affectx, affecty)
            console.log(finalw * affectx, finalh * affecty)

            // translateX.value += finalw * affectx;
            // translateY.value += finalh * affecty;

            // console.log(desplaze.x / width.value)

            // const factor = newScale / scale.value;

            // console.log(finalw, factor, translateX.value, translateY.value)
            // translateX.value = translateX.value * factor;
            // translateX.value += finalw
            // translateY.value += finalh
            // translateY.value = translateY.value * factor
            // translateX.value += (width.value * (factor)) * 0.5
            // translateY.value += (height.value * (factor)) * 0.5
            scale.value = newScale;

        }
    };

    if (Platform.OS == "web") {
        React.useEffect(() => {

            // @ts-ignore
            window.addEventListener('mousedown', handleMouseDown);
            // @ts-ignore
            window.addEventListener('mouseup', handleMouseUp);
            // @ts-ignore
            window.addEventListener('mousemove', handleMouseMove);
            // @ts-ignore
            window.addEventListener('wheel', handleWheel, { passive: false });

            return () => {
                // @ts-ignore
                window.removeEventListener('mousedown', handleMouseDown);
                // @ts-ignore
                window.removeEventListener('mouseup', handleMouseUp);
                // @ts-ignore
                window.removeEventListener('mousemove', handleMouseMove);
                // @ts-ignore
                window.removeEventListener('wheel', handleWheel);
            };
        }, []);

    }

    const animatedStyle2 = useAnimatedStyle(() => {
        return {
            width: width.value,
            height: height.value,
            // backgroundColor: "#ffffff66",
            transform: [
                { translateX: translateX.value },  // Aplica la traslación en X
                { translateY: translateY.value },  // Aplica la traslación en Y
                { scale: scale.value },

            ],
        };
    });
    return (
        <View style={styles.container} onLayout={e => {
            screenWidth.value = e.nativeEvent.layout.width
            screenHeight.value = e.nativeEvent.layout.height
            if (!state.center) {
                const screenCenterX = screenWidth.value / 2;
                const screenCenterY = screenHeight.value / 2;
                const viewCenterX = width.value / 2;
                const viewCenterY = height.value / 2;
                const tx = screenCenterX - viewCenterX;
                const ty = screenCenterY - viewCenterY;
                translateX.value = tx;
                translateY.value = ty;
                auxiliar.value.center.x = tx;
                auxiliar.value.center.y = ty;
                // console.log(screenCenterX, screenCenterY)
                // console.log(viewCenterX, viewCenterY)
                // console.log(tx, ty)
                state.center = true;
            }
        }}>
            <GestureHandlerRootView style={{ flex: 1, width: "100%" }}>

                <Animated.View ref={VentanaPadre} style={[animatedStyle2, { justifyContent: "center", alignItems: "center" }]}>
                    <SImage src={require("../../../Assets/img/grid.png")} style={{ resizeMode: "cover", position: "absolute", opacity: 0.1 }} />
                    <SvgView width={width.value} height={height.value} />
                    <Nodos material={material} scale={scale} widthWorkSpace={width} heightWorkSpace={height} />
                </Animated.View>
            </GestureHandlerRootView>

            {/* <SView style={styles.point} /> */}
        </View >
    );
};

export default ShaderEditor;

const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: "100%",
        // backgroundColor: "#00000099",
        // justifyContent: "center",
        // alignItems: "center"
    },
    point: {
        width: 2,
        height: 2,
        backgroundColor: "#ffffff",
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: [{ translateX: -1 }, { translateY: -1 }]
    }
});
