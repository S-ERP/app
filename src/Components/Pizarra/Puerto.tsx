import React, { Children } from "react";
import { View, ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { SharedValue, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { usePizarra } from "./Pizarra";
import { SText, STheme } from "servisofts-component";
import { NodoInstance, useNodo } from "./PizarraNodo";

export type PuertoProps = {
    id: string;
    style?: ViewStyle,
    type: "input" | "output",
    children?: React.ReactNode,
    connectSpace?: number,
    value?: any
}

export type PuertoInstance = {
    id: string;
    type: "input" | "output";
    layout: SharedValue<{ width: number, height: number, x: number, y: number }>;
    nodo: NodoInstance;
    onConnected: any;
    props: PuertoProps;

};
export default function Puerto(props: PuertoProps) {

    const layout = useSharedValue({ width: 0, height: 0, x: 0, y: 0 });
    const viewRef = React.useRef<Animated.View>(null);
    const context = useSharedValue({ startX: 0, startY: 0 });
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const pizarra = usePizarra();
    const nodo = useNodo();
    const onConnected = useSharedValue(false);

    const connectSpace = props.connectSpace ?? 40;


    React.useEffect(() => {
        pizarra.registerPuerto({ id: props.id, layout, nodo: nodo, onConnected, type: props.type ?? "input", props: props });
        return () => {
            pizarra.unregisterPuerto(props.id, nodo.id);
        };
    }, []);


    const callOtherPorts = () => {
        const myPosition = {
            x: layout.value.x + translateX.value,
            y: layout.value.y + translateY.value,
            width: layout.value.width,
            height: layout.value.height,
        }

        let toTarget = false;
        Object.values(pizarra.puertos.current).forEach(puerto => {
            if (puerto.nodo.id + "_" + puerto.id == nodo.id + "_" + props.id) {
                // onConnected.value = true;
                return;
            }

            if (puerto.id != props.id) return;
            if (puerto.type == props.type) return;
            // console.log(puerto.nodo.id + "_" + puerto.id, nodo.id + "_" + props.id)
            const ppos = {
                x: puerto.nodo.translateX.value + puerto.layout.value.x,
                y: puerto.nodo.translateY.value + puerto.layout.value.y,
            }

            if (ppos.x < nodo.translateX.value + myPosition.x + (myPosition.width / 2) + connectSpace
                && ppos.x + (puerto.layout.value.width + connectSpace) > nodo.translateX.value + myPosition.x + (myPosition.width / 2)
                && ppos.y < nodo.translateY.value + myPosition.y + (myPosition.height / 2) + connectSpace
                && ppos.y + (puerto.layout.value.height + connectSpace) > nodo.translateY.value + myPosition.y + (myPosition.height / 2)
            ) {
                console.log("YO", nodo.id + "_" + props.id, "Me conecte a ", puerto.nodo.id + "_" + puerto.id);
                paintLineToTarget(puerto);
                toTarget = true;
                puerto.onConnected.value = true;
            } else {
                puerto.onConnected.value = false;
            }
        });
        if (!toTarget) {
            paintLineToCursor();
        }
    }

    const paintLineToCursor = () => {



        const lineas = pizarra.lineas.current;
        let line = lineas["select"];
        if (line) {
            line.x1.value = nodo.translateX.value + layout.value.x + (layout.value.width / 2);
            line.y1.value = nodo.translateY.value + layout.value.y + (layout.value.height / 2);
            line.x2.value = line.x1.value + translateX.value;
            line.y2.value = line.y1.value + translateY.value;

        }
    }
    const paintLineToTarget = (port: PuertoInstance) => {
        const lineas = pizarra.lineas.current;
        let line = lineas["select"];
        if (line) {
            line.x1.value = nodo.translateX.value + layout.value.x + (layout.value.width / 2);
            line.y1.value = nodo.translateY.value + layout.value.y + (layout.value.height / 2);
            line.x2.value = port.nodo.translateX.value + port.layout.value.x + (port.layout.value.width / 2);
            line.y2.value = port.nodo.translateY.value + port.layout.value.y + (port.layout.value.height / 2);
            pizarra.lineasRef.current?.drawLine({
                 portA:pizarra.puertos.current[nodo.id + "_" + props.id],
                 portB:port
            });
        }
    }
    const clearLine = () => {
        const lineas = pizarra.lineas.current;
        let line = lineas["select"];
        if (line) {
            line.x1.value = 0;
            line.y1.value = 0;
            line.x2.value = 0;
            line.y2.value = 0;
        }
    }

    const panGesture = Gesture.Pan().minDistance(5)
        // .onStart(e => {
        //     context.value={
        //         startX: e.translationX,
        //         startY: e.translationY
        //     }
        // })
        .onBegin(e => {
            context.value = {
                startX: e.translationX,
                startY: e.translationY,
            };

            console.log(layout.value)
        })
        .onUpdate(e => {
            translateX.value = context.value.startX + (e.translationX / pizarra.scale.value);
            translateY.value = context.value.startY + (e.translationY / pizarra.scale.value);
            callOtherPorts();
            // paintLine()
        }).onEnd(e => {
            translateX.value = 0
            translateY.value = 0
            callOtherPorts();
            clearLine();
            onConnected.value = false;
        })

    const styleAnimated = useAnimatedStyle(() => {
        return {
            backgroundColor: onConnected.value ? STheme.color.warning : STheme.color.text,
            // transform: [
            //     { translateX: translateX.value },
            //     { translateY: translateY.value },
            // ]
        };
    });


    return <GestureDetector gesture={panGesture} >
        <Animated.View
            ref={viewRef}
            onLayout={e => {
                viewRef.current?.measureLayout((nodo.viewRef?.current) as any, (x, y, width, height) => {
                    nodo.viewRef?.current?.measure((nx, ny, nwidth, nheight, npx, npy) => {
                        // console.log(x, y, width, height);
                        // console.log(nx, ny, nwidth, nheight);
                        layout.value = {
                            width, height, x: x - (nwidth / 2), y: y - (nheight / 2)
                        };
                    })

                })
            }}
            style={[{
                // @ts-ignore
                cursor: "crosshair",
                position: "absolute",
                width: 20,
                height: 20,
                // backgroundColor: STheme.color.text,
                // borderRadius: 100,
            }, props.style, styleAnimated]}>
        </Animated.View>
    </GestureDetector >
}
