import React, { Component } from 'react';
import { SText, SThread, SView, } from 'servisofts-component';


export default class SVideo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            muted: true,
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
            this.video.play()
            this.video.pause()
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
            }} src={this.props.src} style={{
                objectFit: "cover",
                width: "100%",
                flex: 1,
                // ...this.props.style
            }} autoPlay={!this.props.paused}  >

            </video>
        </SView>
    }
}
