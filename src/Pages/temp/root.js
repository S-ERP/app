//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SPage, SText } from 'servisofts-component';

// create a component
class index extends Component {
    render() {
        return (
            <SPage title={"Temp"}>
                <SText>Hola</SText>
            </SPage>
        );
    }
}


//make this component available to the app
export default index;
