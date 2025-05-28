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
                bottom: 0,
                left: 0,
                width: 60,
                height: 20,
                // backgroundColor: "#0000ff",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <SText fontSize={10}>{`${this.state.fps} fps`}</SText>
            </View>
        );
    }
}
