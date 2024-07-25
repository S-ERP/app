import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SLoad, SPage, SView } from 'servisofts-component';
import Main from './Main';

export default class world extends Component<any> {
    state = {
        layout: null
    };
    constructor(props: any) {
        super(props);
    }

    handleLayout(e: any) {
        const { layout } = e.nativeEvent;
        this.setState({ layout })
    }
    render() {
        return <SPage title={"world"} disableScroll>
            <SView col={"xs-12"} flex onLayout={this.handleLayout.bind(this)} center>
                {!this.state.layout ? <SLoad /> : <Main layout={this.state.layout} />}
            </SView>
        </SPage>
    }
}
