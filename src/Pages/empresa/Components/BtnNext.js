import { Text, View } from 'react-native'
import React, { Component } from 'react'
import PButtom2 from '../../../Components/PButtom2'
import { SHr, SLoad, SNavigation, SText, STheme, SView } from 'servisofts-component'

export default class BtnNext extends Component {

  getItem({ key, title, icon, url, params }) {
    var color = STheme.color.white;
    var isSelect = key == this.props.url;

    return (
      <SView
        flex
        center
        height={65}
        onPress={() => {
          SNavigation.navigate(url, params);
        }}>
        <SView
          style={{
            width: 80
          }}
          center>
          <SHr height={10}></SHr>
          <SText fontSize={28} center color={color}>
            {title}
          </SText>
          <SHr height={10}></SHr>
        </SView>
      </SView>
    );
  }

  render() {
    return (

      // <SView
      // onPress={this.props.onPress}
      //     width={300}
      //     height={65}
      //     style={{
      //         position: 'relative',
      //         bottom: 20,
      //         borderWidth: 1,
      //         borderColor: STheme.color.darkGray,
      //         borderRadius: 40,
      //         overflow: "hidden",
      //         borderBottomWidth: 2,
      //         borderBottomColor: STheme.color.darkGray,
      //     }}>

      //     <SView col={'xs-12'} row backgroundColor={STheme.color.darkGray}>
      //         {this.getItem({
      //             key: 'comenzar',
      //             title: this.props.label,
      //             url: this.props.url,
      //             params: {}
      //         })}
      //     </SView>
      // </SView>
      <PButtom2 secondary
        loading={this.props.loading}
        width={"100%"}
        props={{
          type: "outline"
        }}
        onPress={this.props.onPress}
      >{this.props.children}</PButtom2>
    )
  }
}