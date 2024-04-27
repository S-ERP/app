import React, { useRef, useState } from "react";
import { FlatList, Platform, StyleSheet, Text, View } from "react-native";
import item from "../../Pages/compra/item";
import { SHr, SText, SThread, SView } from "servisofts-component";
import { Gesture, GestureDetector, GestureHandlerRootView, PanGestureHandler, ScrollView } from "react-native-gesture-handler";
import Animated, { useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring, useAnimatedReaction, ReduceMotion, cancelAnimation, runOnJS } from "react-native-reanimated";

const ItemView = ({ item, index, layout }) => {
    return <View style={{ width: layout.width, height: layout.height, }}>
        {item}
    </View>
}

class PageControl extends React.Component<{ index, data, translateX }> {
    state = {
        index: this.props.index,
    };
    setIndex(index: number) {
        if (index == this.state.index) return;
        this.setState({ index: index })
    }
    render() {

        const size = 6;
        return <View style={{ width: "100%", flexDirection: "row", justifyContent: "center", position: "absolute", bottom: 0, }}>
            {this.props.data.map((a, i) => <SView style={{
                borderRadius: 100,
                backgroundColor: this.state.index == i ? "#ffffff" : "#ffffff66",
                width: size,
                height: size,
                margin: 4,
            }}></SView>)}
        </View>
    }
}
// const PageControl = ({ index, data }) => {

// }

type SwipeableViewPropsType = {
    data: any[],
    initialIndex?: number,
}
const SwipeableView = (props: SwipeableViewPropsType) => {
    const scrollViewRef = useRef<ScrollView>(null);
    const pageControlRef = useRef<PageControl>(null);
    const [index, setIndex] = useState(props.initialIndex ?? 0);
    const [state, setState] = useState({ scrollOffset: 0, index: props.initialIndex ?? 0 });
    const [layout, setLayout] = useState({ height: 0, width: 0 });
    const data = props.data;
    const context = useSharedValue({ x: 0, y: 0 });
    const translateX = useSharedValue(0);

    useAnimatedReaction(
        () => {
            return translateX.value;  // Especificas qué valor observar.
        },
        (current, previous) => {
            if (current !== previous) {
                if (!layout.width) return;
                let i = Math.round(-current / layout.width)
                // if (isIndex) i = index;
                if (i < 0) i = 0;
                if (i > data.length - 1) i = data.length
                // console.log(i, current, layout.width);
                // if(index!=i){
                //     setIndex(i)
                // }
                // console.log('Valor cambió de', previous, 'a', current);
                // Aquí puedes reaccionar al cambio.
            }
        }
    );

    const initialTouchLocation = useSharedValue({ x: 0, y: 0 });
    const gestureHandler = Gesture.Pan()
        .onBegin((evt) => {
            initialTouchLocation.value = { x: evt.x, y: evt.y };
        })
        .onStart((evt) => {
            context.value = { x: translateX.value, y: 0 };
        }).onUpdate((event) => {
            translateX.value = event.translationX + context.value.x;
            if (translateX.value > 0) {
                translateX.value = 0;
                return;
            } else if (translateX.value < -(layout.width * (data.length - 1))) {
                translateX.value = -(layout.width * (data.length - 1));
                return;
            }
        }).onEnd((e) => {

            const cliptoView = async (index = 0, isIndex = false) => {
                let i = Math.round(-translateX.value / layout.width)
                if (isIndex) i = index;
                if (i < 0) i = 0;
                if (i > data.length - 1) i = data.length - 1
                // if (pageControlRef.current) {
                //     pageControlRef.current.setIndex(i)
                // }
                translateX.value = withSpring(-i * layout.width, {
                    mass: 1,
                    damping: 11,
                    stiffness: 200,
                    overshootClamping: true,
                    restDisplacementThreshold: 0.01,
                    restSpeedThreshold: 2,
                    reduceMotion: ReduceMotion.System,
                });
            }
            const maxvel = 5000;
            let v = e.velocityX
            if (v > maxvel) v = maxvel;
            if (v < -maxvel) v = -maxvel;
            let displace = ((v / maxvel) * (layout.width));
            state.index = -Math.round((((translateX.value) + displace) / layout.width))

            if (state.index < 0) {
                state.index = 0
            }
            if (state.index > data.length - 1) {
                state.index = data.length - 1
            }

            // if (index != state.index) {
            // runOnJS(() => {
            //     if(pageControlRef.current){
            //         pageControlRef.current?.setIndex(state.index);
            //     }
            // })();
            // }

            cliptoView(state.index, true);
        })

    const RenderList = () => {
        return <Animated.View ref={scrollViewRef}
            style={[{
                width: layout.width * data.length,
                height: layout.width,
                flexDirection: "row",
            },
            {
                transform: [
                    { translateX: translateX }
                ]
            }
            ]}>
            {data.map((item, i) => <ItemView index={i} item={item} layout={layout} />)}
        </Animated.View>

    }


    return <View style={{ flex: 1, width: "100%" }} onLayout={e => {
        setLayout(e.nativeEvent.layout);
        translateX.value = -(state.index * e.nativeEvent.layout.width)
        // console.log(-(state.index * e.nativeEvent.layout.width))
    }}>
        {!layout.width ? null : <GestureDetector touchAction="pan-x" gesture={gestureHandler}>{RenderList()}</GestureDetector>}
        <PageControl
            ref={pageControlRef}
            index={index} data={data} translateX={translateX} />
    </View >
}

export default SwipeableView