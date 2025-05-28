import React from "react";
import { SIcon, SPage, SText, STheme, SView } from "servisofts-component";
import Action, { FileItemType } from "./Action";
import { View } from "react-native";

export default class FileItem extends React.Component<{ path: string, name: string, open?: boolean, type: string, onOpen?: (file: FileItemType) => void }> {

    state: { data: FileItemType[] | null, open: boolean } = {
        data: null,
        open: this.props.open ?? false
    }
    componentDidMount(): void {
        if (this.state.open) this.loadData();
    }
    loadData = async () => {
        const resp = await Action.ls({
            path: this.props.path
        })
        this.setState({ data: resp });
        console.log("resp", resp);
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
        }).filter(a=>{
            if(a.name.startsWith(".")) return false;
            return true;
        }).map((item, index) => {
            return <FileItem key={index} name={item.name} path={this.props.path + "/" + item.name} type={item.type} onOpen={this.props.onOpen} />
        })
    }
    handlePress = () => {
        if (this.props.type == "directory") {
            if (!this.state.data) {
                this.loadData();
            }
            this.setState({ open: !this.state.open })
        } else {
            if (this.props.onOpen) {
                this.props.onOpen({
                    path: this.props.path,
                    name: this.props.name,
                    type: this.props.type,
                    lastModified: 0
                })
            }
        }
    }
    render() {
        return <View style={{ width: "100%" }}>
            <SView padding={2} width={"100%"} style={{
                alignItems: "center",
            }} onPress={this.handlePress.bind(this)} row >
                <SView width={16} height center>
                    {this.props.type == "directory" && <SView style={{
                        width: 16,
                        height: 12,
                        transform: [
                            { rotate: this.state.open ? "-90deg" : "180deg" }
                        ]
                    }} center>
                        <SIcon name='Back' fill={STheme.color.lightGray} />
                    </SView>
                    }
                    {this.props.type != "directory" && <SView style={{
                        width: 16,
                        height: 12,
                    }} center>
                        <SText fontSize={9} color={STheme.color.warning}>{Action.getExtencion(this.props.name)}</SText>
                    </SView>}
                </SView>
                <SView width={4} />
                <SText font="Poppins" numberOfLines={1}>{this.props.name}</SText>
            </SView>
            {this.state.open &&
                <View style={{ width: "100%", flexDirection: "row" }} >
                    <SView width={9} />
                    <View style={{ width: 1, backgroundColor: STheme.color.card }} />
                    <View style={{ flex: 1 }} >
                        {this.renderChildrens()}
                    </View>
                </View>
            }
        </View >
    }
}