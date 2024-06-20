import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { Example } from 'servisofts-charts';
import { SPage } from 'servisofts-component';

export default class root extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return <SPage title="Graficos" disableScroll>
            <Example />
        </SPage>
    }
}
