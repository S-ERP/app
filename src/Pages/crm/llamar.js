import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SLoad, SPage, SText } from 'servisofts-component';

export default class llamar extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return <SPage title={"Llamar"} center>
            <SLoad />
            <SHr h={64} />
            <SText fontSize={22}>{"Buscando un lead para llamar..."}</SText>
        </SPage>
    }
}
