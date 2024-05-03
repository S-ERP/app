import React, { useState } from "react";
import { SGradient, SText, STheme, SView } from "servisofts-component";
import { Layout, Page, Widget, XY } from "./types";
import { View } from "react-native";
import Animated, { ReduceMotion, SharedValue, cancelAnimation, runOnJS, useAnimatedReaction, useDerivedValue, useSharedValue, withSpring } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Item from "./Item";
type MenuDragableProps = {
    data: { [key: string]: Widget },
    onChangePosition: (evt: Widget) => any
}

export const animationStyle1 = {
    mass: 1,
    damping: 11,
    stiffness: 200,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
    reduceMotion: ReduceMotion.System,
}




const MenuDragable = ({ data, onChangePosition }: MenuDragableProps) => {
    const layout = useSharedValue<Layout>({ x: 0, y: 0, width: 0, height: 0 });
    const page = useSharedValue<Page>({ cant: 4, select: 0, col: 4, row: 7, gridWidth: 0, gridHeight: 0 });
    const scale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const context = useSharedValue({ x: 0, y: 0 });

    const handleOnLayout = (e: any) => {
        const _layout = e.nativeEvent.layout;
        let col = 4;
        if (_layout.width > 720) {
            col = 8;
        } else {
            col = 4;
        }
        layout.value = {
            x: _layout.x,
            y: _layout.x,
            width: _layout.width,
            height: _layout.height,
        }
        const grid = {
            w: _layout.width / col,
            h: _layout.height / 7,
        }

        // if (grid.h > grid.w) {
        //     grid.h = grid.w;
        // }
        page.value = {
            ...page.value,
            gridWidth: grid.w,
            gridHeight: grid.h,
            col: col,
        }

    }


    const gestureHandler = Gesture.Pan()
        .onStart((evt) => {
            context.value = { x: translateX.value, y: translateY.value };
        }).onUpdate((event) => {
            let finalVlaue = event.translationX + context.value.x;
            // translateY.value = event.translationY + context.value.y;

            if (finalVlaue > 0) {
                translateX.value = 0;
                return;
            } else if ((finalVlaue - layout.value.width) * -1 > (layout.value.width * (page.value.cant))) {
                translateX.value = -(layout.value.width * (page.value.cant - 1));
                return;
            } else {
                translateX.value = finalVlaue;
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
            page.value = { ...page.value }
            translateX.value = withSpring(((p * -1) * layout.value.width), animationStyle1)

        })

    const animateToPage = (npage) => {
        if (page.value.select != npage) {
            page.value.select = npage;
            translateX.value = withSpring(npage * layout.value.width * -1, animationStyle1)
            page.value = { ...page.value }
        }
    }

    const longPressGesture = Gesture.LongPress().runOnJS(true)
        .minDuration(600)
        .onStart(() => {
            // scale.value = 0.8;
            console.log("Mostrar los iconos de agregar")
        }).onFinalize((e, succes) => {
            scale.value = 1;
        })


    const composed = Gesture.Simultaneous(gestureHandler, longPressGesture);

    return <View style={{ flex: 1, width: "100%", }} onLayout={handleOnLayout}>
        <GestureDetector gesture={composed}>
            <Animated.View style={{
                width: useDerivedValue(() => layout.value.width * page.value.cant),
                height: useDerivedValue(() => layout.value.height),
                // borderWidth: 1,
                // borderColor: "#f0f",
                // overflow: "hidden",
                transform: [
                    { translateX: useDerivedValue(() => translateX.value) },
                    { translateY: useDerivedValue(() => translateY.value) },
                    { scale: useDerivedValue(() => scale.value) }

                ]
            }}>
                {Object.values(data).map(obj => <Item
                    key={obj.key}
                    data={obj}
                    page={page}
                    layout={layout}
                    translateX={translateX}
                    onChangePosition={onChangePosition}
                    animateToPage={animateToPage}
                />)}

            </Animated.View>
        </GestureDetector >
        <PageInfo page={page} />
    </View>

}


const PageInfo = ({ page }: { page: SharedValue<Page> }) => {
    const [select, setSelect] = useState(1);
    useAnimatedReaction(() => page.value, (p) => {
        // page.value.select = p;
        runOnJS(setSelect)(p.select + 1)
    })
    const size = 6;
    return <Animated.View style={{
        position: "absolute",
        // right: 0,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        flexDirection: "row",
        transform: [{ translateY: useDerivedValue(() => page.value.gridHeight * (page.value.row - 1)) }]
        // bottom: page.value.gridHeight,
    }} >
        {new Array(page.value.cant).fill(0).map((a, i) => {
            return <View style={{
                width: size,
                height: size,
                backgroundColor: select == (i + 1) ? STheme.color.text : STheme.color.card,
                borderRadius: 1000,
                margin: 2,
            }}></View>
        })}
        {/* <SText>{select}/{page.value.cant}</SText> */}
    </Animated.View>
}
export default MenuDragable;