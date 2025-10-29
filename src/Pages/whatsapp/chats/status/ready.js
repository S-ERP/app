import React, { Component } from 'react';
import { View, Text, FlatList } from 'react-native';
import { SHr, SIcon, SImage, SInput, SLoad, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../../MDL';
import Whatsapp from '../../../crm/Components/Whatsapp';
import SIconApp from '../../../../Assets/SIconApp';
import SSocket from 'servisofts-socket';

export default class ready extends Component {
    constructor(props) {
        super(props);
        this.state = {
            allData: [], // lista completa
            data: [], // lista filtrada
            idchat: null,
        };
    }

    componentDidMount() {

        SSocket.addEventListener("onMessage", this.onMessageSocket)
        this.loadData();

    }
    componentWillUnmount() {
        SSocket.removeEventListener("onMessage", this.onMessageSocket);
    }

    onMessageSocket = (data) => {
        if (data.component != "whatsapp") return;
        if (data.type != "event") return;
        if (!["message_create", "message"].includes(data.event)) return;
        this.loadData();

    }

    loadData() {
        const { device } = this.props;
        MDL.whatsapp.device.getChats(device?.key).then(e => {
            console.log("Whatsapp Device", e);
            this.setState({
                allData: e,
                data: e,
            })
        }).catch(e => {
            console.error("Error fetching Whatsapp Device", e);
        })
    }

    handleSearch = (text) => {
        const { allData } = this.state;
        if (!text || text.trim() === "") {
            this.setState({ data: allData });
        } else {
            const filteredData = allData.filter(item => {
                const name = item.name || "";
                const id = item.id?._serialized || "";
                return name.toLowerCase().includes(text.toLowerCase()) ||
                    id.toLowerCase().includes(text.toLowerCase());
            });
            this.setState({ data: filteredData });
        }
    }
    renderChats() {
        const { data } = this.state;
        if (!data) return (
            <SView center col={"xs-12"} padding={16}>
                {new Array(5).fill(0).map((_, index) => (
                    <SView key={index} col={"xs-12"} row center style={{ marginBottom: 16 }}>
                        <SLoad type='skeleton' col={"xs-2"} height={50} />
                        <SView style={{ width: 10 }} />
                        <SView flex>
                            <SLoad type='skeleton' col={"xs-12"} height={20} />
                            <SLoad type='skeleton' col={"xs-8"} height={15} />
                        </SView>
                    </SView>
                ))}
            </SView>
        );

        return (
            <FlatList
                data={data}
                keyExtractor={(item) => item.id._serialized}
                renderItem={({ item }) => {
                    const isActive = this.state.idchat === item.id._serialized;
                    return (
                        <SView
                            row
                            center
                            onPress={() => {
                                this.setState({ idchat: item.id._serialized });
                            }}
                            style={{
                                backgroundColor: isActive ? "#2a3942" : "transparent", // ← color de selección tipo WhatsApp
                                paddingVertical: 10,
                                paddingHorizontal: 8,
                                borderBottomWidth: 1,
                                borderBottomColor: STheme.color.card,
                                borderRadius: 6,
                                transition: "background-color 0.2s ease"
                            }}
                        >
                            {/* Imagen del chat */}
                            <SView
                                style={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: 25,
                                    backgroundColor: STheme.color.card,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    overflow: "hidden"
                                }}
                            >
                                <SImage src={MDL.whatsapp.device.getUrlImage(this.props?.device?.key, item.id._serialized)} />
                            </SView>

                            <SView style={{ width: 10 }} />

                            {/* Información del chat */}
                            <SView flex row style={{ height: "100%" }}>
                                <SView flex>
                                    <SText bold color={isActive ? "#e9edef" : STheme.color.text}>
                                        {item.name}
                                    </SText>
                                    <SText
                                        numberOfLines={1}
                                        flex
                                        color={isActive ? "#b6c1c7" : STheme.color.lightGray}
                                    >
                                        {item?.lastMessage?.type === "chat"
                                            ? item.lastMessage.body
                                            : item?.lastMessage?.type}
                                    </SText>
                                </SView>

                                {/* Hora + contador */}
                                <SView>
                                    <SView
                                        col={"xs-12"}
                                        style={{
                                            justifyContent: "flex-end",
                                            alignItems: "flex-end"
                                        }}
                                    >
                                        <SText
                                            style={{ marginLeft: 4 }}
                                            color={item?.unreadCount ? "#22be60" : STheme.color.gray}
                                            fontSize={12}
                                        >
                                            {item?.lastMessage?.timestamp
                                                ? new Date(
                                                    item.lastMessage.timestamp * 1000
                                                ).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: true
                                                })
                                                : "Sin mensajes"}
                                        </SText>
                                    </SView>

                                    {!!item?.unreadCount && (
                                        <SView
                                            style={{
                                                width: 20,
                                                height: 20,
                                                borderRadius: 10,
                                                backgroundColor: "#22be60",
                                                justifyContent: "center",
                                                alignItems: "center"
                                            }}
                                        >
                                            <SText fontSize={10} color={STheme.color.black}>
                                                {item?.unreadCount}
                                            </SText>
                                        </SView>
                                    )}
                                </SView>
                            </SView>
                        </SView>
                    );
                }}
            />
        );
    }

    render() {
        const { device } = this.props;
        return <View style={{ flexDirection: "row", width: "100%", flex: 1, }}>
            <View style={{ width: 300, height: "100%", borderTopColor: STheme.color.card, borderRightColor: STheme.color.card, borderTopWidth: 1, borderRightWidth: 1, }}>
                <SView row col={"xs-12"} center padding={4}>
                    <SView width={50} height={50} style={{
                        borderRadius: 100,
                        overflow: "hidden"
                    }}>
                        <SImage src={MDL.whatsapp.device.getUrlImage(this.props?.device?.key, device?.session?.info?.wid?._serialized)} />
                    </SView>
                    <SView style={{ width: 10 }} />
                    <SText fontSize={20} bold>Chats - {device.descripcion}</SText>
                    <SView flex />
                </SView>
                <SView col={"xs-12"} padding={4} style={{ marginBottom: 4 }} >
                    <SInput type='' placeholder='Buscar chat' onChangeText={this.handleSearch}
                        icon={<SIcon fill={STheme.color.gray} name='Search' height={22} />}
                        style={{ padding: 10, borderRadius: 16, }}
                        placeholderTextColor={STheme.color.gray}
                    />
                </SView>
                {this.renderChats()}
            </View>
            <View style={{ flex: 1, }}>
                {this.state.idchat && <Whatsapp.ChatById key={this.state.idchat} idDevice={device?.key} idchat={this.state.idchat} />}
                {!this.state.idchat && <SView col={"xs-12"} center flex backgroundColor={STheme.color.card}>
                    <SView width={100} height={100}>
                        <SIconApp name='whatsapp' fill={STheme.color.lightGray} />
                    </SView>
                </SView>}
            </View>
        </View>
    }
}
