import React, { useState } from "react";
import { SGradient, SText, STheme, SView } from "servisofts-component";
import { Layout, Page, Widget, XY } from "./types";
import { View } from "react-native";
import Animated, { ReduceMotion, SharedValue, cancelAnimation, runOnJS, useAnimatedReaction, useDerivedValue, useSharedValue, withSpring } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const MenuBottom = ({ page, onLongPressStatus, menuBottom }: { page: SharedValue<Page>, onLongPressStatus: SharedValue<number>, menuBottom: any }) => {
    const [visible, setVisible] = useState(false);
    // const visibleShare = useSharedValue(0);

    // useAnimatedReaction(() => onLongPressStatus.value, (newValue) => {
    //     if (newValue > 0 && visibleShare.value === 0) {
    //         // runOnJS(setVisible)(true);
    //         visibleShare.value = 1;
    //     } else if (newValue <= 0 && visibleShare.value === 1) {
    //         visibleShare.value = 0;
    //         // runOnJS(setVisible)(false);
    //     }

    //     // runOnJS(setSelect)(p.select + 1)
    // })
    // if (!visibleShare.value) return null;
    return <Animated.View style={{
        position: "absolute",
        // right: 0,
        bottom: 0,
        height: useDerivedValue(() => page.value.gridHeight),
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        flexDirection: "row",
        // backgroundColor: "#f0f",
        transform: [{ translateY: useDerivedValue(() => page.value.gridHeight * (1 - onLongPressStatus.value)) }]
        // bottom: page.value.gridHeight,
    }} >
        {menuBottom}
    </Animated.View>
}

export default MenuBottom;