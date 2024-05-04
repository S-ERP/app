import React, { useEffect } from "react";
import { Layout, Page, Widget, XY } from "./types";
import Animated, { ReduceMotion, SharedValue, runOnJS, useAnimatedReaction, useDerivedValue, useSharedValue, withSpring } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Options from "../MultipageMenu/Options";
import { Vibration } from "react-native";
import { SThread } from "servisofts-component";
import { animationStyle1 } from ".";

type ItemPropsType = {
    data: Widget,
    page: SharedValue<Page>,
    layout: SharedValue<Layout>,
    onChangePosition: (evt: Widget) => any,
    animateToPage: (page: number) => any,
    translateX: SharedValue<number>,
}





const Item = React.memo(({ data, page, onChangePosition, layout, animateToPage, translateX }: ItemPropsType) => {
    const positionIndex = useSharedValue({ x: data.x, y: data.y })
    const position = useSharedValue({ x: 0, y: 0 })
    const context = useSharedValue({ x: 0, y: 0 })
    const onAnimation = useSharedValue(0)
    const scale = useSharedValue(1);
    const zIndex = useSharedValue(1);
    const { w, h, x, y } = data;


    // useAnimatedReaction(() => translateX.value, (p) => {
    // page.value.select = p;
    // if (positionIndex.value.y >= page.value.row - 1) {
    // position.value = withSpring({
    //     x: p * -1,
    //     y: 0,
    // }, animationStyle1, () => {

    // })
    // position.value = {
    //     ...position.value,
    //     x: p * -1,
    // }
    // }
    // console.log("useAnimatedReaction: ", p)
    // }, [translateX])
    useEffect(() => {
        if (position.value.x == 0 && position.value.y == 0) {
            position.value = {
                x: 0,
                y: 0,
            }
            positionIndex.value = withSpring({
                x: data.x,
                y: data.y
            }, animationStyle1, () => {

            })
        } else {
            const absPos = {
                x: ((page.value.gridWidth * positionIndex.value.x)),
                y: ((page.value.gridHeight * positionIndex.value.y))
            }



            let x = data.x;
            if (data.y >= page.value.row - 1) {
                x = data.x + (page.value.select * 4)
            }
            if (data.y >= page.value.row - 1 && positionIndex.value.y != data.y) {
                const sumpos = (translateX.value * -1) + (((page.value.col / 4) - 1) * (page.value.gridWidth * 2))
                x = x + Math.round((sumpos / page.value.gridWidth))

            }
            if (positionIndex.value.y >= page.value.row - 1) {
                absPos.x = absPos.x + (translateX.value * -1)
            }
            if (positionIndex.value.y >= page.value.row - 1 && positionIndex.value.y != data.y) {
                console.log("ENTRO ACA ABAJo")
                const sumpos = (translateX.value * -1) + (((page.value.col / 4) - 1) * (page.value.gridWidth * 2))
                absPos.x = absPos.x + sumpos
            }
            const to = {
                x: ((page.value.gridWidth * x)),
                y: ((page.value.gridHeight * data.y))
            }

            const navigateto = {
                x: to.x - absPos.x,
                y: to.y - absPos.y
            }

            console.log(navigateto, to, absPos);


            position.value = withSpring(navigateto, animationStyle1, () => {
                position.value = {
                    x: 0,
                    y: 0,
                }
                positionIndex.value = {
                    x: data.x,
                    y: data.y
                }

            })


            // positionIndex.value = {
            //     x: data.x,
            //     y: data.y
            // }
            // position.value = {
            //     x: 0,
            //     y: 0,
            // }
        }
    }, [data])


    const variation = 0;
    let isRun = false;
    const stopChangePage = () => {
        '!worklet'
        isRun = false;
    }

    const changePage = () => {
        '!worklet'
        if (isRun) return;
        isRun = true;
        new SThread(1000, "hilo_para_esperar_cambios", true).start(() => {
            if (!isRun) return;
            isRun = false;
            let sum = 0;
            if (positionIndex.value.y >= page.value.row - 1) {
                sum = (translateX.value * -1)
            }
            const absPos = {
                x: ((page.value.gridWidth * x) + position.value.x + sum),
                y: ((page.value.gridHeight * y) + position.value.y)
            }

            const calculatePos = {
                x: Math.round(absPos.x / page.value.gridWidth),
                y: Math.round(absPos.y / page.value.gridHeight),
            }
            if (calculatePos.y >= page.value.row - 1) return;

            if ((((absPos.x + (w * page.value.gridWidth))) - variation > (layout.value.width * (page.value.select + 1))) && (page.value.select < page.value.cant - 1)) {
                onAnimation.value = 1;
                let npage = page.value.select + 1;
                translateX.value = withSpring(npage * layout.value.width * -1, animationStyle1, () => {
                    page.value = { ...page.value, select: npage };
                })
                console.log("x", position.value.x)

                if (positionIndex.value.y >= page.value.row - 1) {
                    // onAnimation.value = 0;
                    // position.value = withSpring(
                    //     { x: (position.value.x - (layout.value.width)), y: position.value.y },
                    //     animationStyle1, () => {
                    //         context.value.x = context.value.x + (layout.value.width);
                    onAnimation.value = 0;
                    //     })
                } else {
                    position.value = withSpring(
                        { x: (position.value.x + (layout.value.width)), y: position.value.y },
                        animationStyle1, () => {
                            context.value.x = context.value.x + (layout.value.width);
                            onAnimation.value = 0;
                        })
                }


            } else if (((position.value.x + variation) < (layout.value.width * (page.value.select))) && page.value.select > 0) {
                onAnimation.value = 1;
                // if (animateToPage) animateToPage(page.value.select - 1)
                let npage = page.value.select - 1;
                translateX.value = withSpring(npage * layout.value.width * -1, animationStyle1, () => {
                    page.value = { ...page.value, select: npage };
                })

                if (positionIndex.value.y >= page.value.row - 1) {
                    onAnimation.value = 0;
                } else {
                    position.value = withSpring(
                        { x: (position.value.x - (layout.value.width)), y: position.value.y },
                        animationStyle1, () => {
                            context.value.x = context.value.x - (layout.value.width);
                            onAnimation.value = 0;
                        })
                }

            }
        })
    }

    const longPressGesture = Gesture.LongPress().runOnJS(true)
        .minDuration(600)
        .onStart(() => {
            zIndex.value = 2;
            scale.value = withSpring(1.1);
            Vibration.vibrate(100);

        }).onFinalize((e, succes) => {

        })

    const panGesture = Gesture.Pan()
        .activateAfterLongPress(600)
        .onStart(() => {
            context.value = { ...position.value };
        }).onUpdate((evt) => {


            if (onAnimation.value == 1) return;
            position.value.x = context.value.x + evt.translationX;
            position.value.y = context.value.y + evt.translationY;
            position.value = { ...position.value }


            let sum = 0;
            if (positionIndex.value.y >= page.value.row - 1) {
                sum = (translateX.value * -1)
            }
            const absPos = {
                x: ((page.value.gridWidth * x) + position.value.x + sum),
                y: ((page.value.gridHeight * y) + position.value.y)
            }
            if (((absPos.x + (w * page.value.gridWidth)) - variation > (layout.value.width * (page.value.select + 1))) && (page.value.select < page.value.cant - 1)) {
                runOnJS(changePage)();
            } else if (((absPos.x + variation) < (layout.value.width * (page.value.select))) && page.value.select > 0) {
                runOnJS(changePage)();
            } else {
                runOnJS(stopChangePage)();
            }


        }).onEnd(() => {
            runOnJS(stopChangePage)();
            scale.value = withSpring(1, {}, () => {
                zIndex.value = 1;
            });


            const absPos = {
                x: ((page.value.gridWidth * x) + position.value.x),
                y: ((page.value.gridHeight * y) + position.value.y)
            }

            const calculatePos = {
                x: Math.round(absPos.x / page.value.gridWidth),
                y: Math.round(absPos.y / page.value.gridHeight),
            }
            if (calculatePos.x > ((page.value.cant * page.value.col) - 1)) {
                calculatePos.x = (page.value.cant * page.value.col) - 1;
            }
            if (calculatePos.x < 0) {
                calculatePos.x = 0;
            }
            if (calculatePos.y < 0) {
                calculatePos.y = 0;
            }

            if (calculatePos.y >= page.value.row - 1) {
                calculatePos.y = page.value.row - 1;

                // calculatePos.x = calculatePos.x % 4
            }
            if (data.y != calculatePos.y && data.y >= page.value.row - 1) {
                // calculatePos.x = calculatePos.x + (page.value.select * page.value.col)
                const sumpos = (translateX.value * -1) + (((page.value.col / 4) - 1) * (page.value.gridWidth * 2))
                absPos.x = absPos.x + sumpos;
                calculatePos.x = Math.round(absPos.x / page.value.gridWidth);
                console.log("Cuando sale", calculatePos, data)
            }
            if (data.y != calculatePos.y && calculatePos.y >= page.value.row - 1) {
                // calculatePos.x = calculatePos.x + (page.value.select * page.value.col)
                const sumpos = (translateX.value * -1) + (((page.value.col / 4) - 1) * (page.value.gridWidth * 2))
                absPos.x = absPos.x - sumpos;
                calculatePos.x = Math.round(absPos.x / page.value.gridWidth);
                console.log("Cuando entra", calculatePos, data)
            }

            if (calculatePos.y >= page.value.row - 1) {
                if (calculatePos.x >= 4) {
                    calculatePos.x = 3;
                }
                if (calculatePos.x <= 0) {
                    calculatePos.x = 0;
                }
            }

            const calculateResto = {
                x: (calculatePos.x * page.value.gridWidth) - (page.value.gridWidth * x),
                y: (calculatePos.y * page.value.gridHeight) - (page.value.gridHeight * y),
            }
            if (onChangePosition) {
                if (x == calculatePos.x && y == calculatePos.y) {
                    position.value = withSpring({ x: 0, y: 0 }, {
                        mass: 1,
                        damping: 11,
                        stiffness: 200,
                        overshootClamping: true,
                        restDisplacementThreshold: 0.01,
                        restSpeedThreshold: 2,
                        reduceMotion: ReduceMotion.System,
                    })
                } else {
                    runOnJS(onChangePosition)({
                        ...data,
                        x: calculatePos.x,
                        y: calculatePos.y,
                    })
                }
            } else {
                position.value = withSpring(calculateResto, {
                    mass: 1,
                    damping: 11,
                    stiffness: 200,
                    overshootClamping: true,
                    restDisplacementThreshold: 0.01,
                    restSpeedThreshold: 2,
                    reduceMotion: ReduceMotion.System,
                })
            }

        })


    const composed = Gesture.Simultaneous(panGesture, longPressGesture);


    let extraProps = {}
    let key_type: any = data.type;
    let ELMENT: any = Options["AppIcon"];
    if (Options[key_type]) {
        ELMENT = Options[key_type];
    }
    if (data.y >= page.value.row - 1) {
        extraProps = {
            nolabel: true
        }
    }

    const sum = useDerivedValue(() => (positionIndex.value.y >= page.value.row - 1 ? (translateX.value * -1) + (((page.value.col / 4) - 1) * (page.value.gridWidth * 2)) : 0))
    return <GestureDetector gesture={composed}>
        <Animated.View key={data.key} style={{
            position: "absolute",
            width: useDerivedValue(() => w * page.value.gridWidth),
            height: useDerivedValue(() => h * page.value.gridHeight),
            zIndex: zIndex,
            // backgroundColor: "#f0ff0066",
            justifyContent: "center",
            alignItems: "center",
            transform: [
                {
                    translateX: useDerivedValue(() => ((page.value.gridWidth * positionIndex.value.x) + position.value.x + sum.value))
                },
                { translateY: useDerivedValue(() => (page.value.gridHeight * positionIndex.value.y) + position.value.y) },
                { scale },
            ]
        }}>
            <ELMENT data={data}  {...extraProps} />
        </Animated.View>
    </GestureDetector>

}, (prevProps: any, nextProps: any) => {
    return prevProps.data.x === nextProps.data.x && prevProps.data.y === nextProps.data.y && nextProps.data.key === nextProps.data.key;
})
export default Item;