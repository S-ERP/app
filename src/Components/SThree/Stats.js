import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SText } from 'servisofts-component';

export default class Stats extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fps: 0,
            deltaAcumulado: 0,
            frameCount: 0,
        };
    }
    update(delta) {
        this.state.deltaAcumulado += delta;
        this.state.frameCount++;
        if (this.state.deltaAcumulado >= 1) {
            const fps = this.state.frameCount / this.state.deltaAcumulado;
            this.setState({
                fps: fps.toFixed(1),
                deltaAcumulado: 0,
                frameCount: 0
            });
        }
    }
    render() {
        return (
            <View style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 60,
                height: 30,
                backgroundColor: "#0000ff",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <SText fontSize={12}>{`${this.state.fps} FPS`}</SText>
            </View>
        );
    }
}
