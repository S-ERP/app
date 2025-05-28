import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, { ReduceMotion, runOnJS, useAnimatedStyle, useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { withSpring } from 'react-native-reanimated';
import { SThread } from 'servisofts-component';

const size = 150;
const halfSize = size / 2;
const bubbleSize = size / 4;
const bubbleRadius = bubbleSize / 2;

const animProps = {
    duration: 20,
    dampingRatio: 0.5,
    stiffness: 500,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
    reduceMotion: ReduceMotion.System,
}
const Joystick = ({ onMove, onJump, onKeyDown }) => {
    const panHandlerRef = useRef();
    const [state, setState] = useState({ x: 0, y: 0, run: false, lastSentTime: 0 });
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    let baseMoveSpeed = size / 4;
    let moveSpeed = baseMoveSpeed * 0.80;
    let speedMultiplier = 1.5;

    useEffect(() => {

        if (Platform.OS === 'web') {
            window.addEventListener('keydown', handleKeyDown.bind(this), false);
            window.addEventListener('keyup', handleKeyUp.bind(this), false);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown.bind(this), false);
            window.removeEventListener('keyup', handleKeyUp.bind(this), false);
        }
    }, [])

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
            ],
        };
    });

    const throttledMove = (evt) => {
        const now = Date.now();
        if (now - state.lastSentTime >= 1000 / 45) {
            onMove(evt)
            state.lastSentTime = now;
        }
    }

    const hilo = () => {
        if (!state.run) return;
        new SThread(1000 / 50, "hilo_joystick", true).start(() => {
            _onMove({ x: state.x, y: state.y })
            hilo();
        })
    }
    const _onMove = (evt) => {

        if (evt.x == 0 && evt.y == 0) {
            state.x = evt.x;
            state.y = evt.y;
            state.run = false;
        } else {
            state.x = evt.x;
            state.y = evt.y;
            if (!state.run) {
                state.run = true;
                hilo();
            }
        }
        if (onMove) throttledMove(evt);


    }
    useDerivedValue(() => {
        runOnJS(_onMove)({ x: translateX.value, y: translateY.value });

    }, [translateX, translateY]);

    const onGestureEvent = (event) => {
        const { translationX, translationY } = event.nativeEvent;
        const distance = Math.sqrt(translationX ** 2 + translationY ** 2);
        const maxDistance = halfSize - bubbleRadius;

        if (distance < maxDistance) {
            translateX.value = translationX;
            translateY.value = translationY;
        } else {
            const angle = Math.atan2(translationY, translationX);
            translateX.value = maxDistance * Math.cos(angle);
            translateY.value = maxDistance * Math.sin(angle);
        }
    };

    const onHandlerStateChange = (event) => {
        if (event.nativeEvent.state === 5) {
            translateX.value = withSpring(0);
            translateY.value = withSpring(0);
        }

    };



    const handleKeyDown = (event) => {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                translateY.value = withSpring(-moveSpeed + Math.random(), animProps, () => {
                    withSpring(0, animProps)
                })
                // this.velocity.z = moveSpeed;
                break;
            case 'ArrowDown':
            case 'KeyS':
                translateY.value = withSpring(moveSpeed + Math.random(), animProps)
                // this.velocity.z = -moveSpeed;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                translateX.value = withSpring(-moveSpeed + Math.random(), animProps, () => {
                    withSpring(0, animProps)
                })
                // this.velocity.x = -moveSpeed;
                break;
            case 'ArrowRight':
            case 'KeyD':
                translateX.value = withSpring(moveSpeed + Math.random(), animProps)
                // this.velocity.x = moveSpeed;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                // this.shiftPressed = true;
                moveSpeed = baseMoveSpeed * speedMultiplier;
                break;
            case 'Space':
                if (onJump) onJump();
                break;
        }
        if (onKeyDown) onKeyDown(event);
    }

    const handleKeyUp = (event) => {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
            case 'ArrowDown':
            case 'KeyS':
                translateY.value = withSpring(0, animProps)
                break;
            case 'ArrowLeft':
            case 'KeyA':
            case 'ArrowRight':
            case 'KeyD':
                translateX.value = withSpring(0, animProps)
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                // this.shiftPressed = false;
                moveSpeed = baseMoveSpeed;
                break;
        }
    }

    return (
        <View style={styles.joystick}>
            <PanGestureHandler
                onGestureEvent={onGestureEvent}
                onHandlerStateChange={onHandlerStateChange}

            >
                <Animated.View style={[styles.bubble, animatedStyle]} />
            </PanGestureHandler>
        </View>
    );
};

const styles = StyleSheet.create({
    joystick: {
        width: size,
        height: size,
        borderRadius: halfSize,
        backgroundColor: '#44444444',
        position: 'absolute',
        bottom: 8,
        left: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bubble: {
        width: bubbleSize,
        height: bubbleSize,
        borderRadius: bubbleRadius,
        backgroundColor: '#fff',
        position: 'absolute',
    },
});

export default Joystick;
