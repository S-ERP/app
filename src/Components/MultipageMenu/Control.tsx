import React, { useEffect, useRef, useState } from "react"
import { Vibration, View } from "react-native";
import { SText, STheme, SThread } from "servisofts-component";
import { Layout, Page, Widget, XY } from ".";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { ReduceMotion, SharedValue, cancelAnimation, interpolateColor, runOnJS, useAnimatedReaction, useAnimatedStyle, useDerivedValue, useSharedValue, withDelay, withSpring } from "react-native-reanimated";
import SSocket from "servisofts-socket";
import ControlMenu from "./ControlMenu";
import Options from "./Options";


export type ControlProps = {
    layout: { value: Layout },
    page: { value: Page },
    translateX: SharedValue<number>,
    rotateZ: SharedValue<any>,
    data: Widget,
    positions: { value: { [key: string]: Widget } },
    onChangePosition: (data: any) => any
}

const animationStyle1 = {
    mass: 1,
    damping: 11,
    stiffness: 200,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
    reduceMotion: ReduceMotion.System,
}


const Control = (props: ControlProps) => {
    // const width = 80;
    const [menuVisible, setMenuVisible] = useState(false);
    const extra = useSharedValue({ run: 0, color: 0 });
    const ElementRef = useRef<any>();
    const layoutCopy = useSharedValue({ width: 0, height: 0 });
    const context = useSharedValue({ x: 0, y: 0 });
    const scale = useSharedValue(1);
    const position = useSharedValue({ x: 0, y: 0 })
    const size = useSharedValue({ w: 1, h: 1 })
    const zIndex = useSharedValue(1);

    useEffect(() => {
        // console.log("entro aca")
        if (layoutCopy.value.width != props.layout.value.width || layoutCopy.value.height != props.layout.value.height) {
            if (Object.values(props.positions.value).length <= 0) return;
            // console.log("Animation Reaction", props)
            // console.log("Animation Reaction" + props.data.key)
            layoutCopy.value.width = props.layout.value.width;
            layoutCopy.value.height = props.layout.value.height;
            if (!props.positions.value[props.data.key]) {
                props.positions.value[props.data.key] = { ...props.data }
                props.positions.value = { ...props.positions.value }
                // console.log("No se encontro la key " + props.data.key)
                // return;
            };
            if (props.positions.value[props.data.key]?.active) return;

            position.value.x = props.positions.value[props.data.key].x * (props.layout.value.width / props.page.value.col)
            position.value.y = props.positions.value[props.data.key].y * (props.layout.value.height / props.page.value.row)
            position.value = { ...position.value }

            size.value.w = (props.layout.value.width / props.page.value.col) * props.positions.value[props.data.key].w;
            size.value.h = (props.layout.value.height / props.page.value.row) * props.positions.value[props.data.key].h;
            size.value = { ...size.value }

            context.value = { x: position.value.x, y: position.value.y }
            context.value = { ...context.value }
            // console.log(position)
        }
    })

    useAnimatedReaction(() => position.value, (p) => {
        // console.log("useAnimatedReaction: ", props.data.key, p)
    })
    useAnimatedReaction(() => { return { w: props.layout.value.width!, h: props.layout.value.height! } }, (n) => {
        // console.log("entro aca 2")
        if (layoutCopy.value.width != n.w || layoutCopy.value.height != n.h) {
            // console.log("Animation Reaction" + props.data.key)
            layoutCopy.value.width = n.w;
            layoutCopy.value.height = n.h;
            if (!props.positions.value[props.data.key]) {
                props.positions.value[props.data.key] = { ...props.data }
                props.positions.value = { ...props.positions.value }
                // console.log("No se encontro la key " + props.data.key)
                // return;
            };
            if (props.positions.value[props.data.key]?.active) return;

            position.value.x = props.positions.value[props.data.key].x * (n.w / props.page.value.col)
            position.value.y = props.positions.value[props.data.key].y * (n.h / props.page.value.row)
            position.value = { ...position.value }

            size.value.w = (n.w / props.page.value.col) * props.positions.value[props.data.key].w;
            size.value.h = (n.h / props.page.value.row) * props.positions.value[props.data.key].h;
            size.value = { ...size.value }

            context.value = { x: position.value.x, y: position.value.y }
            context.value = { ...context.value }
            // console.log(position)
        }


    })

    const menuSetVisible = (visible) => {
        '!worklet'
        if (menuVisible == visible) return;
        setMenuVisible(visible)
    }
    const onChangePosition = (x, y) => {
        '!worklet'
        // console.log(props.data)
        if (props.data.x == x && props.data.y == y) {
            return;
        }
        props.data.x = x;
        props.data.y = y;
        props.onChangePosition(props.data);

        // isRun = false;
    }
    const variation = 0;
    let isRun = false;
    const stopChangePage = () => {
        '!worklet'
        isRun = false;
    }
    const changePage = () => {
        '!worklet'
        if (isRun) return;
        // console.log("INicio el hilo")
        isRun = true;
        new SThread(1000, "hilo_para_esperar_cambios", true).start(() => {
            if (!isRun) return;
            isRun = false;

            if (((position.value.x + size.value.w) - variation > (props.layout.value.width * (props.page.value.select + 1))) && (props.page.value.select < props.page.value.cant - 1)) {
                props.positions.value[props.data.key].onAnim = true;
                // console.log("En el hilo  a la derecha")
                props.translateX.value = withSpring(
                    ((props.layout.value.width * (props.page.value.select + 1)) * -1),
                    animationStyle1,
                    () => {
                        props.page.value.select = props.page.value.select + 1
                    })
                position.value = withSpring(
                    { x: (position.value.x + (props.layout.value.width)), y: position.value.y },
                    animationStyle1, () => {
                        context.value.x = context.value.x + (props.layout.value.width);
                        props.positions.value[props.data.key].onAnim = false;
                    })
            } else if (((position.value.x + variation) < (props.layout.value.width * (props.page.value.select))) && props.page.value.select > 0) {
                props.positions.value[props.data.key].onAnim = true;
                // console.log("En el hilo  a la izquierda")
                props.translateX.value = withSpring(
                    ((props.layout.value.width * (props.page.value.select - 1)) * -1),
                    animationStyle1,
                    () => {
                        props.page.value.select = props.page.value.select - 1
                    })
                position.value = withSpring(
                    { x: (position.value.x - (props.layout.value.width)), y: position.value.y },
                    animationStyle1, () => {
                        context.value.x = context.value.x - (props.layout.value.width);
                        props.positions.value[props.data.key].onAnim = false;
                    })
            } else {

            }


        })
    }

    const longPressGesture = Gesture.LongPress().runOnJS(true)
        .minDuration(600)
        .onStart(() => {
            zIndex.value = 2;
            scale.value = withSpring(1.1);
            Vibration.vibrate(100);
            props.positions.value[props.data.key].active = true;
            runOnJS(menuSetVisible)(true);
        }).onFinalize((e, succes) => {
            if (!succes && e.duration < 300) {
                console.log("click")
                if (ElementRef.current) {
                    if (ElementRef.current.onPress)
                        ElementRef.current.onPress();
                }
            }

        })

    const panGesture = Gesture.Pan()
        .activateAfterLongPress(600)
        .onStart(() => {
            context.value = { ...position.value };
        }).onUpdate((evt) => {

            if (Math.abs(evt.translationX) > 20 || Math.abs(evt.translationY) > 20) {
                runOnJS(menuSetVisible)(false);
            }
            // console.log(evt.translationX)

            if (props.positions.value[props.data.key].onAnim) return;
            position.value.x = context.value.x + evt.translationX;
            position.value.y = context.value.y + evt.translationY;
            position.value = { ...position.value }
            if (((position.value.x + size.value.w) - variation > (props.layout.value.width * (props.page.value.select + 1))) && (props.page.value.select < props.page.value.cant - 1)) {
                runOnJS(changePage)();
            } else if (((position.value.x + variation) < (props.layout.value.width * (props.page.value.select))) && props.page.value.select > 0) {
                runOnJS(changePage)();
            } else {
                runOnJS(stopChangePage)();
            }
            // console.log(props.positions.value[props.data.key].active)
        }).onEnd(() => {
            runOnJS(stopChangePage)();
            props.positions.value[props.data.key].active = false;
            scale.value = withSpring(1, {}, () => {
                zIndex.value = 1;
            });

            let x = Math.round(position.value.x / (props.layout.value.width / props.page.value.col))
            let y = Math.round(position.value.y / (props.layout.value.height / props.page.value.row))
            console.log(x, y)
            if (y >= props.page.value.row) {
                console.log("entro")
                y = props.page.value.row - 1;
            }

            position.value = withSpring({
                x: (x * (props.layout.value.width / props.page.value.col)),
                y: (y * (props.layout.value.height / props.page.value.row))
            }, {
                mass: 1,
                damping: 11,
                stiffness: 200,
                overshootClamping: true,
                restDisplacementThreshold: 0.01,
                restSpeedThreshold: 2,
                reduceMotion: ReduceMotion.System,
            })
            // position.value.y = y * (props.layout.value.height / 6)
            // position.value.x = x * (props.layout.value.width / 4);
            // position.value = { ...position.value }
            runOnJS(onChangePosition)(x, y);
            // console.log(position.value, x, y)

        })



    const composed = Gesture.Simultaneous(panGesture, longPressGesture);

    const dc = useDerivedValue(() => extra.value.color);

    let key_type: any = props.data.type;
    let ELMENT: any = Options["AppIcon"];
    if (Options[key_type]) {
        ELMENT = Options[key_type];
    }
    return <GestureDetector gesture={composed} key={props.data.key}>
        <Animated.View
            key={props.data.key}
            style={[{
                position: "absolute",
                width: useDerivedValue(() => size.value.w),
                height: useDerivedValue(() => size.value.h),
                zIndex: zIndex,
                // borderRadius: 8,
                // backgroundColor: "#fff",
                // borderWidth: 2,
                // borderColor: "#060",
                justifyContent: "center",
                alignItems: "center",
                transform: [
                    { translateX: useDerivedValue(() => position.value.x) },
                    { translateY: useDerivedValue(() => position.value.y) },
                    { rotateZ: useDerivedValue(() => props.rotateZ.value + "deg") },
                    { scale },
                ]
            }]}>
            {!menuVisible ? null : <ControlMenu />}
            <ELMENT ref={ElementRef} data={props.data} />
        </Animated.View>
    </GestureDetector >
}

export default Control;