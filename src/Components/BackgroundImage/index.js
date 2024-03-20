import React, { Component } from 'react';
import { View } from 'react-native';
import { SImage, STheme } from 'servisofts-component';
import Model from '../../Model';
import SSocket from 'servisofts-socket';
type type = {
    source: Object,
    contraste: String

}
export default class BackgroundImage extends Component<type> {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    getBackground = () => {
     
        return <View style={{
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            position: "absolute",
            // opacity: 0.5,
            ...this.props.style,
        }}>
            <SImage style={{
                resizeMode:"cover"
            }} src={SSocket.api.empresa + "empresa_background/" + Model.empresa.Action.getKey()} />
            {/* <SGradient colors={["#000000", "#44000044"]} /> */}
        </View>
    }
    render() {
        // if (!this.props.source) {
        //     return <View />
        // }
        return this.getBackground()
    }
}
