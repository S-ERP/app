import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SIcon, SImage, SText } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import SVideoPreview from '../../../Components/SVideo/SVideoPreview';
export default class ItemIcon extends Component {
  constructor(props) {
    super(props);
    this.state = {
      image: null,
    };
  }

  render() {
    const { obj, path } = this.props;
    const { image } = this.state;

    let finalPath = path;
    if (this.props.path.startsWith("/")) finalPath = finalPath.slice(1, finalPath.length)
    console.log(SSocket.api.drive + finalPath + "/" + encodeURI(obj.name) + ".tb.png")
    console.log(obj.type)

    if (/image.*/gi.test(obj.type)) {
      return <SImage src={SSocket.api.drive + finalPath + "/" + encodeURI(obj.name)} />

    }
    if (/video.*/gi.test(obj.type)) {
      // if (!image) {
      return <SImage src={SSocket.api.drive + finalPath + "/" + encodeURI("."+obj.name) + ".png"} />
      //   return <SText>Loading preview...</SText>;
      // }
      // return <SVideoPreview src={SSocket.api.drive + path + "/" + obj.name} />
    }
    switch (obj.type) {
      case 'directory':
        return <SIcon name='drive-folder' />;
      default:
        return <SIcon name='drive-file' />;
    }
  }
}
