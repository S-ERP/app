import React, { useEffect } from "react";
import { Dimensions } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedGestureHandler, runOnJS, } from "react-native-reanimated";
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
        (async () => {
            Dimensions.addEventListener("change", (e) => {
                const _window = e.window;
                if (translateX.value > _window.width - 70) {
                    translateX.value = _window.width - 70;
                }
                if (translateY.value > _window.height) {
                    translateY.value = 20;
                }
            })
            SStorage.getItem("carrito_compra_pos", (saved) => {
                try {
                    if (saved) {
                        const { x, y } = JSON.parse(saved);
                        if (x > width - 70) {
                            translateX.value = width - 70;
                        } else {
                            translateX.value = x;
                        }
                        if (y > height) {
                            translateY.value = 20;
                        } else {
                            translateY.value = y;
                        }
                    }
                } catch (e) {
                    console.warn("Error al cargar posición:", e);
                }
            })
        })();
    }, []);

    const savePosition = async (x: any, y: any) => {
        try {
            SStorage.setItem("carrito_compra_pos", JSON.stringify({ x, y }));

        } catch (e) {
            console.warn("Error al guardar posición:", e);
        }
    };

    const tapgesture = Gesture.Tap().maxDistance(4).onBegin(() => {
    }).onEnd(() => {
        PopupCarrito.open({});

    })

    const gestureHandler: any = Gesture.Pan().onBegin(e => {
        isDrag.value = true;
    })
        .onStart((e) => {
            gestureHandler.context = {
                startX: translateX.value,
                startY: translateY.value,
            };

        })
        .onUpdate((e) => {
            translateX.value = gestureHandler.context.startX + e.translationX;
            translateY.value = gestureHandler.context.startY + e.translationY;
        })
        .onEnd(() => {
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
            <Animated.View style={[ { width: 50, height: 50, position: "absolute", justifyContent: "center", alignItems: "center", }, animatedStyle, ]} >
                <SView width={50} height={50} center style={{ backgroundColor: ColorCompraVenta.compra, borderRadius: 8, justifyContent: "center", alignItems: "center", }}> <SIconApp name="compraCarro" fill={STheme.color.white} width={35} height={35} style={{ left: 6, position: "absolute" }} />
                </SView>
                <SView style={{ width: 25, height: 25, backgroundColor: STheme.color.text, borderRadius: 100, position: "absolute", justifyContent: "center", alignItems: "center", top: -14, right: -14 }}>
                    <SText fontSize={10} center color={STheme.color.primary} bold>{MDL.carrito.carrito_compra.cantidad_items}</SText>
                </SView>
            </Animated.View>
        </GestureDetector>
    );
};
export default CarritoItem;