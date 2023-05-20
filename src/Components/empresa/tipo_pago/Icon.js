import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SIcon, SList, SLoad, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../Model';

type indexPropsType = {
    type: any,
}
export default class index extends Component<indexPropsType> {
    constructor(props) {
        super(props);
        this.state = {
        };
    }


    render() {
        return (
            <SView col={"xs-12"} center >
                {/* <SIcon name='Add' /> */}
            </SView>
        );
    }
}
