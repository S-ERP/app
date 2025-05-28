import React, { Component } from 'react';
import { SText, SThread, SView, } from 'servisofts-component';


export default class SVideo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            muted: true,
            paused: this.props.paused,
        };

    }
    play() {
        this.video.play()
    }
    pause() {
        this.video.pause()
    }
    componentDidMount() {
        new SThread(100, "before", true).start(() => {
            // this.video.c
            // this.video.play()
            // this.video.pause()
        })
    }

    render() {
        return <SView col={"xs-12"} flex style={{
            overflow: "hidden"
        }} center onPress={() => {
            this.state.paused = !this.state.paused;
            if (!this.state.paused) {
                this.video.play()
            } else {
                this.video.pause()
            }
            this.setState({ paused: this.state.paused })
        }}>
            <video ref={ref => {
                if (ref) {
                    this.video = ref
                }
            }} style={{
                objectFit: "scale-down",
                width: "100%",
                height: "100%",
                background:"none"
                // flex: 1,
                // ...this.props.style
            }}
                // controls
                // autoPlay={!this.props.paused}
                // {...this.props}
                controls


            >
                <source src={this.props.src} type="video/webm"></source>
                {/* <source src={this.props.src} type="video/mp4"></source> */}
            </video>
        </SView>
    }
}
