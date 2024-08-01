import React, { Component } from 'react';
import { SIcon, SLoad, SText, SView } from 'servisofts-component';

export default class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        // if (this.props.loading) return <SLoad />
        return (
            <SView center  {...this.props} style={{
                position: "absolute",

                right: (this.props.right) ? this.props.right : null,
                left: (this.props.left) ? this.props.left : null,
                top: (this.props.top) ? this.props.top : null,
                bottom: (this.props.bottom) ? this.props.bottom : null,
            }}
            >
                <SIcon name={this.props.name} width={this.props.width} height={this.props.height} />
                {this.props.text ? <SText width={40} center style={{ top: this.props.topText ? this.props.topText : 20, position: "absolute" }} fontSize={8} >{this.props.text}</SText> : null}

            </SView>
        );
    }
}
