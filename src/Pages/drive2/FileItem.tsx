import React from "react";
import { SIcon, SPage, SText, STheme, SView, SPopup, SNavigation } from "servisofts-component";
import Action, { FileItemType } from "./Action";
import { View, TextInput } from "react-native";

export default class FileItem extends React.Component<{
    path: string,
    name: string,
    open?: boolean,
    type: string,
    onOpen?: (file: FileItemType) => void,
    onRefresh?: () => void,
    selectedPath?: string | null,
    onSelect?: (path: string) => void
}> {

    state: {
        data: FileItemType[] | null,
        open: boolean,
        isRenaming: boolean,
        renamingValue: string,
        isDragOver: boolean,
        isHover: boolean,
        isFocused: boolean,
        showContextMenu: boolean,
        contextMenuPos: { x: number, y: number }
    } = {
            data: null,
            open: this.props.open ?? false,
            isRenaming: false,
            renamingValue: this.props.name,
            isDragOver: false,
            isHover: false,
            isFocused: false,
            showContextMenu: false,
            contextMenuPos: { x: 0, y: 0 }
        }
    componentDidMount(): void {
        if (this.state.open) this.loadData();
    }

    handleKeyDown = (e: any) => {
        const isSelected = this.props.selectedPath === this.props.path;
        if (!isSelected || this.state.isRenaming) return;
        console.log(e.key)
        if (e.key === 'F2' || e.key === 'Enter') {
            console.log("rename")
            e.preventDefault();
            e.stopPropagation();
            this.setState({ isRenaming: true, renamingValue: this.props.name });
            return;
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault();
            e.stopPropagation();
            this.handleDelete();
            return;
        }
    }
    loadData = async () => {
        const resp = await Action.ls({
            path: this.props.path
        })
        this.setState({ data: resp });
        console.log("resp", resp);
    }

    handleRename = async () => {
        if (this.state.renamingValue === this.props.name || !this.state.renamingValue.trim()) {
            this.setState({ isRenaming: false, renamingValue: this.props.name });
            return;
        }

        try {
            const pathParts = this.props.path.split("/");
            pathParts[pathParts.length - 1] = this.state.renamingValue;
            const newPath = pathParts.join("/");

            await Action.mv({
                path: this.props.path,
                path_to: newPath
            });

            this.setState({ isRenaming: false });
            if (this.props.onRefresh) this.props.onRefresh();
        } catch (error) {
            console.error("Error renaming:", error);
            this.setState({ isRenaming: false, renamingValue: this.props.name });
        }
    }

    handleDelete = () => {
        SPopup.confirm({
            title: "Eliminar",
            message: `¿Estás seguro de eliminar "${this.props.name}"?`,
            onPress: async () => {
                try {
                    await Action.papelera({
                        path: this.props.path
                    });
                    if (this.props.onRefresh) this.props.onRefresh();
                } catch (error) {
                    console.error("Error deleting:", error);
                    SPopup.alert("Error al eliminar el archivo");
                }
            }
        });
    }

    handleDragStart = (e: any) => {
        e.dataTransfer.setData("filePath", this.props.path);
        e.dataTransfer.setData("fileType", this.props.type);
        e.dataTransfer.effectAllowed = "move";
    }

    handleDragOver = (e: any) => {
        if (this.props.type === "directory") {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            this.setState({ isDragOver: true });
        }
    }

    handleDragLeave = () => {
        this.setState({ isDragOver: false });
    }

    handleDrop = async (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({ isDragOver: false });

        if (this.props.type !== "directory") return;

        const draggedPath = e.dataTransfer.getData("filePath");
        if (!draggedPath || draggedPath === this.props.path) return;

        // Evitar mover una carpeta dentro de sí misma
        if (draggedPath && this.props.path.startsWith(draggedPath)) {
            SPopup.alert("No puedes mover una carpeta dentro de sí misma");
            return;
        }

        try {
            const fileName = draggedPath.split("/").pop();
            const newPath = this.props.path + "/" + fileName;

            await Action.mv({
                path: draggedPath,
                path_to: newPath
            });

            if (this.props.onRefresh) this.props.onRefresh();
        } catch (error) {
            console.error("Error moving file:", error);
            SPopup.alert("Error al mover el archivo");
        }
    }

    handleContextMenu = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({
            showContextMenu: true,
            contextMenuPos: { x: e.clientX, y: e.clientY }
        });
    }
    renderChildrens() {
        if (!this.state.data) return <SText>Cargando...</SText>
        return this.state.data.sort((a, b) => {
            if (a.type == "directory" && b.type == "directory") {
                return a.name.localeCompare(b.name);
            } else if (a.type == "directory") {
                return -1;
            } else if (b.type == "directory") {
                return 1;
            } else {
                return a.name.localeCompare(b.name);
            }
        }).filter(a => {
            if (a.name.startsWith(".")) return false;
            return true;
        }).map((item, index) => {
            return <FileItem
                key={index}
                name={item.name}
                path={this.props.path + "/" + item.name}
                type={item.type}
                onOpen={this.props.onOpen}
                onRefresh={this.loadData}
                selectedPath={this.props.selectedPath}
                onSelect={this.props.onSelect}
            />
        })
    }

    renderContextMenu() {
        if (!this.state.showContextMenu) return null;

        return <View style={{
            position: "fixed",
            top: this.state.contextMenuPos.y,
            left: this.state.contextMenuPos.x,
            backgroundColor: STheme.color.card,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: STheme.color.lightGray + "44",
            minWidth: 160,
            zIndex: 9999,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
        }}>
            <SView
                padding={8}
                row
                style={{ alignItems: "center", justifyContent: "space-between" }}
                onPress={() => {
                    this.setState({ showContextMenu: false, isRenaming: true, renamingValue: this.props.name });
                }}
            >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <SIcon name="Edit" width={14} height={14} fill={STheme.color.text} />
                    <SView width={8} />
                    <SText fontSize={13}>Renombrar</SText>
                </View>
                <SText fontSize={11} color={STheme.color.lightGray}>Enter</SText>
            </SView>
            <View style={{ height: 1, backgroundColor: STheme.color.lightGray + "22" }} />
            <SView
                padding={8}
                row
                style={{ alignItems: "center", justifyContent: "space-between" }}
                onPress={() => {
                    this.setState({ showContextMenu: false });
                    this.handleDelete();
                }}
            >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <SIcon name="Delete" width={14} height={14} fill={STheme.color.danger} />
                    <SView width={8} />
                    <SText fontSize={13} color={STheme.color.danger}>Eliminar</SText>
                </View>
                <SText fontSize={11} color={STheme.color.lightGray}>⌫</SText>
            </SView>
        </View>
    }
    handlePress = () => {
        if (this.state.isRenaming) return;

        // Marcar como seleccionado
        if (this.props.onSelect) {
            this.props.onSelect(this.props.path);
        }

        // Ejecutar acción inmediatamente
        if (this.props.type == "directory") {
            if (!this.state.data) {
                this.loadData();
            }
            this.setState({ open: !this.state.open });
        } else {
            if (this.props.onOpen) {
                this.props.onOpen({
                    path: this.props.path,
                    name: this.props.name,
                    type: this.props.type,
                    lastModified: 0
                });
            }
        }
    }

    renderNameContent() {
        if (this.state.isRenaming) {
            return <TextInput
                value={this.state.renamingValue}
                onChangeText={(text) => this.setState({ renamingValue: text })}
                onBlur={this.handleRename}
                onSubmitEditing={this.handleRename}
                autoFocus
                selectTextOnFocus
                style={{
                    // flex: 1,
                    color: STheme.color.text,
                    fontSize: 13,
                    fontFamily: "Poppins",
                    backgroundColor: STheme.color.primary + "33",
                    paddingHorizontal: 4,
                    paddingVertical: 2,
                    borderRadius: 2,
                    outline: "none",
                }}
                onKeyPress={(e: any) => {
                    if (e.key === "Escape") {
                        this.setState({ isRenaming: false, renamingValue: this.props.name });
                    }
                }}
            />
        }

        return <SText font="Poppins" fontSize={13} numberOfLines={1}>{this.props.name}</SText>
    }
    render() {
        const isSelected = this.props.selectedPath === this.props.path;
        const bgColor = this.state.isDragOver
            ? STheme.color.primary + "44"
            : isSelected
                ? STheme.color.primary + "33"
                : this.state.isFocused
                    ? STheme.color.primary + "22"
                    : this.state.isHover
                        ? STheme.color.card
                        : "transparent";

        return <>
            {this.state.showContextMenu && <View
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 9998,
                }}
                // @ts-ignore
                onClick={() => this.setState({ showContextMenu: false })}
            />}
            {this.renderContextMenu()}

            <View style={{ width: "100%" }}>
                <SView
                    padding={4}
                    paddingVertical={2}
                    width={"100%"}
                    style={{
                        alignItems: "center",
                        backgroundColor: bgColor,
                        borderRadius: 2,
                        cursor: this.state.isRenaming ? "text" : "pointer",
                        transition: "background-color 0.1s ease",
                        outline: this.state.isFocused ? `1px solid ${STheme.color.text}66` : "none",
                    }}
                    onPress={(e) => {
                        // @ts-ignore
                        console.log(e)
                        if (e?.key === 'Enter') {
                            // Si es Enter, lo maneja handleKeyDown
                            this.handleKeyDown(e);
                            return;
                        }
                        this.handlePress();
                    }}
                    // @ts-ignore
                    tabIndex={0}
                    onFocus={() => this.setState({ isFocused: true })}
                    onBlur={() => this.setState({ isFocused: false })}
                    // onKeyDown={this.handleKeyDown}
                    onMouseEnter={() => this.setState({ isHover: true })}
                    onMouseLeave={() => this.setState({ isHover: false })}
                    draggable={!this.state.isRenaming}
                    onDragStart={this.handleDragStart}
                    onDragOver={this.handleDragOver}
                    onDragLeave={this.handleDragLeave}
                    onDrop={this.handleDrop}
                    onContextMenu={this.handleContextMenu}
                    row
                >
                    <SView width={18} height center>
                        {this.props.type == "directory" && <SView style={{
                            width: 16,
                            height: 12,
                            transform: [
                                { rotate: this.state.open ? "-90deg" : "180deg" }
                            ]
                        }} center>
                            <SIcon name='Back' fill={STheme.color.text} width={12} height={12} />
                        </SView>
                        }
                        {this.props.type != "directory" && <SView style={{
                            width: 16,
                            height: 12,
                        }} center>
                            <SText fontSize={8} color={STheme.color.warning} font="Poppins-Medium">{Action.getExtencion(this.props.name).toUpperCase()}</SText>
                        </SView>}
                    </SView>
                    <SView width={6} />
                    {this.renderNameContent()}
                </SView>
                {this.state.open &&
                    <View style={{ width: "100%", flexDirection: "row" }} >
                        <SView width={12} />
                        <View style={{ width: 1, backgroundColor: STheme.color.lightGray + "44" }} />
                        <View style={{ flex: 1 }} >
                            {this.renderChildrens()}
                        </View>
                    </View>
                }
            </View >
        </>
    }
}