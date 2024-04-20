import React from 'react';
import { Animated } from 'react-native';
import {
    Swipeable,
    GestureHandlerRootView,
    RectButton
} from 'react-native-gesture-handler';
import { SText } from 'servisofts-component';

// global.__DEV__ = process.env.NODE_ENV !== 'production';

const SwipeableListItem = ({ children }) => {
    const renderRightActions = (progress, dragX) => {
        const trans = dragX.interpolate({
            inputRange: [0, 50, 100, 101],
            outputRange: [0, 0, 0, 1],
        });

        return (
            <Animated.View style={{ transform: [{ translateX: trans }] }}>
               <SText>ELIMINAR</SText>
            </Animated.View>
        );
    };

    return (<GestureHandlerRootView am>
            <Swipeable rightThreshold={17} renderRightActions={renderRightActions}>
                {children}
            </Swipeable>
        </GestureHandlerRootView>
    );
};

export default SwipeableListItem;
