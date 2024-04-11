import { Text, View } from 'react-native'
import React, { Component } from 'react'
import { SIcon, STheme, SThread, SView } from 'servisofts-component'
import { Svg } from 'react-native-svg'
import { Path, Rect, Line, Circle } from "react-native-svg";

export default class LikeAnimation extends Component {
    constructor(props) {
        super(props)
        this.state = {
            load: false,
        }
    }
    start() {
        this.setState({ load: true });
        new SThread(700, "asdasd", false).start(() => {
            this.setState({ load: false });
        })
    }

    render() {
        if(!this.state.load) return null;
        return (
            <SView style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                // backgroundColor: "#6600ff",
                // transform: [{ scale: 0.5 }]

            }} center height >
                <Svg width="30%" height={"100%"} viewBox="0 0 231 192" fill="none" >
                    <Path d="M54.0138 0C39.5873 0 26.0234 5.62 15.8203 15.8203C5.61719 26.0206 0 39.5873 0 54.0138C0 68.4404 5.62 82.0042 15.8203 92.2073L115.21 191.597L214.6 92.2073C224.803 82.0042 230.42 68.4404 230.42 54.0138C230.42 39.5873 224.803 26.0234 214.6 15.8203C204.397 5.62 190.836 0 176.406 0C161.98 0 148.416 5.62 138.213 15.8203L115.21 38.8258L92.2045 15.8203C82.0042 5.62 68.4404 0 54.0138 0Z" fill="#FFFFFF" />
                </Svg>

                {/* <SIcon name='Heart' fill={STheme.color.text} /> */}
            </SView>
        )
    }
}