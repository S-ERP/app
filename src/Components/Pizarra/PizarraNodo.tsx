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
import { SText, STheme, SUuid } from "servisofts-component";
import Nodo from "../SThree/ShaderEditor/Nodo";


// export type NodoContextType = {
//     id: string;
//     viewRef: React.RefObject<Animated.View>;
// }

export const NodoContext = React.createContext<NodoInstance>({
    id: "",
    viewRef: React.createRef<Animated.View>(),
    translateX: 0 as any,
    translateY: 0 as any,
    selected: false as any,
    onDrag: false as any,
});

export const useNodo = () => React.useContext(NodoContext);

type PizarraNodoProps = {
    children: React.ReactNode,
    style?: ViewStyle,
    id: string,
    data: any,
    x: number, y: number,
    onChangePosition: (e: { x: number, y: number }) => void,
    onDoublePress?: (evt:any) => void,
}

export type NodoInstance = {
    id: string;
    translateX: Animated.SharedValue<number>;
    translateY: Animated.SharedValue<number>;
    selected: Animated.SharedValue<boolean>;
    onDrag: Animated.SharedValue<boolean>;
    panGesture?: any;
    viewRef?: React.RefObject<Animated.View>;
    toJSon?: () => any;
};
function PizarraNodo({ children, style, x = 0, y = 0, id = SUuid(), onChangePosition, onDoublePress }: PizarraNodoProps) {

    const viewRef = React.useRef<Animated.View>(null);

    const layout = useSharedValue({ width: 0, height: 0 });
    // Posiciones acumuladas
    const pizarra = usePizarra();
    const translateX = useSharedValue(x);
    const translateY = useSharedValue(y);
    const selected = useSharedValue(false);

    const onDrag = useSharedValue(false);
    const isRendondeado = true;

    const doubleTapGesture: any = Gesture.Tap().numberOfTaps(2).onStart((e) => {
        if (onDoublePress) onDoublePress(e);
    })
    const panGesture: any = Gesture.Pan()
        .onBegin(() => {
            // Guardamos la posición anterior
            pizarra.preventPan.value = true;
            onDrag.value = true;
            if (!selected.value) {
                Object.values(pizarra.nodos.current).forEach(nodo => {
                    if (nodo.id == id) return;
                    if (nodo.selected.value) {
                        nodo.selected.value = false;
                    }
                });
            } else {
                Object.values(pizarra.nodos.current).forEach(nodo => {
                    if (nodo.id == id) return;
                    if (nodo.selected.value) {
                        nodo.panGesture.context = {
                            startX: nodo.translateX.value,
                            startY: nodo.translateY.value,
                        }
                    }
                });
            }
            selected.value = true;

            panGesture.context = {
                startX: translateX.value,
                startY: translateY.value,
            };


        }).onStart(e => {

        })
        .onUpdate((event) => {


            translateX.value = panGesture.context.startX + (event.translationX / pizarra.scale.value);
            translateY.value = panGesture.context.startY + (event.translationY / pizarra.scale.value);

            if (pizarra.exponentDeRedondeoDeMovimiento.value > 1) {
                translateX.value = Math.round(translateX.value / pizarra.exponentDeRedondeoDeMovimiento.value) * pizarra.exponentDeRedondeoDeMovimiento.value;
                translateY.value = Math.round(translateY.value / pizarra.exponentDeRedondeoDeMovimiento.value) * pizarra.exponentDeRedondeoDeMovimiento.value;
            }
            Object.values(pizarra.nodos.current).forEach(nodo => {
                if (nodo.id == id) return;
                if (nodo.selected.value) {
                    if (nodo.panGesture?.context == null) return;
                    nodo.translateX.value = nodo.panGesture.context.startX + (event.translationX / pizarra.scale.value);
                    nodo.translateY.value = nodo.panGesture.context.startY + (event.translationY / pizarra.scale.value);
                    if (pizarra.exponentDeRedondeoDeMovimiento.value > 1) {
                        nodo.translateX.value = Math.round(nodo.translateX.value / pizarra.exponentDeRedondeoDeMovimiento.value) * pizarra.exponentDeRedondeoDeMovimiento.value;
                        nodo.translateY.value = Math.round(nodo.translateY.value / pizarra.exponentDeRedondeoDeMovimiento.value) * pizarra.exponentDeRedondeoDeMovimiento.value;
                    }
                }
            });

            // pizarra.selectTranslateX.value = translateX.value;
            // pizarra.selectTranslateY.value = translateY.value;
        }).onEnd(() => {
            onDrag.value = false;
            const canbios = Object.values(pizarra.nodos.current).filter(nodo => nodo.selected.value).map((nodo: any) => nodo.toJSon());
            pizarra.saveChangeNodes(canbios);
            pizarra.preventPan.value = false;
        }).onFinalize(() => {
            onDrag.value = false;
            pizarra.preventPan.value = false;
        });



    const toJSon = () => {
        return {
            id: id,
            x: translateX.value,
            y: translateY.value,
            selected: selected.value,
        }
    }

    React.useEffect(() => {
        pizarra.registerNodo({ id: id, translateX, translateY, selected, onDrag, panGesture: panGesture, viewRef: viewRef, toJSon });
        return () => {
            pizarra.unregisterNodo(id);
        };
    }, []);
    // pizarra.registerNodo({ id: id, translateX, translateY, selected, onDrag, panGesture: panGesture, viewRef: viewRef, toJSon });
    // si se actualiza el translateX o el translateY, llamamos a onChangePosition
    translateX.addListener(999, (value: any) => {
        if (onChangePosition) onChangePosition({ x: value, y: translateY.value });
    });
    translateY.addListener(999, (value: any) => {
        if (onChangePosition) onChangePosition({ x: translateX.value, y: value });
    });
    const animatedStyleSelect = useAnimatedStyle(() => {
        const isSelect = () => {
            if (pizarra.selectStartX.value) {
                const select = {
                    startX: (pizarra.selectStartX.value) - (pizarra.width / 2),
                    endX: pizarra.selectEndX.value - (pizarra.width / 2),
                    startY: pizarra.selectStartY.value - (pizarra.width / 2),
                    endY: pizarra.selectEndY.value - (pizarra.width / 2),
                }

                const selectPosition = {
                    width: Math.abs(select.endX - select.startX),
                    height: Math.abs(select.endY - select.startY),
                    x: (select.startX < select.endX ? select.startX : select.endX),
                    y: (select.startY < select.endY ? select.startY : select.endY),
                }

                if (layout.value.width && layout.value.height) {
                    if (selectPosition.width && selectPosition.height) {
                        if (
                            selectPosition.x < translateX.value - (layout.value.width / 2)
                            && (selectPosition.x + selectPosition.width) > (translateX.value + (layout.value.width / 2))
                            && selectPosition.y < translateY.value - (layout.value.height / 2)
                            && (selectPosition.y + selectPosition.height) > (translateY.value + (layout.value.height / 2))
                        ) {
                            // console.log("Dentro de la selección");
                            return true;
                        }
                    }
                }
            }
            return false;
        }
        if (pizarra.selectStartX.value && !onDrag.value) {
            selected.value = isSelect();
        }

        if (selected.value) {
            return {
                backgroundColor: STheme.color.card,
                borderRadius: 4,
            }
        }


        return {
            backgroundColor: "transparent",
            borderRadius: 0,
            // opacity: onDrag.value ? 0.5 : 1,
            // opacity: !selected ? 0.5 : 1,
        }
    });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            zIndex: onDrag.value ? 9999 : 10,

            // opacity: onDrag.value ? 0.5 : 1,
            // opacity: !selected ? 0.5 : 1,
            cursor: onDrag.value ? "grabbing" : "pointer",
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
            ],
        }
    });




    return (<>
        <GestureDetector gesture={(Gesture.Simultaneous(panGesture, doubleTapGesture))}>
            <Animated.View
                ref={viewRef}
                style={[{
                    position: "absolute",
                    padding: 8,
                }, style, animatedStyle, animatedStyleSelect]} onLayout={(event) => {
                    const { width, height } = event.nativeEvent.layout;
                    layout.value = { width, height };
                    // translateX.value = (width / 2);
                    // translateY.value = (height / 2);
                }}>
                <NodoContext.Provider value={{ id, viewRef: viewRef, onDrag, translateX, translateY, selected }}>
                    {children}
                </NodoContext.Provider>
            </Animated.View>
        </GestureDetector>
    </>
    );
}


PizarraNodo.displayName = "PizarraNodo";

export default PizarraNodo