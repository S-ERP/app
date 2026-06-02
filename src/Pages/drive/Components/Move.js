import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import { SHr, SIcon, SNotification, SPopup, SText, STheme, SView } from 'servisofts-component';
import { Actions } from '..';

export default class Move extends Component {
    static KEYPOPUP = "MovePopup"
    static close() { SPopup.close(Move.KEYPOPUP) }
    static open({ path, obj, onEvent }) {
        SPopup.open({
            key: Move.KEYPOPUP,
            content: <Move path={path} obj={obj} onEvent={onEvent} />
        })
    }

    constructor(props) {
        super(props);
        this.state = {
            browsePath: "/",
            items: [],
            loading: true,
            moving: false,
        };
    }

    componentDidMount() {
        this.loadFolder("/");
    }

    loadFolder(path) {
        this.setState({ loading: true, browsePath: path });
        Actions.ls({ path: Actions.root_path + path })
            .then(data => {
                const items = (data ?? []).sort((a, b) => {
                    if (a.type === "directory" && b.type !== "directory") return -1;
                    if (a.type !== "directory" && b.type === "directory") return 1;
                    return a.name.localeCompare(b.name);
                });
                this.setState({ items, loading: false });
            })
            .catch(e => {
                this.setState({ loading: false });
                console.error(e);
            });
    }

    navigateTo(folderName) {
        const { browsePath } = this.state;
        const newPath = browsePath === "/" ? "/" + folderName : browsePath + "/" + folderName;
        this.loadFolder(newPath);
    }

    navigateToSegment(index) {
        const { browsePath } = this.state;
        if (index < 0) { this.loadFolder("/"); return; }
        const segments = browsePath.split("/").filter(Boolean);
        const targetPath = "/" + segments.slice(0, index + 1).join("/");
        this.loadFolder(targetPath);
    }

    handleMover() {
        const { browsePath, moving } = this.state;
        if (moving) return;
        const pathfinalFrom = !this.props.path
            ? this.props?.obj?.name
            : this.props.path + "/" + this.props?.obj?.name;
        const path_to = Actions.root_path + (browsePath === "/" ? "/" : browsePath + "/") + this.props.obj.name;

        this.setState({ moving: true });
        Actions.mv({
            path: Actions.root_path + pathfinalFrom,
            path_to,
        }).then(() => {
            if (this.props.onEvent) this.props.onEvent("delete", null);
            Move.close();
        }).catch(e => {
            this.setState({ moving: false });
            SNotification.send({
                title: "Error al mover",
                body: e.error,
                color: STheme.color.danger,
                time: 5000,
            });
        });
    }

    renderBreadcrumb() {
        const { browsePath } = this.state;
        const segments = browsePath === "/" ? [] : browsePath.split("/").filter(Boolean);

        return <SView col={"xs-12"} row style={{ alignItems: "center", flexWrap: "wrap", gap: 2, backgroundColor: STheme.color.card, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8 }}>
            {/* Root */}
            <SView row style={{ alignItems: "center" }}>
                <SText
                    fontSize={13}
                    bold={segments.length === 0}
                    color={segments.length === 0 ? STheme.color.primary : STheme.color.text}
                    onPress={() => this.navigateToSegment(-1)}
                    style={{ cursor: "pointer" }}
                >
                    Inicio
                </SText>
            </SView>

            {segments.map((seg, i) => {
                const isLast = i === segments.length - 1;
                return <SView key={i} row style={{ alignItems: "center" }}>
                    <SText fontSize={12} color={STheme.color.gray} style={{ marginHorizontal: 4 }}>›</SText>
                    <SText
                        fontSize={13}
                        bold={isLast}
                        color={isLast ? STheme.color.primary : STheme.color.text}
                        onPress={() => !isLast && this.navigateToSegment(i)}
                        style={{ cursor: isLast ? "default" : "pointer" }}
                        numberOfLines={1}
                    >
                        {seg}
                    </SText>
                </SView>;
            })}
        </SView>;
    }

