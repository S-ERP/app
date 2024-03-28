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

    return (
      <SView
        flex
        center
        height={65}
        onPress={() => {
          SNavigation.navigate(url, params);
        }}>
        {/* <SHr height={10}></SHr> */}
        <SText fontSize={28} center color={color}>
          {title}
        </SText>
        {/* <SHr height={10}></SHr> */}
      </SView>
    );
  }
  render() {
    return (
      <>
        <SView col={'xs-12'} center flex>
          <SView center
            width={300}
            height={65}
            style={{
              position: 'absolute',
              bottom: 20,
              borderWidth: 1,
              borderColor: STheme.color.darkGray,
              borderRadius: 40,
              overflow: "hidden",
              borderBottomWidth: 4,
              borderBottomColor: STheme.color.black,
            }}>

            <SView col={'xs-12'} row backgroundColor={STheme.color.darkGray}>
              {this.getItem({
                key: 'comenzar',
                title: this.props.label,
                url: this.props.url,
                params: {}
              })}
            </SView>
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
