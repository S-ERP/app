import { FlatList, Text, View } from 'react-native'
import React, { Component } from 'react'
import PButtom2 from '../../../Components/PButtom2'
import { SHr, SIcon, SImage, SNavigation, SText, STheme, SView } from 'servisofts-component'
import MDL from '../../../MDL';

export default class MensajesLista extends Component {

  getItem({ key, title, icon, url, params, description, time, red_social }) {
    var color = STheme.color.text;
    var isSelect = key == this.props.url;

    return (
      <SView
        row center
        padding={8}
        style={{
          borderBottomColor: STheme.color.card,
          borderBottomWidth: 1,
          backgroundColor: isSelect ? STheme.color.card : "transparent",
        }}
        onPress={() => {
          // SNavigation.navigate(url, params);
        }}>

        <SView style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: STheme.color.card,
          justifyContent: "center",
          alignItems: "center",
          // overflow: "hidden"
        }}>
          <SImage src={MDL.whatsapp.device.getUrlImage(this.props?.device?.key, this.props?._serialized)} />
          <SView style={{ position: "absolute", right: 0, bottom: -5, zIndex: 10 }}>
            <SIcon name={red_social} width={20} height={20} fill={STheme.color.text} />
          </SView>
        </SView>
        <SView style={{ width: 10 }} />
        <SView
          flex
        >
          <SHr height={10}></SHr>
          <SText color={color}>
            {title}
          </SText>

          <SText numberOfLines={1} flex color={STheme.color.lightGray}>
            {description}
          </SText>
          <SHr height={10}></SHr>
          <SView style={{ justifyContent: "flex-end", alignItems: "flex-end" }} >
            <SText style={{ marginLeft: 4 }} color={STheme.color.gray} fontSize={12}>
              {time ? new Date(time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : "Sin mensajes"}
            </SText>
          </SView>
        </SView>
      </SView>
    );
  }

  render() {
    console.log("Data MensajesLista", this.props?.data);
    return (

      <SView col={"xs-12"} >
        <SView col={"xs-12"} row padding={8} >
          <SView center>
            <SText bold fontSize={12} color={STheme.color.text} >Todos</SText>
          </SView>
          <SView width={10} />
          <SView  >
            <SView width={15} height={15} style={{
              borderRadius: 10,
              backgroundColor: STheme.color.danger,
              position: "absolute",
              top: -5,
              right: -5,
              zIndex: 10
            }} center>
              <SText fontSize={9} color={STheme.color.white}>3</SText>
            </SView>
            <SIcon name='redesFacebook' width={30} height={30} fill={STheme.color.text} />

          </SView>
          <SView width={10} />
          <SView  >
            <SIcon name='redesInstagram' width={30} height={30} fill={STheme.color.text} />
          </SView>
          <SView width={10} />
          <SView  >
            <SIcon name='redesWhatsapp' width={30} height={30} fill={STheme.color.text} />
          </SView>
        </SView>
        <FlatList
          data={this.props?.data}
          keyExtractor={(item) => item.id._serialized}
          renderItem={({ item }) => (
            console.log("Item MensajesLista", item?.lastMessage?.timestamp),
            <SView >
              {this.getItem({
                key: item.id._serialized,
                title: item.name,
                description: item.lastMessage?.body,
                time: item?.lastMessage?.timestamp,
                red_social: item.red_social,
                url: item.url,
                params: {}
              })}
            </SView>
          )}
        />
      </SView >
    )
  }
}
