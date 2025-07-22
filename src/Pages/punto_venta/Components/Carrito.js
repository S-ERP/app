import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SText } from 'servisofts-component';

class Carrito extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <View>
            <SText color='red'> Carrito </SText>
      </View>
    );
  }
}

export default Carrito;
