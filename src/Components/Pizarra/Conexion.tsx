import React, { Ref } from "react";
import { usePizarra } from "./Pizarra";
import Animated, { SharedValue, useAnimatedProps, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { Path, PathProps, Svg } from "react-native-svg";
import { STheme } from "servisofts-component";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
type ConexionProps = {
    id: string,
    inp: any,
    out: any
}


const SVGAnimates = Animated.createAnimatedComponent(Svg);
const PathAnimates = Animated.createAnimatedComponent(Path);
const Conexion = (props: ConexionProps) => {
    const pizarra = usePizarra();
    const x1 = useSharedValue(0);
    const y1 = useSharedValue(0);
    const x2 = useSharedValue(0);
    const y2 = useSharedValue(0);
    const zIndex = useSharedValue(1);
    const select = useSharedValue(false);

    const id = props.id;

    const doubleTapGesture: any = Gesture.Tap().numberOfTaps(1).onStart((e) => {
        // if (onDoublePress) onDoublePress(e);
        if (props.inp?.port?.props?.onPressLine) {
            select.value = true;
            props.inp.port.props.onPressLine({
                select,
                ...e,
                ...props.out.port.props,
            })
        }
    })



    const styleAnimated = useAnimatedStyle(() => {
        const inputElm = props.inp;
        const instanceNodoInput = pizarra.nodos.current[inputElm.nodo.props.id];
        const instancePorInput = pizarra.puertos.current["input_" + instanceNodoInput?.id + "_" + inputElm.port.props.id]

        const outputElm = props.out;
        const instanceNodoOutPut = pizarra.nodos.current[outputElm.nodo.props.id];
        const instancePorOutput = pizarra.puertos.current["output_" + instanceNodoOutPut?.id + "_" + outputElm.port.props.id]
        if (!instanceNodoInput || !instanceNodoOutPut) return {}
        if (!instancePorInput || !instancePorOutput) return {}
        // console.log(instanceNodoInput)

        let lineProps: PathProps = {
        }
        if (instanceNodoInput?.selected?.value) {
            if (props?.inp?.port?.props?.selectLineProps) {
                lineProps = {
                    ...lineProps,
                    ...props.inp.port.props.selectLineProps
                }
            }
        }
        if (instanceNodoOutPut?.selected?.value) {
            if (props.out.port.props.selectLineProps) {
                lineProps = {
                    ...lineProps,
                    ...props.out.port.props.selectLineProps
                }
            }
        }


        x1.value = instanceNodoInput.translateX.value + instancePorInput.layout.value.x - (instancePorInput.layout.value.width / 2);
        y1.value = instanceNodoInput.translateY.value + instancePorInput.layout.value.y - (instancePorInput.layout.value.height / 2);
        x2.value = instanceNodoOutPut.translateX.value + instancePorOutput.layout.value.x - (instancePorOutput.layout.value.width / 2);
        y2.value = instanceNodoOutPut.translateY.value + instancePorOutput.layout.value.y - (instancePorOutput.layout.value.height / 2);
        const width = Math.abs(x2.value - x1.value);
        const height = Math.abs(y2.value - y1.value);
        return {
            // pointerEvents: "none",
            zIndex: zIndex.value,
            opacity: width < 2 && height < 2 ? 0 : 1,
            position: "absolute",
            width: width + 4,
            height: height + 4,
            // backgroundColor: "#ff00ff66",
            transform: [
                { translateX: Math.min(x1.value, x2.value) + width / 2 },
                { translateY: Math.min(y1.value, y2.value) + height / 2 },
            ],
        }
    })


    const pathProps = useAnimatedProps(() => {
        const buildLineProps = (lineProps: PathProps & { zIndex?: number }) => {
            const instanceNodoInput = pizarra.nodos.current[props.inp.nodo.props.id];
            const instanceNodoOutPut = pizarra.nodos.current[props.out.nodo.props.id];

            if (props?.inp?.port?.props?.lineProps) {
                lineProps = {
                    ...lineProps,
                    ...props.inp.port.props.lineProps
                }
            }
            if (props.out.port.props.lineProps) {
                lineProps = {
                    ...lineProps,
                    ...props.out.port.props.lineProps
                }
            }

            if (instanceNodoInput?.selected?.value) {
                lineProps.stroke = STheme.color.text;
                lineProps.strokeDasharray = "0"
                if (props?.inp?.port?.props?.selectLineProps) {
                    lineProps = {
                        ...lineProps,
                        ...props.inp.port.props.selectLineProps
                    }
                }
            }
            if (instanceNodoOutPut?.selected?.value) {
                lineProps.stroke = STheme.color.text;
                lineProps.strokeDasharray = "0"
                if (props.out.port.props.selectLineProps) {
                    lineProps = {
                        ...lineProps,
                        ...props.out.port.props.selectLineProps
                    }
                }
            }
            return lineProps;
        }

        const lineProps = buildLineProps({
            zIndex: 1,
            stroke: STheme.color.text + "88",
            // strokeWidth: 1,
            strokeDasharray: "10, 10",
            fill: "transparent",
        });

        const armarD = () => {
            const width = Math.abs(x2.value - x1.value);
            const height = Math.abs(y2.value - y1.value);

            const startX = x1.value < x2.value ? 0 : width;
            const startY = y1.value < y2.value ? 0 : height;
            const endX = x1.value < x2.value ? width : 0;
            const endY = y1.value < y2.value ? height : 0;

            // puntos de control para hacer una S
            const control1X = startX + (endX - startX) / 2; // a mitad de camino
            const control1Y = startY;                       // pegado al inicio
            const control2X = startX + (endX - startX) / 2; // misma X que el control1
            const control2Y = endY;                         // pegado al final
            let d = "";


            let lineType = "curve";

            if (props?.inp?.port?.props?.lineType) {
                lineType = props.inp.port.props.lineType;
            }
            if (props.out.port.props.lineType) {
                lineType = props.out.port.props.lineType;
            }
            if (lineType == "line") {
                return {
                    d: `M ${startX} ${startY + 1} L ${control1X} ${control1Y} L ${control2X} ${control2Y} L ${endX} ${endY + 1}`,
                };
            }
            return {
                d: `M ${startX} ${startY + 1} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${endX} ${endY + 1}`,
            };
        }

        if (lineProps.zIndex) {
            zIndex.value = lineProps.zIndex
        }

        return {
            ...armarD(),
            ...lineProps,
        }

    });

    const otrasProps = useAnimatedProps(() => {
        const propsLine = {
            zIndex: 1,
            stroke: select.value ? STheme.color.card : "transparent",
            // stroke: "#ff000044",
            strokeWidth: 12,
            fill: "transparent",
        }

        const armarD = () => {
            const width = Math.abs(x2.value - x1.value);
            const height = Math.abs(y2.value - y1.value);

            const startX = x1.value < x2.value ? 0 : width;
            const startY = y1.value < y2.value ? 0 : height;
            const endX = x1.value < x2.value ? width : 0;
            const endY = y1.value < y2.value ? height : 0;

            // puntos de control para hacer una S
            const control1X = startX + (endX - startX) / 2; // a mitad de camino
            const control1Y = startY;                       // pegado al inicio
            const control2X = startX + (endX - startX) / 2; // misma X que el control1
            const control2Y = endY;                         // pegado al final
            let d = "";


            let lineType = "curve";

            if (props?.inp?.port?.props?.lineType) {
                lineType = props.inp.port.props.lineType;
            }
            if (props.out.port.props.lineType) {
                lineType = props.out.port.props.lineType;
            }
            if (lineType == "line") {
                return {
                    d: `M ${startX} ${startY + 1} L ${control1X} ${control1Y} L ${control2X} ${control2Y} L ${endX} ${endY + 1}`,
                };
            }
            return {
                d: `M ${startX} ${startY + 1} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${endX} ${endY + 1}`,
            };
        }

        return {
            ...armarD(),
            ...propsLine

        }
    })




    return <Animated.View style={styleAnimated} pointerEvents="none" >
        <SVGAnimates width={"100%"} height={"100%"} focusable={false}
            pointerEvents="box-none"
            style={{
                outlineStyle: 'none',
            }}>
            <PathAnimates animatedProps={pathProps} />
            <GestureDetector gesture={doubleTapGesture}   >
                <PathAnimates animatedProps={otrasProps} style={{ cursor: 'pointer' }} />
            </GestureDetector>

        </SVGAnimates>
    </Animated.View>
}

export default Conexion;