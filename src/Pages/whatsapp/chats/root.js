import React, { Component } from 'react';
import { View, Text, FlatList } from 'react-native';
import { SImage, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import { Container } from '../../../Components';
import Whatsapp from '../../crm/Components/Whatsapp';

export default class root extends Component {

    pk = SNavigation.getParam("pk");
    state = {
        idchat: "",
        data: null
    }

    componentDidMount() {
        MDL.whatsapp.device.getChats(this.pk).then(e => {
            console.log("Whatsapp Device", e);
            this.setState({
                data: e
            })
        }).catch(e => {
            console.error("Error fetching Whatsapp Device", e);
        })
    }

    renderChats() {
        if (!this.state.data) return <SText>Loading...</SText>;
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
                            <SImage src={MDL.whatsapp.device.getUrlImage(this.pk, item.id._serialized)} />
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
        return <SPage title={"Whatsapp Chats "} disableScroll>
            {/* <SText>{this.pk}</SText> */}
            <View style={{
                flexDirection: "row",
                width: "100%",
                height: "100%",
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
                    {this.state.idchat && <Whatsapp.ChatById key={this.state.idchat} idDevice={this.pk} idchat={this.state.idchat} />}
                </View>
            </View>
        </SPage>
    }
}
