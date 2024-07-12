import React, { Component } from 'react';
import { SText, SView, } from 'servisofts-component';

import Video from 'react-native-video';

export default class SVideo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            paused: false,
            muted: true,
        };

    }

    play() {
        this.setState({ paused: false })
    }
    pause() {
        this.setState({ paused: true })
    }
    render() {
        // console.log(this.props.src)
        return <SView col={"xs-12"} center
            flex
            style={{
                overflow: "hidden",
            }}
            activeOpacity={1}
            onPress={() => this.setState({ muted: !this.state.muted })}
        >
            <Video
                ref={(ref) => {
                    this.player = ref;
                }}
                muted={this.state?.muted}
                paused={this.state?.paused}
                repeat
                source={{
                    uri: this.props.src,
                }}
                maxBitRate={5000000}
                bufferConfig={{
                    minBufferMs: 15000, // 3 seconds
                    maxBufferMs: 60000, // 10 seconds
                    bufferForPlaybackMs: 2500, // 1 second
                    bufferForPlaybackAfterRebufferMs: 5000, // 2 seconds
                }}
                resizeMode={"contain"}
                style={{
                    height: "100%",
                    width: "100%",
                }}
                {...this.props}
            />
        </SView>
    }
}
