import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SView } from 'servisofts-component';

export default class PDFViewer extends Component<{ src: string }> {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <SView col={"xs-12"} height>
                <iframe style={{ height: "100%" }} src={this.props.src} />
            </SView>
        );
    }
}
