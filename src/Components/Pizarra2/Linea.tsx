import * as React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { usePizarra } from './Pizarra';
import Animated, { useAnimatedProps, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { STheme } from 'servisofts-component';

interface LineaProps { }

const SVGAnimates = Animated.createAnimatedComponent(Svg);
const PathAnimates = Animated.createAnimatedComponent(Path);

const Linea = (props: LineaProps) => {
    const visible = useSharedValue(false);
    const startX = useSharedValue(0);
    const startY = useSharedValue(0);
    const endX = useSharedValue(0);
    const endY = useSharedValue(0);
    const space = useSharedValue(0);

    const pizarra = usePizarra();

    const animatedStyle = useAnimatedStyle(() => {
        const menorX = Math.min(startX.value, endX.value);
        const menorY = Math.min(startY.value, endY.value);
        const mayorX = Math.max(startX.value, endX.value);
        const mayorY = Math.max(startY.value, endY.value);
        const width = mayorX - menorX;
        const height = mayorY - menorY;

        return {
            width: width + (space.value),
            height: height + (space.value),
            opacity: visible.value ? 1 : 0,
            position: "absolute",
            transform: [
                { translateX: startX.value - ((startX.value - endX.value) / 2) },
                { translateY: startY.value - ((startY.value - endY.value) / 2) },
            ],
        }
    })


    React.useEffect(() => {
        pizarra.linea.current = {
            startX,
            startY,
            endX,
            endY,
            space,
            visible
        };

        return () => {
            pizarra.linea.current = null;
        };
    }, []);

    const pathProps = useAnimatedProps((): any => {
        const menorX = Math.min(startX.value, endX.value);
        const menorY = Math.min(startY.value, endY.value);
        const mayorX = Math.max(startX.value, endX.value);
        const mayorY = Math.max(startY.value, endY.value);
        const width = mayorX - menorX;
        const height = mayorY - menorY;
        const start = {
            x: 0 + (space.value / 2),
            y: 0 + (space.value / 2),
        }
        const end = {
            x: width + (space.value / 2),
            y: height + (space.value / 2),
        }
        if (startX.value < endX.value) {
            start.x = width + (space.value / 2);
            end.x = 0 + (space.value / 2);
        }
        if (startY.value < endY.value) {
            start.y = height + (space.value / 2);
            end.y = 0 + (space.value / 2);
        }

        const controlX = (start.x + end.x) / 2;
        const lineType: any = "curve"
        const d = lineType === "line"
            ? `M ${start.x} ${start.y}  L ${controlX} ${start.y} L ${controlX} ${end.y} L ${end.x} ${end.y}`
            : `M ${start.x} ${start.y}  C ${controlX} ${start.y} , ${controlX} ${end.y} , ${end.x} ${end.y}`;
        return {
            stroke: STheme.color.text + "88",
            strokeWidth: 1,
            // strokeDasharray: "10,10",
            fill: "none",
            d: d,
        }
    })

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <SVGAnimates width={"100%"} height={"100%"}>
                <PathAnimates animatedProps={pathProps} />
            </SVGAnimates>
        </Animated.View>
    );
};

export default Linea;

const styles = StyleSheet.create({
    container: {
        // backgroundColor: "#f0ff0f66",
        pointerEvents: "none",
        zIndex: 1,
        position: "absolute",
    }
});
