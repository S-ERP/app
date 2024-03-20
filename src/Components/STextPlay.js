import React, { Component } from 'react';
import { SText, STextProps, SThread, SUuid } from 'servisofts-component';
type STextPlayProps = {
    time?: number,
    onEnd: () => void,
    autoplay?: boolean,
}
export default class STextPlay extends Component<STextProps & STextPlayProps> {
    static defaultProps = {
        autoplay: true
    }
    constructor(props) {
        super(props);
        this.state = {
            uuid: SUuid(),
            index: 0,
        };
        this.isrun = this.props.autoplay;
        console.log(this.isrun)
    }
    start = () => {
        this.isrun = true;
        this.play();
    }

    componentDidMount() {
        this.play();
    }

    componentWillUnmount() {
        this.isrun = false;
    }
    onEnd() {
        if (this.props.onEnd) this.props.onEnd();
        console.log("entro al onEnd");
    }
    async play() {

        if (!this.isrun) {
            this.onEnd();
            return;
        }
        new SThread(this.props.time ?? 50, "play_item-" + this.state.uuid, true).start(() => {
            this.state.index += 1;
            if (!this.isrun) {
                this.onEnd();
                return;
            }
            this.setState({ ...this.state })
            if (this.state.index >= this.props.children.length) {
                this.isrun = false;
            }
            this.play();
        })


    }
    render() {
        if (!this.isrun && this.props.autoplay) {
            if (this.props.children.length != this.state.index) {
                this.isrun = true;
                if (this.props.children.length < this.state.index) {
                    this.state.index = this.props.children.length;
                }

                this.play();
            }
        }
        let mensaje = this.props.children.substring(0, this.state.index);
        if(!mensaje) return null;
        return <SText {...this.props}>{mensaje}</SText>
    }
}
