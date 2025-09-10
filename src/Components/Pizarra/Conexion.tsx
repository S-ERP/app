import React, { Ref } from "react";
import { usePizarra } from "./Pizarra";
import Animated, { SharedValue, useAnimatedProps, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { Path, Svg } from "react-native-svg";
import { STheme } from "servisofts-component";
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

    const id = props.id;





    const styleAnimated = useAnimatedStyle(() => {
        const inputElm = props.inp;
        const instanceNodoInput = pizarra.nodos.current[inputElm.nodo.props.id];
        const instancePorInput = pizarra.puertos.current[instanceNodoInput?.id + "_" + inputElm.port.props.id]

        const outputElm = props.out;
        const instanceNodoOutPut = pizarra.nodos.current[outputElm.nodo.props.id];
        const instancePorOutput = pizarra.puertos.current[instanceNodoOutPut?.id + "_" + outputElm.port.props.id]
        if (!instanceNodoInput || !instanceNodoOutPut) return {}
        if (!instancePorInput || !instancePorOutput) return {}
        // console.log(instanceNodoInput)
        x1.value = instanceNodoInput.translateX.value + instancePorInput.layout.value.x - (instancePorInput.layout.value.width / 2);
        y1.value = instanceNodoInput.translateY.value + instancePorInput.layout.value.y - (instancePorInput.layout.value.height / 2);
        x2.value = instanceNodoOutPut.translateX.value + instancePorOutput.layout.value.x - (instancePorOutput.layout.value.width / 2);
        y2.value = instanceNodoOutPut.translateY.value + instancePorOutput.layout.value.y - (instancePorOutput.layout.value.height / 2);
        const width = Math.abs(x2.value - x1.value);
        const height = Math.abs(y2.value - y1.value);
        return {
            pointerEvents: "none",
            zIndex: 1,
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

        return {
            stroke: STheme.color.text + "88",
            strokeWidth: 1,
            strokeDasharray: "10,10",
            fill: "none",
            d: `M ${startX} ${startY + 1} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${endX} ${endY + 1}`,
        };
    });
    return <Animated.View style={styleAnimated}>
        <SVGAnimates width={"100%"} height={"100%"}  >
            <PathAnimates animatedProps={pathProps} />
        </SVGAnimates>
    </Animated.View>
}

export default Conexion;