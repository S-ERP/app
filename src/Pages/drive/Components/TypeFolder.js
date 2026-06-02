import React, { Component } from 'react';
import { View, Text, Linking, ScrollView, FlatList } from 'react-native';
import { SDate, SHr, SIcon, SInput, SList, SNavigation, SPage, SStorage, SText, STheme, SThread, SView } from 'servisofts-component';
import ListItem from './ListItem';
import ItemIcon from './ItemIcon';
import { Actions } from '../index';
import AddButtom from './AddButtom';
import SUpload, { DBUploadTask, SUploadFileDrop } from '../../../Components/SUpload';
import FloatMenu from '../../../Components/FloatMenu';
import NewFolder from './NewFolder';
import SSocket from 'servisofts-socket';
import ListItem2 from './ListItem2';
import MDL from '../../../MDL';

export default class TypeFolder extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showHidden: false,
            time: new Date().getTime(),
            buscador: "",
            realTime: false,
            data: [],
            viewMode: "list", // "list" | "icons" | "gallery"
            sortBy: "name",   // "name" | "date" | "size"
            sortDir: "asc",   // "asc" | "desc"
        };
    }

    loadData() {
        Actions.ls({ path: Actions.root_path + "" + this.props.path })
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
        SStorage.getItem("drive_view_prefs", (raw) => {
            if (!raw) return;
            try {
                const prefs = typeof raw === "string" ? JSON.parse(raw) : raw;
                this.setState({
                    viewMode: prefs.viewMode ?? "list",
                    sortBy:   prefs.sortBy   ?? "name",
                    sortDir:  prefs.sortDir  ?? "asc",
                });
            } catch (e) {}
        });
    }
    componentWillUnmount() {
        this.isrun = false;
    }
    async hilo() {
        if (!this.isrun) return;
        new SThread(2000, "cambios", false).start(() => {
            if (!this.isrun) return;
            if (this.state.realTime) {
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

    setViewPref(update) {
        this.setState(update, () => {
            SStorage.setItem("drive_view_prefs", JSON.stringify({
                viewMode: this.state.viewMode,
                sortBy:   this.state.sortBy,
                sortDir:  this.state.sortDir,
            }));
        });
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

    renderViewToggle() {
        const modes = [
            { key: "list", label: "☰", title: "Lista" },
            { key: "icons", label: "⊞", title: "Íconos" },
            { key: "gallery", label: "⊟", title: "Galería" },
        ];
        return <SView row style={{ gap: 2 }}>
            {modes.map(m => {
                const active = this.state.viewMode === m.key;
                return <SView
                    key={m.key}
                    height={26}
                    style={{
                        paddingHorizontal: 8,
                        borderRadius: 5,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: active ? STheme.color.secondary : "transparent",
                        borderWidth: 1,
                        borderColor: active ? STheme.color.primary : STheme.color.card,
                    }}
                    onPress={() => this.setViewPref({ viewMode: m.key })}
                >
                    <SText fontSize={14} color={active ? STheme.color.primary : STheme.color.gray}>{m.label}</SText>
                </SView>;
            })}
        </SView>;
    }

    renderSortBtn(label, key, width, align = "flex-start") {
        const active = this.state.sortBy === key;
        const arrow = active ? (this.state.sortDir === "asc" ? " ↑" : " ↓") : "";
        const style = width ? { width, justifyContent: "center", alignItems: align, cursor: "pointer" }
            : { flex: 1, justifyContent: "center", alignItems: align, cursor: "pointer" };
        return <SView
            height
            style={{ justifyContent: "center", alignItems: align, cursor: "pointer" }}
            onPress={() => {
                if (active) {
                    this.setState(s => ({ sortDir: s.sortDir === "asc" ? "desc" : "asc" }));
                } else {
                    this.setState({ sortBy: key, sortDir: "asc" });
                }
            }}
        >
            <SText fontSize={10} bold color={active ? STheme.color.primary : STheme.color.gray}>
                {label}{arrow}
            </SText>
        </SView>;
    }

    renderSortControls() {
        const { sortBy, sortDir } = this.state;
        const fields = [
            { key: "name", label: "Nombre" },
            { key: "date", label: "Fecha" },
            { key: "size", label: "Tamaño" },
        ];
        return <SView row style={{ gap: 4, alignItems: "center" }}>
            <SText fontSize={10} color={STheme.color.gray}>Ordenar:</SText>
            {fields.map(f => {
                const active = sortBy === f.key;
                return <SView
                    key={f.key}
                    height={22}
                    style={{
                        paddingHorizontal: 7,
                        borderRadius: 4,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: active ? STheme.color.secondary : "transparent",
                        borderWidth: 1,
                        borderColor: active ? STheme.color.primary : STheme.color.card,
                        cursor: "pointer",
                    }}
                    onPress={() => {
                        if (active) this.setViewPref({ sortDir: this.state.sortDir === "asc" ? "desc" : "asc" });
                        else this.setViewPref({ sortBy: f.key, sortDir: "asc" });
                    }}
                >
                    <SText fontSize={10} color={active ? STheme.color.primary : STheme.color.gray}>
                        {f.label}{active ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                    </SText>
                </SView>;
            })}
        </SView>;
    }

    renderListHeader() {
        return <SView col={"xs-12"} row style={{
            paddingLeft: 44,
            paddingRight: 0,
            paddingVertical: 4,
            borderBottomWidth: 1,
            borderColor: STheme.color.card,
            backgroundColor: STheme.color.barColor,
        }}>
            <SView style={{ flex: 1, justifyContent: "center" }}>
                <SText fontSize={10} color={STheme.color.gray} bold>NOMBRE</SText>
            </SView>
            <SView width={140} style={{ justifyContent: "center" }}>
                <SText fontSize={10} color={STheme.color.gray} bold>MODIFICADO</SText>
            </SView>
            <SView width={72} style={{ justifyContent: "center", alignItems: "flex-end" }}>
                <SText fontSize={10} color={STheme.color.gray} bold>TAMAÑO</SText>
            </SView>
            <SView width={40} />
        </SView>;
    }

    renderIconItem(item, index) {
        const isDir = item.type === "directory";
        return <SView
            key={item.name}
            style={{
                width: 100,
                height: 100,
                padding: 2,
                alignItems: "center",
            }}
            onPress={() => {
                if (this.active) return;
                this.active = true;
                new SThread(800, "nav_" + item.name, true).start(() => { this.active = false; });
                let pathfinal = this.props.path + (this.props.path === "/" ? item.name : "/" + item.name);
                SNavigation.lastRoute.navigation.push("/drive", { path: pathfinal, key_empresa: MDL.empresa?.select?.key });
            }}
        >
            <SView width={90} height={60} style={{ borderRadius: 8, overflow: "hidden" }}>
                <ItemIcon obj={item} path={Actions.root_path + "" + this.props.path} time={this.state.time} />
            </SView>
            <SText
                fontSize={10}
                color={isDir ? STheme.color.text : STheme.color.text + "cc"}
                style={{ marginTop: 4, textAlign: "center" }}
                numberOfLines={2}
            >{item.name}</SText>
        </SView>;
    }

    renderGalleryItem(item, index) {
        return <SView
            key={item.name}
            col="xs-6 sm-4 md-3 lg-2"
            colSquare
            style={{padding: 4 }}
            onPress={() => {
                if (this.active) return;
                this.active = true;
                new SThread(800, "nav_" + item.name, true).start(() => { this.active = false; });
                let pathfinal = this.props.path + (this.props.path === "/" ? item.name : "/" + item.name);
                SNavigation.lastRoute.navigation.push("/drive", { path: pathfinal, key_empresa: MDL.empresa?.select?.key });
            }}
        >
            <SView style={{
                aspectRatio: 1.1,
                borderRadius: 8,
                overflow: "hidden",
                backgroundColor: STheme.color.card,
                marginBottom: 4,
            }}>
                <ItemIcon obj={item} path={Actions.root_path + "" + this.props.path} time={this.state.time} />
            </SView>
            <SText fontSize={10} color={STheme.color.text} numberOfLines={1}>{item.name}</SText>
        </SView>;
    }

    render() {
        const { viewMode } = this.state;
        const { sortBy, sortDir } = this.state;
        const filteredData = this.state.data
            .filter(a => (!(a.name ?? "").startsWith(".") || this.state.showHidden) && (a.name.toLowerCase().indexOf(this.state.buscador.toLowerCase()) > -1))
            .sort((a, b) => {
                // Folders always first
                if (a.type === "directory" && b.type !== "directory") return -1;
                if (a.type !== "directory" && b.type === "directory") return 1;
                let cmp = 0;
                if (sortBy === "name") cmp = a.name.localeCompare(b.name);
                else if (sortBy === "date") cmp = (a.lastModified ?? 0) - (b.lastModified ?? 0);
                else if (sortBy === "size") cmp = (a.size ?? 0) - (b.size ?? 0);
                return sortDir === "asc" ? cmp : -cmp;
            });

        return <SPage title={this.props.path} disableScroll backAlternative={(e) => {
            const path = this.props.path ?? '/';
            if (path === '/') {
                SNavigation.goBack();
                return;
            }
            const trimmed = path.endsWith('/') ? path.slice(0, -1) : path;
            const lastSlash = trimmed.lastIndexOf('/');
            const parentPath = lastSlash <= 0 ? '/' : trimmed.slice(0, lastSlash);
            SNavigation.lastRoute.navigation.replace('/drive', { path: parentPath, key_empresa: MDL.empresa?.select?.key });
        }}>
            <SUploadFileDrop
                onChange={(e) => {
                    if (!e) return;
                    for (let i = 0; i < e.length; i++) {
                        const file = e[i];
                        let finalName = (file?.fullPath ?? file.name);
                        let pathfinal = Actions.root_path + this.props.path + (this.props.path == "/" ? encodeURI(finalName) : "/" + encodeURI(finalName))
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
                                    })
                                }
                            }
                        }
                    }
                }}>
                <SView col={"xs-12"} height onLayout={e => { this.setState({ layout: e.nativeEvent.layout }) }} onContextMenu={e => {
                        e.preventDefault();
                        FloatMenu.open({
                            e,
                            label: "Nuevo",
                            options: [
                                { label: "Nueva Carpeta", onPress: () => {
                                    NewFolder.open({ path: Actions.root_path + "" + this.props.path, onEvent: (evt, data) => this.handleEvent(evt, data) });
                                }},
                                { label: "Subir Archivo", onPress: () => {
                                    SUpload.choose({ accept: "*/*", multiple: true }).then(files => {
                                        if (!files) return;
                                        for (let i = 0; i < files.length; i++) {
                                            const file = files[i];
                                            const submite = SUpload.submitFile({
                                                host: SSocket.api.drive + "uploadv2",
                                                path: Actions.root_path + this.props.path + "/" + encodeURI(file?.name),
                                                file,
                                            });
                                            this.handleEvent("submit_file", {
                                                size: file.size,
                                                name: file?.name,
                                                lastModified: file.lastModified ?? new SDate().getTime(),
                                                type: file.type,
                                                submite_key: submite.key,
                                            });
                                        }
                                    }).catch(console.error);
                                }},
                                { label: "Recargar", onPress: () => this.loadData() },
                            ]
                        });
                    }}>

                    {/* ── Toolbar ── */}
                    <SView col={"xs-12"} backgroundColor={STheme.color.barColor} row padding={8} style={{ gap: 10, alignItems: "center" }}>
                        <SView height={26} center row onPress={() => this.componentDidMount()} style={{ gap: 4 }}>
                            <SIcon name='Reload' width={10} height={10} fill={STheme.color.text} />
                            <SText fontSize={10} color={STheme.color.text}>RELOAD</SText>
                        </SView>

                        <SView width={1} height={16} style={{ backgroundColor: STheme.color.card }} />

                        {this.renderBtnOption({ icon: "Eyes", key: "showHidden", activeLabel: "Ver ocultos", toggleLabel: "Ocultar" })}
                        {this.renderBtnOption({ icon: "Wifi", key: "realTime", activeLabel: "Real Time", toggleLabel: "Real Time ✓" })}

                        <SView flex />

                        {this.renderViewToggle()}

                        <SView width={1} height={16} style={{ backgroundColor: STheme.color.card }} />

                        {this.renderSortControls()}

                        <SView width={1} height={16} style={{ backgroundColor: STheme.color.card }} />

                        <SView height={26} center>
                            <SInput height={26}
                                style={{ fontSize: 12 }}
                                placeholder={"Buscar..."}
                                icon={<SIcon fill={STheme.color.gray} name='Search' height={22} />}
                                onChangeText={(e) => { this.setState({ buscador: e }) }}
                            />
                        </SView>
                    </SView>

                    {/* ── List header (only in list mode) ── */}
                    {viewMode === "list" && this.renderListHeader()}

                    {/* ── Content ── */}
                    {viewMode === "list" ? (
                        <FlatList
                            key="list"
                            data={filteredData}
                            keyExtractor={e => e.name}
                            renderItem={({ item, index }) => (
                                <ListItem
                                    numColumns={6}
                                    index={index}
                                    width={this.state?.layout?.width}
                                    obj={item}
                                    path={this.props.path}
                                    time={this.state.time}
                                    onPress={() => {
                                        if (this.active) return null;
                                        new SThread(1000, "asdad", true).start(() => { this.active = false; });
                                        this.active = true;
                                        let pathfinal = this.props.path + (this.props.path == "/" ? item.name : "/" + item.name);
                                        SNavigation.lastRoute.navigation.push("/drive", { path: pathfinal, key_empresa: MDL.empresa?.select?.key });
                                    }}
                                    onEvent={(evt, data) => { this.handleEvent(evt, data, item); }}
                                />
                            )}
                        />
                    ) : (
                        <ScrollView>
                            <SView col={"xs-12"} row style={{ flexWrap: "wrap", padding: viewMode === "gallery" ? 8 : 12 }}>
                                {filteredData.map((item, index) =>
                                    viewMode === "icons"
                                        ? this.renderIconItem(item, index)
                                        : this.renderGalleryItem(item, index)
                                )}
                            </SView>
                        </ScrollView>
                    )}
                </SView>
                <AddButtom path={this.props.path} onEvent={(evt, data) => { this.handleEvent(evt, data); }} />
            </SUploadFileDrop>
        </SPage>;
    }
}
