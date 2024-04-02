import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { STheme, SView } from 'servisofts-component';

export default class ChangeColor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.defaultValue ?? "#E7E28D"
        };
    }

    Color({ color }) {
        let isselec = this.state.value == color;
        return <SView padding={3} center height={30} flex onPress={() => {
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
                borderWidth: isselec ? 3 : 0,
                borderColor: isselec ? STheme.color.text : "#aaa",
                opacity: isselec ? 1 : 0.6

            }}>

            </SView>
        </SView>
    }
    render() {
        if (this.props.value) {
            this.state.value = this.props.value;
        }
        return <SView row >
            {this.Color({ color: "#E7E28D" }) /*AMARILLO*/}
            {this.Color({ color: "#D2E9E1" }) /*CELESTE*/}
            {this.Color({ color: "#D5EDB9" }) /*VERDE*/}
            {this.Color({ color: "#F0C1CA" }) /*ROSADO*/}
            {this.Color({ color: "#DCCBED" }) /*LILA*/}
            {this.Color({ color: "#FBEDC9" }) /*NARANJA*/}
        </SView>
    }
}
