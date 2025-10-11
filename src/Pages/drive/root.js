import React, { Component } from 'react';
import { View, Text, Linking, ScrollView, FlatList } from 'react-native';
import { SDate, SHr, SIcon, SList, SLoad, SNavigation, SNotification, SPage, SText, STheme, SThread, SView } from 'servisofts-component';
import ListItem from './Components/ListItem';
import { Actions } from '.';
import AddButtom from './Components/AddButtom';
import TypeFolder from './Components/TypeFolder';
import TypeFile from './Components/TypeFile';
import MDL from '../../MDL';
import Model from '../../Model';

export default class root extends Component {
    key_empresa = SNavigation.getParam("key_empresa", "");
    constructor(props) {
        super(props);
        Actions.root_path = "/serp/" + MDL.empresa?.select?.key;
        this.state = {
            path: SNavigation.getParam("path", this.props.path || "/"),
        };
    }

    componentDidMount() {

        if (!!this.key_empresa) {
            if (this.key_empresa != MDL.empresa?.select?.key) {
                console.log("hay que cambiar de empresa");
                const currentRouteParams = SNavigation.getAllParams();
                Model.empresa.Action.changeEmpresaByKey(this.key_empresa).then(e => {
                    new SThread(1000, "navegando", false).start(() => {
                        SNavigation.navigate("/drive", currentRouteParams)
                    })
                    console.log("Acabo")
                }).catch(e => {
                    console.log("error al cambiar de empresa", e)
                })
            }
        }
        if (!MDL.empresa?.select?.key) {
            SNavigation.navigate("/login")
            return;
        }
        Actions.get({ path: Actions.root_path + "" + this.state.path })
            .then(e => {
                this.setState({ file: e })
            })
            .catch(e => {
                console.log(Actions.root_path, Actions.root_path + "" + this.state.pat)
                if (e?.error == "La ruta especificada no contiene archivos ni carpetas." && Actions.root_path + "/" == Actions.root_path + "" + (this.state.path)) {
                    Actions.mkdir({ path: Actions.root_path + "" + this.state.path }).then(e => {
                        this.componentDidMount();
                    }).catch(e => {
                        console.error(e);
                    })
                    return;
                }
                SNotification.send({
                    title: "Error",
                    body: e?.error,
                    color: STheme.color.danger,
                    time: 5000,
                })
                SNavigation.goBack();
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
