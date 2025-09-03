//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView, SectionList } from 'react-native';
import { SBuscador, SGradient, SInput, SPage, SText, STheme, SView } from 'servisofts-component';
import SIconApp from '../Assets/SIconApp';
import { svg } from '../Assets';
import OtherIcons from "servisofts-component/img/index"
import DateTimeBetween from '../Components/DateTimeBetween';

class test2 extends Component {
    state = {
        search: "",
    }



    render() {
        // const sections = this.getDataGrouped();
        return (
            <SPage disableScroll>
              

                    <DateTimeBetween />

                


            </SPage>
        );
    }
}

export default test2;