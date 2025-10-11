import React, { Ref } from "react";
import Animated, { SharedValue, useAnimatedProps, useAnimatedStyle, useDerivedValue, useSharedValue } from "react-native-reanimated";
import { Path, PathProps, Svg } from "react-native-svg";
import { STheme } from "servisofts-component";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { usePizarra } from "./Pizarra";
type ConexionProps = {
    inp: any,
    out: any,
    id: string
}


const SVGAnimates = Animated.createAnimatedComponent(Svg);
const PathAnimates = Animated.createAnimatedComponent(Path);
const Conexion = (props: ConexionProps) => {
    const pizarra = usePizarra();
    const x1 = useSharedValue(0);
    const space = useSharedValue(10);
    const y1 = useSharedValue(0);
    const x2 = useSharedValue(0);
    const y2 = useSharedValue(0);
    const zIndex = useSharedValue(1);
    const select = useSharedValue(false);


    const coords = useDerivedValue(() => {
        const inputElm = props.inp;
        const instanceNodoInput = inputElm.nodo
        const instancePorInput = inputElm.puerto

        const outputElm = props.out;
        const instanceNodoOutPut = outputElm.nodo
        const instancePorOutput = outputElm.puerto;

        if (!instanceNodoInput || !instanceNodoOutPut || !instancePorInput || !instancePorOutput) {
            return { x1: 0, y1: 0, x2: 0, y2: 0 };
        }

        const resp = {
            x1: instanceNodoInput.translateX.value - (instanceNodoInput.layout.value.width / 2)
                + (instancePorInput.layout.value.x)
                + (instancePorInput.layout.value.width / 2)
            ,
            y1: instanceNodoInput.translateY.value - (instanceNodoInput.layout.value.height / 2)
                + instancePorInput.layout.value.y
                + (instancePorInput.layout.value.height / 2)
            ,
            x2: instanceNodoOutPut.translateX.value - (instanceNodoOutPut.layout.value.width / 2)
                + (instancePorOutput.layout.value.x )
                + (instancePorOutput.layout.value.width / 2)
            ,
            y2: instanceNodoOutPut.translateY.value - (instanceNodoOutPut.layout.value.height / 2)
                + instancePorOutput.layout.value.y
                + (instancePorOutput.layout.value.height / 2)
            ,
        };
        return resp;
    });

    const d = useDerivedValue(() => {
        const { x1, y1, x2, y2 } = coords.value;
        const ms = space.value / 2
        const startX = x1 < x2 ? ms : Math.abs(x2 - x1) + ms;
        const startY = y1 < y2 ? ms : Math.abs(y2 - y1) + ms;
        const endX = x1 < x2 ? Math.abs(x2 - x1) + ms : ms;
        const endY = y1 < y2 ? Math.abs(y2 - y1) + ms : ms

        const controlX = (startX + endX) / 2;
        const lineType = props.inp.puerto.props.lineType || props.out.puerto.props.lineType || "curve";
        // const lineType = "line"
        const d = lineType === "line"
            ? `M ${startX} ${startY} L ${controlX} ${startY} L ${controlX} ${endY} L ${endX} ${endY}`
            : `M ${startX} ${startY} C ${controlX} ${startY}, ${controlX} ${endY}, ${endX} ${endY}`;
        return d;
    })

    const doubleTapGesture: any = Gesture.Tap().numberOfTaps(1).onStart((e) => {
        // if (onDoublePress) onDoublePress(e);

        if (props.inp?.puerto?.props?.onPressLine) {
            select.value = true;
            props.inp.puerto.props.onPressLine({
                select,
                ...e,
                ...props.out.puerto.props,
            })
        }
    })



    const styleAnimated = useAnimatedStyle(() => {
        const { x1, y1, x2, y2 } = coords.value;

        const width = Math.abs(x2 - x1);
        const height = Math.abs(y2 - y1);

        return {
            zIndex: zIndex.value,
            opacity: width < 2 && height < 2 ? 0 : 1,
            position: "absolute",
            width: width + space.value,
            height: height + space.value,
            // backgroundColor: "#f0ff0f33",
            transform: [
                { translateX: Math.min(x1, x2) + (width / 2) },
                { translateY: Math.min(y1, y2) + (height / 2) },
            ],
        };
    });

    const pathProps = useAnimatedProps(() => {

        let lineProps: PathProps = {
        }

        if (props?.inp?.nodo?.selected?.value) {
            if (props?.inp?.puerto?.props?.selectLineProps) {
                lineProps = {
                    ...lineProps,
                    ...props.inp.puerto.props.selectLineProps
                }
            }
        }
        if (props?.out?.nodo?.selected?.value) {
            if (props?.out?.puerto?.props?.selectLineProps) {
                lineProps = {
                    ...lineProps,
                    ...props.out.puerto?.props.selectLineProps
                }
            }
        }
        return {
            d: d.value,
            stroke: STheme.color.text + "88",
            strokeDasharray: "10, 10",
            fill: "transparent",
            ...lineProps
        };
    });
    const otrasProps = useAnimatedProps(() => {
        return {
            d: d.value,
            stroke: select.value ? STheme.color.card : "transparent",
            strokeWidth: 8,
            fill: "transparent",
        };
    })


    // console.log("render_conexion", props.id)

    return <Animated.View style={styleAnimated} pointerEvents="none" >
        <SVGAnimates width={"100%"} height={"100%"} focusable={false}
            pointerEvents="box-none"
            style={{
                // @ts-ignore
                outlineStyle: 'none',
            }}>
            <PathAnimates animatedProps={pathProps} />
            <GestureDetector gesture={doubleTapGesture}   >
                <PathAnimates animatedProps={otrasProps}
                    // @ts-ignore
                    style={{ cursor: 'pointer' }}
                    onPress={e => {
                        console.log("sadsa")
                    }} />
            </GestureDetector>

        </SVGAnimates>
    </Animated.View>
}


export default Conexion;