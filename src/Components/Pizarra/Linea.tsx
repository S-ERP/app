import React, { Ref } from "react";
import Animated, { SharedValue, useAnimatedProps, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { Path, Svg } from "react-native-svg";
import { SDate, SPage, SText, STheme, SView } from "servisofts-component";
import { usePizarra } from "./Pizarra";


export type LineaProps = {
    id: string;
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
}
export type LineaInstance = {
    id: string;
    x1: SharedValue<number>,
    y1: SharedValue<number>,
    x2: SharedValue<number>,
    y2: SharedValue<number>,
}


const SVGAnimates = Animated.createAnimatedComponent(Svg);
const PathAnimates = Animated.createAnimatedComponent(Path);
const Linea = (props: LineaProps) => {


    const pizarra = usePizarra();
    const x1 = useSharedValue(props.x1 ?? 0);
    const y1 = useSharedValue(props.y1 ?? 0);
    const x2 = useSharedValue(props.x2 ?? 0);
    const y2 = useSharedValue(props.y2 ?? 0);



    React.useEffect(() => {
        pizarra.registerLinea({ id: props.id, x1, y1, x2, y2 });
        return () => {
            pizarra.unregisterLinea(props.id);
        };
    }, []);

    const styleAnimated = useAnimatedStyle(() => {
        const width = Math.abs(x2.value - x1.value);
        const height = Math.abs(y2.value - y1.value);
        return {
            zIndex: 999,
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
            stroke: STheme.color.text,
            strokeWidth: 2,
            fill: "none",
            d: `M ${startX} ${startY+1} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${endX} ${endY+1}`,
        };
    });

    return <Animated.View style={styleAnimated}>
        <SVGAnimates width={"100%"} height={"100%"}  >
            <PathAnimates animatedProps={pathProps} />
            {/* <Path d={"M 0 0 L 100 100"} stroke={"#ff0"} strokeWidth={2} /> */}
        </SVGAnimates>
    </Animated.View>
}

export default Linea;