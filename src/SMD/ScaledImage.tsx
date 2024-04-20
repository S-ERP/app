import React, { Component } from "react";
import { Image, ImageStyle, Text } from "react-native";

export default class ScaledImage extends Component<{ width?: any, height?: any, src: any, alt?: string, style?: ImageStyle }> {
    // props;
    state: any;
    constructor(props: any) {
        super(props);
        this.state = { source: { uri: this.props.src } };
    }

    componentWillMount() {
        Image.getSize(this.props.src, (width, height) => {
            this.setState({ width: width, height: height })
        });
    }

    render() {
        if (!this.state.width) return <Text>{this.props.alt ?? "img"}</Text>
        let width = this.state.width ?? 0;
        let height = this.state.height ?? 0;
        if (this.props.width && !this.props.height) {
            width = this.props.width;
            height = (this.state.height * this.props.width) / this.state.width;
        } else if (!this.props.width && this.props.height) {
            width = this.state.width * (this.props.height / this.state.height);
            height = this.props.height;
        }
        return (
            <Image
                source={this.state.source}
                style={{ height: height, width: width, ...this.props.style }}
                alt={this.props.alt}
            />
        );
    }
}

