import React, { Component } from "react";
import DraggableBox from "./DraggableBox";
import { SharedValue } from "react-native-reanimated";
import { View, ViewStyle } from "react-native";
import { SIcon, SText, STheme, SView } from "servisofts-component";
import { THREE } from "expo-three";

export type NodeAbstractType = {
    scale: SharedValue<number>,
    x: number,
    y: number,
    style?: ViewStyle | ViewStyle[],
    threeObject: any,

}

export type NodeConfig = {
    type: string,
    color: string,
}
export type NodeState = {
    open: boolean
}

export default abstract class NodeAbstract<P = {}> extends React.Component<P & NodeAbstractType, NodeState> {
    abstract $renderContent(): any;
    abstract $config: NodeConfig;
    style: ViewStyle = {}
    state: NodeState = {
        open: true
    }
    defaultStyle: ViewStyle = {
        width: 200,
        backgroundColor: "#232323",
        borderRadius: 4,
    }
    currentPosition = { x: this.props.x, y: this.props.y }
    render() {

        return <DraggableBox x={this.props.x} y={this.props.y} scale={this.props.scale}
            onChange={e => {
                this.currentPosition = { x: e.x, y: e.y }
            }}
            style={[this.defaultStyle, ...(Array.isArray(this.props.style) ? this.props.style : [this.props.style]), this.style]}
        >
            <SView col={"xs-12"} backgroundColor={this.$config.color} borderRadius={4} padding={4} row center >
                <SView width={10} height={10} style={{
                    transform: [{ rotate: !this.state.open ? "180deg" : "-90deg" }]
                }} onPress={() => {
                    this.setState({ open: !this.state.open })
                }}>
                    <SIcon name="Arrow" fill={STheme.color.text} />
                </SView>
                <SView width={4} />
                <SView flex>
                    <SText bold>{this.$config.type}</SText>
                </SView>
            </SView>
            {!this.state.open ? null : this.$renderContent()}
        </DraggableBox>
    }
}