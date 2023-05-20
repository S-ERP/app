import React, { Component } from 'react';
import { SText, STheme, SView } from 'servisofts-component';
type propsType = {
    label?: any,
    color?: any,
    width: Number,

}

export default class StateTiqueta extends Component<propsType> {
    static defaultProps: propsType = {
        width: 120
    }
    props: propsType;
    constructor(props) {
        super(props);
        this.state = {
        };

    }
    render() {
        return <SView row center style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: this.props.width,
            height: 20,
            borderRadius: 10,
            backgroundColor: this.props.color,
            transform: [{
                rotateZ: '45deg'
            }, { translateX: "30%" }, { translateY: -8 }]
        }} >
            <SText fontSize={12} bold color={STheme.color.text}>{this.props.label}</SText>
        </SView>
    }
}