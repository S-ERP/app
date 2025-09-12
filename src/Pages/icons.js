//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView, SectionList } from 'react-native';
import { SBuscador, SGradient, SInput, SPage, SText, STheme, SView } from 'servisofts-component';
import SIconApp from '../Assets/SIconApp';
import { svg } from '../Assets';
import OtherIcons from "servisofts-component/img/index"

class lookicons extends Component {
    state = {
        search: "",
    }

    getDataGrouped = () => {
        const nombresDeIconos = [...Object.keys(svg), ...Object.keys(OtherIcons)];
        const filtrados = nombresDeIconos.filter((nombre) => {
            if (!this.state.search) return true;
            return nombre.toLowerCase().includes(this.state.search.toLowerCase());
        });

        const agrupados = {};
        filtrados.sort((a, b) => a.localeCompare(b)).forEach((nombre) => {
            const letra = nombre[0].toUpperCase();
            if (!agrupados[letra]) agrupados[letra] = [];
            agrupados[letra].push({ key: nombre });
        });

        return Object.keys(agrupados).sort().map(letra => ({
            title: letra,
            data: agrupados[letra]
        }));
    }

    renderItem = ({ item }) => (
        <View style={{ width: 50, padding: 2 }}>
            <View style={{ justifyContent: "center", alignItems: "center" }}>
                <SView col="xs-12" colSquare style={{ padding: 4 }}>
                    <SIconApp name={item.key} fill={this.state.fill ?? STheme.color.text}  />
                </SView>
                <SText col="xs-12" fontSize={8} center numberOfLines={1}>{item.key}</SText>
            </View>
        </View>
    );

    renderSectionHeader = ({ section: { title, data } }) => {
        return <SView col={"xs-12"} style={{
            // borderTopWidth: 1,
            borderBottomWidth: 1,
            borderBottomColor: STheme.color.card,
        }}>
            <SText style={{ padding: 4, fontWeight: 'bold' }}>{title}</SText>
            <SView col="xs-12" row style={{ justifyContent: "flex-start", flexWrap: "wrap" }}>
                {data.map(a => this.renderItem({ item: a }))}
            </SView>
        </SView>
    }

    render() {
        const sections = this.getDataGrouped();
        return (
            <SPage disableScroll>
                <SView col="xs-12" style={{ alignItems: "flex-end" }} row>
                    <SView padding={4}>
                        <SInput label={"Fill"} type='color' defaultValue={STheme.color.text} onChangeText={e => {
                            this.setState({ fill: e });
                        }} />
                    </SView>
                    <SView padding={4}>
                        <SInput label={"Stroke"} type='color' defaultValue={STheme.color.text} onChangeText={e => {
                            this.setState({ stroke: e });
                        }} />
                    </SView>
                    <SView flex />

                    <SView col="xs-12" style={{ maxWidth: 300, padding: 4 }}>
                        <SBuscador data={sections.flatMap(s => s.data.map(d => d.key))} onChange={e => this.setState({ search: e })} />
                    </SView>
                </SView>

                <SectionList
                    sections={sections}
                    keyExtractor={(item) => item.key}
                    renderItem={() => null}
                    renderSectionHeader={this.renderSectionHeader}
                />
            </SPage>
        );
    }
}

export default lookicons;