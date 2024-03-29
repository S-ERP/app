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
                    this.player = ref
                }}
                muted={this.state?.muted}
                paused={this.state?.paused}
                repeat
                // controls
                source={{
                    uri: this.props.src,
                    // uri: `https://repo.servisofts.com/class/kubernetes/001.-%20Todo%20lo%20que%20aprenderás%20sobre%20Kubernetes%20-%20Platzi1.mp4`,
                    // uri: `https://repo.servisofts.com/video/calistenia-01.mp4`,
                    // type: 'mp4',
                    // headers: {
                    //     'range': 'bytes=0-'
                    // }
                }}
                maxBitRate={2000000}
                bufferConfig={{
                    minBufferMs: 15000,
                    maxBufferMs: 50000,
                    bufferForPlaybackMs: 2500,
                    bufferForPlaybackAfterRebufferMs: 5000
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
