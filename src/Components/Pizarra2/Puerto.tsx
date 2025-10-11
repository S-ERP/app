// Puerto.tsx
import React from "react";
import { Text, View, ViewStyle } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { usePizarra } from "./Pizarra";
import { useNodo } from "./Nodo";
import { PathProps } from "react-native-svg";

type PuertoProps = {
    id: string;
    children?: React.ReactNode;
    style?: ViewStyle;
    type: "input" | "output",
    connectSpace?: number,
    lineType?: "line" | "curve"
    lineProps?: PathProps & { zIndex?: number },
    selectLineProps?: PathProps & { zIndex?: number },
    onConnect?: (evt: any) => void,
    onPressLine?: (evt: any) => void,
};

export const PuertoContext = React.createContext<any>(null);

function PuertoBase(props: PuertoProps) {
    const { id, children, style, type, value } = props;
    const viewRef = React.useRef<any>(null);
    const puertoConectado = React.useRef<any>(null);
    const pizarra = usePizarra();
    const nodo = useNodo();
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const connectSpace = props.connectSpace ?? 20;
    const layout = useSharedValue({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    })
    const styleAnimated = useSharedValue({

    });


    const checkConnectPort = async () => {
        Object.values(pizarra.nodos.current).forEach((_nodo: any) => {
            if (nodo.id == _nodo.id) return;
            Object.keys(_nodo.puertos.current).forEach(_puerto_key => {
                const _puerto = _nodo.puertos.current[_puerto_key];
                if (type == _puerto.type) return;
                if (!_puerto.viewRef.current) return;

                // @ts-ignore
                _puerto.viewRef.current.measureLayout((pizarra.viewRef?.current) as any, (x, y, width, height) => {
                    const mx = (x - ((pizarra.size.value * pizarra.scale.value) / 2)) / pizarra.scale.value
                        + ((width) / 2)
                    const my = (y - ((pizarra.size.value * pizarra.scale.value) / 2)) / pizarra.scale.value
                        + ((height) / 2)

                    const endx = translateX.value + pizarra.linea.current.startX.value
                    const endy = translateY.value + pizarra.linea.current.startY.value
                    if (endx > (mx - (width) / 2) - connectSpace && endx < (mx + (width) / 2) + connectSpace
                        && endy > (my - (height) / 2) - connectSpace && endy < (my + (height) / 2) + connectSpace
                    ) {
                        _puerto.styleAnimated.value = {
                            backgroundColor: "#f0f",
                        }
                        pizarra.linea.current.endX.value = mx;
                        pizarra.linea.current.endY.value = my;
                        puertoConectado.current = _puerto
                    } else {
                        if (puertoConectado.current) {
                            if (puertoConectado.current.id_full == _puerto.id_full) {
                                puertoConectado.current = null
                            }
                        }
                        _puerto.styleAnimated.value = {}
                    }

                })
            })
        })
    }

    // 📌 Arrastre del Puerto
    const panGesture: any = Gesture.Pan().minDistance(2)
        .onStart((e) => {
            panGesture.context = { startX: translateX.value, startY: translateY.value, mx: e.x, my: e.y };
            // @ts-ignore
            viewRef.current.measureLayout((pizarra.viewRef?.current) as any, (x, y, width, height) => {
                panGesture.context.mx = (e.x / pizarra.scale.value) - (width / 2);
                panGesture.context.my = (e.y / pizarra.scale.value) - (height / 2);

                pizarra.linea.current.startX.value = (
                    (x - ((pizarra.size.value * pizarra.scale.value) / 2)) / pizarra.scale.value
                    + ((width) / 2)
                )
                pizarra.linea.current.startY.value = (
                    (y - ((pizarra.size.value * pizarra.scale.value) / 2)) / pizarra.scale.value
                    + ((height) / 2)
                )

            })
        })
        .onUpdate((e) => {

            translateX.value = (panGesture.context.startX + panGesture.context.mx) + (e.translationX / pizarra.scale.value);
            translateY.value = (panGesture.context.startY + panGesture.context.my) + (e.translationY / pizarra.scale.value);
            if (!puertoConectado.current) {
                pizarra.linea.current.endX.value = pizarra.linea.current.startX.value + translateX.value;
                pizarra.linea.current.endY.value = pizarra.linea.current.startY.value + translateY.value;
            }

            pizarra.linea.current.visible.value = e.translationX != 0 || e.translationY != 0;

            checkConnectPort()


        }).onEnd(() => {
            translateX.value = 0
            translateY.value = 0
            pizarra.linea.current.startX.value = 0
            pizarra.linea.current.startY.value = 0
            pizarra.linea.current.endX.value = 0
            pizarra.linea.current.endY.value = 0
            pizarra.linea.current.visible.value = false;
            if (puertoConectado.current) {
                console.log("Se conecto con este puerto", puertoConectado.current)
                if (props.onConnect) {
                    props.onConnect(puertoConectado.current.props);
                }
                if (puertoConectado.current.props.onConnect) {
                    puertoConectado.current.props.onConnect(props)
                }
            }
            Object.values(pizarra.nodos.current).forEach((_nodo: any) => {
                if (nodo.id == _nodo.id) return;
                Object.keys(_nodo.puertos.current).forEach(_puerto_key => {
                    const _puerto = _nodo.puertos.current[_puerto_key];
                    if (type == _puerto.type) return;
                    _puerto.styleAnimated.value = {}
                })
            })
        });






    React.useEffect(() => {
        nodo.puertos.current[id + "-" + type] = {
            id,
            id_full: nodo.id + "-" + id + "-" + type,
            viewRef,
            type: type,
            layout,
            props,
            getProps: () => { return props },
            styleAnimated,
        }
        return () => {
            delete nodo.puertos.current[id + "-" + type];
        };
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            zIndex: 2,
            ...style,
            ...styleAnimated.value,
        }
    })
    if (nodo?.puertos?.current?.[id + "-" + type]) {
        nodo.puertos.current[id + "-" + type].props = props;
    }
    console.log("Entro al rendes puerto", props, value)

    if (pizarra.conexiones?.current) {
        pizarra.conexiones.current.calcularConexiones();
    }
    return (
        <GestureDetector gesture={panGesture}>
            <Animated.View
                onLayout={e => {
                    // @ts-ignore
                    viewRef.current.measureLayout((nodo.viewRef?.current) as any, (x, y, width, height) => {
                        layout.value = {
                            x: x / pizarra.scale.value,
                            y: y / pizarra.scale.value,
                            width: width,
                            height: height
                        }
                        if (pizarra.conexiones?.current) {
                            pizarra.conexiones.current.calcularConexiones();
                        }
                    })


                }}
                ref={viewRef}
                style={[
                    { cursor: "crosshair" } as any,
                    animatedStyle
                ]}
            >
                {children}
            </Animated.View>
        </GestureDetector>
    );
}

// ✅ Memo: solo re-renderiza si cambian las props (x, y, label)
const Puerto = React.memo(PuertoBase, (prev, next) => {
    const isSameValue = Array.isArray(prev.value) && Array.isArray(next.value)
        ? prev.value.length === next.value.length &&
        prev.value.every((v, i) => v === next.value[i])
        : prev.value === next.value;

    return (
        prev.id === next.id
        && prev.type === next.type
        && isSameValue
    );
});

export default Puerto;
