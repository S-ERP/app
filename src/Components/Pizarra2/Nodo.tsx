// Nodo.tsx
import React from "react";
import { Text, ViewStyle } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { usePizarra } from "./Pizarra";
import { STheme } from "servisofts-component";

type NodoProps = {
    id: string;
    x: number;
    y: number;
    label: string;
    children?: React.ReactNode;
    style?: ViewStyle,
    data?: any,
    memo?: (prev: NodoProps, next: NodoProps) => boolean
    onDoublePress?: (evt: any) => void,
    onSelectChange?: (select: boolean) => void
};

export const NodoContext = React.createContext<any>(null);

function NodoBase(props: NodoProps) {
    const { id, x, y, label, children, style, onDoublePress, onSelectChange } = props;
    const puertos = React.useRef<Record<string, any>>({});
    const viewRef = React.useRef<any>(null);
    const onDrag = useSharedValue(false);
    const layout = useSharedValue({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    })
    const pizarra = usePizarra();
    const selected = useSharedValue(false);
    const translateX = useSharedValue(x);
    const translateY = useSharedValue(y);


    const contextValue = React.useMemo(
        () => ({
            id,
            puertos,
            translateX,
            translateY,
            layout,
            selected
        }),
        []
    );

    selected.addListener(999, (value: any) => {
        if (onSelectChange) onSelectChange(value);
        if (pizarra.onNodoChangeSelect) pizarra.onNodoChangeSelect({
            id: id,
            x: translateX.value,
            y: translateY.value,
        });
    });

    const doubleTapGesture: any = Gesture.Tap().numberOfTaps(2).onStart((e) => {
        if (onDoublePress) onDoublePress(e);
    })
    // 📌 Arrastre del nodo
    const panGesture: any = Gesture.Pan()
        .onTouchesDown(e => {
            if (e.allTouches.length > 1) {
                panGesture.fail();
            }
        })
        .onBegin(() => {
            pizarra.preventPan.value = true;
            onDrag.value = true;
            if (!selected.value) {
                Object.values(pizarra.nodos.current).forEach((nodo: any) => {
                    if (nodo.id == id) return;
                    if (nodo.selected.value) {
                        nodo.selected.value = false;
                    }
                });
            } else {
                Object.values(pizarra.nodos.current).forEach((nodo: any) => {
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
            // Object.values(pizarra.nodos.current).forEach((nodo: any) => {
            //     if (nodo.id == id) return;
            //     if (nodo.selected.value) {
            //         nodo.selected.value = false;
            //     }
            // });
        })
        .onStart(() => {
            panGesture.context = { startX: translateX.value, startY: translateY.value };
        })
        .onUpdate((e) => {
            translateX.value = panGesture.context.startX + e.translationX / pizarra.scale.value;
            translateY.value = panGesture.context.startY + e.translationY / pizarra.scale.value;
            if (pizarra.exponentDeRedondeoDeMovimiento.value > 1) {
                translateX.value = Math.round(translateX.value / pizarra.exponentDeRedondeoDeMovimiento.value) * pizarra.exponentDeRedondeoDeMovimiento.value;
                translateY.value = Math.round(translateY.value / pizarra.exponentDeRedondeoDeMovimiento.value) * pizarra.exponentDeRedondeoDeMovimiento.value;
            }
            Object.values(pizarra.nodos.current).forEach((nodo: any) => {
                if (nodo.id == id) return;
                if (nodo.selected.value) {
                    if (nodo.panGesture?.context == null) return;
                    nodo.translateX.value = nodo.panGesture.context.startX + (e.translationX / pizarra.scale.value);
                    nodo.translateY.value = nodo.panGesture.context.startY + (e.translationY / pizarra.scale.value);
                    if (pizarra.exponentDeRedondeoDeMovimiento.value > 1) {
                        nodo.translateX.value = Math.round(nodo.translateX.value / pizarra.exponentDeRedondeoDeMovimiento.value) * pizarra.exponentDeRedondeoDeMovimiento.value;
                        nodo.translateY.value = Math.round(nodo.translateY.value / pizarra.exponentDeRedondeoDeMovimiento.value) * pizarra.exponentDeRedondeoDeMovimiento.value;
                    }
                }
            });
        }).onEnd((e) => {
            onDrag.value = false;
            const canbios = Object.values(pizarra.nodos.current).filter(nodo => nodo.selected.value).map((nodo: any) => ({
                id: nodo.id,
                x: nodo.translateX.value,
                y: nodo.translateY.value,
            }));
            pizarra.saveChangeNodes(canbios);
            pizarra.preventPan.value = false;
        }).onFinalize(() => {
            onDrag.value = false;
            pizarra.preventPan.value = false;
        });

    const animatedStyle = useAnimatedStyle(() => {

        return {
            position: "absolute",
            zIndex: 2,
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
            ],
        };
    });

    const animatedStyleSelect = useAnimatedStyle(() => {
        const isSelect = () => {
            if (pizarra.selectStartX.value) {
                const select = {
                    startX: (pizarra.selectStartX.value) - (pizarra.size.value / 2),
                    endX: pizarra.selectEndX.value - (pizarra.size.value / 2),
                    startY: pizarra.selectStartY.value - (pizarra.size.value / 2),
                    endY: pizarra.selectEndY.value - (pizarra.size.value / 2),
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
                padding: 4,
            }
        }


        return {
            backgroundColor: "transparent",
            borderRadius: 0,
            padding: 4,
            // opacity: onDrag.value ? 0.5 : 1,
            // opacity: !selected ? 0.5 : 1,
        }
    });
    React.useEffect(() => {
        pizarra.nodos.current[id] = {
            id,
            puertos,
            translateX,
            translateY,
            viewRef,
            layout,
            selected,
            panGesture,
            getProps: () => props
            // Acá podrías agregar: selected, refs, métodos, etc.
        };

        return () => {
            delete pizarra.nodos.current[id];
            if (pizarra.onNodoChangeSelect) pizarra.onNodoChangeSelect({
                id: id,
                x: translateX.value,
                y: translateY.value,
            });

        };
    }, []);

    // console.log("Entro al rendes", id)
    return (
        <NodoContext.Provider value={contextValue}>
            <GestureDetector gesture={(Gesture.Simultaneous(panGesture, doubleTapGesture))}>
                <Animated.View
                    ref={viewRef}
                    onLayout={e => {
                        layout.value = {
                            x: e.nativeEvent.layout.x,
                            y: e.nativeEvent.layout.y,
                            width: e.nativeEvent.layout.width,
                            height: e.nativeEvent.layout.height,
                        }
                    }}
                    style={[
                        animatedStyle,
                        style,
                        animatedStyleSelect
                    ]}
                >
                    {children}
                </Animated.View>
            </GestureDetector>
        </NodoContext.Provider>
    );
}

// ✅ Memo: solo re-renderiza si cambian las props (x, y, label)
const Nodo = React.memo(NodoBase, (prev, next) => {
    if (!(
        prev.x === next.x &&
        prev.y === next.y &&
        prev.id === next.id

    )) {
        return false;
    }
    // if (prev.memo) {
    //     return prev.memo(prev, next);
    // }
    let equal = true;
    // if (next.data != prev.data) return false;
    if (next.data) {
        Object.keys(next.data).map(key => {
            // if (key == "arrIngredientes") {
            //     console.log("asdsa")
            // }
            const isSameValue = Array.isArray(prev.data[key]) && Array.isArray(next.data[key])
                ? prev.data[key].length === next.data[key].length &&
                prev.data[key].every((v, i) => v === next.data[key][i])
                : prev.data[key] === next.data[key];

            if (!isSameValue) {
                equal = false;
            }
        })
        // console.log("Se previno el render", equal, prev.id)
        return equal;
    }
    return true;

});

export default Nodo;

export function useNodo() {
    return React.useContext(NodoContext);
}