import React from "react";
import { StyleSheet, View } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import { SInput, SPage, SText, SView } from "servisofts-component";
import SvgView from "../SvgView";
import NodeAbstract from "../NodeAbstract";

export type NodeAttributeType = {
    type: "input" | "output",
    label?: string,
    typeInput?: "color",
    node: NodeAbstract
}

const Input = (props: NodeAttributeType & { nodeAttribute: NodeAttribute }) => {
    const viewRef = React.useRef<View>(null);
    if (props.type != "input") return null;

    return <PanGestureHandler
        onGestureEvent={(event) => {

            // console.log(event);
            // translateX.value = event.nativeEvent.translationX * (1 / scale.value);
            // translateY.value = event.nativeEvent.translationY * (1 / scale.value);
        }}
        onHandlerStateChange={(e) => {

            // if(e.state)
            // console.log(e.nativeEvent.translationX)
            // @ts-ignore
            // viewRef.current?.measure((x, y, w, h, px, py) => {
            //     if(props.nodeAttribute.viewRef){
            //         props.nodeAttribute.viewRef.measure((z,y,w,h,px,py)=>{})
            //     }
            //     console.log(x, y);
            //     console.log(e, props.node.currentPosition);
            //     SvgView.createLine({ d: `M ${props.node.currentPosition.x + x} ${props.node.currentPosition.y + y} L 0 0` })
            // })

        }}
    >
        <View ref={viewRef} style={[styles.ball, { left: -4 }]} ></View>
    </PanGestureHandler>
}
const Output = (props: NodeAttributeType) => {
    if (props.type != "output") return null;
    return <SView style={[styles.ball, { right: -4 }]}></SView>
}
export default class NodeAttribute extends React.Component<NodeAttributeType> {
    viewRef?: View;

    render() {
        return <View ref={(ref: any) => this.viewRef = ref}  style={{
            flexDirection:"row",
            width:"100%",
            alignItems: "center",
            justifyContent: this.props.type == "output" ? "flex-end" : "flex-start",
            padding: 6
        }} >
            <SView width={4} height={12} />
            <SText >{this.props.label}</SText>
            {/* <SView width={4} height={12} /> */}
            {/* <SView flex>
                <SInput height={20} type="color" placeholder={"color"} />
            </SView> */}
            <SView width={4} height={12} />
            <Input {...this.props} nodeAttribute={this} />
            <Output {...this.props} />
        </View>
    }
}

const styles = StyleSheet.create({
    ball: {
        width: 8, height: 8, backgroundColor: "#ff0", borderRadius: 100, position: "absolute",
        borderWidth: 1,
        borderColor: "#000"
    }
});