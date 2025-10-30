import React, { useEffect } from "react";
import { Dimensions } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedGestureHandler,
    runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector, PanGestureHandler } from "react-native-gesture-handler";
import { SNavigation, SStorage, SText, STheme, SView } from "servisofts-component";
import MDL from "../../MDL";

export default class CarritoCompra extends React.Component {
    state = {
        open: false,
    }
    handleChange = () => {
        const items = MDL.carrito.carrito_compra.items;
        console.log("Repintando entro al force update", items.length)

        this.setState({
            open: items.length > 0
        })
    }
    componentDidMount(): void {

        MDL.carrito.addEventListener("handleChange", this.handleChange.bind(this))
    }
    componentWillUnmount(): void {
        MDL.carrito.removeEventListener(this.handleChange.bind(this))
    }
    render() {
        // if (!this.state.open) return <SView />;
        return <CarritoItem />
    }
}

const { width, height } = Dimensions.get("window");

const CarritoItem = () => {
    // Posición inicial del elemento
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
            // await AsyncStorage.setItem("carrito_pos", JSON.stringify({ x, y }));
        } catch (e) {
            console.warn("Error al guardar posición:", e);
        }
    };

    const tapgesture = Gesture.Tap().maxDistance(4).onBegin(() => {

    }).onEnd(() => {
        console.log("asdsad");
        // SNavigation.navigate("/compra/carrito");
    })
    const gestureHandler = Gesture.Pan().onBegin(e => {
        isDrag.value = true;
    })
        .onStart((e) => {
            gestureHandler.context = {
                startX: translateX.value,
                startY: translateY.value,
            };

            // ctx.startY = translateY.value;
        })
        .onUpdate((e) => {
            translateX.value = gestureHandler.context.startX + e.translationX;
            translateY.value = gestureHandler.context.startY + e.translationY;

        })
        .onEnd(() => {

            runOnJS(savePosition)(translateX.value, translateY.value);
            // Aquí podrías agregar límites, animaciones de rebote, etc.
        }).onFinalize(e => {
            isDrag.value = false;
        })


    const conbine = Gesture.Simultaneous(gestureHandler, tapgesture);

    // Estilo animado
    const animatedStyle = useAnimatedStyle(() => ({
        cursor: isDrag.value ? "grabbing" : "grab",
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
        ],
    }));

    return (
        <GestureDetector gesture={conbine}>
            <Animated.View
                style={[
                    {
                        width: 50,
                        height: 50,
                        borderWidth:1,
                        borderColor:STheme.color.card,
                        backgroundColor: STheme.color.background,
                        borderRadius: 4,
                        position: "absolute",
                        justifyContent: "center",
                        alignItems: "center",
                    },
                    animatedStyle,
                ]}
            >
                <SText fontSize={10} center>Carrito de compras </SText>
                <SView style={{
                    width: 27,
                    height: 27,
                    backgroundColor: STheme.color.text,
                    borderRadius: 100,
                    position: "absolute",
                    justifyContent: "center",
                    alignItems: "center",
                    top: -14,
                    right: -14
                }}>
                    <SText fontSize={10} center color={STheme.color.primary} bold>{MDL.carrito.carrito_compra.items.length}</SText>
                </SView>
            </Animated.View>
        </GestureDetector>
    );
};
