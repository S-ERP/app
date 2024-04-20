import React, { useRef, useState } from "react";
import { FlatList, Platform, StyleSheet, Text, View } from "react-native";
import item from "../../Pages/compra/item";
import { SHr, SText, SThread, SView } from "servisofts-component";
import { Gesture, GestureDetector, PanGestureHandler } from "react-native-gesture-handler";
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
    const flatListRef = useRef<FlatList>(null);
    const pageControlRef = useRef<PageControl>(null);
    const [index, setIndex] = useState(props.initialIndex ?? 0);
    const [state, setState] = useState({ scrollOffset: 0, index: props.initialIndex });
    const [layout, setLayout] = useState({ height: 0, width: 0 });
    // const [data, setData] = useState(props.data);
    const data = props.data;
    const context = useSharedValue({ x: 0, y: 0 });
    const translateX = useSharedValue(0);

    if (Platform.OS == "web") {
        useAnimatedReaction(
            () => {
                return translateX.value;
            },
            (data) => {
                if (flatListRef.current) flatListRef.current.scrollToOffset({ animated: false, offset: translateX.value })

            }
        );
    }


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
        return <FlatList
            ref={flatListRef}
            horizontal
            data={data}
            renderItem={({ item, index }) => <ItemView index={index} item={item} layout={layout} />}
            scrollEventThrottle={16}
            bounces={false}
            // scrollEnabled={false}
            nestedScrollEnabled={true}
            initialScrollIndex={index}
            decelerationRate="fast"
            snapToAlignment={"center"}
            pagingEnabled={true}
            // directionalLockEnabled={true}
            showsHorizontalScrollIndicator={false}
            snapToInterval={layout.width}
            getItemLayout={(data, index) => (
                { length: layout.width, offset: index * layout.width, index: index }
            )}
            style={{
                width: "100%",
                height: "100%"
            }}
      
            disableIntervalMomentum={true}
            onContentSizeChange={e => {
                if (flatListRef.current) {
                    flatListRef.current?.scrollToIndex({
                        animated: false,
                        index: index,
                    })
                }

            }}
            onScroll={(e) => {
                if (e.nativeEvent.contentSize.width <= e.nativeEvent.contentOffset.x) {
                    return;
                }
                state.scrollOffset = e.nativeEvent.contentOffset.x;
                const ni = state.scrollOffset / (layout.width)
                const closestIndex = Math.round(ni);
                state.index = closestIndex;
                // if (index != state.index) {
                console.warn("TODO: Cambiar esto para que no renderice (OPTIMIZAR)")
                if (pageControlRef.current) {
                    pageControlRef.current.setIndex(state.index);
                }
                // setIndex(state.index)
                // }
            }}
        />
    }
    return <View style={{ flex: 1, width: "100%" }} onLayout={e => {
        setLayout(e.nativeEvent.layout);
        if (Platform.OS == "web") translateX.value = index * e.nativeEvent.layout.width
    }}>
        {!layout.width ? null : ((Platform.OS == "web") ? <GestureDetector gesture={gestureHandler}>{RenderList()}</GestureDetector> : RenderList())}
        <PageControl ref={pageControlRef} index={index} data={data} />
    </View >
}

export default SwipeableView