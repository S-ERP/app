import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SLoad, SNavigation, SPage, SThread } from 'servisofts-component';

export default class loading extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.deeplink = SNavigation.getParam("deeplink");
    this.succes = false;
  }

  componentDidMount() {
    if (!this.deeplink) {
      SNavigation.goBack();
      return
    }
    // SNavigation.goBack();
    new SThread(100, "navegarsigueinte", false).start(() => {
      // SNavigation.goBack();
      SNavigation.openDeepLink(this.deeplink, true);
      this.succes = true;

    })
  }
  render() {
    return <SPage hidden>
      <SLoad />
    </SPage>
  }
}
