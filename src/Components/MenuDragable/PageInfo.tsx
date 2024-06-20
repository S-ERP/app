import React, { useState } from "react";
import { SGradient, SText, STheme, SView } from "servisofts-component";
import { Layout, Page, Widget, XY } from "./types";
import { View } from "react-native";
import Animated, { ReduceMotion, SharedValue, cancelAnimation, runOnJS, useAnimatedReaction, useDerivedValue, useSharedValue, withSpring } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

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

export default PageInfo;