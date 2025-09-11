//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView, SectionList } from 'react-native';
import { SBuscador, SGradient, SHr, SIcon, SInput, SPage, SText, STheme, SView } from 'servisofts-component';
import SIconApp from '../Assets/SIconApp';
import { svg } from '../Assets';
import OtherIcons from "servisofts-component/img/index"
import DateTimeBetween from '../Components/DateTimeBetween';
import ToolTips from '../Components/ToolTips';

class test2 extends Component {
    state = {
        search: "",
    }

    render() {
        // const sections = this.getDataGrouped();
        return (
            <SPage disableScroll>
                <DateTimeBetween />
                <SHr height={20} />
                <SView col={"xs-12"} center row>
                    <SText>Label - 1</SText>
                    <ToolTips
                        type="info"
                        // descripcion="Este es un tooltip de información Este es un tooltip de información Este es un tooltip de información Este es un tooltip de información"
                        descripcion="Este es un tooltip de información Este es un tooltip de información Este es un tooltip de información Este es un tooltip de información"
                        width={20}
                        height={20}
                        itemWidth={280}
                        itemHeight={50}
                        color={STheme.color.warning}
                        icon={"toolinfo"}
                    />
                </SView>
                <SHr height={20} />
                <SView col={"xs-12"} center row>
                    <SText>Label - 2</SText>
                    <ToolTips
                        type="question"
                        // descripcion="Este es un tooltip de información Este es un tooltip de información Este es un tooltip de información Este es un tooltip de información"
                        descripcion="Este es un tooltip de información"
                        width={20}
                        height={20}
                        
                        color={STheme.color.warning}
                        icon={"toolquestion"}
                        url={"/usuario/table"}
                    />
                </SView>
            </SPage>
        );
    }
}

export default test2;