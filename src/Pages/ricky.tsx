import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SPage } from 'servisofts-component';
import TextArea from '../Components/QueryTool/TextArea';


const text = `
`


export default class ricky extends Component {

    render() {
        return <SPage>
            <TextArea
                pk="ricky"
                type='MD'
                defaultValue={text}
            />
        </SPage>
    }
}
