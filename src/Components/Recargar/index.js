import React, { Component } from 'react';
import { SView, SText, SIcon, STheme } from 'servisofts-component';

export default class Recargar extends Component {
    initialTime = this.props.initialTime ?? 300;

    constructor(props) {
        super(props);
        this.state = {
            time: this.initialTime,
            rotate: false,
        };
        this.interval = null;
    }

    componentDidMount() {
        this.startTimer();
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    startTimer = () => {
        this.interval = setInterval(() => {
            this.setState(prev => {
                if (prev.time <= 1) {
                    clearInterval(this.interval);
                    this.setState({ time: this.initialTime, rotate: true }, () => {
                        setTimeout(() => this.setState({ rotate: false }), 1000);
                        this.props.onFinish?.();
                        this.startTimer();
                    });
                    return { time: 0 };
                }
                return { time: prev.time - 1 };
            });
        }, 1000);
    };

    formatTime = (seconds) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    onPress = () => {
        clearInterval(this.interval);
        this.setState({ time: this.initialTime, rotate: true }, () => {
            setTimeout(() => this.setState({ rotate: false }), 1000);
            this.props.onFinish?.();
            this.startTimer();
        });
    };

    render() {
        const { time, rotate } = this.state;
        const fillColor = this.props.fill ?? STheme.color.text;
        return (
            <SView width={38} center height={38} onPress={this.onPress}>
                <SIcon
                    name={"Reload"}
                    width={38}
                    height={38}
                    fill={fillColor}
                    style={{ transition: 'transform 1s', transform: rotate ? 'rotate(360deg)' : 'rotate(0deg)' }}
                />
                <SView col={"xs-12"} height={40} style={{ position: "absolute", paddingTop: 2 }} center>
                    <SText fontSize={8} style={{ color: fillColor }}>
                        {this.formatTime(time)}
                    </SText>
                </SView>
            </SView>
        );
    }
}
