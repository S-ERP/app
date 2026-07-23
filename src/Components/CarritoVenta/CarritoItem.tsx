import React, { useEffect } from "react";
import { Dimensions } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedGestureHandler, runOnJS } from "react-native-reanimated";
import { Gesture, GestureDetector, PanGestureHandler } from "react-native-gesture-handler";
import { SStorage, SText, STheme, SView } from "servisofts-component";
import MDL from "../../MDL";
import SIconApp from "../../Assets/SIconApp";
import PopupCarrito from "./PopupCarrito";
import theme, { ColorCompraVenta } from "../../Config/theme";

const CarritoItem = () => {
    const { width, height } = Dimensions.get("window");
    const isDrag = useSharedValue(false);
    const translateX = useSharedValue(width - 70);
    const translateY = useSharedValue(20);

    useEffect(() => {
        const sub = Dimensions.addEventListener("change", (e) => {
            const _window = e.window;
            if (translateX.value > _window.width - 70) {
                translateX.value = _window.width - 70;
            }
            if (translateY.value > _window.height) {
                translateY.value = 20;
            }
        });
        SStorage.getItem("carrito_venta_pos", (saved) => {
            try {
                if (saved) {
                    const { x, y } = JSON.parse(saved);
                    translateX.value = x > width - 70 ? width - 70 : x;
                    translateY.value = y > height ? 20 : y;
                }
            } catch (e) {
                console.error("Error al cargar posición:", e);
            }
        });
        return () => sub.remove();
    }, []);

    const savePosition = async (x: any, y: any) => {
        try {
            SStorage.setItem("carrito_venta_pos", JSON.stringify({ x, y }));
        } catch (e) {
            console.error("Error al guardar posición:", e);
        }
    };
    const tapgesture = Gesture.Tap().maxDistance(4).onBegin(() => {
    }).onEnd(() => {
        PopupCarrito.open({});
    })
    const gestureHandler: any = Gesture.Pan().onBegin(e => {
        isDrag.value = true;
    }).onStart((e) => {
        gestureHandler.context = {
            startX: translateX.value,
            startY: translateY.value,
        };
    }).onUpdate((e) => {
        translateX.value = gestureHandler.context.startX + e.translationX;
        translateY.value = gestureHandler.context.startY + e.translationY;
    }).onEnd(() => {
        runOnJS(savePosition)(translateX.value, translateY.value);
    }).onFinalize(e => {
        isDrag.value = false;
    })

    const conbine = Gesture.Simultaneous(gestureHandler, tapgesture);
    const animatedStyle = useAnimatedStyle(() => ({
        cursor: isDrag.value ? "grabbing" : "grab",
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
        ],
    }));
    
    return (
        <GestureDetector gesture={conbine}>
            <Animated.View style={[{ width: 50, height: 50, position: "absolute", justifyContent: "center", alignItems: "center" }, animatedStyle]}>
                <SView width={50} height={50} center style={{ backgroundColor: ColorCompraVenta.venta, borderRadius: 8, justifyContent: "center", alignItems: "center" }}>
                    <SIconApp name="ventaCarro" fill={STheme.color.white} width={35} height={35} style={{ left: 6, position: "absolute" }} />
                </SView>
                <SView style={{ width: 25, height: 25, backgroundColor: STheme.color.lightGray, borderRadius: 100, position: "absolute", justifyContent: "center", alignItems: "center", top: -14, right: -14 }}>
                    <SText fontSize={10} center color={STheme.color.black} bold>{MDL.carrito.carrito_venta.cantidad_items}</SText>
                </SView>
            </Animated.View>
        </GestureDetector>
    );
};
export default CarritoItem;
