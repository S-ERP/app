import React, { Component } from 'react';
import { View, Text, Linking, ScrollView, FlatList } from 'react-native';
import { SDate, SHr, SIcon, SList, SLoad, SNavigation, SPage, SText, STheme, SThread, SView } from 'servisofts-component';
import ListItem from './Components/ListItem';
import { Actions } from '.';
import AddButtom from './Components/AddButtom';
import TypeFolder from './Components/TypeFolder';
import TypeFile from './Components/TypeFile';

export default class root extends Component {
    constructor(props) {
        super(props);
        this.state = {
            path: SNavigation.getParam("path", this.props.path ?? "/"),
        };
    }

    componentDidMount() {
        Actions.get({ path: this.state.path })
            .then(e => {
                this.setState({ file: e })
            })
            .catch(e => {
                console.error(e);
                // SNavigation.goBack();
            })
    }

    render() {
        if (!this.state.file) return <SPage title={this.state.path}>
            <SLoad />
        </SPage>
        const { type } = this.state.file;
        if (type == "directory") return <TypeFolder path={this.state.path} file={this.state.file} />
        return <TypeFile path={this.state.path} file={this.state.file} />
        return <SView>
            <SText>ERROR</SText>
        </SView>

    }
}
