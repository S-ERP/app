import React, { useState } from "react";
import { SGradient, SText, STheme, SView } from "servisofts-component";
import { Layout, Page, Widget, XY } from "./types";
import { View } from "react-native";
import Animated, { ReduceMotion, SharedValue, cancelAnimation, runOnJS, useAnimatedReaction, useDerivedValue, useSharedValue, withSpring } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const PageSeparator = ({ page }: { page: SharedValue<Page> }) => {
    const [visible, setVisible] = useState(false);

    return <>{
        new Array(page.value.cant*2).fill(0).map((a,i) => {
            return <Animated.View style={{
                position: "absolute",
                // right: 0,
                top: 0,
                width: 1,
                height: useDerivedValue(() => (page.value.gridHeight * (page.value.row - 1))),
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: STheme.color.card,
                transform: [{ translateX: useDerivedValue(() => page.value.gridWidth * 4 * (i+1)) }]
                // bottom: page.value.gridHeight,
            }} >
            </Animated.View>
        })
    }
    </>
}

export default PageSeparator;