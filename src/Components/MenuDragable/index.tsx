import React, { useState } from "react";
import { SGradient, SText, STheme, SView } from "servisofts-component";
import { Layout, Page, Widget, XY } from "./types";
import { Vibration, View } from "react-native";
import Animated, { ReduceMotion, SharedValue, cancelAnimation, runOnJS, useAnimatedReaction, useDerivedValue, useSharedValue, withSpring } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Item from "./Item";
import PageInfo from "./PageInfo";
import MenuBottom from "./MenuBottom";
import MenuItem from "./MenuItem";
import PageSeparator from "./PageSeparator";
type MenuDragableProps = {
    data: { [key: string]: Widget },
    onChangePosition: (evt: Widget) => any,
    onLongPressStart: (evt: XY & { page: number, col: number }) => any,
    onDelete: (evt: Widget) => any,
    menuBottom: any,
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




const MenuDragable = ({ data, onChangePosition, menuBottom, onDelete, onLongPressStart }: MenuDragableProps) => {
    const [menu, setMenu] = useState<Widget>();
    const layout = useSharedValue<Layout>({ x: 0, y: 0, width: 0, height: 0 });
    const page = useSharedValue<Page>({ cant: 4, select: 0, col: 4, row: 7, gridWidth: 0, gridHeight: 0 });
    // const menuOpen = useSharedValue({ key: "", x: 0, y: 0 });
    const scale = useSharedValue(1);
    const onLongPressStatus = useSharedValue(0);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const context = useSharedValue({ x: 0, y: 0 });
    const startLongPress = useSharedValue({ x: 0, y: 0 });

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
        .onBegin(() => {
            setMenu(undefined);
            onLongPressStatus.value = withSpring(0, animationStyle1);
        })
        .onStart((evt) => {
            // scale.value = 0.8;
            onLongPressStatus.value = withSpring(1, animationStyle1);
            // startLongPress.value = 
            if (onLongPressStart) onLongPressStart({
                x: Math.round((evt.x / page.value.gridWidth)),
                y: Math.round((evt.y / page.value.gridHeight)),
                page: page.value.select,
                col: page.value.col
            });
            // console.log(evt)
            Vibration.vibrate(100);
            // console.log("Mostrar los iconos de agregar")
        }).onFinalize((e, succes) => {
            scale.value = 1;
        })


    const composed = Gesture.Simultaneous(gestureHandler, longPressGesture);


    const closeMenuItem = (val: Widget) => {
        setMenu(undefined)
    }
    const openMenuItem = (itm: Widget) => {
        setMenu(itm)
        // menuOpen.value = {
        //     key: itm.key,
        //     x: itm.x,
        //     y: itm.y
        // }
    }

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
                <PageSeparator page={page}/>
                {Object.values(data).map(obj => <Item
                    key={obj.key}
                    data={obj}
                    page={page}
                    layout={layout}
                    translateX={translateX}
                    onChangePosition={onChangePosition}
                    animateToPage={animateToPage}
                    onLongPressStatus={onLongPressStatus}
                    openMenuItem={openMenuItem}
                    closeMenuItem={closeMenuItem}
                />)}
            </Animated.View>
        </GestureDetector >
        <PageInfo page={page} />
        {!menu ? null : <MenuItem page={page} onLongPressStatus={onLongPressStatus} menuBottom={menuBottom} menu={menu} onDelete={onDelete} closeMenuItem={closeMenuItem} />}
        <MenuBottom page={page} onLongPressStatus={onLongPressStatus} menuBottom={menuBottom} />
    </View>

}



export default MenuDragable;