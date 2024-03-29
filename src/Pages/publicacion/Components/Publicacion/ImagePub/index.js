import React, { useRef, useState } from 'react';
import { Animated } from 'react-native';
import { PinchGestureHandler, PanGestureHandler, State } from 'react-native-gesture-handler';

export default function ImagePub({ src }) {
    const scale = useRef(new Animated.Value(1)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;

    const onPinchEvent = Animated.event(
        [{ nativeEvent: { scale } }],
        { useNativeDriver: true }
    );

    const onPanEvent = Animated.event(
        [
            {
                nativeEvent: {
                    translationX: translateX,
                    translationY: translateY,
                },
            },
        ],
        { useNativeDriver: true }
    );

    return (
        <Animated.View style={{ width: "100%", flex: 1 }}>
            <PinchGestureHandler
                onGestureEvent={onPinchEvent}
                onHandlerStateChange={event => {
                    if (event.nativeEvent.oldState === State.ACTIVE) {
                        Animated.spring(scale, {
                            toValue: 1,
                            useNativeDriver: true,
                        }).start();
                    }
                }}
            >
                <Animated.Image
                    source={{ uri: src }}
                    style={{
                        width: "100%",
                        flex: 1,
                        transform: [
                            { scale },
                            { translateX },
                            { translateY },
                        ],
                    }}
                    resizeMode="contain"
                />
            </PinchGestureHandler>
        </Animated.View>
    );
}
