import React, { Ref } from "react";
import { usePizarra } from "./Pizarra";
import Animated, { SharedValue, useAnimatedProps, useAnimatedStyle, useDerivedValue, useSharedValue } from "react-native-reanimated";
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

    const coords = useDerivedValue(() => {
        const inputElm = props.inp;
        const instanceNodoInput = pizarra.nodos.current[inputElm.nodo.props.id];
        const instancePorInput = pizarra.puertos.current["input_" + instanceNodoInput?.id + "_" + inputElm.port.props.id];

        const outputElm = props.out;
        const instanceNodoOutPut = pizarra.nodos.current[outputElm.nodo.props.id];
        const instancePorOutput = pizarra.puertos.current["output_" + instanceNodoOutPut?.id + "_" + outputElm.port.props.id];

        if (!instanceNodoInput || !instanceNodoOutPut || !instancePorInput || !instancePorOutput) {
            return { x1: 0, y1: 0, x2: 0, y2: 0 };
        }

        return {
            x1: instanceNodoInput.translateX.value + instancePorInput.layout.value.x - (instancePorInput.layout.value.width / 2),
            y1: instanceNodoInput.translateY.value + instancePorInput.layout.value.y - (instancePorInput.layout.value.height / 2),
            x2: instanceNodoOutPut.translateX.value + instancePorOutput.layout.value.x - (instancePorOutput.layout.value.width / 2),
            y2: instanceNodoOutPut.translateY.value + instancePorOutput.layout.value.y - (instancePorOutput.layout.value.height / 2),
        };
    });


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
        const { x1, y1, x2, y2 } = coords.value;

        const width = Math.abs(x2 - x1);
        const height = Math.abs(y2 - y1);

        return {
            zIndex: zIndex.value,
            opacity: width < 2 && height < 2 ? 0 : 1,
            position: "absolute",
            width: width + 4,
            height: height + 4,
            transform: [
                { translateX: Math.min(x1, x2) + width / 2 },
                { translateY: Math.min(y1, y2) + height / 2 },
            ],
        };
    });

    const pathProps = useAnimatedProps(() => {
        const { x1, y1, x2, y2 } = coords.value;

        const startX = x1 < x2 ? 0 : Math.abs(x2 - x1);
        const startY = y1 < y2 ? 0 : Math.abs(y2 - y1);
        const endX = x1 < x2 ? Math.abs(x2 - x1) : 0;
        const endY = y1 < y2 ? Math.abs(y2 - y1) : 0;

        const controlX = (startX + endX) / 2;

        const lineType = props.inp.port.props.lineType || props.out.port.props.lineType || "curve";

        const d = lineType === "line"
            ? `M ${startX} ${startY} L ${controlX} ${startY} L ${controlX} ${endY} L ${endX} ${endY}`
            : `M ${startX} ${startY} C ${controlX} ${startY}, ${controlX} ${endY}, ${endX} ${endY}`;

        return {
            d,
            stroke: STheme.color.text + "88",
            strokeDasharray: "10, 10",
            fill: "transparent",
            zIndex: 1,
        };
    });
    const otrasProps = useAnimatedProps(() => {
        const { x1, y1, x2, y2 } = coords.value;

        const startX = x1 < x2 ? 0 : Math.abs(x2 - x1);
        const startY = y1 < y2 ? 0 : Math.abs(y2 - y1);
        const endX = x1 < x2 ? Math.abs(x2 - x1) : 0;
        const endY = y1 < y2 ? Math.abs(y2 - y1) : 0;

        const controlX = (startX + endX) / 2;

        const lineType = props.inp.port.props.lineType || props.out.port.props.lineType || "curve";

        const d = lineType === "line"
            ? `M ${startX} ${startY} L ${controlX} ${startY} L ${controlX} ${endY} L ${endX} ${endY}`
            : `M ${startX} ${startY} C ${controlX} ${startY}, ${controlX} ${endY}, ${endX} ${endY}`;

        return {
            d,
            stroke: select.value ? STheme.color.card : "transparent",
            strokeWidth: 12,
            fill: "transparent",
            zIndex: 1,
        };
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


const ConexionMemo = React.memo(Conexion, (prevProps, nextProps) => {
    // Solo re-renderiza si cambian las props importantes
    return prevProps.id === nextProps.id
});

ConexionMemo.displayName = "Conexion";

export default ConexionMemo;
// export default Conexion;