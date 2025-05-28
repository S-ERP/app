import React, { useRef, useEffect } from 'react';
import { Animated, TouchableOpacity, Text, StyleSheet } from 'react-native';

const ElectricButton = ({ onPress }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.05,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ])
        );

        const flicker = Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 1,
                    duration: 100 + Math.random() * 200,
                    useNativeDriver: false,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0,
                    duration: 50 + Math.random() * 100,
                    useNativeDriver: false,
                }),
            ])
        );

        pulse.start();
        flicker.start();
    }, []);

    const glowInterpolate = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(0,255,255,0.4)', 'rgba(0,255,255,1)'],
    });

    return (
        <Animated.View
            style={[
                styles.wrapper,
                {
                    transform: [{ scale: scaleAnim }],
                    shadowColor: '#00FFFF',
                    shadowOpacity: glowAnim,
                }
            ]}
        >
            <TouchableOpacity style={[styles.button, { shadowColor: glowInterpolate }]} onPress={onPress}>
                <Text style={styles.text}>⚡ Crear nuevo usuario ⚡</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        borderRadius: 10,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 20,
        elevation: 15,
    },
    button: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#00FFFF',
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    text: {
        color: '#00FFFF',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
        textShadowColor: '#00FFFF',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
});

export default ElectricButton;
