import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SUploadFileDropProps } from "./type"
export default class SUploadFileDrop extends Component<SUploadFileDropProps> {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return this.props.children
  }
}
