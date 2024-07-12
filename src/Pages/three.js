import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SPage } from 'servisofts-component';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box } from '@react-three/drei';

export default class three extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return <SPage title={"three"} disableScroll>

    </SPage>
  }
}
