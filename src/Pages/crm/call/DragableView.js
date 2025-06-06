import React, { Component } from 'react';
import { View, PanResponder, Animated, StyleSheet } from 'react-native';

export default class DraggableView extends Component<View["props"]> {
    constructor(props) {
        super(props);

        this.state = {
            pan: new Animated.ValueXY(), // Posición inicial
        };

        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true, // Activar el responder al toque
            onPanResponderGrant: () => {
                document.body.style.userSelect = 'none';
            },
            onPanResponderMove: Animated.event(
                [null, { dx: this.state.pan.x, dy: this.state.pan.y }],
                { useNativeDriver: false } // No usar el driver nativo aquí
            ),

            onPanResponderRelease: () => {
                document.body.style.userSelect = '';
                this.state.pan.extractOffset();
                // Si quieres que vuelva al lugar original:
                // Animated.spring(this.state.pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
            },
        });
    }
    componentWillUnmount() {
        document.body.style.userSelect = '';
    }

    render() {
        return (<Animated.View
            {...this.panResponder.panHandlers}
            style={[this.state.pan.getLayout(), styles.box, this.props.style]}
        />
        );
    }
}

const styles = StyleSheet.create({

    box: {
        position: 'absolute',
        // width: 100,
        // height: 100,
        // backgroundColor: '#3498db',
        // borderRadius: 8,
    },
});
