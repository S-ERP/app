import React, { Component } from 'react';
import { View, Text, Linking, ScrollView, FlatList } from 'react-native';
import { SDate, SHr, SIcon, SList, SLoad, SNavigation, SPage, SText, STheme, SThread, SView } from 'servisofts-component';
import ListItem from './Components/ListItem';
import { Actions } from '.';
import AddButtom from './Components/AddButtom';
import TypeFolder from './Components/TypeFolder';
import TypeFile from './Components/TypeFile';
import MDL from '../../MDL';

export default class root extends Component {
    constructor(props) {
        super(props);
        Actions.root_path = "/serp/" + MDL.empresa.select.key;
        this.state = {
            path: SNavigation.getParam("path", this.props.path ?? "/"),
        };
    }

    componentDidMount() {
        Actions.get({ path: Actions.root_path + "" + this.state.path })
            .then(e => {
                this.setState({ file: e })
            })
            .catch(e => {
                if (e?.error == "La ruta especificada no contiene archivos ni carpetas.") {
                    Actions.mkdir({ path: Actions.root_path + "" + this.state.path }).then(e => {
                        this.componentDidMount();
                    }).catch(e => {
                        console.error(e);
                    })

                }
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
