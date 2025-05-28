import React, { Component } from 'react';
import { View, Text } from 'react-native';
import Slide from '../../Components/Slide';
import { SHr, SText, STheme, SView } from 'servisofts-component';

export default class QuePuedeTocar extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const { data } = this.props ?? {};
    return <>
      <SText fontSize={18} font={'Montserrat-Bold'} color={STheme.color.primary}>{"¿QUÉ PUEDE LLEGAR EN TU TAPEKE?"}</SText>
      <SHr />
      <SView
        col={'xs-12 sm-10 md-8 lg-6 xl-4'}
        center
        height={200}
        backgroundColor="#fff"
      >
        <Slide key_restaurante={data.key}
          ref={ref => this.slide = ref}
        />
      </SView>
    </>
  }
}
