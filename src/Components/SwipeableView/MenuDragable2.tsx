import React, { useRef, useState } from "react";
import { Dimensions, Text, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView, LongPressGestureHandler, PanGestureHandler, State } from "react-native-gesture-handler";
import Animated, { SlideInRight, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring } from "react-native-reanimated";
import { SText, STheme } from "servisofts-component";


const MenuItem = ({ layout, obj, onMove }) => {

    const context = useSharedValue({ x: 0, y: 0 });
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const zIndex = useSharedValue(1);
    const scale = useSharedValue(1);
    const panRef = useRef<PanGestureHandler>(null);


    const calculate = () => {
        const x = translateX.value + (layout.x * obj.x);
        const y = translateY.value + (layout.y * obj.y);
        const w = layout.x * (obj.w)
        const h = layout.y * (obj.h)

        onMove({ x: x, y: y, w: w, h: h, wx: x + w, wy: y + h })
    }
    const panGesture = Gesture.Pan()
        .activateAfterLongPress(800)
        .onStart(() => {
            context.value = { x: translateX.value, y: translateY.value };
        })
        .onUpdate((evt) => {
            translateX.value = context.value.x + evt.translationX;
            translateY.value = context.value.y + evt.translationY;
            calculate();
        })
        .onEnd(() => {
            translateX.value = withSpring(context.value.x);
            translateY.value = withSpring(context.value.y);
            scale.value = withSpring(1, {}, () => {
                zIndex.value = 1;
            });

        });

    const longPressGesture = Gesture.LongPress()
        .minDuration(800)
        .onStart(() => {
            zIndex.value = 2;
            scale.value = withSpring(1.1);
        })
        .onEnd(() => {
            // panRef.current?.setNativeProps({ enabled: false });
        });
    const composed = Gesture.Simultaneous(panGesture, longPressGesture);

    const derivedValueX = useDerivedValue(() => {
        return translateX.value + (layout.x * obj.x);
    });
    const wx = useDerivedValue(() => {
        return layout.x * (obj.w);
    });
    const wy = useDerivedValue(() => {
        return layout.y * (obj.h);
    });
    const derivedValueY = useDerivedValue(() => {
        return translateY.value + (layout.y * obj.y);
    });
    return (<GestureDetector gesture={composed}>
        <Animated.View
            style={[
                {
                    top: 0, left: 0,
                    width: wx,
                    height: wy,
                     position: "absolute", borderRadius: 4, borderWidth: 1, borderColor: STheme.color.card,
                    alignItems: "center",
                    justifyContent: "center"
                },
                { transform: [{ translateX: derivedValueX }, { translateY: derivedValueY }, { scale }], zIndex: zIndex }

            ]}>
            {obj.component}
        </Animated.View>
    </GestureDetector>
    );
}
const MenuDragable = () => {

    const ncol = 4;
    const nrow = 6;
    // const [layout, setLayout] = useState({ x: Dimensions.get("window").width / ncol, y: Dimensions.get("window").height / nrow })
    const [layout, setLayout] = useState({ x: 0, y: 0 })
    // const layout = useSharedValue({ x: Dimensions.get("window").width / ncol, y: Dimensions.get("window").height / nrow });

    const data = [
        { key: "btn1", x: 0, y: 0, w: 4, h: 1, component: <SText>1x4 Bucar</SText> },
        { key: "btn2", x: 3, y: 1, w: 1, h: 1, component: <SText>1x1 Facebook</SText> },
        { key: "btn3", x: 0, y: 2, w: 4, h: 1, component: <SText>4x1 Hora</SText> },
        { key: "btn4", x: 0, y: 3, w: 3, h: 2, component: <SText>Notas</SText> },
        { key: "btn5", x: 3, y: 3, w: 1, h: 1, component: <SText>QR</SText> },
        { key: "btn6", x: 0, y: 5, w: 1, h: 1, component: <SText>Google</SText> },
        { key: "btn7", x: 1, y: 5, w: 1, h: 1, component: <SText>Galeria</SText> },
        { key: "btn8", x: 2, y: 5, w: 1, h: 1, component: <SText>Hola</SText> },
        { key: "btn9", x: 3, y: 5, w: 1, h: 1, component: <SText>Play Store</SText> },
        // { key: "btn1", x: 0, y: 1, w: 3, h: 2, component: <SText>3x2</SText> },
    ]
    return <View style={{
        flex: 1,
        width: "100%",
    }} onLayout={e => {
        setLayout({ x: e.nativeEvent.layout.width / ncol, y: e.nativeEvent.layout.height / nrow })
        // layout.y = e.nativeEvent.layout.height / nrow
        // layout.x = e.nativeEvent.layout.width / ncol
    }}>
        {!layout.x ? null : data.map(obj => {
            return <MenuItem
                layout={layout}
                obj={obj}
                onMove={a => {
                    console.log(a)
                }}
            />
        })}
    </View>
}
export default MenuDragable;