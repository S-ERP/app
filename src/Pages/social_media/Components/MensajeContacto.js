import { FlatList, ScrollView, Text, View } from 'react-native'
import React, { Component } from 'react'
import PButtom2 from '../../../Components/PButtom2'
import { SHr, SIcon, SImage, SNavigation, SText, STheme, SView } from 'servisofts-component'
import MDL from '../../../MDL';
import { title } from 'process';
// import { name } from 'jssip';

export default class MensajeContacto extends Component {

  renderContacto() {
    if (!this.props?.data) return <SText>Cargando...</SText>
    console.log("Data MensajeContacto", this.props?.data);
    var color = STheme.color.text;
    // var isSelect = key == this.props.url;
    ({ _serialized, name, red_social, last_message, last_time, description } = this.props?.data || {});
    return (
      <SView col={"xs-12"} row>
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
            {name}
          </SText>
          <SText numberOfLines={1} flex color={STheme.color.lightGray}>
            usuario@gmail.com
          </SText>
        </SView>
        <SHr height={20}></SHr>

        <SView col={"xs-12"} >
          <SView flex row >
            <SIcon name={"iconHome"} width={16} height={16} fill={STheme.color.text} />
            <SView width={4} />
            <SText flex style={{ marginLeft: 4 }} color={STheme.color.gray} fontSize={12}>
              Vive en Santa Cruz de la Sierra
            </SText>
          </SView>
          <SHr height={12} />
          <SView flex row >
            <SIcon name={"iconUbicacion"} width={16} height={16} fill={STheme.color.text} />
            <SView width={4} />
            <SText flex style={{ marginLeft: 4 }} color={STheme.color.gray} fontSize={12}>
              De Santa Cruz de la Sierra, Bolivia
            </SText>
          </SView>
          <SHr height={12} />
          <SView col={"xs-12"} row >
            <SIcon name={"iconMail"} width={16} height={16} fill={STheme.color.text} />
            <SView width={4} />
            <SText style={{ marginLeft: 4 }} color={STheme.color.gray} fontSize={12}>
              usuario@gmail.com
            </SText>
          </SView>
          <SHr height={12} />
          <SView col={"xs-12"} row >
            <SIcon name={"iconCall"} width={16} height={16} fill={STheme.color.text} />
            <SView width={4} />
            <SText style={{ marginLeft: 4 }} color={STheme.color.gray} fontSize={12}>
              +51 987654321
            </SText>
          </SView>
        </SView>

      </SView>
    )
  }

  render() {
    console.log("Data MensajesLista", this.props?.data);
    return (

      <SView col={"xs-12"} padding={8}>

        {/* <SText bold fontSize={15} color={STheme.color.text} >Conversación con {this.props?.data?.name}</SText> */}
        <SText bold fontSize={15} color={STheme.color.text} >Información de contacto</SText>
        <SHr height={16} />
        {this.renderContacto()}
      </SView >
    )
  }
}
