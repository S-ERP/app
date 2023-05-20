import React, { Component } from 'react';
import { SText, STheme } from 'servisofts-component';
type PropsType = {
    label: any,
}
export default class index extends Component<PropsType> {
    static defaultProps = {
        size: 40
    }
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    render() {
        return <SText col={"xs-12"} style={{
            position: "absolute",
            top: 2,
            left: 2,
        }} color={STheme.color.lightGray} fontSize={10}>{this.props.label}</SText>
    }
}