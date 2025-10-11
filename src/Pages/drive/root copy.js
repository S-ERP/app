import React, { Component } from 'react';
import { View, Text, Linking, ScrollView } from 'react-native';
import { SDate, SIcon, SList, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import SUpload from '../../Components/SUpload';
import ListItem from './Components/ListItem';
import MDL from '../../MDL';

export default class root extends Component {
    constructor(props) {
        super(props);
        this.state = {
            path: SNavigation.getParam("path", ""),
            data: [],
            order: { key: "name", order: "asc" }
        };
    }

    componentDidMount() {
        this.getData(this.state.path);
    }
    getData(path) {
        SSocket.sendPromise({
            service: "drive",
            component: "file",
            type: "ls",
            path: path
        }).then(e => {
            this.setState({ data: e.data, path: path })
        }).catch(e => {
            console.error(e);
        })
    }

    handleDelete(path) {
        SSocket.sendPromise({
            service: "drive",
            component: "file",
            type: "rm",
            path: path
        }).then(e => {
            // '
            console.log(e)
            // this.setState({ data: e.data, path: path })
        }).catch(e => {
            console.error(e);
        })

    }
    changeOrder(name) {
        this.setState({ order: { key: name, order: this.state.order.key == name && this.state.order.order == "asc" ? "desc" : "asc" } })
    }
    renderOrderSignal(name) {
        if (this.state.order.key != name) return;
        return this.state.order.order == "asc" ? "⬆️" : "⬇️";
    }
    renderHeader() {
        return <SView col={"xs-12"} padding={6} center row style={{
            borderBottomWidth: 2,
            borderColor: STheme.color.card
        }}>
            <SText flex fontSize={12} onPress={this.changeOrder.bind(this, "name")}>{"Name"} {this.renderOrderSignal("name")}</SText>
            {/* <SText width={70} fontSize={12} onPress={this.changeOrder.bind(this, "type")}>{"Type"} {this.renderOrderSignal("type")}</SText> */}
            <SText width={45} fontSize={12} onPress={this.changeOrder.bind(this, "lastModified")}>{"Mod."} {this.renderOrderSignal("lastModified")}</SText>
            <SText width={45} style={{ textAlign: "right" }} fontSize={12} onPress={this.changeOrder.bind(this, "size")}>{"Size"} {this.renderOrderSignal("size")}</SText>
        </SView>
    }

    goBack() {
        let p = this.state.path
        let arr = p.split("/");
        arr.pop();
        let newPath = arr.join("/");
        // if (!newPath) {
        //     SNavigation.reset("/")
        //     return;
        // }
        SNavigation.navigate("/drive", { path: newPath, key_empresa: MDL.empresa?.select?.key })
        this.getData(newPath);
    }
    renderBar() {
        return <SView col={"xs-12"} row height={30} center>
            <SView width={30} height={30} center padding={4} onPress={this.goBack.bind(this)}>
                <SIcon fill={STheme.color.text} name='Arrow' />
            </SView>
            <SText >/{this.state.path}</SText>
            <SView width={8} />
            <SText card padding={4} onPress={() => {
                SUpload.choose({
                    accept: "*/*",
                    multiple: true
                }).then(e => {
                    console.log("Subir fotos")
                    if (!e) return;
                    for (let i = 0; i < e.length; i++) {
                        const file = e[i];
                        const submite = SUpload.submitFile({
                            host: SSocket.api.drive + "uploadv2",
                            path: "/" + this.state.path + "/" + encodeURI(file?.name),
                            file: file
                        })
                        this.state.data.push({
                            "size": file.size,
                            "name": file?.name,
                            "lastModified": file.lastModified,
                            "type": file.type,
                            "submite_key": submite.key
                        })
                        this.setState({ ...this.state })
                        submite.addListener("complete", () => {
                            this.getData(this.state.path)
                        })
                    }

                }).catch(e => {
                    console.error(e);
                })
            }}>{"SUBIR"}</SText>
            <SView width={8} />
            <SText card padding={4} onPress={() => {
                SSocket.sendPromise({
                    service: "drive",
                    component: "file",
                    type: "mkdir",
                    path: "/" + this.state.path + "/Nuevo folder"
                })
            }}>{"NEW FOLDER"}</SText>
            <SView flex />
        </SView>
    }
    handleReload(path) {
        this.getData(path);
    }
    render() {
        return <SPage title={"Drive"} hidden>
            {this.renderBar()}
            {this.renderHeader()}
            <SList
                buscador
                data={this.state.data}
                order={[this.state.order]}
                space={0}
                render={(obj, k, index) => <ListItem obj={obj} i={index} path={this.state.path}
                    reload={this.handleReload.bind(this)}
                    onDelete={(path) => {
                        this.handleDelete(path)
                    }}
                />}
            />
        </SPage>
    }
}
