import React, { useRef, useState } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView, LongPressGestureHandler, PanGestureHandler, State, TouchableWithoutFeedback } from "react-native-gesture-handler";
import Animated, { SlideInRight, useAnimatedReaction, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { SText, STheme } from "servisofts-component";
import MyBilletera from "../../Pages/loby/Components/MyBilletera";
import MyPerfil from "../../Pages/loby/Components/MyPerfil";

const ncol = 4;
const nrow = 6;


// export const getPosition = (position: number) => {
//     "worklet";

//     return {
//         x: position % COL === 0 ? 0 : SIZE * (position % COL),
//         y: Math.floor(position / COL) * SIZE,
//     };
// };

const MenuItem = ({ layout, obj, positions }) => {
    const [disabled, setDisabled] = useState(false)

    const context = useSharedValue({ x: 0, y: 0 });
    const positionX = useSharedValue(positions.value[obj.key].x);
    const positionY = useSharedValue(positions.value[obj.key].y);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const zIndex = useSharedValue(1);
    const scale = useSharedValue(1);

    const panRef = useRef<PanGestureHandler>(null);
    useAnimatedReaction(
        () => positions.value[obj.key]!,
        (newOrder) => {
            if (newOrder.disabled) return null;

            console.log("Entro al reaction", obj.key, newOrder)
            if (positionX.value != newOrder.x || positionY.value != newOrder.y) {
                positionX.value = withSpring(newOrder.x)
                positionY.value = withSpring(newOrder.y)
                // position.value.x = withTiming(newOrder.x);
                // position.value.y = withTiming(newOrder.y);
                // position.value = { ...position.value }
            }
        }
    );


    const panGesture = Gesture.Pan()
        .activateAfterLongPress(800)
        .onStart(() => {
            context.value = { x: translateX.value, y: translateY.value };
            if (positions.value[obj.key]) {
                positions.value[obj.key].disabled = 1;
            }
        })
        .onUpdate((evt) => {
            translateX.value = context.value.x + evt.translationX;
            translateY.value = context.value.y + evt.translationY;

            const llenarEspacios = ({ matrix, x, y, w, h, key }) => {
                for (let yi = 0; yi < h; yi++) {
                    for (let xi = 0; xi < w; xi++) {
                        matrix[y + yi][x + xi] = key
                    }
                }
            }
            const comprobarEspacios = ({ matrix, x, y, w, h }) => {
                if (x + w > ncol) return false;
                if (y + h > nrow) return false;
                for (let yi = y; yi < h + y; yi++) {
                    for (let xi = x; xi < x + w; xi++) {
                        if (!!matrix[yi][xi]) {
                            return false;
                        }
                    }
                }
                return true;
            }
            const calculate = () => {
                const x = (translateX.value / layout.x) + (positionX.value);
                const y = (translateY.value / layout.y) + positionY.value;
                const w = (obj.w)
                const h = (obj.h)
                const rx = Math.round(x);
                const ry = Math.round(y);


                let needMoved = {};
                let matrisDeEspacios: string[][] = new Array<string[]>(nrow).fill([]).map(a => new Array(ncol).fill(""));

                llenarEspacios({ matrix: matrisDeEspacios, x: rx, y: ry, w: w, h: h, key: obj.key });
                Object.keys(positions.value).filter(k => k != obj.key).map(k => {
                    const pos = positions.value[k];
                    if (((rx >= pos.x && rx <= (pos.x + pos.w - 1)) || ((rx + w - 1) >= pos.x && (rx + w - 1) <= (pos.x + pos.w - 1))
                        || (pos.x >= rx && pos.x <= (rx + w - 1)) || ((pos.x + pos.w - 1) >= rx && (pos.x + pos.w - 1) <= (rx + w - 1)))
                        && (((ry >= pos.y && ry <= (pos.y + pos.h - 1)) || ((ry + h - 1) >= pos.y && (ry + h - 1) <= (pos.y + pos.h - 1))))
                    ) {
                        needMoved[k] = pos;
                        // llenarEspacios({ matrix: matrisDeEspacios, x: pos.x, y: pos.y, w: pos.w, h: pos.h, key: "" });
                    } else {
                        llenarEspacios({ matrix: matrisDeEspacios, x: pos.x, y: pos.y, w: pos.w, h: pos.h, key: k + "" });
                    }
                })
                let valid = false;
                Object.keys(needMoved).map(k => {
                    const pos = positions.value[k];
                    // console.log(k);
                    // console.log(matrisDeEspacios)

                    for (let mi = 0; mi < matrisDeEspacios.length; mi++) {
                        for (let mj = 0; mj < matrisDeEspacios[mi].length; mj++) {
                            if (!matrisDeEspacios[mi][mj]) {
                                if (comprobarEspacios({ matrix: matrisDeEspacios, x: mj, y: mi, w: pos.w, h: pos.h, })) {
                                    llenarEspacios({ matrix: matrisDeEspacios, x: mj, y: mi, w: pos.w, h: pos.h, key: k + "" });
                                    positions.value[k] = { x: mj, y: mi, w: pos.w, h: pos.h, disabled: 0 };
                                    positions.value = { ...positions.value }
                                    valid = true;
                                    return;
                                }
                            }
                        }
                    }
                    valid = false;
                    return true;
                })


                // obj.x = rx;
                // obj.y = ry;
            }
            calculate();
        })
        .onEnd(() => {

            if (positions.value[obj.key]) {
                positions.value[obj.key].disabled = 0;
            }

            console.log("Entro al on end");
            const x = (translateX.value / layout.x) + (positionX.value);
            const y = (translateY.value / layout.y) + positionY.value;
            const w = (obj.w)
            const h = (obj.h)
            const rx = Math.round(x);
            const ry = Math.round(y);
            translateX.value = withTiming(context.value.x);
            translateY.value = withTiming(context.value.y);
            positionX.value = withTiming(rx);
            positionY.value = withTiming(ry);
            scale.value = withSpring(1, {}, () => {
                zIndex.value = 1;
            });
            // setDisabled(false);

        });

    const longPressGesture = Gesture.LongPress()
        .minDuration(800)
        .onStart(() => {
            zIndex.value = 2;
            // setDisabled(true);
            scale.value = withSpring(1.1);
        })
        .onEnd(() => {
            // panRef.current?.setNativeProps({ enabled: false });
        });


    const composed = Gesture.Simultaneous(panGesture, longPressGesture);

    const derivedValueX = useDerivedValue(() => {
        return translateX.value + (layout.x * positionX.value);
    });
    const wx = useDerivedValue(() => {
        return layout.x * (obj.w);
    });
    const wy = useDerivedValue(() => {
        return layout.y * (obj.h);
    });
    const derivedValueY = useDerivedValue(() => {
        return translateY.value + (layout.y * positionY.value);
    });
    return (<GestureDetector gesture={composed}  >
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

            ]}

        >
            {obj.component}
            <View style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                top: 0,
                right: 0,
            }}>
                <SText>{obj.key}</SText>
            </View>
        </Animated.View>
    </GestureDetector>
    );
}
const MenuDragable = () => {
    const data = [
        { key: "btn1", x: 0, y: 0, w: 4, h: 1, component: <SText>1x4 Bucar</SText> },
        { key: "btn2", x: 3, y: 1, w: 1, h: 1, component: <SText>1x1 Facebook</SText> },
        { key: "btn3", x: 0, y: 2, w: 4, h: 1, component: <SText>4x1 Hora</SText> },
        { key: "btn4", x: 0, y: 3, w: 2, h: 1, component: <MyPerfil /> },
        { key: "btn5", x: 3, y: 3, w: 1, h: 1, component: <SText>QR</SText> },
        { key: "btn6", x: 0, y: 5, w: 1, h: 1, component: <SText>Google</SText> },
        { key: "btn7", x: 1, y: 5, w: 1, h: 1, component: <SText>Galeria</SText> },
        { key: "btn8", x: 2, y: 5, w: 1, h: 1, component: <SText>Hola</SText> },
        { key: "btn9", x: 3, y: 5, w: 1, h: 1, component: <SText>Play Store</SText> },
        // { key: "btn1", x: 0, y: 1, w: 3, h: 2, component: <SText>3x2</SText> },
    ]

    // const [layout, setLayout] = useState({ x: Dimensions.get("window").width / ncol, y: Dimensions.get("window").height / nrow })
    const [layout, setLayout] = useState({ x: 0, y: 0 })
    // const layout = useSharedValue({ x: Dimensions.get("window").width / ncol, y: Dimensions.get("window").height / nrow });

    const positions = useSharedValue<{ [key: string]: { x: number, y: number } }>(
        Object.assign(
            {},
            ...data.map((child, index) => ({ [child.key]: { x: child.x, y: child.y, w: child.w, h: child.h, disabled: 0 } }))
        )
    );


    return <View style={{
        flex: 1,
        width: "100%",
    }} onLayout={e => {
        setLayout({ x: e.nativeEvent.layout.width / ncol, y: e.nativeEvent.layout.height / (nrow + 1) })
        // layout.y = e.nativeEvent.layout.height / nrow
        // layout.x = e.nativeEvent.layout.width / ncol
    }}>
        {!layout.x ? null : data.map(obj => {
            return <MenuItem
                positions={positions}
                layout={layout}
                obj={obj}
            />
        })}
    </View>
}
export default MenuDragable;