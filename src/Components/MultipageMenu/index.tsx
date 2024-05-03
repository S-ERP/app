import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import { Dimensions, Easing, View } from "react-native";
import Animated, { ReduceMotion, cancelAnimation, runOnJS, useAnimatedStyle, useDerivedValue, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { SGradient, SText, SThread, SUuid, SView } from "servisofts-component";
import Control from "./Control";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

export type XY = {
    x: number,
    y: number
}

export type Layout = {
    width: number,
    height: number
} & XY

export type MultipageMenuProps = {
    onChangePosition: (data: any) => any,
    data: { [key: string]: Widget },
}
export type Page = {
    cant: number, select: number,
    col: number,
    row: number,
}
export type Widget = {
    key: string,
    type?: string,
    active?: boolean,
    onAnim?: boolean,
    x: number,
    y: number,
    w: number,
    h: number
}



const MultipageMenu = forwardRef((props: MultipageMenuProps, ref) => {
    const [data, setData] = useState(props.data);
    const page = useSharedValue<Page>({ cant: 4, select: 0, col: 4, row: 7 });
    const translateX = useSharedValue(0);
    const rotateZ = useSharedValue(0);
    const layout = useSharedValue<Layout>({ x: 0, y: 0, width: 0, height: 0 });
    const context = useSharedValue({ x: 0, y: 0 });
    // const context = useSharedValue({ x: 0, y: 0 });
    const animTranslate = useSharedValue(0);
    const positions = useSharedValue<{ [key: string]: Widget }>({});

    const sharedEvent = (e) => {
        Object.values(listeners).map((f) => {
            if (typeof f == "function") {
                f.call(this, e);
            }
        })
    }

    const listeners = {};
    const subscribeEvents = (e) => {
        const key = SUuid();
        listeners[key] = e;
        return () => {
            delete listeners[key];
        }
    }


    const setItem = (a) => {
        let pos = { ...positions.value };
        if (!positions.value[a.key]) {
            pos[a.key] = { x: a.x, y: a.y, w: a.w, h: a.h, key: a.key }
        }
        positions.value = { ...pos };
        setData({ ...data, [a.key]: a })
    };
    const removeAllItems = () => {
        positions.value = {
        }
        setData({})
    };

    // Use useImperativeHandle para exponer algunas funciones específicas
    useImperativeHandle(ref, () => ({
        setItem,
        removeAllItems
    }));
    const easing = Easing.elastic(1.3);

    const animateRotate = () => {
        '!worklet'
        rotateZ.value = withRepeat(
            withTiming(2, {
                duration: 100,
                // easing: easing,
            }),
            -1,
            true
        );
    };

    const gestureHandler = Gesture.Pan()
        .onBegin(evt => {
            cancelAnimation(rotateZ);
            rotateZ.value = 0;
        })
        .onStart((evt) => {

            context.value = { x: translateX.value, y: 0 };
        }).onUpdate((event) => {
            translateX.value = event.translationX + context.value.x;
            if (translateX.value > 0) {
                translateX.value = 0;
                return;
            } else if ((translateX.value - layout.value.width) * -1 > (layout.value.width * (page.value.cant))) {
                translateX.value = -(layout.value.width * (page.value.cant - 1));
                return;
            }
        }).onEnd((e) => {
            const maxvel = 5000;
            let v = e.velocityX
            if (v > maxvel) v = maxvel;
            if (v < -maxvel) v = -maxvel;
            let displace = ((v / maxvel) * (layout.value.width));
            let p = Math.round(((translateX.value ?? 0) + displace) / layout.value.width) * -1;

            if (p < 0) {
                p = 0;
            }
            if (p > page.value.cant - 1) {
                p = page.value.cant - 1
            }
            page.value.select = p;
            translateX.value = withSpring(((p * -1) * layout.value.width), {
                mass: 1,
                damping: 11,
                stiffness: 200,
                overshootClamping: true,
                restDisplacementThreshold: 0.01,
                restSpeedThreshold: 2,
                reduceMotion: ReduceMotion.System,
            })

        })

    const longPressGesture = Gesture.LongPress().runOnJS(true)
        .minDuration(800)
        .onBegin((evt) => {
            sharedEvent({
                ...evt,
                type: "onBegin",

            })
        })
        .onStart(() => {
            console.log("Long Press")
        })
    const composed = Gesture.Simultaneous(gestureHandler, longPressGesture);

    const renderItems = () => {
        const arr = Object.values(data).sort((a: any, b: any) => a.index - b.index);
        if (arr.length <= 0) return null;
        return arr.map((a: any) => {
            if (!a) return null;
            return <Control
                key={a.key}
                rotateZ={rotateZ}
                data={a}
                onChangePosition={props.onChangePosition}
                positions={positions}
                layout={layout}
                page={page}
                translateX={translateX}
                subscribeEvents={subscribeEvents}
            />
        })
    }


    return <View style={{ flex: 1, width: "100%" }} onLayout={(e) => {
        if (e.nativeEvent.layout.width > 720) {
            if (page.value.col != 8) {
                page.value.col = 8;
                page.value = { ...page.value }
            }
        } else {
            if (page.value.col != 4) {
                page.value.col = 4;
                page.value = { ...page.value }
            }
        }
        layout.value = {
            x: e.nativeEvent.layout.x,
            y: e.nativeEvent.layout.x,
            width: e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height,
        }
    }}>
        <GestureDetector gesture={composed}>
            <Animated.View style={{
                width: useDerivedValue(() => layout.value.width * page.value.cant),
                height: useDerivedValue(() => layout.value.height),
                overflow: "hidden",
                transform: [
                    { translateX: useDerivedValue(() => translateX.value) },
                ]
            }}>
                {/* <SGradient colors={["#000", "#f0f", "#660", "#000"]} deg={90} /> */}
                {/* {data.map(a => <WidgetComponent data={a} positions={positions} />)} */}
                {/* <Grid layout={layout} page={page} /> */}
                {renderItems()}
            </Animated.View>
        </GestureDetector>

    </View >
});

export default MultipageMenu;