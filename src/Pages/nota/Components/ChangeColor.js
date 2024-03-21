import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SView } from 'servisofts-component';

export default class ChangeColor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.defaultValue ?? "#E7E28D"
        };
    }

    Color({ color }) {
        let isselec = this.state.value == color;
        return <SView padding={3} onPress={() => {
            if (this.props.onChange) {
                this.props.onChange(color)
            }
            this.setState({ value: color })
        }}>
            <SView style={{
                width: 24,
                height: 24,
                borderRadius: 100,
                backgroundColor: color,
                borderWidth: isselec ? 2 : 1,
                borderColor: isselec ? "#000" : "#aaa"

            }}>

            </SView>
        </SView>
    }
    render() {
        if (this.props.value) {
            this.state.value = this.props.value;
        }
        return <SView row >
            {this.Color({ color: "#E7E28D" })}
            {this.Color({ color: "#8EC8E8" })}
            {this.Color({ color: "#CFDF38" })}
            {this.Color({ color: "#EF83B4" })}
            {this.Color({ color: "#AE8EBF" })}
            {this.Color({ color: "#F8A956" })}
        </SView>
    }
}
