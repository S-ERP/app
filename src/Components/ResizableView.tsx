import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { SView } from 'servisofts-component';
type PropsType = {
  style?: ViewStyle, children?: any,
  width?: number, height?: number,
  left?: number, right?: number, top?: number, bottom?: number,
  lineColor?: string,
  disableLeft?: boolean, disableRight?: boolean, disableTop?: boolean, disableBottom?: boolean,
}
const ResizableView = (props: PropsType) => {
  const sizeLine = 4;
  const colorLine = props.lineColor ?? "#66666666";
  const context = useSharedValue({
    w: 0,
    h: 0,
    top: 0,
    left: 0,
    bottom: 0,
    invertHorizontal: props.right != null,
    inverVertical: props.bottom != null,
  });
  const width = useSharedValue(props.width ?? 0);
  const height = useSharedValue(props.height ?? 0);
  const top = useSharedValue(0);
  const left = useSharedValue(context.value.invertHorizontal ? props.left ?? 0 : props.right ?? 0);

  const animatedStyle = useAnimatedStyle(() => {
    let elm: any = {
    }
    if (width.value) {
      elm.width = width.value;
    }
    if (height.value) {
      elm.height = height.value;
    }
    if (top.value) {
      elm.top = top.value;
    }
    if (left.value) {
      elm.left = left.value;
    }
    // return {
    //   width: width.value,
    //   height: height.value,
    //   top: top.value,
    //   right: left.value
    // };

    if (context.value.invertHorizontal) {
      elm.right = left.value;
    } else {
      elm.left = left.value;
    }

    return elm;
  });

  return (
    <Animated.View style={[styles.box, animatedStyle, props.style]} >
      <View style={{
        width: "100%",
        flex: 1,
        paddingLeft: props.disableLeft ? 0 : sizeLine,
        paddingRight: props.disableRight ? 0 : sizeLine,
        paddingTop: props.disableTop ? 0 : sizeLine,
        paddingBottom: props.disableBottom ? 0 : sizeLine,
      }}>
        {props.children}
      </View>
      {props.disableRight ? null :
        <PanGestureHandler
          onActivated={() => {
            context.value.w = width.value;
            context.value.left = left.value;
          }}
          onGestureEvent={(evt) => {
            if (context.value.invertHorizontal) {
              left.value = withSpring(-evt.nativeEvent.translationX + context.value.left, { damping: 0 });
              width.value = withSpring(context.value.w + evt.nativeEvent.translationX, { damping: 0 });
            } else {
              width.value = withSpring(evt.nativeEvent.translationX + context.value.w, { damping: 0 });
            }

          }}>
          <Animated.View style={{
            width: sizeLine, height: "100%", backgroundColor: colorLine, position: "absolute", right: 0,
            //@ts-ignore 
            cursor: "ew-resize"
          }} >

          </Animated.View>
        </PanGestureHandler>
      }
      {props.disableBottom ? null :
        <PanGestureHandler
          onActivated={() => {
            context.value.h = height.value;
          }}
          onGestureEvent={(evt) => {
            height.value = withSpring(evt.nativeEvent.translationY + context.value.h, { damping: 0 });
          }}>
          <Animated.View style={{
            width: "100%", height: sizeLine, backgroundColor: colorLine, position: "absolute", bottom: 0,
            //@ts-ignore 
            cursor: "ns-resize"
          }} >

          </Animated.View>
        </PanGestureHandler>
      }
      {props.disableTop ? null :
        <PanGestureHandler
          onActivated={() => {
            context.value.top = top.value;
            context.value.h = height.value;
          }}
          onGestureEvent={(evt) => {
            top.value = withSpring(evt.nativeEvent.translationY + context.value.top, { damping: 0 });
            height.value = withSpring(context.value.h - evt.nativeEvent.translationY, { damping: 0 });
          }}>
          <Animated.View style={{
            width: "100%", height: sizeLine, backgroundColor: colorLine, position: "absolute", top: 0,
            //@ts-ignore 
            cursor: "ns-resize"
          }} >

          </Animated.View>
        </PanGestureHandler>
      }
      {props.disableLeft ? null :
        <PanGestureHandler
          onActivated={() => {
            context.value.left = left.value;
            context.value.w = width.value;
          }}
          onGestureEvent={(evt) => {
            if (context.value.invertHorizontal) {
              width.value = withSpring(context.value.w - evt.nativeEvent.translationX, { damping: 0 });
            } else {
              left.value = withSpring(evt.nativeEvent.translationX + context.value.left, { damping: 0 });
              width.value = withSpring(context.value.w - evt.nativeEvent.translationX, { damping: 0 });
            }
          }}>
          <Animated.View style={{
            width: sizeLine, height: "100%", backgroundColor: colorLine, position: "absolute", left: 0,
            //@ts-ignore 
            cursor: "ew-resize"

          }} >
          </Animated.View>
        </PanGestureHandler>
      }
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  box: {
  },
});

export default ResizableView;