    renderItem(item) {
        const isDir = item.type === "directory";
        const isMovingItem = item.name === this.props.obj?.name;
        return <SView key={item.name} col={"xs-12"} row
            style={{
                alignItems: "center",
                paddingVertical: 9,
                paddingHorizontal: 12,
                borderBottomWidth: 1,
                borderColor: STheme.color.card,
                opacity: (!isDir || isMovingItem) ? 0.35 : 1,
                cursor: isDir && !isMovingItem ? "pointer" : "default",
            }}
            onPress={isDir && !isMovingItem ? () => this.navigateTo(item.name) : undefined}
        >
            <SView width={22} height={22}>
                <SIcon name={isDir ? "drive-folder" : "drive-file"} fill={isDir ? STheme.color.text : STheme.color.gray} />
            </SView>
            <SView width={10} />
            <SText fontSize={13} style={{ flex: 1 }} numberOfLines={1} color={isDir ? STheme.color.text : STheme.color.gray}>
                {item.name}
            </SText>
            {isDir && !isMovingItem && (
                <SView width={16} height={16}>
                    <SIcon name='ArrowRight' fill={STheme.color.gray} />
                </SView>
            )}
        </SView>;
    }

    render() {
        const { browsePath, items, loading, moving } = this.state;

        // Check if destination is already the file's current parent
        const currentParent = !this.props.path ? "/" : this.props.path;
        const sameLocation = browsePath === currentParent;

        return <SView col={"xs-11 sm-8 md-6"} backgroundColor={STheme.color.background} withoutFeedback padding={16} style={{ borderRadius: 16 }}>

            {/* Title */}
            <SView col={"xs-12"} row style={{ alignItems: "center" }}>
                <SView width={28} height={28} center
                    style={{ opacity: browsePath === "/" ? 0.3 : 1, cursor: browsePath === "/" ? "default" : "pointer", borderRadius: 6, backgroundColor: STheme.color.card }}
                    onPress={() => {
                        if (browsePath === "/") return;
                        const trimmed = browsePath.endsWith("/") ? browsePath.slice(0, -1) : browsePath;
                        const lastSlash = trimmed.lastIndexOf("/");
                        this.loadFolder(lastSlash <= 0 ? "/" : trimmed.slice(0, lastSlash));
                    }}
                >
                    <SIcon name='Arrow' fill={STheme.color.text} />
                </SView>
                <SView width={10} />
                <SText bold fontSize={15} style={{ flex: 1 }} numberOfLines={1}>Mover "{this.props.obj?.name}"</SText>
                <SView width={28} height={28} center style={{ cursor: "pointer", borderRadius: 6, backgroundColor: STheme.color.card }} onPress={() => Move.close()}>
                    <SIcon name='Close' fill={STheme.color.gray} />
                </SView>
            </SView>

            <SHr h={12} />
            {this.renderBreadcrumb()}
            <SHr h={8} />

            {/* Folder list */}
            <SView col={"xs-12"} style={{ height: 300, borderRadius: 8, overflow: "hidden", borderWidth: 1, borderColor: STheme.color.card }}>
                <ScrollView>
                    {loading ? (
                        <SView col={"xs-12"} center style={{ padding: 32 }}>
                            <SText color={STheme.color.gray} fontSize={13}>Cargando...</SText>
                        </SView>
                    ) : items.length === 0 ? (
                        <SView col={"xs-12"} center style={{ padding: 32 }}>
                            <SText color={STheme.color.gray} fontSize={13}>Carpeta vacía</SText>
                        </SView>
                    ) : items.map(item => this.renderItem(item))}
                </ScrollView>
            </SView>

            <SHr h={12} />

            {/* Destination hint */}
            <SView col={"xs-12"} style={{ backgroundColor: STheme.color.card, borderRadius: 6, padding: 8 }}>
                <SText fontSize={11} color={STheme.color.gray}>Destino: <SText fontSize={11} color={STheme.color.text}>{browsePath}</SText></SText>
            </SView>

            <SHr h={12} />

            {/* Actions */}
            <SView col={"xs-12"} row style={{ justifyContent: "flex-end", alignItems: "center" }}>
                <SText padding={8} color={STheme.color.gray} fontSize={13} onPress={() => Move.close()} style={{ cursor: "pointer" }}>Cancelar</SText>
                <SView width={10} />
                <SView height={36} style={{
                    paddingHorizontal: 18,
                    borderRadius: 8,
                    backgroundColor: (sameLocation || moving) ? STheme.color.card : STheme.color.primary,
                    justifyContent: "center",
                    cursor: (sameLocation || moving) ? "default" : "pointer",
                }}
                    onPress={!sameLocation && !moving ? () => this.handleMover() : undefined}
                >
                    <SText color={sameLocation || moving ? STheme.color.gray : "#fff"} bold fontSize={13}>
                        {moving ? "Moviendo..." : sameLocation ? "Ya está aquí" : "Mover aquí"}
                    </SText>
                </SView>
            </SView>
        </SView>;
    }
}


