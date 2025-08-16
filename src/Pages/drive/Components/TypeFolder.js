import React, { Component } from 'react';
import { View, Text, Linking, ScrollView, FlatList } from 'react-native';
import { SDate, SHr, SIcon, SInput, SList, SNavigation, SPage, SText, STheme, SThread, SView } from 'servisofts-component';
import ListItem from './ListItem';
import { Actions } from '../index';
import AddButtom from './AddButtom';
import SUpload, { DBUploadTask, SUploadFileDrop } from '../../../Components/SUpload';
import SSocket from 'servisofts-socket';
import ListItem2 from './ListItem2';

export default class TypeFolder extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showHidden: false,
            time: new Date().getTime(),
            buscador: "",
            realTime: false,
            data: []
        };
    }

    loadData() {
        Actions.ls({ path: Actions.root_path + "" +this.props.path })
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
    componentDidMount() {
        this.isrun = true;
        this.loadData();
        this.hilo();

    }
    componentWillUnmount() {
        this.isrun = false;
    }
    async hilo() {
        if (!this.isrun) return;
        new SThread(2000, "cambios", false).start(() => {
            if (!this.isrun) return;
            if(this.state.realTime){
                this.loadData();
            }
            this.hilo();
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

    renderBtnOption({ key, icon, activeLabel, toggleLabel }) {
        return <SView row height={26} center onPress={() => this.setState({ [key]: !this.state[key] })} style={{ borderBottomWidth: 1, borderColor: !!this.state[key] ? STheme.color.gray : STheme.color.card }}>
            <SView width={12} height={12} >
                <SIcon name={icon} fill={!!this.state[key] ? STheme.color.text : STheme.color.gray} />
            </SView>
            <SView width={4} />
            <SText fontSize={12} color={!!this.state[key] ? STheme.color.text : STheme.color.gray} >{!this.state[key] ? activeLabel : toggleLabel}</SText>

        </SView>
    }

    render() {
        return <SPage title={this.props.path} disableScroll>
            <SUploadFileDrop
                onChange={(e) => {
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
                    <SView col={"xs-12"} backgroundColor={STheme.color.barColor} row padding={8}>
                        <SView height={26} center row onPress={() => this.componentDidMount()}>
                            <SIcon name='Reload' width={10} height={10} fill={STheme.color.text} />
                            <SView width={4} />
                            <SText fontSize={10} color={STheme.color.text} >{"RELOAD"}</SText>
                        </SView>
                        <SView width={16} />

                        {this.renderBtnOption({
                            icon: "Eyes",
                            key: "showHidden",
                            activeLabel: "Ver ocultos",
                            toggleLabel: "Esconder ocultos"
                        })}
                        <SView width={16} />
                        {this.renderBtnOption({
                            icon: "Wifi",
                            key: "realTime",
                            activeLabel: "Real Time",
                            toggleLabel: "Reat Time"
                        })}


                        <SView flex />
                        <SView height={26} center >
                            <SInput height={26}
                                style={{ fontSize: 12 }}
                                placeholder={"Buscar..."}
                                icon={<SIcon fill={STheme.color.gray} name='Search' height={22} />}
                                onChangeText={(e) => {
                                    this.setState({ buscador: e })
                                }}
                            />
                        </SView>
                    </SView>
                    <FlatList
                        data={this.state.data.filter(a => (!(a.name ?? "").startsWith(".") || this.state.showHidden) && (a.name.toLowerCase().indexOf(this.state.buscador.toLowerCase()) > -1)).sort((a, b) => a.name > b.name ? 1 : -1)}
                        // ItemSeparatorComponent={() => <SHr h={4} />}
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
                        // numColumns={6}
                        renderItem={({ item, index }) => {
                            return <ListItem  numColumns={6} index={index} width={this.state?.layout?.width} obj={item} path={this.props.path}
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
