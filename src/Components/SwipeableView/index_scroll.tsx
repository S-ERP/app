import React, { useRef, useState } from "react";
import { FlatList, Platform, StyleSheet, Text, View, ScrollView } from "react-native";
import item from "../../Pages/compra/item";
import { SHr, SText, SThread, SView } from "servisofts-component";
import { Gesture, GestureDetector, PanGestureHandler, } from "react-native-gesture-handler";
import Animated, { useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring, useAnimatedReaction, ReduceMotion, cancelAnimation } from "react-native-reanimated";

const ItemView = ({ item, index, layout }) => {
    return <View style={{ width: layout.width, height: layout.height, }}>
        {item}
    </View>
}

class PageControl extends React.Component<{ index, data }> {
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
    const [state, setState] = useState({ scrollOffset: 0, index: props.initialIndex });
    const [layout, setLayout] = useState({ height: 0, width: 0 });
    // const [data, setData] = useState(props.data);
    const data = props.data;
    const context = useSharedValue({ x: 0, y: 0 });
    const translateX = useSharedValue(0);

    // if (Platform.OS == "web") {
    //     useAnimatedReaction(
    //         () => {
    //             return translateX.value;
    //         },
    //         (data) => {
    //             // if (scrollViewRef.current) scrollViewRef.current.scrollToOffset({ animated: false, offset: translateX.value })
    //             // if (scrollViewRef.current) scrollViewRef.current.scrollTo({ x: translateX.value, animated: false })

    //         }
    //     );
    // }


    const cliptoView = (index = 0, isIndex = false) => {
        let i = Math.round(translateX.value / layout.width)
        if (isIndex) i = index;
        if (i < 0) i = 0;
        if (i > data.length - 1) i = data.length - 1

        translateX.value = withSpring(i * layout.width, {
            mass: 1,
            damping: 11,
            stiffness: 200,
            overshootClamping: true,
            restDisplacementThreshold: 0.01,
            restSpeedThreshold: 2,
            reduceMotion: ReduceMotion.System,
        });
    }
    const gestureHandler = Gesture.Pan().onStart((evt) => {
        context.value = { x: translateX.value, y: 0 };
        // cancelAnimation(translateX)
    }).onUpdate((event) => {

        translateX.value = -event.translationX + context.value.x;
    }).onEnd((e) => {
        const maxvel = 8000;
        let v = e.velocityX
        if (Math.abs(v) > 1000) {
            if (v > maxvel) v = maxvel;
            if (v < -maxvel) v = -maxvel;
            let displace = ((v / maxvel) * (-layout.width * 0.8));
            state.index = Math.round(((translateX.value + displace) / layout.width));
            cliptoView(state.index, true);
        } else {
            cliptoView();

        }


    });

    const RenderList = () => {
        return <Animated.View ref={scrollViewRef}
            style={[{
                width: layout.width * data.length,
                height: layout.width,
                flexDirection: "row",
            },
            {
                transform: [
                    { translateX: translateX.value}
                ]
            }
            ]}
        // onScroll={(e) => {
        //     if (e.nativeEvent.contentSize.width <= e.nativeEvent.contentOffset.x) {
        //         return;
        //     }
        //     state.scrollOffset = e.nativeEvent.contentOffset.x;
        //     const ni = state.scrollOffset / (layout.width)
        //     const closestIndex = Math.round(ni);
        //     state.index = closestIndex;
        //     // if (index != state.index) {
        //     console.warn("TODO: Cambiar esto para que no renderice (OPTIMIZAR)")
        //     if (pageControlRef.current) {
        //         pageControlRef.current.setIndex(state.index);
        //     }
        //     // setIndex(state.index)
        //     // }
        // }}
        >
            {data.map((item, i) => <ItemView index={i} item={item} layout={layout} />)}
        </Animated.View>

    }
    return <View style={{ flex: 1, width: "100%", }} onLayout={e => {
        setLayout(e.nativeEvent.layout);
        if (Platform.OS == "web") translateX.value = index * e.nativeEvent.layout.width
    }}>
        {!layout.width ? null : ((Platform.OS == "web") ? <GestureDetector gesture={gestureHandler}>{RenderList()}</GestureDetector> : RenderList())}
        <PageControl ref={pageControlRef} index={index} data={data} />
    </View >
}

export default SwipeableView