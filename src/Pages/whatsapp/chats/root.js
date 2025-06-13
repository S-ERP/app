import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SNavigation, SPage, SText } from 'servisofts-component';
import MDL from '../../../MDL';

export default class root extends Component {

    pk = SNavigation.getParam("pk");

    componentDidMount(){
        
    }
    render() {
        return <SPage title={"Whatsapp Chats"} disableScroll>
            <SText>{this.pk}</SText>
        </SPage>
    }
}
