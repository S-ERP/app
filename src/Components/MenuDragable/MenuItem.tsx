import React, { useState } from "react";
import { SGradient, SIcon, SText, STheme, SView } from "servisofts-component";
import { Layout, Page, Widget, XY } from "./types";
import { View } from "react-native";
import Animated, { ReduceMotion, SharedValue, cancelAnimation, runOnJS, useAnimatedReaction, useDerivedValue, useSharedValue, withSpring } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const MenuItem = React.memo(({ page, onLongPressStatus, menuBottom, menu, onDelete, closeMenuItem }: {
    page: SharedValue<Page>, onLongPressStatus: SharedValue<number>, menuBottom: any, menu: Widget,
    onDelete: (evt: Widget) => any,
    closeMenuItem: (evt: Widget) => any,
}) => {
    const [visible, setVisible] = useState(false);

    const size = { width: 200, height: 50, }
    return <Animated.View style={{
        position: "absolute",
        width: size.width,
        height: size.height,
        // height: useDerivedValue(() => page.value.gridHeight),
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
        backgroundColor: STheme.color.barColor,
        borderRadius: 8,
        transform: [
            {
                translateX: useDerivedValue(() => {
                    let sum = 0;
                    if (menu.y >= page.value.row - 1) {
                        sum = ((page.value.col - 4) / 2) * page.value.gridWidth
                    }
                    let val = (page.value.gridWidth * (menu.x % page.value.col)) + sum
                    if (val + size.width >= page.value.gridWidth * page.value.col) {
                        val = (page.value.gridWidth * page.value.col) - size.width;
                    }
                    return val
                })
            },
            {
                translateY: useDerivedValue(() => {
                    let sum = 0;
                    if (menu.y <= 0) {
                        sum = (page.value.gridHeight * 1) + size.height
                    }
                    return (page.value.gridHeight * menu.y) - size.height + sum
                })
            },
        ]
        // bottom: page.value.gridHeight,
    }} >
        <SView row col={"xs-12"} height>
            <SView flex center onPress={() => {
                if (onDelete) onDelete(menu)
                if (closeMenuItem) closeMenuItem(menu)
            }}>
                <SView width={25} height={25}>
                    <SIcon name={"Close"} fill={STheme.color.text} />
                </SView>
                <SText>Eliminar</SText>
            </SView>
            <SView flex center>
                <SView width={25} height={25}>
                    <SIcon name={"Eyes"} fill={STheme.color.text} />
                </SView>
                <SText>Icono</SText>
            </SView>
        </SView>
    </Animated.View>
}, (prevProps: any, nextProps: any) => {
    return prevProps.menu == nextProps.menu ;
})

export default MenuItem;