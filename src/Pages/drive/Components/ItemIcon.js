import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SIcon, SImage, SText } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import SVideoPreview from '../../../Components/SVideo/SVideoPreview';
import { Actions } from '..';
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

    const type = Actions.getFileType(obj, obj.name);

    if (/image.*/gi.test(type)) {
      return <SImage src={SSocket.api.drive + finalPath + "/" + encodeURI(obj.name) + "?time=" + this.props.time ?? 0} />
    }

    if (/pdf/gi.test(type)) {
      return <SImage src={SSocket.api.drive + finalPath + "/" + encodeURI("." + obj.name) + ".png" + "?time=" + this.props.time ?? 0} />
    }
    if (/video.*/gi.test(type)) {
      console.log(type)
      // if (/mp4/g.test(obj.type)) {
      //   return <SVideoPreview src={SSocket.api.drive + finalPath + "/" + obj.name} size={obj.size} />
      // }
      // if (!image) {
      return <SImage src={SSocket.api.drive + "thumbnail/" + finalPath + "/" + encodeURI(obj.name)  + "?ms=1&time=" + this.props.time ?? 0} />
      //   return <SText>Loading preview...</SText>;
      // }
      // return <SText>{obj.size}</SText>

    }
    switch (obj.type) {
      case 'directory':
        return <SIcon name='drive-folder' />;
      default:
        return <SIcon name='drive-file' />;
    }
  }
}
