import React, { Component } from 'react';
import { View, Text, Linking, ScrollView, FlatList } from 'react-native';
import { SDate, SHr, SIcon, SList, SNavigation, SPage, SText, STheme, SThread, SView } from 'servisofts-component';
import ListItem from './ListItem';
import { Actions } from '../index';
import AddButtom from './AddButtom';
import SUpload, { DBUploadTask, SUploadFileDrop } from '../../../Components/SUpload';
import SSocket from 'servisofts-socket';

export default class TypeFolder extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showHidden: false,
            time: new Date().getTime(),
            data: []
        };
    }

    componentDidMount() {
        Actions.ls({ path: this.props.path })
            .then(e => {
                let extras = Object.values(DBUploadTask)
                    .filter(a => {
                        const filePath = a.props?.path ?? "";
                        const isSameFolder = filePath.startsWith(this.props.path) &&
                            filePath.slice(this.props.path.length + 1).indexOf('/') === -1;
                        const fileExists = e.some(z => z.name === a.props.file.name);
                        return isSameFolder && !fileExists;
                    })
                    .map(a => a.file) ?? [];
                // Crear el array final combinando los archivos existentes y los extras
                let array_final = [...e, ...extras];
                this.setState({ data: array_final });
            })
            .catch(e => {
                console.error(e);
                // SNavigation.goBack();
            })
    }
    handleEvent = (evt, data, item) => {
        if (evt == "delete") {
            this.setState(prevState => ({
                data: prevState.data.filter(dataItem => dataItem.name !== item.name)
            }));
        }
        if (evt == "new_folder") {
            this.setState(prevState => ({
                data: [...prevState.data.filter(dataItem => dataItem.name !== data.name), data]
            }));
        }
        if (evt == "submit_file") {
            this.setState(prevState => ({
                time: new Date().getTime(),
                data: [...prevState.data.filter(dataItem => dataItem.name !== data.name), data]
            }));
        }
        if (evt == "change_name") {
            this.setState(prevState => ({
                data: prevState.data.map((obj) => {
                    if (obj.name != item.name) return obj;
                    return { ...obj, ...data }
                })
            }));
        }
    }

    render() {
        return <SPage title={this.props.path} disableScroll>
            <SUploadFileDrop onChange={(e) => {
                // console.error(e);
                // return;
                if (!e) return;
                for (let i = 0; i < e.length; i++) {
                    const file = e[i];
                    console.log(file)
                    let finalName = (file?.fullPath ?? file.name);
                    let pathfinal = this.props.path + (this.props.path == "/" ? encodeURI(finalName) : "/" + encodeURI(finalName))
                    const submite = SUpload.submitFile({
                        host: SSocket.api.drive + "uploadv2",
                        path: pathfinal,
                        file: file
                    })
                    if (this.handleEvent) {
                        if (finalName == file.name) {
                            this.handleEvent("submit_file", {
                                "size": file.size,
                                "name": file?.name,
                                "lastModified": file.lastModified ?? new SDate().getTime(),
                                "type": file.type,
                                "submite_key": submite.key
                            })
                        } else {
                            let parts = finalName.split("/");
                            if (parts.length > 1) {
                                this.handleEvent("new_folder", {
                                    "size": 0,
                                    "name": parts[0],
                                    "lastModified": new SDate().getTime(),
                                    "type": "directory"
                                    // "submite_key": submite.key
                                })
                            }
                        }

                    }
                }
            }}>
                <SView col={"xs-12"} height onLayout={e => {
                    this.setState({ layout: e.nativeEvent.layout })
                }}>
                    <SText onPress={() => this.setState({ showHidden: !this.state.showHidden })}>{!this.state.showHidden ? "Mostrar ocultos" : "Ocultar ocultos"}</SText>
                    <FlatList
                        data={this.state.data.filter(a => !(a.name ?? "").startsWith(".") || this.state.showHidden).sort((a, b) => a.name > b.name ? 1 : -1)}
                        ItemSeparatorComponent={() => <SHr />}
                        // ListHeaderComponent={() => <SView col={"xs-12"} center padding={8} row>
                        //     <SView center>
                        //         <SText >Nombre</SText>
                        //     </SView>
                        //     <SView flex center></SView>
                        //     <SView width={30} height={30} center padding={6}>
                        //         <SIcon name='Menu' fill={STheme.color.gray} />
                        //     </SView>
                        // </SView >
                        // }
                        keyExtractor={e => e.name}
                        renderItem={({ item, index }) => {
                            return <ListItem width={this.state?.layout?.width} obj={item} path={this.props.path}
                                time={this.state.time}
                                onPress={() => {
                                    console.log("Entro")
                                    if (this.active) return null;
                                    new SThread(1000, "asdad", true).start(e => {
                                        this.active = false;
                                    })
                                    console.log("paso")
                                    this.active = true;
                                    let pathfinal = this.props.path + (this.props.path == "/" ? item.name : "/" + item.name)
                                    console.log(pathfinal)
                                    SNavigation.lastRoute.navigation.push("/drive", { path: pathfinal })

                                }}
                                onEvent={(evt, data) => {
                                    this.handleEvent(evt, data, item)

                                }}
                            />
                        }}
                    />
                </SView>
                <AddButtom path={this.props.path} onEvent={(evt, data) => {
                    this.handleEvent(evt, data)
                }} />
            </SUploadFileDrop>
        </SPage>
    }
}
