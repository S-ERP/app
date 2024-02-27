import React, { Component } from 'react';

import { connect } from 'react-redux';
import {
  SGradient,
  SHr,
  SIcon,
  SNavigation,
  SText,
  STheme,
  SView
} from 'servisofts-component';

class PBarraFooter extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    // this.page = SNavigation.getParam("page");
  }

  getItem({ key, title, icon, url, params }) {
    var color = STheme.color.white;
    var isSelect = key == this.props.url;

    // if (this.props.state.usuarioReducer.usuarioLog) {
    //   if (url == 'login') {
    //     title = 'PERFIL';
    //     url = 'perfil';
    //   }
    // }
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
          <SView
            height={5}
            col={'xs-12'}
            style={{
              backgroundColor: "#7D7D7D",
              borderBottomLeftRadius: 5,
              borderBottomRightRadius: 5
            }}></SView>
          <SHr height={10}></SHr>
          {/* <SView height={23} colSquare center>
            <SIcon name={icon} fill={STheme.color.primary} />
          </SView>
          <SView height={2} /> */}
          <SText fontSize={28} center color={color}>
            {title}
          </SText>
          <SHr height={10}></SHr>
          <SView
            height={5}
            col={'xs-12'}
            style={{
              backgroundColor: isSelect ? STheme.color.primary : '',
              borderTopLeftRadius: 5,
              borderTopRightRadius: 5
            }}></SView>
        </SView>
      </SView>
    );
  }
  render() {
    return (
      <>
        <SView
          width={300}
          height={65}
          style={{
            position: 'absolute',
            bottom: 0,
            borderWidth: 1,
            borderColor: STheme.color.darkGray,
            borderRadius: 40,
            overflow: "hidden",
            borderBottomWidth: 2,
            borderBottomColor: STheme.color.darkGray,
          }}>
          {/* <SView height={8} col={'xs-12'} style={{}}>
            <SGradient
              colors={[STheme.color.barColor, STheme.color.darkGray + '22']}
            />
          </SView> */}
          <SView col={'xs-12'} row backgroundColor={STheme.color.darkGray}>
            {this.getItem({
              key: 'comenzar',
              title: this.props.label,
              // icon: 'Inicio',
              url: this.props.url,
              params: {}
            })}

          </SView>
        </SView>
      </>
    );
  }
}
const initStates = (state) => {
  return { state };
};
export default connect(initStates)(PBarraFooter);
