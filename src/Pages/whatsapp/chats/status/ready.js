import React, { Component } from 'react';
import { View, Text, FlatList } from 'react-native';
import { SHr, SImage, SLoad, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../../MDL';
import Whatsapp from '../../../crm/Components/Whatsapp';
import SIconApp from '../../../../Assets/SIconApp';
import SSocket from 'servisofts-socket';

export default class ready extends Component {
    constructor(props) {
        super(props);
        this.state = {
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
                data: e
            })
        }).catch(e => {
            console.error("Error fetching Whatsapp Device", e);
        })
    }
    renderChats() {
        if (!this.state.data) return <SView center col={"xs-12"} padding={16}>
            {new Array(5).fill(0).map((item, index) => {
                return <SView key={index} col={"xs-12"} row center style={{
                    marginBottom: 16
                }}>
                    <SLoad type='skeleton' col={"xs-2"} height={50} />
                    <SView style={{ width: 10 }} />
                    <SView flex>
                        <SLoad type='skeleton' col={"xs-12"} height={20} />
                        <SLoad type='skeleton' col={"xs-8"} height={15} />
                    </SView>
                </SView>
            }
            )}
        </SView>
        return <FlatList
            data={this.state.data}
            keyExtractor={(item) => item.id._serialized}
            renderItem={({ item }) => (
                <View style={{ padding: 10, }}>
                    <SView row center onPress={() => {
                        this.setState({ idchat: item.id._serialized, });
                        // SNavigation.navigate("/crm/whatsapp/chatlead", { idchat: item.id, pk: this.pk });
                    }}>
                        <SView style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: STheme.color.card, justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
                            <SImage src={MDL.whatsapp.device.getUrlImage(this.props?.device?.key, item.id._serialized)} />
                        </SView>
                        <SView style={{ width: 10 }} />
                        <SView flex row style={{
                            height: "100%",
                            borderBottomWidth: 1,
                            borderBottomColor: STheme.color.card,
                        }}>
                            <SView flex>
                                <SText bold>{item.name}</SText>
                                <SText numberOfLines={1} flex color={STheme.color.lightGray}>{item?.lastMessage?.type == "chat" ? item.lastMessage.body : item?.lastMessage?.type}</SText>
                            </SView>
                            {item?.unreadCount && <SView style={{ width: 15, height: 15, borderRadius: 15, backgroundColor: STheme.color.success, justifyContent: "center", alignItems: "center" }}>
                                <SText fontSize={10} color={STheme.color.black}>{item?.unreadCount}</SText>
                            </SView>}
                        </SView>
                    </SView>
                    {/* <SText>{item.lastMessage}</SText> */}
                </View>
            )}
        />;
    }
    render() {
        const { device } = this.props;
        return <View style={{
            flexDirection: "row",
            width: "100%",
            flex: 1,
        }}>
            <View style={{
                width: 300,
                height: "100%",
            }}>
                {this.renderChats()}
            </View>
            <View style={{
                flex: 1,
            }}>
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
